import { Elysia } from 'elysia';
import { readUserById } from '../queries/auth.query';
import { readAllUsers } from '../queries/user.query';
import { readContactsByUser } from '../queries/contact.query';

const user = new Elysia({ prefix: '/users' })
	.get('/:id', async ({ params, set, jwt, cookie: { session } }) => {
		const profile = await jwt.verify(session);

		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}
		const { id } = params;

		// Get user
		const user = await readUserById(Number(id));

		if (!user) {
			set.status = 400;
			return { ok: false, message: `User with id ${id} does not exist` };
		}

		const data = {
			id: user.id,
			email: user.email,
			username: user.username,
		};

		return { ok: true, message: 'User found', data };
	})
	.get('/', async ({ set, jwt, cookie: { session } }) => {
		const profile = await jwt.verify(session);

		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}

		// Get all users
		const users = await readAllUsers();
		if (!users) {
			set.status = 200;
			return { ok: false, message: 'No users found' };
		}

		// Get users contact list
		const contactList = await readContactsByUser(profile.id);

		// Filter
		const removeUser = users.filter((item) => item.id !== profile.id);
		const data = removeUser.filter(
			(item) => !contactList.some((contact) => contact.contactId === item.id)
		);

		return { ok: true, message: 'User found', data };
	});

export { user };
