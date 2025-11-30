import { Controller, Get, HttpStatus, Param, Req, Res, UseGuards } from "@nestjs/common";
import { MediaService } from "./media.service";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseHelper } from "src/shared/helpers/response";
import { ChatMedia } from "@prisma/client";
import { ResponseType } from "src/shared/types/response";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get(":roomId/room/get")
    async getMediaByRoomId(@Param("roomId") roomId: string): Promise<ResponseType<ChatMedia[]>> {
        const media = await this.mediaService.getMediaByRoomId({ roomId })
        return { message: "Media data retrieved successfully", statusCode: HttpStatus.OK, data: media.data }
    }

    @Get(":roomId/non-file/get")
    @UseGuards(AuthGuard)
    async getNonFileMediaByRoomId(@Req() req, @Param("roomId") roomId: string): Promise<ResponseType<ChatMedia[]>> {
        const media = await this.mediaService.getNonFileMediaByRoomId({ userId: req.user.userId, roomId })
        return { message: "Non File Media Data Retrieved Successfully", statusCode: HttpStatus.OK, data: media.data }
    }

    @Get(":roomId/file/get")
    @UseGuards(AuthGuard)
    async getFileMediaByRoomId(@Req() req, @Res() res, @Param("roomId") roomId: string): Promise<ResponseType<ChatMedia[]>> {
        const media = await this.mediaService.getFileMediaByRoomId({ userId: req.user.userId, roomId })
        return { message: "File Media Data Retrieved Successfully", statusCode: HttpStatus.OK, data: media.data }
    }
}