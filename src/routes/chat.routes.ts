import { Elysia, t } from 'elysia';
import { readUserById } from '../queries/auth.query';
import { readContactById } from '../queries/contact.query';
import { createMessage } from '../queries/message.query';

export const chat = new Elysia({ prefix: '/chat' }).ws('/ws', {
	body: t.Object({
		text: t.String(),
		contactId: t.String(),
	}),
	open(ws) {
		console.log(`[open] Connection established`);
		ws.subscribe('test-chat');
	},
	close(ws) {
		console.log(`[open] Connection closed`);
		ws.unsubscribe('test-chat');
	},
	async message(ws, data) {
		const { text, contactId } = data;
		const { cookie, jwt } = ws.data;

		const session = await jwt.verify(cookie.session);
		if (!session) {
			ws.send({
				ok: false,
				message: 'Unauthorised',
			});
			ws.close();
		}

		// find user
		const user = await readUserById(Number(session.id));
		if (!user) {
			ws.send({
				ok: false,
				message: 'User does not exist',
			});
			ws.close();
		}

		// Get contact
		const contact = await readContactById(Number(contactId));
		if (!contact) {
			ws.send({
				ok: false,
				message: 'Contact does not exist',
			});
			ws.close();
		}

		// Create message
		const message = await createMessage(
			Number(user?.id),
			Number(contact?.contactId),
			text
		);

		if (message) {
			console.log(`[send]: ${JSON.stringify(message)}`);
			ws.send(message);
			ws.publish('test-chat', message);
		}
	},
});
