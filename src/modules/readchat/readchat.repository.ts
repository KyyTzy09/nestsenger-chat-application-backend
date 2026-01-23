import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Chat, Member } from "@prisma/client";

@Injectable()
export class ReadChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findReadedChats(data: { chatId: string }) {
        return await this.prisma.chatRead.findMany({
            where: {
                chatId: data.chatId,
                isRead: true
            },
            orderBy: {
                sendAt: "desc"
            }
        })
    }

    async findUnreadChatsByRoomId(data: { roomId: string, userId: string }) {
        return await this.prisma.chatRead.findMany({
            where: {
                chat: {
                    roomId: data.roomId
                },
                isRead: false,
                reader: {
                    userId: data.userId
                }

            },
            include: {
                reader: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: {
                sendAt: "desc"
            }
        })
    }

    async findManyByRoomId(data: { roomId: string }) {
        return await this.prisma.chatRead.findMany({
            where: {
                chat: {
                    roomId: data.roomId
                },
            },
            include: {
                reader: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: {
                sendAt: "desc"
            }
        })
    }

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

    async updateMany(data: { readChatIds: string[] }) {
        return await this.prisma.chatRead.updateMany({
            where: {
                chatReadId: {
                    in: data.readChatIds
                }
            },
            data: {
                isRead: true
            }
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

    async countAllRoomUnreadChats(data: { userId: string }) {
        return await this.prisma.chatRead.count({
            where: {
                chat: {
                    room: {
                        members: {
                            some: {
                                userId: data.userId
                            }
                        }
                    },
                },
                reader: {
                    userId: data.userId,
                },
                isRead: false
            },
            orderBy: {
                chat: {
                    room: {
                        updatedAt: "desc"
                    }
                }
            }
        })
    }

    async countRoomUnreadChats(data: { roomId: string, userId: string }): Promise<number> {
        return await this.prisma.chatRead.count({
            where: {
                chat: {
                    roomId: data.roomId
                },
                reader: {
                    userId: data.userId
                },
                isRead: false
            },
        })
    }
}