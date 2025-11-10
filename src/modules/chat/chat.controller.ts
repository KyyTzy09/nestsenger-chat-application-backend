import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { createNewChatDto, createNewChatWithMediaDto, deleteChatForYourselfDto } from './chat.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MEDIA_FIELD_NAME, MEDIA_UPLOAD_PATH } from 'src/shared/constants/upload';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    createNewChat(@Req() req, @Body() dto: createNewChatDto) {
        return this.chatService.createNewChat({ userId: req.user.userId, roomId: dto.roomId, message: dto.message, parentId: dto?.parentId })
    }

    @Post('create-media/post')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor(MEDIA_FIELD_NAME, {
        storage: diskStorage({
            destination: MEDIA_UPLOAD_PATH,
            filename(_req, file, cb) {
                const uniqueSuffix = "media" + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    createNewChatWithMedia(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() dto: createNewChatWithMediaDto) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const mediaUrl = `${baseUrl}/uploads/media/${file.filename}`;

        return this.chatService.createNewChatWithMedia({ userId: req.user.userId, roomId: dto.roomId, mediaUrl, mediaName: file.filename, mediaSize: file.size, parentId: dto.parentId, message: dto.message });
    }

    @Delete('for-all/:chatId/delete')
    @UseGuards(AuthGuard)
    deleteChatForAll(@Req() req, @Param('chatId') chatId: string) {
        return this.chatService.deleteChatForAll({ userId: req.user.userId, chatId })
    }

    @Delete("for-self/:chatId/delete")
    @UseGuards(AuthGuard)
    deleteChatForYourSelf(@Req() req, @Param('chatId') chatId: string) {
        return this.chatService.deleteChatForYourself({ userId: req.user.userId, chatId })
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

    @Get('deleted-chat/:roomId/get')
    getDeletedChat(@Param("roomId") roomId: string) {
        return this.chatService.getDeletedChat({ roomId })
    }
}
