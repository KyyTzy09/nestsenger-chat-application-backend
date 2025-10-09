import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Reaction } from "@prisma/client";

@Injectable()
export class ReactionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUnique(data: { chatId: string, userId: string }): Promise<Reaction | null> {
        return await this.prisma.reaction.findUnique({
            where: {
                userId_chatId: {
                    chatId: data.chatId,
                    userId: data.userId
                }
            }
        })
    }

    async upsertReaction(data: { content: string, userId: string, chatId: string }): Promise<Reaction> {
        return await this.prisma.reaction.upsert({
            where: {
                userId_chatId: {
                    chatId: data.chatId,
                    userId: data.userId
                }
            },
            create: {
                chatId: data.chatId,
                userId: data.userId,
                content: data.content,
            },
            update: {
                content: data.content
            }
        })
    }
}