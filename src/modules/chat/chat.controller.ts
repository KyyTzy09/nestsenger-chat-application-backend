import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { createNewChatDto, createNewChatWithMediaDto, deleteChatForYourselfDto } from './chat.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MEDIA_FIELD_NAME, MEDIA_UPLOAD_PATH } from 'src/shared/constants/upload';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ResponseType } from 'src/shared/types/response';
import { Chat, DeletedChat } from '@prisma/client';
import { ChatWithAliasType } from 'src/shared/types/chat';
import { AliasType } from 'src/shared/types/alias';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    async createNewChat(@Req() req, @Body() dto: createNewChatDto): Promise<ResponseType<Chat>> {
        const createdChat = await this.chatService.createNewChat({ userId: req.user.userId, roomId: dto.roomId, message: dto.message, parentId: dto?.parentId })
        return { message: "Chat Created Successfully", statusCode: HttpStatus.CREATED, data: createdChat.data }
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
    async createNewChatWithMedia(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() dto: createNewChatWithMediaDto): Promise<ResponseType<Chat>> {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const mediaUrl = `${baseUrl}/uploads/media/${file.filename}`;

        const createdChat = await this.chatService.createNewChatWithMedia({ userId: req.user.userId, roomId: dto.roomId, mediaUrl, mediaName: file.filename, mediaSize: file.size, parentId: dto.parentId, message: dto.message });
        return { message: "Chat With Media Created Successfull", statusCode: HttpStatus.CREATED, data: createdChat.data }
    }


    @Get(':roomId/get')
    @UseGuards(AuthGuard)
    async getChatByRoomId(@Req() req, @Param('roomId') roomId: string): Promise<ResponseType<{ date: string, chats: ChatWithAliasType[] }[]>> {
        const results = await this.chatService.getChatByRoomId({ roomId, userId: req.user.userId })
        return { message: "Chats Retrieved Successfull", statusCode: HttpStatus.OK, data: results.data }
    }

    @Get(':chatId/parent/get')
    @UseGuards(AuthGuard)
    async getChatParent(@Req() req, @Param("chatId") chatId: string): Promise<ResponseType<{ chat: Chat | null, user: AliasType }>> {
        const result = await this.chatService.getChatParent({ userId: req.user.userId, chatId })
        return { message: "Parent Chat Data Retrieved Successfully", statusCode: HttpStatus.OK, data: { chat: result.data.chat, user: result.data.user } }
    }

    @Get('deleted-chat/:roomId/get')
    async getDeletedChat(@Param("roomId") roomId: string): Promise<ResponseType<DeletedChat[]>> {
        const deletedChats = await this.chatService.getDeletedChat({ roomId })
        return { message: "Deleted Chat Data Retrieved Successfull", statusCode: HttpStatus.OK, data: deletedChats.data }
    }

    @Delete('for-all/:chatId/delete')
    @UseGuards(AuthGuard)
    async deleteChatForAll(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<DeletedChat>> {
        const deletedChat = await this.chatService.deleteChatForAll({ userId: req.user.userId, chatId })
        return { message: "Deleted Chat For All Successfully", statusCode: HttpStatus.OK, data: deletedChat.data }
    }

    @Delete("for-self/:chatId/delete")
    @UseGuards(AuthGuard)
    async deleteChatForYourSelf(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<DeletedChat>> {
        const deletedChat = await this.chatService.deleteChatForYourself({ userId: req.user.userId, chatId })
        return { message: "Deleted Chat Successfully", statusCode: HttpStatus.OK, data: deletedChat.data }
    }
}
