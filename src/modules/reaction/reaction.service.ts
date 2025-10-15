import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ReactionRepository } from './reaction.repository';
import { createReactionDto, deleteReactionByIdDto, getChatReactionsDto, getUserReactionDto } from './reaction.dto';
import { UserRepository } from '../user/user.repository';
import { ChatRepository } from '../chat/chat.repository';
import { Friend, Reaction, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';
import { AliasType } from 'src/shared/types/alias';
import { ChatGateWay } from '../chat/chat.gateway';

@Injectable()
export class ReactionService {
    constructor(private readonly reactionRepository: ReactionRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly chatRepository: ChatRepository, private readonly chatGateway: ChatGateWay) { }

    async createReaction(dto: createReactionDto): Promise<{ message: string, statusCode: number, data: Reaction }> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }
        const createdReaction = await this.reactionRepository.upsertReaction(dto)

        this.chatGateway.server.to(existingChat?.roomId).emit("updateReaction", createdReaction)
        return { message: "Reaction Created Successfull", statusCode: HttpStatus.CREATED, data: createdReaction }
    }

    async deleteReactionById(dto: deleteReactionByIdDto): Promise<{ message: string, statusCode: number, data: Reaction }> {
        const existingReaction = await this.reactionRepository.finduserReaction(dto)
        if (!existingReaction) {
            throw new NotFoundException("Reaction Doesn't Exist")
        }

        const deletedReaction = await this.reactionRepository.deleteById(dto)
        this.chatGateway.server.to(deletedReaction?.chat?.roomId).emit("updateReaction", deletedReaction)
        return { message: "Reaction Deleted Successfull", statusCode: HttpStatus.OK, data: deletedReaction }
    }

    async getUserReaction(dto: getUserReactionDto): Promise<{ message: string, statusCode: number, data: Reaction }> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const existingReaction = await this.reactionRepository.findByUnique(dto)
        if (!existingReaction) {
            throw new NotFoundException("Reaction Doesn't Exist In This Chat")
        }

        return { message: "Reaction Data Retrieved Successfull", statusCode: HttpStatus.OK, data: existingReaction }
    }

    async getChatReactions(dto: getChatReactionsDto): Promise<{ message: string, statusCode: number, data: { reaction: Reaction, alias: AliasType }[] | {}[] }> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const existingReactions = await this.reactionRepository.findChatReactions({ chatId: dto.chatId })
        if (existingReactions.length === 0) {
            throw new NotFoundException("Reactions Don't Exist In This Chat")
        }

        const result = await Promise.all(existingReactions.map(async ({ chatId, userId }, i) => {
            const reaction = await this.reactionRepository.findByUnique({ chatId, userId })
            let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: userId })
            if (!alias) {
                alias = await this.userRepository.findUserInfo({ userId })
            }

            return { reaction, alias }
        }))

        return { message: "Chat Reactions Retrieved Successfull", statusCode: HttpStatus.OK, data: result }
    }
}
