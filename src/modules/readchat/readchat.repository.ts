import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Member } from "@prisma/client";

@Injectable()
export class ReadChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUnique(data: { chatId: string, readerId: string }) {
        return await this.prisma.chatRead.findUnique({
            where: {
                readerId_chatId: {
                    chatId: data.chatId,
                    readerId: data.readerId
                }
            }
        })
    }

    async findByChatId(data: { chatId: string, userId: string }) {
        return await this.prisma.chatRead.findMany({
            where: {
                chatId: data.chatId,
                NOT: {
                    reader: {
                        userId: data.userId
                    }
                }
            },
            include: {
                reader: {
                    select: {
                        userId: true
                    }
                }
            }
        })
    }

    async createMany(data: { members: Member[], chatId: string }) {
        return await this.prisma.chatRead.createMany({
            data: data.members.map(({ memberId }) => ({
                chatId: data.chatId,
                readerId: memberId
            }))
        })
    }

    async updateReadChat(data: { readerId: string, chatId: string }) {
        return await this.prisma.chatRead.update({
            where: {
                readerId_chatId: {
                    chatId: data.chatId,
                    readerId: data.readerId
                }
            },
            data: {
                isRead: true
            }
        })
    }
}