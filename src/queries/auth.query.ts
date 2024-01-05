import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUser = async (
	username: string,
	email: string,
	password: string,
	avatar: string
) => {
	return await prisma.user.create({
		data: {
			username,
			email,
			password,
			avatar,
		},
	});
};

export const readUserByUsername = async (username: string) => {
	return await prisma.user.findUnique({
		where: { username: username },
	});
};

export const readUserByEmail = async (email: string) => {
	return await prisma.user.findUnique({
		where: { email: email },
	});
};

export const readUserById = async (id: number) => {
	return await prisma.user.findUnique({
		where: { id: id },
	});
};

export const updateUserToken = async (id: number, token: string) => {
	return await prisma.user.update({
		where: {
			id: id,
		},
		data: {
			token: token,
		},
	});
};
