import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CreateReactionDto } from './reaction.dto';

@Controller('reaction')
export class ReactionController {
    constructor(private readonly reactionService: ReactionService) { }

    @Post('create/post')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    createReaction(@Req() req, @Body() dto: CreateReactionDto) {
        return this.reactionService.createReaction({ userId: req.user.userId, chatId: dto.chatId, content: dto.content })
    }
}
