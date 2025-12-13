import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ViewerRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createViewers(data: { userIds: string[], statusId: string }) {
        return await this.prisma.statusViewer.createMany({
            data: data.userIds.map((v) => ({
                viewerId: v,
                statusId: data.statusId
            }))
        })
    }

    async findTodayUserViewers(data: { userId: string, now: Date }) {
        return await this.prisma.statusViewer.findMany({
            where: {
                friend: {
                    friendId: data.userId
                },
                status: {
                    expiredAt: {
                        gt: data.now
                    }
                }
            }
        })
    }

    async findByUnique(data: { viewerId: string, statusId: string }) {
        return await this.prisma.statusViewer.findUnique({
            where: {
                statusId_viewerId: data
            }
        })
    }

    async updateView(data: { viewerId: string, statusId: string }) {
        return await this.prisma.statusViewer.update({
            where: {
                statusId_viewerId: data
            },
            data: {
                isViewed: true
            }
        })
    }
}