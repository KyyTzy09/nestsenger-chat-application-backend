import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserRepository } from '../user/user.repository';
import { RoomRepository } from '../room/room.repository';
import { createNewChatDto, deleteChatForAllDto, getChatByRoomIdDto, getChatParentDto } from './chat.dto';
import { Chat, Friend, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';
import { format } from 'date-fns';
import { ChatWithAliasType } from 'src/shared/types/chat';
import { ChatGateWay } from './chat.gateway';
import { AliasType } from 'src/shared/types/alias';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly roomRepository: RoomRepository, private readonly chatGateway: ChatGateWay) { }

    async createNewChat(dto: createNewChatDto): Promise<{ message: string, statusCode: number, data: Chat }> {
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

    async getChatByRoomId(dto: getChatByRoomIdDto): Promise<{ message: string, statusCode: number, data: { date: string, chats: ChatWithAliasType[] }[] }> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const allChats = await this.chatRepository.findByRoomId(dto)
        if (allChats.length === 0) {
            throw new HttpException("Chats Don't Exist In This Room", HttpStatus.NOT_FOUND)
        }

        const result = await Promise.all(
            allChats.map(async ({ chatId, userId }) => {
                const chat = await this.chatRepository.findById({ chatId })
                let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: userId })
                if (!alias) {
                    alias = await this.userRepository.findUserInfo({ userId })
                }
                return { chat, alias }
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

    async getChatParent(dto: getChatParentDto): Promise<{ message: string, statusCode: number, data: { chat: Chat | null, alias: Friend | Partial<User> | null } }> {
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

        return { message: "Parent Chat Data Retrieved Successfully", statusCode: HttpStatus.OK, data: { chat: existingParent, alias } }
    }

    async deleteChatForAll(dto: deleteChatForAllDto): Promise<{ message: string, statusCode: number, data: Chat }> {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't exist")
        } if (existingChat && existingChat.userId !== dto.userId) {
            throw new ForbiddenException("You Don't Have Access To Delete This Chat")
        }

        const deletedChat = await this.chatRepository.deleteById({ chatId: dto.chatId })
        return { message: "Deleted Chat For All Successfull", statusCode: HttpStatus.OK, data: deletedChat }
    }
}
