import { forwardRef, Module } from "@nestjs/common";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";
import { UserModule } from "../user/user.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MemberModule } from "../member/member.module";
import { FriendModule } from "../friend/friend.module";
import { RoomController } from "./room.controller";
import { ChatModule } from "../chat/chat.module";
import { RoomGateway } from "./room.gateway";

@Module({
    imports: [forwardRef(() => UserModule), PrismaModule, forwardRef(() => MemberModule), forwardRef(() => ChatModule), forwardRef(() => FriendModule)],
    controllers: [RoomController],
    providers: [RoomService, RoomRepository, RoomGateway],
    exports: [RoomRepository, RoomService, RoomGateway],
})
export class RoomModule { }