import Elysia, { t } from 'elysia';
import { readMessages } from '../queries/message.query';
import { readContactById } from '../queries/contact.query';
import { readUserById } from '../queries/auth.query';

const message = new Elysia({ prefix: '/messages' }).get(
	'/',
	async ({ query, set, jwt, cookie: { session } }) => {
		const { contactId } = query;
		const profile = await jwt.verify(session);
		if (!profile) {
			set.status = 401;
			return 'Unauthorized';
		}

		const user = await readUserById(Number(profile.id));
		if (!user) {
			set.status = 400;
			return {
				ok: false,
				message: 'User cannot be found',
			};
		}

		const contact = await readContactById(Number(contactId));
		if (!contact) {
			set.status = 400;
			return {
				ok: false,
				message: 'Contact cannot be found',
			};
		}

		const messages = await readMessages(user.id, contact.contactId);

		set.status = 200;
		return { ok: true, message: 'Successful', data: messages };
	},
	{
		query: t.Object({
			contactId: t.String(),
		}),
	}
);

export { message };
