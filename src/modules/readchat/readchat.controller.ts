import { Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
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

    @Get(":roomId/unread/get")
    @UseGuards(AuthGuard)
    countUnreadChats(@Req() req, @Param('roomId') roomId: string) {
        return this.readChatService.countRoomUnreadChats({ userId: req.user.userId, roomId })
    }

    @Get(':chatId/has-read/get')
    @UseGuards(AuthGuard)
    isChatHasRead(@Req() req, @Param('chatId') chatId: string) {
        return this.readChatService.isChatHasRead({ userId: req.user.userId, chatId })
    }

    @Patch(":roomId/patch")
    @UseGuards(AuthGuard)
    updateReadChat(@Req() req, @Param('roomId') roomId: string) {
        return this.readChatService.readChats({ roomId, userId: req.user.userId })
    }
}