import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { cors } from '@elysiajs/cors';

import { auth } from './routes/auth.routes';
import { user } from './routes/user.routes';
import { chat } from './routes/chat.routes';
import { profile } from './routes/profile.routes';
import { contact } from './routes/contact.routes';
import { message } from './routes/message.routes';

const PORT = Bun.env.PORT || 8000;

const app = new Elysia({ prefix: '/api' });

// Middleware
app
	.use(cors())
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_SECRET!,
		})
	)
	.use(cookie());

// Routes
app.use(auth);
app.use(user);
app.use(chat);
app.use(profile);
app.use(contact);
app.use(message);

app.listen(PORT);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
