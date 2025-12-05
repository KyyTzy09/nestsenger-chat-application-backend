import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
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

    @Post(":roomId/add-group/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async addGroupMembers(@Req() req, @Param("roomId") roomId: string, @Body() dto: { userIds: string[] }): Promise<ResponseType<number>> {
        const createdMembers = await this.memberService.AddGroupMember({ userId: req.user.userId, roomId, userIds: dto.userIds })
        return { message: "Members Created Successfully", statusCode: HttpStatus.CREATED, data: createdMembers.data }
    }
}