import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
                        user: {
                            select: {
                                email: true,
                                profile: true,
                                isOnline: true
                            }
                        }
                    }
                }
            }
        })
    }
}