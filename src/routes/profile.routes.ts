import Elysia from 'elysia';
import { readUserById } from '../queries/auth.query';

const profile = new Elysia({ prefix: '/profile' }).get(
	'/',
	async ({ set, jwt, cookie: { session } }) => {
		const profile = await jwt.verify(session);

		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}
		const { id } = profile;

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
	}
);

export { profile };
