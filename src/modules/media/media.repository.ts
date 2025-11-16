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
}