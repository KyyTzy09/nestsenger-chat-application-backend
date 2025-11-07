import { ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { CountRoomUnreadChatsDto, CreateReadChatsDto, GetReadChatsDto, IsChatReadDto, UpdateReadChatDto } from "./readchat.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { Friend, Prisma, User } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";
import { MemberRepository } from "../member/member.repository";
import { ChatGateWay } from "../chat/chat.gateway";
import { ResponseType } from "src/shared/types/response";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly chatGateway: ChatGateWay) { }

    async countRoomUnreadChats(dto: CountRoomUnreadChatsDto): Promise<ResponseType<number>> {
        const countUnreadChats = await this.readChatRepository.countRoomUnreadChats(dto)
        if (countUnreadChats === 0) {
            throw new NotFoundException("All Chat's Has Been Readed")
        }

        return { message: "Count Unread Chats Successfully", statusCode: HttpStatus.OK, data: countUnreadChats }
    }

    async readChats(dto: UpdateReadChatDto) {
        const existingReadChats = await this.readChatRepository.findManyByRoomId({ roomId: dto.roomId, userId: dto.userId })
        if (existingReadChats.length === 0) throw new NotFoundException("Read Chat Not Founds")
        const readChatIds = existingReadChats.map(({ chatReadId }) => { return chatReadId })

        const updatedReadChats = await this.readChatRepository.updateMany({ readChatIds: readChatIds })

        this.chatGateway.server.to(dto.roomId).emit("readChatUpdate")
        return { message: "ReadChats Updated Successfull", statusCode: HttpStatus.OK, count: updatedReadChats.count }
    }

    async isChatHasRead(dto: IsChatReadDto): Promise<ResponseType<boolean>> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) throw new NotFoundException("Chat Not Found")

        const existingMembers = await this.memberRepository.findWithoutSpecificUSerId({ userId: dto.userId, roomId: existingChat.roomId })
        if (existingMembers.length === 0) throw new NotFoundException("Member Data Not Founds")

        const existingReadChats = await this.readChatRepository.findReadedChats({ chatId: dto.chatId })
        if (existingReadChats.length === 0) throw new NotFoundException("ReadChat Data Not Founds")

        return { message: "Read Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: existingMembers.length === existingReadChats.length }
    }

    async createReadChats(dto: CreateReadChatsDto) {
        const createdReadChats = await this.readChatRepository.createMany(dto)

        return { message: "ReadChats Created Successfull", statusCode: HttpStatus.CREATED, data: createdReadChats }
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