import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Room, User } from "@prisma/client";

@Injectable()
export class RoomRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findRoomById(data: { roomId: string }): Promise<Room | null> {
        return await this.prisma.room.findUnique({
            where: {
                roomId: data.roomId,
            }
        })
    }

    async findRoomIdWithMember(data: { roomId: string, userId: string }) {
        return await this.prisma.room.findUnique({
            where: {
                roomId: data.roomId,
                members: {
                    some: {
                        userId: data.userId
                    }
                }
            },
            include: {
                members: true
            }
        })
    }

    async findByGroupId(data: { groupId: string }): Promise<Room | null> {
        return await this.prisma.room.findUnique({
            where: {
                roomId: data.groupId,
                type: "GROUP"
            }
        })
    }

    async findChatRoom(data: { roomId: string, userId: string }) {
        return await this.prisma.room.findUnique({
            where: {
                roomId: data.roomId
            },
            include: {
                members: {
                    where: {
                        NOT: {
                            userId: data.userId
                        }
                    },
                    select: {
                        userId: true
                    }
                },
                lastChat: {
                    include: {
                        sender: {
                            select: {
                                email: true,
                            }
                        }
                    }
                }
            }
        })
    }

    async findUserRoom(data: { userId: string }): Promise<Room[]> {
        return await this.prisma.room.findMany({
            where: {
                members: {
                    some: {
                        userId: data.userId
                    }
                },
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
    }

    async findWhereLastChatExist(data: { userId: string }) {
        return await this.prisma.room.findMany({
            where: {
                members: {
                    some: {
                        userId: data.userId
                    }
                },
                OR: [
                    {
                        lastChatId: {
                            not: null
                        }
                    },
                    {
                        type: "GROUP"
                    }
                ]
            },
            include: {
                members: {
                    where: {
                        NOT: {
                            userId: data.userId
                        }
                    },
                    select: {
                        userId: true
                    }
                },
                lastChat: {
                    include: {
                        sender: {
                            select: {
                                email: true,
                            }
                        },
                        media: {
                            select: {
                                mediaType: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
    }

    async createPrivateRoom(data: { roomId: string }): Promise<Room> {
        return await this.prisma.room.create({
            data: {
                roomId: data.roomId,
                type: "PRIVATE"
            }
        })
    }

    async createGroupRoom(data: { userId: string, avatar: string, roomId: string, roomName: string }) {
        return await this.prisma.room.create({
            data: {
                roomId: data.roomId,
                roomName: data.roomName,
                avatar: data.avatar,
                type: "GROUP"
            }
        })
    }

    async updateRoomName(data: { roomId: string, roomName: string }) {
        return await this.prisma.room.update({
            where: {
                roomId: data.roomId
            },
            data: {
                roomName: data.roomName
            },
            select: {
                roomId: true,
                roomName: true
            }
        })
    }

    async updateRoomDescription(data: { roomId: string, description: string }) {
        return await this.prisma.room.update({
            where: {
                roomId: data.roomId
            },
            data: {
                description: data.description
            },
            select: {
                roomId: true,
                description: true
            }
        })
    }

    async updateLastMessage(data: { roomId: string, chatId: string }) {
        return await this.prisma.room.update({
            where: {
                roomId: data.roomId
            },
            data: {
                lastChatId: data.chatId,
            }
        })
    }
}