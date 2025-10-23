import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserRepository } from '../user/user.repository';
import { RoomRepository } from '../room/room.repository';
import { createNewChatDto, deleteChatForAllDto, deleteChatForYourselfDto, getChatByRoomIdDto, getChatParentDto, getDeletedChatDto } from './chat.dto';
import { Chat, DeletedChat, Friend, Prisma, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';
import { format } from 'date-fns';
import { ChatWithAliasType } from 'src/shared/types/chat';
import { ChatGateWay } from './chat.gateway';
import { AliasType } from 'src/shared/types/alias';
import { ResponseType } from 'src/shared/types/response';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly roomRepository: RoomRepository, private readonly chatGateway: ChatGateWay) { }

    async createNewChat(dto: createNewChatDto): Promise<ResponseType<Chat>> {
        const existingRoom = await this.roomRepository.findRoomIdWithMember({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new ForbiddenException("You Don't Have Access To This Room")
        }

        let createdChat: Chat
        if (!dto.parentId) {
            createdChat = await this.chatRepository.createChat({ message: dto.message, roomId: dto.roomId, userId: dto.userId })
        } else {
            createdChat = await this.chatRepository.createChatWithParent(dto)
        }
        if (createdChat) {
            await this.roomRepository.updateLastMessage({ roomId: dto.roomId, chatId: createdChat.chatId })
        }

        this.chatGateway.server.to(createdChat?.roomId).emit("newMessage", createdChat)
        this.chatGateway.server.to("current-room").emit("refreshRoom")
        return { message: "Chat Created Successfully", statusCode: HttpStatus.CREATED, data: createdChat }
    }

    async getChatByRoomId(dto: getChatByRoomIdDto): Promise<ResponseType<{ date: string, chats: ChatWithAliasType[] }[]>> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
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
                    name: alias ? (alias as friendWithFriend)?.alias || "~" + (alias as User)?.email : "",
                    avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { chat, alias: aliasResult }
            })
        )

        const groupedResult = result.reduce((acc, data) => {
            const dateKey = format(new Date(data?.chat?.createdAt!), "MM/dd/yyyy");

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            acc[dateKey].push({
                chat: data.chat!,
                alias: data.alias
            });

            return acc;
        }, {} as Record<string, { chat: Chat; alias: Friend | Partial<User> | null }[]>)

        const finalGrouped = Object.entries(groupedResult).map(([date, chats]) => ({
            date,
            chats
        }))

        return { message: "Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: finalGrouped }
    }

    async getChatParent(dto: getChatParentDto): Promise<ResponseType<{ chat: Chat | null, alias: AliasType }>> {
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
            name: alias ? (alias as friendWithFriend)?.alias || (alias as User)?.email : "",
            avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
        }

        return { message: "Parent Chat Data Retrieved Successfully", statusCode: HttpStatus.OK, data: { chat: existingParent, alias: aliasResult } }
    }

    async deleteChatForAll(dto: deleteChatForAllDto): Promise<ResponseType<DeletedChat>> {
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
        this.chatGateway.server.to(deletedChat.chat.roomId).emit("deletedChat")
        return { message: "Deleted Chat For All Successfull", statusCode: HttpStatus.OK, data: deletedChat }
    }

    async getDeletedChat(dto: getDeletedChatDto): Promise<ResponseType<DeletedChat[]>> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new NotFoundException("Room Not Found")
        }

        const existingDeletedChats = await this.chatRepository.getDeletedChatByRoomId(dto)
        if (existingDeletedChats.length === 0) {
            throw new NotFoundException("Deleted Chats Not Found")
        }

        return { message: "Deleted Chat Data Retrieved Successfull", statusCode: HttpStatus.OK, data: existingDeletedChats }
    }

    async deleteChatForYourself(dto: deleteChatForYourselfDto): Promise<ResponseType<DeletedChat>> {
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

        this.chatGateway.server.to(deletedChat?.chat?.roomId).emit("deletedChat")
        return { message: "Deleted Chat Successfully", statusCode: HttpStatus.OK, data: deletedChat }
    }
}
