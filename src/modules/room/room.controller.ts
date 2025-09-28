import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createGroupRoomDto, createPrivateRoomDto } from "./room.dto";

@Controller("room")
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get("user/get")
    @UseGuards(AuthGuard)
    getUserRoom(@Req() req) {
        return this.roomService.getUserRoom({ userId: req.user.userId })
    }

    @Get(":roomId/get")
    @UseGuards(AuthGuard)
    getChatRoom(@Req() req, @Param('roomId') roomId: string) {
        return this.roomService.getRoomById({ roomId, userId: req.user.userId })
    }

    @Post("private-room/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    createPrivateRoom(@Req() req, @Body() dto: createPrivateRoomDto) {
        return this.roomService.createPrivateRoom({ userIdA: req.user.userId, userIdB: dto.userIdB })
    }

    @Post("group-room/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    createGroupRoom(@Req() req, @Body() dto: createGroupRoomDto) {
        return this.roomService.createGroupRoom({ userId: req.user.userId, roomName: dto.roomName, memberId: dto.memberId })
    }

    @Delete(":groupId/out-group/delete")
    @UseGuards(AuthGuard)
    outGroup(@Req() req, @Param('groupId') groupId: string) {
        return this.roomService.outFromGroup({ userId: req.user.userId, groupId: groupId })
    }
}