import { Elysia, t } from 'elysia';
import { readUserById, readUserByUsername } from '../queries/auth.query';
import { createContact, readContactsByUser } from '../queries/contact.query';

const contact = new Elysia({ prefix: '/contact' })
	.get('/', async ({ body, set, jwt, cookie: { session } }) => {
		const profile = await jwt.verify(session);
		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}

		// Get users contact list
		const contactList = await readContactsByUser(profile.id);

		if (!contactList || contactList.length === 0) {
			set.status = 200;
			return {
				ok: false,
				message: 'User has no contacts',
			};
		}

		const contacts = contactList.map((item) => ({
			id: item.id,
			userId: item.contactId,
			username: item.contact.username,
			avatar: item.contact.avatar,
		}));

		set.status = 200;
		return { ok: true, message: 'Successful', data: contacts };
	})
	.post(
		'/',
		async ({ body, set, jwt, cookie: { session } }) => {
			const profile = await jwt.verify(session);
			if (!profile) {
				set.status = 401;
				return 'Unauthorized';
			}

			const { username } = body;

			//  Find contact to add
			const contact = await readUserByUsername(username);

			if (!contact) {
				set.status = 400;
				return {
					ok: false,
					message: 'Contact cannot be found',
				};
			}

			// Get the user
			const user = await readUserById(Number(profile.id));

			if (!user) {
				set.status = 400;
				return {
					ok: false,
					message: 'User cannot be found',
				};
			}

			if (user.id === contact.id) {
				set.status = 400;
				return {
					ok: false,
					message: 'Cannot add yourself as a contact',
				};
			}

			// // Add contact to user
			try {
				const result = await createContact(Number(user.id), Number(contact.id));

				const data = {
					id: result.id,
					userId: result.contactId,
					username: result.contact.username,
					avatar: result.contact.avatar,
				};

				set.status = 200;
				return { ok: true, message: 'Successfully added', data };
			} catch (error) {
				set.status = 400;
				return {
					ok: false,
					message: 'Contact already added',
				};
			}
		},
		{
			body: t.Object({
				username: t.String(),
			}),
		}
	);

export { contact };
