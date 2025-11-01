import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ReadChatRepository } from "./readchat.repository";
import { ChatRepository } from "../chat/chat.repository";
import { ResponseType } from "src/shared/types/response";
import { GetReadChatsDto } from "./readchat.dto";

@Injectable()
export class ReadChatService {
    constructor(private readonly readChatRepository: ReadChatRepository, private readonly chatRepository: ChatRepository) { }

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