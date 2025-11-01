import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { CreateReadChatsDto, GetReadChatsDto } from "./readchat.dto";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository) { }

    async createReadChats(dto: CreateReadChatsDto) {
        const createdReadChats = await this.readChatRepository.createMany(dto)

        return { message: "ReadChats created successfully", statusCode: HttpStatus.CREATED, data: createdReadChats }
    }

    async getReadChats(dto: GetReadChatsDto) {
        const existingChat = await this.chatRepository.findById({ chatId: dto.chatId })
        if (!existingChat) {
            throw new NotFoundException("Chat Doesn't Exist")
        }

        const existingReadChats = await this.readChatRepository.findByChatId({ chatId: dto.chatId })
        if (existingReadChats.length === 0) {
            throw new NotFoundException("ReadChats Don't Exist In This Chat")
        }

        return { message: "Read Chat Data Retrieved Successfull", statusCode: HttpStatus.OK, data: existingReadChats }
    }
}