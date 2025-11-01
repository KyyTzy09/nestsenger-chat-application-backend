import { Controller, Get, Param } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }

    @Get(":chatId/get")
    getReadChat(@Param('chatId') chatId: string) {
        return this.readChatService.getReadChats({ chatId })
    }
}