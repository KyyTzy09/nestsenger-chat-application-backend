import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Member } from "@prisma/client";

@Injectable()
export class ReadChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByChatId(data: { chatId: string }) {
        return await this.prisma.chatRead.findMany({
            where: {
                chatId: data.chatId
            },
            include: {
                user: {
                    select: {
                        userId: true
                    }
                }
            }
        })
    }

    async createMany(data: { members: Member[], chatId: string }) {
        return await this.prisma.chatRead.createMany({
            data: data.members.map(({ memberId }) => ({
                chatId: data.chatId,
                userId: memberId
            }))
        })
    }
}