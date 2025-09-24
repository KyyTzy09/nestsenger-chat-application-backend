import { Module } from "@nestjs/common";
import { MemberRepository } from "./member.repository";

@Module({
    exports: [MemberRepository],
    providers: [MemberRepository],
})
export class MemberModule { }