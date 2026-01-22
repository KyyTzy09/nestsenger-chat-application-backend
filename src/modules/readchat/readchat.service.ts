import { ForbiddenException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { CountAllRoomUnreadChatsDto, CountRoomUnreadChatsDto, CreateReadChatsDto, GetReadChatsByRoomIdDto, GetReadChatsDto, IsChatReadDto, UpdateReadChatDto } from "./readchat.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { Friend, Prisma, User } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";
import { MemberRepository } from "../member/member.repository";
import { RoomRepository } from "../room/room.repository";
import { ReadChatGateway } from "./readChat.gateway";
import { UserGateWay } from "../user/user.gateway";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly roomRepository: RoomRepository, private readonly readChatGateway: ReadChatGateway, private readonly userGateway: UserGateWay) { }

    async countAllRoomUnreadChats(dto: CountAllRoomUnreadChatsDto) {
        const countUnreadChats = await this.readChatRepository.countAllRoomUnreadChats(dto);

        if (countUnreadChats === 0) throw new NotFoundException("Unread Chat Not Founds");

        return { count: countUnreadChats }
    }

    async countRoomUnreadChats(dto: CountRoomUnreadChatsDto) {
        const countUnreadChats = await this.readChatRepository.countRoomUnreadChats(dto)
        if (countUnreadChats === 0) {
            throw new NotFoundException("All Chat's Has Been Readed")
        }

        return { data: countUnreadChats }
    }

    async readChats(dto: UpdateReadChatDto) {
        const existingReadChats = await this.readChatRepository.findUnreadChatsByRoomId({ roomId: dto.roomId, userId: dto.userId })
        if (existingReadChats.length === 0) throw new NotFoundException("Unread Chat Not Founds")
        const readChatIds = existingReadChats.map(({ chatReadId }) => { return chatReadId })

        const updatedReadChats = await this.readChatRepository.updateMany({ readChatIds: readChatIds })

        this.readChatGateway.handleUpdateReadChat(dto.roomId)
        this.userGateway.emitToUserRoom(dto.userId, "room:refresh", dto.roomId)
        return { count: updatedReadChats.count }
    }

    async isChatHasRead(dto: IsChatReadDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) throw new NotFoundException("Chat Not Found")

        const existingMembers = await this.memberRepository.findWithoutSpecificUSerId({ userId: dto.userId, roomId: existingChat.roomId })
        if (existingMembers.length === 0) throw new NotFoundException("Member Data Not Founds")

        const existingReadChats = await this.readChatRepository.findReadedChats({ chatId: dto.chatId })
        if (existingReadChats.length === 0) throw new NotFoundException("ReadChat Data Not Founds")

        return { data: existingMembers.length === existingReadChats.length }
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
                    alias: alias ? (alias as friendWithFriend)?.alias || "~" + (alias as User)?.email : "",
                    avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { readChat, user: aliasResult }
            })
        )

        return { data: result }
    }

    async getReadChatsByRoomId(dto: GetReadChatsByRoomIdDto) {
        const existingUser = await this.userRepository.findById(dto)
        if (!existingUser) throw new UnauthorizedException("User Not Registered")

        const existingRoom = await this.roomRepository.findRoomById(dto)
        if (!existingRoom) throw new NotFoundException("Room Not Found")

        const existingReadChats = await this.readChatRepository.findManyByRoomId(dto)
        if (existingReadChats.length === 0) {
            throw new NotFoundException("ReadChats Don't Exist In This Room")
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
                    alias: alias ? (alias as friendWithFriend)?.alias || "~" + (alias as User)?.email : "",
                    avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { readChat, user: aliasResult }
            })
        )

        return { data: result }
    }
}