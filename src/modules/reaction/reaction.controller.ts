import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Delete, Req, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { createReactionDto } from './reaction.dto';

@Controller('reaction')
export class ReactionController {
    constructor(private readonly reactionService: ReactionService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createReaction(@Req() req, @Body() dto: createReactionDto) {
        return this.reactionService.createReaction({ userId: req.user.userId, chatId: dto.chatId, content: dto.content })
    }

    @Delete(':reactId/delete')
    @UseGuards(AuthGuard)
    deleteReactionById(@Req() req, @Param('reactId') reactionId: string) {
        return this.reactionService.deleteReactionById({ userId: req.user.userId, reactionId })
    }

    @Get(':chatId/user/get')
    @UseGuards(AuthGuard)
    getUserReaction(@Req() req, @Param('chatId') chatId: string) {
        return this.reactionService.getUserReaction({ userId: req.user.userId, chatId })
    }

    @Get(':chatId/chat/get')
    @UseGuards(AuthGuard)
    getChatReactions(@Req() req, @Param('chatId') chatId: string) {
        return this.reactionService.getChatReactions({ userId: req.user.userId, chatId })
    }
}
