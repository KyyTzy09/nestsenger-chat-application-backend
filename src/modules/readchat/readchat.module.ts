import { forwardRef, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { ReadChatService } from "./readchat.service";
import { ReadChatRepository } from "./readchat.repository";
import { UserModule } from "../user/user.module";
import { ReadChatController } from "./readchat.controller";

@Module({
    imports: [UserModule, forwardRef(() => ChatModule), PrismaModule],
    controllers: [ReadChatController],
    providers: [ReadChatService, ReadChatRepository],
    exports: [ReadChatService, ReadChatRepository]
})
export class ReadChatModule { }