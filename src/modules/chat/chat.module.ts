import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [PrismaModule, UserModule, RoomModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatRepository]
})
export class ChatModule { }
