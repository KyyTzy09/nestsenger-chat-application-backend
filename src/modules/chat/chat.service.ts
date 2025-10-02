import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserRepository } from '../user/user.repository';
import { RoomRepository } from '../room/room.repository';
import { createNewChatDto, getChatByRoomIdDto } from './chat.dto';
import { Chat, Friend, User } from '@prisma/client';
import { FriendRepository } from '../friend/friend.repository';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly roomRepository: RoomRepository) { }

    async createNewChat(dto: createNewChatDto): Promise<{ message: string, statusCode: number, data: Chat }> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const createdChat = await this.chatRepository.createChat(dto)
        return { message: "Chat Created Successfully", statusCode: HttpStatus.CREATED, data: createdChat }
    }

    async getChatByRoomId(dto: getChatByRoomIdDto): Promise<{ message: string, statusCode: number, data: { chat: Chat[], alias: User | Friend }[] | {}[] }> {
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

        return { message: "Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: result }
    }
}
