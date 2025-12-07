import { forwardRef, Module } from "@nestjs/common";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";
import { UserModule } from "../user/user.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MemberModule } from "../member/member.module";
import { FriendModule } from "../friend/friend.module";
import { RoomController } from "./room.controller";
import { ChatModule } from "../chat/chat.module";

@Module({
    imports: [UserModule, PrismaModule, forwardRef(() => MemberModule),  forwardRef(() => ChatModule), forwardRef(() => FriendModule)],
    exports: [RoomRepository, RoomService],
    controllers: [RoomController],
    providers: [RoomService, RoomRepository]
})
export class RoomModule { }