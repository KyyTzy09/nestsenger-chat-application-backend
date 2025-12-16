import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './reaction.repository';
import { FriendModule } from '../friend/friend.module';
import { RoomModule } from '../room/room.module';
import { ReactionGateway } from './reaction.gateway';

@Module({
    imports: [forwardRef(() => UserModule), ChatModule, FriendModule, RoomModule, PrismaModule],
    controllers: [ReactionController],
    providers: [ReactionService, ReactionRepository, ReactionGateway],
    exports: [ReactionRepository, ReactionGateway]
})
export class ReactionModule { }
