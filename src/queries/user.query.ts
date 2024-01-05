import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const readAllUsers = async () => {
	return await prisma.user.findMany({
		select: { id: true, username: true, email: true, avatar: true },
	});
};
