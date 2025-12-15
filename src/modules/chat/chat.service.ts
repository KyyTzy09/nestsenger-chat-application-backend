import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserRepository } from '../user/user.repository';
import { RoomRepository } from '../room/room.repository';
import { createNewChatDto, createNewChatWithMediaDto, deleteChatForAllDto, deleteChatForYourselfDto, getChatByRoomIdDto, getChatParentDto, getDeletedChatDto } from './chat.dto';
import { Chat, Friend, Prisma, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';
import { format } from 'date-fns';
import { ChatGateWay } from './chat.gateway';
import { AliasType } from 'src/shared/types/alias';
import { ResponseType } from 'src/shared/types/response';
import { ReadChatService } from '../readchat/readchat.service';
import { generateFileSize } from 'src/shared/helpers/generate-file-size';
import { GetMediaType } from 'src/shared/helpers/get-file-type';
import { UserGateWay } from '../user/user.gateway';
import { ChatGrouper } from 'src/shared/helpers/chat-grouper';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository, private readonly readChatService: ReadChatService, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly roomRepository: RoomRepository, private readonly chatGateway: ChatGateWay, private readonly userGateway: UserGateWay) { }

    async createNewChat(dto: createNewChatDto) {
        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new ForbiddenException("You Don't Have Access To This Room")
        }

        const roomMembers = existingRoom.members.filter(({ userId }) => {
            return userId !== dto.userId
        })

        let createdChat: Chat
        if (!dto.parentId) {
            createdChat = await this.chatRepository.createChat({ message: dto.message, roomId: dto.roomId, userId: dto.userId })
        } else {
            createdChat = await this.chatRepository.createChatWithParent(dto)
        }
        if (createdChat) {
            await this.readChatService.createReadChats({ chatId: createdChat.chatId, members: roomMembers })
            await this.roomRepository.updateLastMessage({ roomId: dto.roomId, chatId: createdChat.chatId })
        }

        this.chatGateway.handleNewChat(createdChat?.roomId, createdChat)
        roomMembers.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", createdChat)
        })

        return { data: createdChat }
    }

    async createNewChatWithMedia(dto: createNewChatWithMediaDto) {
        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new ForbiddenException("You Don't Have Access To This Room")
        }

        const roomMembers = existingRoom.members.filter(({ userId }) => {
            return userId !== dto.userId
        })

        const mediaSize = generateFileSize(dto.mediaSize)
        const mediaType = GetMediaType(dto.mediaName)
        let createdChat: Chat = await this.chatRepository.createNewChatWithMedia({
            roomId: dto.roomId,
            userId: dto.userId,
            parentId: dto.parentId,
            mediaName: dto.mediaName,
            mediaSize,
            mediaType,
            mediaUrl: dto.mediaUrl,
            message: dto.message
        })
        if (createdChat) {
            await this.readChatService.createReadChats({ chatId: createdChat.chatId, members: roomMembers })
            await this.roomRepository.updateLastMessage({ roomId: dto.roomId, chatId: createdChat.chatId })
        }

        this.chatGateway.handleNewChat(createdChat?.roomId, createdChat)
        existingRoom.members.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", createdChat)
        })

        return { data: createdChat }
    }

    async getChatByRoomId(dto: getChatByRoomIdDto) {
        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new HttpException("Room Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const allChats = await this.chatRepository.findByRoomId(dto)
        if (allChats.length === 0) {
            throw new HttpException("Chats Don't Exist In This Room", HttpStatus.NOT_FOUND)
        }

        const result = await Promise.all(
            allChats.map(async (chat) => {
                type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
                type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

                let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: chat.userId })
                if (!alias) {
                    alias = await this.userRepository.findUserInfo({ userId: chat.userId })
                }

                const aliasResult: AliasType = {
                    userId: alias?.userId as string,
                    alias: alias ? (alias as friendWithFriend)?.alias || "~" + (alias as User)?.email : "",
                    avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { chat, user: aliasResult }
            })
        )

        const groupedResult = ChatGrouper(result)
        const finalGrouped = Object.entries(groupedResult).map(([date, chats]) => ({
            date,
            chats
        }))

        return { data: finalGrouped }
    }

    async getChatParent(dto: getChatParentDto): Promise<ResponseType<{ chat: Chat | null, user: AliasType }>> {
        type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
        type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new HttpException("Chat Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const existingParent = await this.chatRepository.findById({ chatId: existingChat?.parentId! })
        if (!existingChat) {
            throw new HttpException("Chat Parent Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingParent?.userId! })
        if (!alias) {
            alias = await this.userRepository.findUserInfo({ userId: existingParent?.userId! })
        }

        const aliasResult: AliasType = {
            userId: alias?.userId as string,
            alias: alias ? (alias as friendWithFriend)?.alias || (alias as User)?.email : "",
            avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
        }

        return { message: "Parent Chat Data Retrieved Successfully", statusCode: HttpStatus.OK, data: { chat: existingParent, user: aliasResult } }
    }

    async deleteChatForAll(dto: deleteChatForAllDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't exist")
        } if (existingChat && existingChat.userId !== dto.userId) {
            throw new ForbiddenException("You Don't Have Access To Delete This Chat")
        }

        const existingDeletedChatData = await this.chatRepository.findDeletedChatByUnique(dto)
        if (existingDeletedChatData) {
            throw new ConflictException("This Chat Has Been Deleted")
        }

        const deletedChat = await this.chatRepository.deleteForAll(dto)
        if (deletedChat) {
            await this.chatRepository.updateMessage({ chatId: deletedChat.chatId, userId: existingChat.userId })
        }

        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: deletedChat.chat.roomId, userId: dto.userId })
        if (!existingRoom) throw new NotFoundException("Room Not Found")

        this.chatGateway.handleDeleteChat(deletedChat.chat.roomId)
        existingRoom.members.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", deletedChat)
        })

        return { message: "Deleted Chat For All Successfull", statusCode: HttpStatus.OK, data: deletedChat }
    }

    async getDeletedChat(dto: getDeletedChatDto) {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new NotFoundException("Room Not Found")
        }

        const existingDeletedChats = await this.chatRepository.getDeletedChatByRoomId(dto)
        if (existingDeletedChats.length === 0) {
            throw new NotFoundException("Deleted Chats Not Found")
        }

        return { data: existingDeletedChats }
    }

    async deleteChatForYourself(dto: deleteChatForYourselfDto) {
        type deletedChatWithChat = Prisma.DeletedChatGetPayload<{
            include: {
                chat: true
            }
        }>;

        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't exist")
        }

        let deletedChat: deletedChatWithChat
        const existingDeletedChatData = await this.chatRepository.findDeletedChatByUnique(dto)
        if (existingDeletedChatData) {
            deletedChat = await this.chatRepository.updateDeletedChat(dto)
        } else {
            deletedChat = await this.chatRepository.deleteForYourself(dto)
        }

        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: deletedChat.chat.roomId, userId: dto.userId })
        if (!existingRoom) throw new NotFoundException("Room Not Found")

        this.chatGateway.handleDeleteChat(deletedChat.chat.roomId)
        existingRoom.members.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", deletedChat)
        })
        
        return { data: deletedChat }
    }
}
