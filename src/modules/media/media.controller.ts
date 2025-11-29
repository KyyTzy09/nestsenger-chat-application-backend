import { Controller, Get, HttpStatus, Param, Req, Res, UseGuards } from "@nestjs/common";
import { MediaService } from "./media.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseHelper } from "src/shared/helpers/response";
import { ChatMedia } from "@prisma/client";
import { ResponseType } from "src/shared/types/response";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService, private readonly response: ResponseHelper) { }

    @Get(":roomId/room/get")
    async getMediaByRoomId(@Res() res, @Param("roomId") roomId: string) {
        const media = await this.mediaService.getMediaByRoomId({ roomId })
        this.response.successResponse<ChatMedia[]>(res, "Media Retrieved Successfully", media?.data)
    }

    @Get(":roomId/non-file/get")
    @UseGuards(AuthGuard)
    async getNonFileMediaByRoomId(@Req() req, @Res() res, @Param("roomId") roomId: string) {
        const media = await this.mediaService.getNonFileMediaByRoomId({ userId: req.user.userId, roomId })
        this.response.successResponse(res, "Non File Media Retrieved Successfully", media.data)
    }

    @Get(":roomId/file/get")
    @UseGuards(AuthGuard)
    async getFileMediaByRoomId(@Req() req, @Res() res, @Param("roomId") roomId: string) {
        const media = await this.mediaService.getFileMediaByRoomId({ userId: req.user.userId, roomId })
        this.response.successResponse(res, "File Media Retrieved Successfully", media.data)
    }
}