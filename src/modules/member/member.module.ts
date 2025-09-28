import { forwardRef, Module } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import { RoomModule } from "../room/room.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [PrismaModule, forwardRef(() => RoomModule), UserModule],
    exports: [MemberRepository],
    controllers: [MemberController],
    providers: [MemberService, MemberRepository],
})
export class MemberModule { }