import { Controller, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ReadChatService } from "./readchat.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseType } from "src/shared/types/response";
import { ChatRead } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";

@Controller("readchat")
export class ReadChatController {
    constructor(private readonly readChatService: ReadChatService) { }

    @Get("unread/get")
    @UseGuards(AuthGuard)
    async getAllUnreadChats(@Req() req) {
        const result = await this.readChatService.countAllRoomUnreadChats({ userId: req.user.userId });
        return { message: "Count Unread Chats Successfully", statusCode: HttpStatus.OK, data: result.count }
    }

    @Get(":chatId/get")
    @UseGuards(AuthGuard)
    async getReadChat(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<{ readChat: ChatRead, user: AliasType }[]>> {
        const results = await this.readChatService.getReadChats({ userId: req.user.userId, chatId })
        return { message: "Read Chat Data Retrieved Successfull", statusCode: HttpStatus.OK, data: results.data }
    }

    @Get(":roomId/room/get")
    @UseGuards(AuthGuard)
    async getReadChatsByRoomId(@Req() req, @Param("roomId") roomId: string): Promise<ResponseType<{ readChat: ChatRead, user: AliasType }[]>> {
        const results = await this.readChatService.getReadChatsByRoomId({ userId: req.user.userId, roomId })

        return { message: "Read Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: results.data }
    }

    @Get(":roomId/unread/get")
    @UseGuards(AuthGuard)
    async countUnreadChats(@Req() req, @Param('roomId') roomId: string): Promise<ResponseType<number>> {
        const countUnreadChats = await this.readChatService.countRoomUnreadChats({ userId: req.user.userId, roomId })
        return { message: "Count Unread Chats Successfully", statusCode: HttpStatus.OK, data: countUnreadChats.data }
    }

    @Get(':chatId/has-read/get')
    @UseGuards(AuthGuard)
    async isChatHasRead(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<boolean>> {
        const result = await this.readChatService.isChatHasRead({ userId: req.user.userId, chatId })
        return { message: "Read Chat Retrieved Successfull", statusCode: HttpStatus.OK, data: result.data }
    }

    @Patch(":roomId/patch")
    @UseGuards(AuthGuard)
    async updateReadChat(@Req() req, @Param('roomId') roomId: string): Promise<{ message: string, statusCode: number, count: number }> {
        const updatedReadChats = await this.readChatService.readChats({ roomId, userId: req.user.userId })
        return { message: "ReadChats Updated Successfull", statusCode: HttpStatus.OK, count: updatedReadChats.count }
    }
}