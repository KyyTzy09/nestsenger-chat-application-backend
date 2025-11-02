import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { CreateReadChatsDto, GetReadChatsDto, UpdateReadChatDto } from "./readchat.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { Friend, Prisma, User } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";
import { MemberRepository } from "../member/member.repository";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async updateReadChat(dto: UpdateReadChatDto) {
        const existingChats = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChats) {
            throw new NotFoundException("Chat Not Found")
        }

        const existingMember = await this.memberRepository.findByUnique({ roomId: existingChats.roomId, userId: dto.userId })
        if (!existingMember) {
            throw new NotFoundException("Member Not Found")
        }

        const existingReadChat = await this.readChatRepository.findByUnique({ chatId: dto.chatId, readerId: existingMember.memberId })
        if (!existingReadChat) {
            throw new NotFoundException("Read Chat Doesn't Exist")
        }

        const updatedReadChat = await this.readChatRepository.updateReadChat({ chatId: dto.chatId, readerId: existingMember.memberId })
        return { message: "ReadChats updated successfull", statusCode: HttpStatus.OK, data: updatedReadChat }
    }

    async createReadChats(dto: CreateReadChatsDto) {
        const createdReadChats = await this.readChatRepository.createMany(dto)

        return { message: "ReadChats created successfull", statusCode: HttpStatus.CREATED, data: createdReadChats }
    }

    async getReadChats(dto: GetReadChatsDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        } else if (existingChat.userId !== dto.userId) {
            throw new ForbiddenException("You Don't Have Access To This Chat")
        }

        const existingReadChats = await this.readChatRepository.findByChatId(dto)
        if (existingReadChats.length === 0) {
            throw new NotFoundException("ReadChats Don't Exist In This Chat")
        }

        const result = await Promise.all(
            existingReadChats.map(async (readChat) => {
                type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
                type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

                let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: readChat.reader.userId })
                if (!alias) {
                    alias = await this.userRepository.findUserInfo({ userId: readChat.reader.userId })
                }

                const aliasResult: AliasType = {
                    userId: alias?.userId as string,
                    name: alias ? (alias as friendWithFriend)?.alias || "~" + (alias as User)?.email : "",
                    avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { readChat, alias: aliasResult }
            })
        )

        return { message: "Read Chat Data Retrieved Successfull", statusCode: HttpStatus.OK, data: result }
    }
}