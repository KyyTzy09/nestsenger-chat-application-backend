import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Chat, DeletedChat } from "@prisma/client";

@Injectable()
export class ChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(data: { chatId: string }): Promise<Chat | null> {
        return await this.prisma.chat.findUnique({
            where: {
                chatId: data.chatId
            },
            include: {
                sender: {
                    select: {
                        userId: true,
                    }
                },
                parent: true,
                reactions: true
            }
        })
    }

    async findByRoomId(data: { roomId: string }): Promise<Chat[]> {
        return await this.prisma.chat.findMany({
            where: {
                roomId: data.roomId
            },
            include: {
                room: true,
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    }

    async createChat(data: { roomId: string, userId: string, message: string }): Promise<Chat> {
        return await this.prisma.chat.create({
            data: data
        })
    }

    async createChatWithParent(data: { roomId: string, userId: string, parentId: string, message: string }): Promise<Chat> {
        return await this.prisma.chat.create({
            data: {
                roomId: data.roomId,
                userId: data.userId,
                message: data.message,
                parentId: data.parentId,
            }
        })
    }

    async getDeletedChatByRoomId(data: { roomId: string }): Promise<DeletedChat[]> {
        return await this.prisma.deletedChat.findMany({
            where: {
                chat: {
                    roomId: data.roomId
                },
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async findDeletedChatByUnique(data: { chatId: string, userId: string }): Promise<DeletedChat | null> {
        return await this.prisma.deletedChat.findUnique({
            where: {
                userId_chatId: {
                    chatId: data.chatId,
                    userId: data.userId
                }
            }
        })
    }

    async deleteById(data: { chatId: string }): Promise<Chat> {
        return await this.prisma.chat.delete({
            where: { chatId: data.chatId },
        })
    }

    async deleteForYourself(data: { chatId: string, userId: string }): Promise<DeletedChat> {
        return await this.prisma.deletedChat.create({
            data: {
                chatId: data.chatId,
                userId: data.userId,
                type: "SELF"
            }
        })
    }
}