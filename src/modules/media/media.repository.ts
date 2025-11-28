import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MediaRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findManyByRoomId(data: { roomId: string }) {
        return await this.prisma.chatMedia.findMany({
            where: {
                chat: {
                    roomId: data.roomId
                }
            },
            orderBy: {
                createdAt: "asc",
            }
        })
    }

    async findNonFileMediaByRoomId(data: { userId: string, roomId: string }) {
        return await this.prisma.chatMedia.findMany({
            where: {
                chat: {
                    roomId: data.roomId,
                    NOT: {
                        deletedChats: {
                            some: {
                                OR: [{
                                    type: "ALL"
                                }, {
                                    isDeleted: true
                                }, {
                                    userId: data.userId,
                                    type: "SELF"
                                }]
                            }
                        }
                    }
                },
                NOT: {
                    mediaType: "file",
                }
            },
            include: {
                chat: {
                    select: {
                        message: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    }
}