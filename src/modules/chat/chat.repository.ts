import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Chat } from "@prisma/client";

@Injectable()
export class ChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(data: { chatId: string }): Promise<Chat | null> {
        return await this.prisma.chat.findUnique({
            where: {
                chatId: data.chatId
            },
            include: {
                sender: {
                    select: {
                        userId: true,
                    }
                }
            }
        })
    }

    async findByRoomId(data: { roomId: string }): Promise<Chat[]> {
        return await this.prisma.chat.findMany({
            where: {
                roomId: data.roomId
            },
            include: {
                room: true
            },
            orderBy: {
                createdAt: "asc"
            }
        })
    }

    async createChat(data: { roomId: string, userId: string, message: string }): Promise<Chat> {
        return await this.prisma.chat.create({
            data: data
        })
    }
}