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

    async findTodayStatus(data: { friendIds: string[] }) {
        return await this.prisma.status.findMany({
            where: {
                creatorId: {
                    in : data.friendIds
                },
            }
        })
    }
}