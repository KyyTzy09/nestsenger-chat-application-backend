import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { createNewChatDto } from './chat.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    createNewChat(@Req() req, @Body() dto: createNewChatDto) {
        return this.chatService.createNewChat({ userId: req.user.userId, roomId: dto.roomId, message: dto.message })
    }

    @Get(':roomId/get')
    getChatByRoomId(@Param('roomId') roomId: string) {
        return this.chatService.getChatByRoomId({ roomId })
    }
}
