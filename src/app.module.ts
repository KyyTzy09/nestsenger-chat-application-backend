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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot : "/uploads"
    }),
    UserModule, AuthModule, ProfileModule, FriendModule, RoomModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
