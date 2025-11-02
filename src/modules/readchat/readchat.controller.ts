import { Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }

    @Patch(":chatId/update/patch")
    @UseGuards(AuthGuard)
    updateReadChat(@Req() req, @Param('chatId') chatId: string) {
        return this.readChatService.updateReadChat({ chatId, userId: req.user.userId })
    }

    @Get(":chatId/get")
    @UseGuards(AuthGuard)
    getReadChat(@Req() req, @Param('chatId') chatId: string) {
        return this.readChatService.getReadChats({ userId: req.user.userId, chatId })
    }
}