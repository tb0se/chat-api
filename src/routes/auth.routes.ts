import { Elysia, t } from 'elysia';
import {
	createUser,
	readUserByEmail,
	readUserById,
	readUserByUsername,
	updateUserToken,
} from '../queries/auth.query';
import { generateToken } from '../utils';

export const auth = new Elysia()
	.post(
		'/register',
		async ({ body, set }) => {
			const { username, email, password, avatar } = body;

			// Check if user exists
			const userByEmail = await readUserByEmail(email);
			const userByUsername = await readUserByUsername(username);
			if (userByEmail || userByUsername) {
				set.status = 400;
				return {
					ok: false,
					message:
						'Cannot registered that username/email and password combination',
				};
			}

			// Hash the password
			const hash = await Bun.password.hash(password, {
				algorithm: 'bcrypt',
				cost: 4,
			});

			// Create user in DB
			const result = await createUser(username, email, hash, avatar);

			if (!result) {
				set.status = 500;
				return { ok: false, message: 'Could register. Please try again later' };
			}

			const data = {
				id: result.id,
				email: result.email,
				username: result.username,
				avatar: result.avatar,
			};

			set.status = 201;
			return { ok: true, message: 'Successfully registered', data };
		},
		{
			body: t.Object({
				username: t.String(),
				password: t.String(),
				email: t.String(),
				avatar: t.String(),
				agreeToTermsAndConditions: t.Boolean(),
			}),
		}
	)
	.post(
		'/login',
		async ({ body, set, jwt, setCookie }) => {
			const { username, password, rememberMe } = body;

			// Check for user
			const user = await readUserByUsername(username);
			if (!user) {
				set.status = 400;
				return { ok: false, message: 'Username or password is incorrect' };
			}

			if (!user.active) {
				set.status = 400;
				return { ok: false, message: 'Account is no longer active' };
			}

			const isMatch = await Bun.password.verify(password, user.password);

			if (!isMatch) {
				set.status = 400;
				return { ok: false, message: 'Username or password is incorrect' };
			}

			setCookie('session', await jwt.sign({ id: user.id }), {
				httpOnly: true,
				maxAge: 7 * 86400,
				secure: Bun.env.NODE_ENV === 'production',
				// sameSite: 'None',
			});

			if (rememberMe) {
				const token = generateToken();
				setCookie('persist', token, {
					httpOnly: true,
					secure: Bun.env.NODE_ENV === 'production',
					expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
				});
				const res = await updateUserToken(user.id, token);
				if (!res) {
					set.status = 500;
					return {
						ok: false,
						message: 'Something happened. Please try again.',
					};
				}
			}

			const data = {
				id: user.id,
				email: user.email,
				username: user.username,
				avatar: user.avatar,
			};

			set.status = 200;
			return { ok: true, message: 'Successfully logged in', data };
		},
		{
			body: t.Object({
				username: t.String(),
				password: t.String(),
				rememberMe: t.Boolean(),
			}),
		}
	)
	.get('/check-auth', async ({ set, jwt, cookie: { session, persist } }) => {
		const profile = await jwt.verify(session);
		if (!profile || !persist) {
			set.status = 401;
			return { ok: false, message: 'Unauthorised' };
		}

		const user = await readUserById(Number(profile.id));
		const token = persist as unknown as String;
		if (!user?.token || user.token !== token) {
			set.status = 401;
			return { ok: false, message: 'Unauthorised' };
		}

		return { ok: true, message: 'Authorised' };
	});
