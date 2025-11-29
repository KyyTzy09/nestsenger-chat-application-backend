import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { MediaService } from "./media.service";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get(":roomId/room/get")
    getMediaByRoomId(@Param("roomId") roomId: string) {
        return this.mediaService.getMediaByRoomId({ roomId })
    }

    @Get(":roomId/non-file/get")
    @UseGuards(AuthGuard)
    getNonFileMediaByRoomId(@Req() req, @Param("roomId") roomId: string) {
        return this.mediaService.getNonFileMediaByRoomId({ userId: req.user.userId, roomId })
    }

    @Get(":roomId/file/get")
    @UseGuards(AuthGuard)
    getFileMediaByRoomId(@Req() req, @Param("roomId") roomId: string) {
        return this.mediaService.getFileMediaByRoomId({ userId: req.user.userId, roomId })
    }
}