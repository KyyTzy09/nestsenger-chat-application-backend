import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { createNewChatDto } from './chat.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    createNewChat(@Req() req, @Body() dto: createNewChatDto) {
        return this.chatService.createNewChat({ userId: req.user.userId, roomId: dto.roomId, message: dto.message, parentId: dto?.parentId })
    }

    @Delete(':chatId/delete')
    @UseGuards(AuthGuard)
    deleteChatForAll(@Req() req, @Param('chatId') chatId: string) {
        return this.chatService.deleteChatForAll({ userId: req.user.userId, chatId })
    }

    @Get(':roomId/get')
    @UseGuards(AuthGuard)
    getChatByRoomId(@Req() req, @Param('roomId') roomId: string) {
        return this.chatService.getChatByRoomId({ roomId, userId: req.user.userId })
    }

    @Get(':chatId/parent/get')
    @UseGuards(AuthGuard)
    getChatParent(@Req() req, @Param("chatId") chatId: string) {
        return this.chatService.getChatParent({ userId: req.user.userId, chatId })
    }
}
