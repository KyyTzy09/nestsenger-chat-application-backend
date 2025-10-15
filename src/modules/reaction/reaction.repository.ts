import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Reaction } from "@prisma/client";

@Injectable()
export class ReactionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(data: { reactionId: string }): Promise<Reaction | null> {
        return await this.prisma.reaction.findUnique({
            where: {
                reactionId: data.reactionId
            },
            include: {
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                }
            }
        })
    }

    async finduserReaction(data: { reactionId: string, userId: string }): Promise<Reaction | null> {
        return await this.prisma.reaction.findUnique({
            where: {
                reactionId: data.reactionId,
                userId: data.userId
            }
        })
    }

    async findChatReactions(data: { chatId: string }): Promise<Reaction[]> {
        return await this.prisma.reaction.findMany({
            where: {
                chatId: data.chatId
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
    }

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

    async upsertReaction(data: { content: string, userId: string, chatId: string }) {
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
            },
            include: {
                chat: {
                    select: {
                        roomId: true
                    }
                }
            }
        })
    }

    async deleteById(data: { reactionId: string }) {
        return await this.prisma.reaction.delete({
            where: {
                reactionId: data.reactionId
            },
            include: {
                chat: {
                    select: {
                        roomId: true
                    }
                }
            }
        })
    }
}