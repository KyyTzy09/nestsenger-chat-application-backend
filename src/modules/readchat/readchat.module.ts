import { forwardRef, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { ReadChatService } from "./readchat.service";
import { ReadChatRepository } from "./readchat.repository";
import { UserModule } from "../user/user.module";
import { ReadChatController } from "./readchat.controller";
import { FriendModule } from "../friend/friend.module";
import { MemberModule } from "../member/member.module";

@Module({
    imports: [UserModule, forwardRef(() => ChatModule), PrismaModule, UserModule, FriendModule, MemberModule],
    controllers: [ReadChatController],
    providers: [ReadChatService, ReadChatRepository],
    exports: [ReadChatService, ReadChatRepository]
})
export class ReadChatModule { }