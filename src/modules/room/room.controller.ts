import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { createGroupRoomDto, createPrivateRoomDto, updateRoomDescriptionDto, updateRoomNameDto } from "./room.dto";
import { ResponseType } from "src/shared/types/response";
import { Friend, Member, Room, User } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { ROOM_AVATAR_FIELD_NAME, ROOM_AVATAR_PATH } from "src/shared/constants/upload";
import { extname } from "path";
import { diskStorage } from "multer";
import { GetBatchResult } from "@prisma/client/runtime/client";
import { AliasType } from "src/shared/types/alias";

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
    async getChatRoom(@Req() req, @Param('roomId') roomId: string): Promise<ResponseType<{ room: Room, user?: AliasType | null }>> {
        const result = await this.roomService.getRoomById({ roomId, userId: req.user.userId })
        return { message: "Room Retrieved Successfully", statusCode: HttpStatus.OK, data: { room: result.data.room, user: result.data.user } }
    }

    @Post("private-room/post")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async createPrivateRoom(@Req() req, @Body() dto: createPrivateRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
        const result = await this.roomService.createPrivateRoom({ userIdA: req.user.userId, userIdB: dto.userIdB })
        return { message: "Private Room created successfull", statusCode: HttpStatus.CREATED, data: { room: result.data.room, member: result.data.member } }
    }

    @Post("group-room/post")
    @UseInterceptors(FileInterceptor(ROOM_AVATAR_FIELD_NAME, {
        storage: diskStorage({
            destination: ROOM_AVATAR_PATH,
            filename(_req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            },
        })
    }))
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    async createGroupRoom(@UploadedFile() file: Express.Multer.File, @Req() req, @Body() dto: createGroupRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/rooms/${file.filename}`

        const result = await this.roomService.createGroupRoom({ userId: req.user.userId, avatarUrl: fileUrl, roomName: dto.roomName, userIds: dto.userIds })
        return { message: "Group Created Successfully", statusCode: HttpStatus.CREATED, data: result.data }
    }

    @Patch(":roomId/name/patch")
    @UseGuards(AuthGuard)
    async updateRoomName(@Req() req, @Param("roomId") roomId: string, @Body() dto: updateRoomNameDto): Promise<ResponseType<Partial<Room>>> {
        const result = await this.roomService.updateRoomName({ userId: req.user.userId, roomId, roomName: dto.roomName })
        return { message: "Room Name Updated Successfully", statusCode: HttpStatus.OK, data: result.data }
    }

    @Patch(":roomId/desc/patch")
    @UseGuards(AuthGuard)
    async updateRoomDescription(@Req() req, @Param("roomId") roomId: string, @Body() dto: updateRoomDescriptionDto): Promise<ResponseType<Partial<Room>>> {
        const result = await this.roomService.updateRoomDescription({ userId: req.user.userId, roomId, description: dto.description })
        return { message: "Room Description Updated Successfully", statusCode: HttpStatus.OK, data: result.data }
    }

    @Delete(":groupId/out-group/delete")
    @UseGuards(AuthGuard)
    async outGroup(@Req() req, @Param('groupId') groupId: string): Promise<ResponseType<Member>> {
        const result = await this.roomService.outFromGroup({ userId: req.user.userId, groupId: groupId })
        return { message: "Member Deleted Successfull", statusCode: HttpStatus.OK, data: result.data }
    }
}