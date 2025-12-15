import { forwardRef, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { ReadChatService } from "./readchat.service";
import { ReadChatRepository } from "./readchat.repository";
import { UserModule } from "../user/user.module";
import { ReadChatController } from "./readchat.controller";
import { FriendModule } from "../friend/friend.module";
import { MemberModule } from "../member/member.module";
import { RoomModule } from "../room/room.module";
import { ReadChatGateway } from "./readChat.gateway";

@Module({
    imports: [UserModule, forwardRef(() => ChatModule), forwardRef(() => RoomModule), UserModule, forwardRef(() => FriendModule), MemberModule, PrismaModule],
    controllers: [ReadChatController],
    providers: [ReadChatService, ReadChatRepository, ReadChatGateway],
    exports: [ReadChatService, ReadChatRepository]
})
export class ReadChatModule { }