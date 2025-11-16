import { Controller, Get, Param } from "@nestjs/common";
import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Get(":roomId/room/get")
    getMediaByRoomId(@Param("roomId") roomId: string) {
        return this.mediaService.getMediaByRoomId({ roomId })
    }

    @Get(":roomId/non-file/get")
    getNonFileMediaByRoomId(@Param("roomId") roomId: string) {
        return this.mediaService.getNonFileMediaByRoomId({ roomId })
    }
}