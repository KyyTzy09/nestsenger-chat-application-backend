import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FriendModule } from './modules/friend/friend.module';
import { RoomModule } from './modules/room/room.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReactionController } from './modules/reaction/reaction.controller';
import { ReactionService } from './modules/reaction/reaction.service';
import { ReactionModule } from './modules/reaction/reaction.module';
import { ReadChatModule } from './modules/readchat/readchat.module';
import { MediaModule } from './modules/media/media.module';
import { StatusModule } from './modules/status/status.module';
import { ViewerModule } from './modules/viewers/viewer.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads"
    }),
    UserModule, AuthModule, ProfileModule, FriendModule, RoomModule, ChatModule, ReactionModule, ReadChatModule, MediaModule, StatusModule, ViewerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
