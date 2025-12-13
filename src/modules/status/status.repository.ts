import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StatusRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createNewStatus(data: { creatorId: string, mediaName: string, mediaType: string, mediaUrl: string, message: string, createdAt: Date, expiredAt: Date }) {
        return await this.prisma.status.create({
            data: {
                mediaName: data.mediaName,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                message: data.message,
                creatorId: data.creatorId,
                createdAt: data.createdAt,
                expiredAt: data.expiredAt,
            },
            include: {
                creator: {
                    select: {
                        userId: true,
                        email: true,
                        profile: true
                    }
                }
            }
        })
    }

    async findById(data: { statusId: string }) {
        return await this.prisma.status.findUnique({
            where: {
                statusId: data.statusId
            }
        })
    }

    async findByUnique(data: { userId: string, statusId: string }) {
        return await this.prisma.status.findUnique({
            where: {
                statusId: data.statusId,
                creatorId: data.userId
            }
        })
    }

    async findTodayUserStatus(data: { creatorId: string, now: Date }) {
        return await this.prisma.status.findMany({
            where: {
                creatorId: data.creatorId,
                expiredAt: {
                    gt: data.now
                }
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                creator: true
            }
        })
    }

    async findTodayStatus(data: { userId: string, friendIds: string[], now: Date }) {
        return await this.prisma.status.findMany({
            where: {
                creatorId: {
                    in: data.friendIds
                },
                AND: {
                    viewers: {
                        some: {
                            friend: {
                                friendId: data.userId
                            }
                        }
                    }
                },
                expiredAt: {
                    gt: data.now
                }
            },
            orderBy: {
                createdAt: "asc"
            },
            include: {
                creator: true,
                viewers: {
                    include: {
                        friend: {
                            select: {
                                friendId: true
                            }
                        }
                    }
                }
            }
        })
    }

    async deleteById(data: { statusId: string }) {
        return await this.prisma.status.delete({
            where: {
                statusId: data.statusId
            }
        })
    }
}