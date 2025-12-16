import { forwardRef, Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { MediaService } from "./media.service";
import { MediaRepository } from "./media.repository";
import { RoomModule } from "../room/room.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [RoomModule, ChatModule, forwardRef(() => UserModule), PrismaModule],
    controllers: [MediaController],
    providers: [MediaService, MediaRepository],
    exports: [MediaRepository]
})
export class MediaModule { }