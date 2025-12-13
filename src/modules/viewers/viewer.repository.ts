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
            })),
            skipDuplicates: true
        })
    }

    async findByUnique(data: { viewerId: string, statusId: string }) {
        return await this.prisma.statusViewer.findUnique({
            where: {
                statusId_viewerId: data
            }
        })
    }
    
}