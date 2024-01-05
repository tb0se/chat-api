import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createContact = async (userId: number, contactId: number) => {
	return await prisma.contact.create({
		data: {
			user: {
				connect: { id: userId },
			},
			contact: {
				connect: { id: contactId },
			},
		},
		include: {
			contact: {
				select: {
					username: true,
					avatar: true,
				},
			},
		},
	});
};

export const readContactsByUser = async (userId: number) => {
	return await prisma.contact.findMany({
		where: { userId: userId },
		include: {
			contact: {
				select: {
					username: true,
					avatar: true,
				},
			},
		},
	});
};

export const readContactById = async (contactId: number) => {
	return await prisma.contact.findUnique({
		where: { id: contactId },
	});
};
