import { Module } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports:[PrismaModule],
    exports: [MemberRepository],
    providers: [MemberRepository],
})
export class MemberModule { }