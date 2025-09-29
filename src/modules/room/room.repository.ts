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

    async createPrivateRoom(data: { roomId: string }): Promise<Room> {
        return await this.prisma.room.create({
            data: {
                roomId: data.roomId,
                type: "PRIVATE"
            }
        })
    }

    async createGroupRoom(data: { roomId: string, roomName: string }) {
        return await this.prisma.room.create({
            data: {
                roomId: data.roomId,
                roomName: data.roomName,
                type: "GROUP"
            }
        })
    }
}