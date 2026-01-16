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
                media: true,
                parent: true,
                reactions: true
            }
        })
    }

    async findByRoomId(data: { userId: string, roomId: string, startDate: Date }): Promise<Chat[]> {
        return await this.prisma.chat.findMany({
            where: {
                roomId: data.roomId,
                createdAt: {
                    gt: data.startDate
                },
                NOT: {
                    deletedChats: {
                        some: {
                            userId: data.userId,
                            OR: [{
                                type: "SELF"
                            }, {
                                isDeleted: true
                            }]
                        }
                    }
                }
            },
            include: {
                parent: true,
                media: true,
                reactions: true
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

    async createNewChatWithMedia(data: { roomId: string, userId: string, parentId: string, mediaUrl: string, mediaType: string, mediaSize: string, mediaName: string, message: string }) {
        return await this.prisma.chat.create({
            data: {
                parentId: data.parentId,
                roomId: data.roomId,
                userId: data.userId,
                message: data.message,
                media: {
                    create: {
                        mediaUrl: data.mediaUrl,
                        mediaType: data.mediaType,
                        mediaName: data.mediaName,
                        size: data.mediaSize,
                    }
                }
            },
            include: {
                media: true
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

    async updateMessage(data: { chatId: string, userId: string }) {
        return await this.prisma.chat.update({
            where: {
                userId: data.userId,
                chatId: data.chatId
            },
            data: {
                message: "Pesan ini telah dihapus"
            }
        })
    }

    async deleteById(data: { chatId: string }): Promise<Chat> {
        return await this.prisma.chat.delete({
            where: { chatId: data.chatId },
        })
    }

    async deleteForYourself(data: { chatId: string, userId: string }) {
        return await this.prisma.deletedChat.create({
            data: {
                chatId: data.chatId,
                userId: data.userId,
                type: "SELF"
            },
            include: {
                chat: true
            }
        })
    }

    async updateDeletedChat(data: { userId: string, chatId: string }) {
        return await this.prisma.deletedChat.update({
            where: {
                userId_chatId: {
                    chatId: data.chatId,
                    userId: data.userId
                }
            },
            data: {
                isDeleted: true,
            },
            include: {
                chat: true
            }
        })
    }

    async deleteForAll(data: { chatId: string, userId: string }) {
        return await this.prisma.deletedChat.create({
            data: {
                chatId: data.chatId,
                userId: data.userId,
                type: "ALL"
            },
            include: {
                chat: true
            }
        })
    }
}