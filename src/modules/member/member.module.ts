import { forwardRef, Module } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import { RoomModule } from "../room/room.module";
import { UserModule } from "../user/user.module";
import { FriendModule } from "../friend/friend.module";

@Module({
    imports: [PrismaModule, forwardRef(() => UserModule), forwardRef(() => RoomModule), forwardRef(() => FriendModule)],
    exports: [MemberRepository],
    controllers: [MemberController],
    providers: [MemberService, MemberRepository],
})
export class MemberModule { }