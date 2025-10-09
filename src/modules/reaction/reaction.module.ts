import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './reaction.repository';
import { FriendModule } from '../friend/friend.module';

@Module({
    imports: [UserModule, ChatModule, FriendModule, PrismaModule],
    controllers: [ReactionController],
    providers: [ReactionService, ReactionRepository],
    exports: [ReactionRepository]
})
export class ReactionModule { }
