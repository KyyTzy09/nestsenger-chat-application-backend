import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { MediaService } from "./media.service";
import { MediaRepository } from "./media.repository";
import { RoomModule } from "../room/room.module";
import { UserModule } from "../user/user.module";
import { ResponseHelper } from "src/shared/helpers/response";

@Module({
    imports: [RoomModule, ChatModule, UserModule, PrismaModule],
    controllers: [MediaController],
    providers: [MediaService, MediaRepository, ResponseHelper],
    exports: [MediaRepository]
})
export class MediaModule { }