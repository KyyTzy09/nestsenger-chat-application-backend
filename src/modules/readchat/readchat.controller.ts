import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }

    @Get(":chatId/get")
    @UseGuards(AuthGuard)
    getReadChat(@Req() req, @Param('chatId') chatId: string) {
        return this.readChatService.getReadChats({ userId: req.user.userId, chatId })
    }
}