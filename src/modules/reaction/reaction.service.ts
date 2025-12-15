import { ConflictException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ReactionRepository } from './reaction.repository';
import { createReactionDto, deleteReactionByIdDto, getChatReactionsByRoomIdDto, getChatReactionsDto, getUserReactionDto } from './reaction.dto';
import { UserRepository } from '../user/user.repository';
import { ChatRepository } from '../chat/chat.repository';
import { Friend, Prisma, Reaction, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';
import { AliasType } from 'src/shared/types/alias';
import { ResponseType } from 'src/shared/types/response';
import { RoomRepository } from '../room/room.repository';
import { ReactionGateway } from './reaction.gateway';

@Injectable()
export class ReactionService {
    constructor(private readonly reactionRepository: ReactionRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly chatRepository: ChatRepository, private readonly reactionGateway: ReactionGateway, private readonly roomRepository: RoomRepository) { }

    async createReaction(dto: createReactionDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }
        const createdReaction = await this.reactionRepository.upsertReaction(dto)

        this.reactionGateway.handleUpdateReaction(createdReaction.chat.roomId, createdReaction)
        return { data: createdReaction }
    }

    async deleteReactionById(dto: deleteReactionByIdDto): Promise<ResponseType<Reaction>> {
        const existingReaction = await this.reactionRepository.finduserReaction(dto)
        if (!existingReaction) {
            throw new NotFoundException("Reaction Doesn't Exist")
        }

        const deletedReaction = await this.reactionRepository.deleteById(dto)

        this.reactionGateway.handleUpdateReaction(deletedReaction.chat.roomId, deletedReaction)
        return { message: "Reaction Deleted Successfull", statusCode: HttpStatus.OK, data: deletedReaction }
    }

    async getUserReaction(dto: getUserReactionDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const existingReaction = await this.reactionRepository.findByUnique(dto)
        if (!existingReaction) {
            throw new NotFoundException("Reaction Doesn't Exist In This Chat")
        }

        return { data: existingReaction }
    }

    async getChatReactionsByRoomId(dto: getChatReactionsByRoomIdDto) {
        const existingUser = await this.userRepository.findById({ ...dto })
        if (!existingUser) throw new UnauthorizedException("User Not Registered")

        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) throw new NotFoundException("Room Not Found")

        const reactions = await this.reactionRepository.findByRoomId({ roomId: dto.roomId })
        if (reactions.length === 0) throw new NotFoundException("Reaction Data Not Founds")

        const result = await Promise.all(reactions.map(async (reaction) => {
            type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
            type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>
            let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: reaction.userId })
            if (!alias) {
                alias = await this.userRepository.findUserInfo({ userId: reaction.userId })
            }

            const aliasResult: AliasType = {
                userId: alias?.userId as string,
                alias: alias ? (alias as friendWithFriend)?.alias || (alias as User)?.email : "",
                avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
            }
            return { reaction, user: aliasResult }
        }))

        return { data: result }
    }

    async getChatReactions(dto: getChatReactionsDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const existingReactions = await this.reactionRepository.findChatReactions({ chatId: dto.chatId })
        if (existingReactions.length === 0) {
            throw new NotFoundException("Reactions Don't Exist In This Chat")
        }

        const result = await Promise.all(existingReactions.map(async ({ chatId, userId }, i) => {
            type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
            type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

            const reaction = await this.reactionRepository.findByUnique({ chatId, userId })
            let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: userId })
            if (!alias) {
                alias = await this.userRepository.findUserInfo({ userId })
            }

            const aliasResult: AliasType = {
                userId: alias?.userId as string,
                alias: alias ? (alias as friendWithFriend)?.alias || (alias as User)?.email : "",
                avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
            }
            return { reaction, user: aliasResult }
        }))

        return { data: result }
    }
}
