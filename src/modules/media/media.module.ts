import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ChatModule } from "../chat/chat.module";
import { MediaService } from "./media.service";
import { MediaRepository } from "./media.repository";

@Module({
    imports: [ChatModule, PrismaModule],
    controllers: [MediaController],
    providers: [MediaService, MediaRepository],
    exports: [MediaRepository]
})
export class MediaModule { }