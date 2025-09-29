import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserRepository } from '../user/user.repository';
import { RoomRepository } from '../room/room.repository';
import { createNewChatDto, getChatByRoomIdDto } from './chat.dto';
import { Chat } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository, private readonly userRepository: UserRepository, private readonly roomRepository: RoomRepository) { }

    async createNewChat(dto: createNewChatDto): Promise<{ message: string, statusCode: number, data: Chat }> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const createdChat = await this.chatRepository.createChat(dto)
        return { message: "Chat Created Successfully", statusCode: HttpStatus.CREATED, data: createdChat }
    }

    async getChatByRoomId(dto: getChatByRoomIdDto): Promise<{ message: string, statusCode: number, data: Chat[] }> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Doesn't Exist", HttpStatus.NOT_FOUND)
        }

        const existingChat = await this.chatRepository.findByRoomId(dto)
        if (existingChat.length === 0) {
            throw new HttpException("Chats Don't Exist In This Room", HttpStatus.NOT_FOUND)
        }

        return { message: "Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: existingChat }
    }
}
