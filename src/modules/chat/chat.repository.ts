import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Chat } from "@prisma/client";

@Injectable()
export class ChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByRoomId(data: { roomId: string }): Promise<Chat[]> {
        return await this.prisma.chat.findMany({
            where: {
                roomId: data.roomId
            },
            include: {
                room: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async createChat(data: { roomId: string, userId: string, message: string }): Promise<Chat> {
        return await this.prisma.chat.create({
            data:data
        })
    }
}