import { forwardRef, Module } from "@nestjs/common";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { FriendRepository } from "./friend.repository";
import { UserModule } from "../user/user.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RoomModule } from "../room/room.module";

@Module({
    imports: [forwardRef(() => UserModule), PrismaModule, forwardRef(() => RoomModule)],
    controllers: [FriendController],
    providers: [FriendService, FriendRepository],
    exports: [FriendRepository]
})
export class FriendModule { }