import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createPrivateRoomDto } from "./room.dto";

@Controller("room")
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get(":roomId/get")
    @UseGuards(AuthGuard)
    getChatRoom(@Req() req, @Param('roomId') roomId: string) {
        return this.roomService.getRoomById({ roomId, userId: req.user.userId })
    }

    @Post("private-room/post")
    @UseGuards(AuthGuard)
    createChatRoom(@Req() req, @Body() dto: createPrivateRoomDto) {
        return this.roomService.createPrivateRoom({ userIdA: req.user.userId, userIdB: dto.userIdB })
    }
}