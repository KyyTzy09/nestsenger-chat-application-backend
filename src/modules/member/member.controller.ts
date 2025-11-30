import { Controller, Get, HttpStatus, Param, Req, UseGuards } from "@nestjs/common";
import { MemberService } from "./member.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseType } from "src/shared/types/response";
import { Friend, Member, User } from "@prisma/client";

@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Get(":roomId/room/get")
    @UseGuards(AuthGuard)
    async getGroupMember(@Req() req, @Param('roomId') roomId: string): Promise<ResponseType<({ member: Member, alias: Friend | Partial<User> | null }[] | {}[]) | (Member | null)>> {
        const members = await this.memberService.getRoomMember({ roomId, userId: req.user.userId })
        return { message: "Member Retrieved Successfully", statusCode: HttpStatus.OK, data: members.data }
    }
}