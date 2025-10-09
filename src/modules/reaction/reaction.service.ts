import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ReactionRepository } from './reaction.repository';
import { CreateReactionDto } from './reaction.dto';
import { UserRepository } from '../user/user.repository';
import { ChatRepository } from '../chat/chat.repository';
import { Reaction } from '@prisma/client';

@Injectable()
export class ReactionService {
    constructor(private readonly reactionRepository: ReactionRepository, private readonly userRepository: UserRepository, private readonly chatRepository: ChatRepository) { }

    async createReaction(dto: CreateReactionDto): Promise<{ message: string, statusCode: number, data: Reaction }> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const createdReaction = await this.reactionRepository.createReaction(dto)

        return { message: "Reaction Created Successfull", statusCode: HttpStatus.CREATED, data: createdReaction }
    }
}
