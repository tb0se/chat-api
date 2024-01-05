import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMessage = async (
	senderId: number,
	recipientId: number,
	text: string
) => {
	return await prisma.message.create({
		data: {
			sender: {
				connect: { id: senderId },
			},
			recipient: {
				connect: { id: recipientId },
			},
			text,
		},
	});
};

export const readMessages = async (senderId: number, recipientId: number) => {
	return await prisma.message.findMany({
		where: {
			OR: [
				{ senderId: senderId, recipientId: recipientId },
				{ senderId: recipientId, recipientId: senderId },
			],
		},
	});
};
