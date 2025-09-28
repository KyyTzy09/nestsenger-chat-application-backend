import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { MemberService } from "./member.service";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Get(":roomId/room/get")
    @UseGuards(AuthGuard)
    getGroupMember(@Req() req, @Param('roomId') roomId: string) {
        return this.memberService.getRoomMember({ roomId, userId: req.user.userId })
    }
}