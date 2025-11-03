import { Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }

    @Patch(":roomId/patch")
    @UseGuards(AuthGuard)
    updateReadChat(@Req() req, @Param('roomId') roomId: string) {
        return this.readChatService.readChats({ roomId, userId: req.user.userId })
    }

    @Get(":chatId/get")
    @UseGuards(AuthGuard)
    getReadChat(@Req() req, @Param('chatId') chatId: string) {
        return this.readChatService.getReadChats({ userId: req.user.userId, chatId })
    }
}