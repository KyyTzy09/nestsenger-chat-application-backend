import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { CreateReadChatsDto, GetReadChatsDto, UpdateReadChatDto } from "./readchat.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { Friend, Prisma, User } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";
import { MemberRepository } from "../member/member.repository";
import { ChatGateWay } from "../chat/chat.gateway";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly chatGateway: ChatGateWay) { }

    async readChats(dto: UpdateReadChatDto) {
        const existingChats = await this.chatRepository.findByRoomId({ roomId: dto.roomId, userId: dto.userId })
        if (existingChats.length === 0) throw new NotFoundException("Chat Not Founds")
        const chatIds = existingChats.map(({ chatId }) => { return chatId })

        const existingReadChats = await this.readChatRepository.findManyByChatId({ chatIds })
        if (existingReadChats.length === 0) throw new NotFoundException("Read Chat Not Founds")
        const readChatIds = existingReadChats.map(({ chatReadId }) => { return chatReadId })

        const updatedReadChats = await this.readChatRepository.updateMany({ readChatIds: readChatIds })
        this.chatGateway.server.to(dto.roomId).emit("readChatUpdate")
        
        return { message: "ReadChats Updated Successfull", statusCode: HttpStatus.OK, count: updatedReadChats.count }
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