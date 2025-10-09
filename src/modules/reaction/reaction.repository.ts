import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Reaction } from "@prisma/client";

@Injectable()
export class ReactionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createReaction(data: { content: string, userId: string, chatId: string }): Promise<Reaction> {
        return await this.prisma.reaction.create({
            data: {
                chatId: data.chatId,
                userId: data.userId,
                content: data.content,
            }
        })
    }
}