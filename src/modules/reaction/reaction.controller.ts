import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Delete, Req, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { createReactionDto } from './reaction.dto';
import { ResponseType } from 'src/shared/types/response';
import { Reaction } from '@prisma/client';
import { AliasType } from 'src/shared/types/alias';

@Controller('reaction')
export class ReactionController {
    constructor(private readonly reactionService: ReactionService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createReaction(@Req() req, @Body() dto: createReactionDto): Promise<ResponseType<Reaction>> {
        const createdReaction = await this.reactionService.createReaction({ userId: req.user.userId, chatId: dto.chatId, content: dto.content })
        return { message: "Reaction Created Successfull", statusCode: HttpStatus.CREATED, data: createdReaction.data }
    }

    @Delete(':reactId/delete')
    @UseGuards(AuthGuard)
    async deleteReactionById(@Req() req, @Param('reactId') reactionId: string): Promise<ResponseType<Reaction>> {
        const deletedReaction = await this.reactionService.deleteReactionById({ userId: req.user.userId, reactionId })
        return { message: "Reaction Deleted Successfull", statusCode: HttpStatus.OK, data: deletedReaction.data }
    }

    @Get(':chatId/user/get')
    @UseGuards(AuthGuard)
    async getUserReaction(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<Reaction>> {
        const userReactions = await this.reactionService.getUserReaction({ userId: req.user.userId, chatId })
        return { message: "Reaction Data Retrieved Successfull", statusCode: HttpStatus.OK, data: userReactions.data }
    }

    @Get(":roomId/room/get")
    @UseGuards(AuthGuard)
    async getByRoomId(@Req() req, @Param("roomId") roomId: string): Promise<ResponseType<{ reaction: Reaction, alias: AliasType }[] | {}[]>> {
        const chatReactions = await this.reactionService.getChatReactionsByRoomId({ userId: req.user.userId, roomId })

        return { message: "Reactions Data Retrieved Successfully", statusCode: HttpStatus.OK, data: chatReactions.data }
    }

    @Get(':chatId/chat/get')
    @UseGuards(AuthGuard)
    async getChatReactions(@Req() req, @Param('chatId') chatId: string): Promise<ResponseType<{ reaction: Reaction, alias: AliasType }[] | {}[]>> {
        const chatReactions = await this.reactionService.getChatReactions({ userId: req.user.userId, chatId })
        return { message: "Chat Reactions Retrieved Successfull", statusCode: HttpStatus.OK, data: chatReactions.data }
    }
}
