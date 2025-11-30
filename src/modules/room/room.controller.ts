import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createGroupRoomDto, createPrivateRoomDto } from "./room.dto";
import { ResponseType } from "src/shared/types/response";
import { Friend, Member, Room, User } from "@prisma/client";
import { GetBatchResult } from "@prisma/client/runtime/library";

@Controller("room")
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Get('get-create/:userIdB/get')
    @UseGuards(AuthGuard)
    async getOrCreateRoom(@Req() req, @Param('userIdB') userIdB: string): Promise<ResponseType<{ room: Room, member: Member[] | GetBatchResult }>> {
        const result = await this.roomService.getOrCreatePrivateRoom({ userIdA: req.user.userId, userIdB })
        return { message: "Room Retrieved Successfull", statusCode: HttpStatus.OK, data: result.data }
    }

    @Get('current/get')
    @UseGuards(AuthGuard)
    async getCurrentRooms(@Req() req,): Promise<ResponseType<{ room: Room, alias: Friend | Partial<User> | null }[] | {}[]>> {
        const results = await this.roomService.getCurrentUserRoom({ userId: req.user.userId })
        return { message: "Current User Rooms data Retrieved Successfull", statusCode: HttpStatus.OK, data: results.data }
    }

    @Get("user/get")
    @UseGuards(AuthGuard)
    async getUserRoom(@Req() req): Promise<ResponseType<{ room: Room, alias: Friend | Partial<User> | null }[] | {}[]>> {
        const results = await this.roomService.getUserRoom({ userId: req.user.userId })
        return { message: "User Room Retrieved Successfully", statusCode: HttpStatus.OK, data: results.data }
    }

    @Get(":roomId/get")
    @UseGuards(AuthGuard)
    async getChatRoom(@Req() req, @Param('roomId') roomId: string): Promise<ResponseType<{ room: Room, alias?: Friend | Partial<User> | null }>> {
        const result = await this.roomService.getRoomById({ roomId, userId: req.user.userId })
        return { message: "Room Retrieved Successfully", statusCode: HttpStatus.OK, data: { room: result.data.room, alias: result.data.alias } }
    }

    @Post("private-room/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async createPrivateRoom(@Req() req, @Body() dto: createPrivateRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
        const result = await this.roomService.createPrivateRoom({ userIdA: req.user.userId, userIdB: dto.userIdB })
        return { message: "Private Room created successfull", statusCode: HttpStatus.CREATED, data: { room: result.data.room, member: result.data.member } }
    }

    @Post("group-room/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async createGroupRoom(@Req() req, @Body() dto: createGroupRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
        const result = await this.roomService.createGroupRoom({ userId: req.user.userId, roomName: dto.roomName, memberId: dto.memberId })
        return { message: "Group Created Successfully", statusCode: HttpStatus.CREATED, data: { room: result.data.room, member: result.data.member } }
    }

    @Delete(":groupId/out-group/delete")
    @UseGuards(AuthGuard)
    async outGroup(@Req() req, @Param('groupId') groupId: string): Promise<ResponseType<Member>> {
        const result = await this.roomService.outFromGroup({ userId: req.user.userId, groupId: groupId })
        return { message: "Member Deleted Successfull", statusCode: HttpStatus.OK, data: result.data }
    }
}