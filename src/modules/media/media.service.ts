import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { MediaRepository } from "./media.repository";
import { GetFileMediaByRoomIdDto, GetMediaByRoomIdDto, GetNonFileMediaByRoomIdDto } from "./media.dto";
import { RoomRepository } from "../room/room.repository";
import { ResponseType } from "src/shared/types/response";
import { ChatMedia } from "@prisma/client";

@Injectable()
export class MediaService {
    constructor(private readonly mediaRepository: MediaRepository, private readonly roomRepository: RoomRepository) { }

    async getMediaByRoomId(dto: GetMediaByRoomIdDto) {
        const existingRoom = await this.roomRepository.findRoomById(dto)
        if (!existingRoom) throw new NotFoundException("This Room Doesn't Exist")

        const existingMedia = await this.mediaRepository.findManyByRoomId(dto)
        if (existingMedia.length === 0) throw new NotFoundException("Media Don't Exist In This Room")

        return { data: existingMedia }
    }

    async getNonFileMediaByRoomId(dto: GetNonFileMediaByRoomIdDto) {
        const existingRoom = await this.roomRepository.findRoomById(dto)
        if (!existingRoom) throw new NotFoundException("This Room Doesn't Exist")

        const existingMedia = await this.mediaRepository.findNonFileMediaByRoomId(dto)
        if (existingMedia.length === 0) throw new NotFoundException("Media Don't Exist In This Room")

        return { data: existingMedia }
    }

    async getFileMediaByRoomId(dto: GetFileMediaByRoomIdDto) {
        const existingRoom = await this.roomRepository.findRoomById(dto)
        if (!existingRoom) throw new NotFoundException("This Room Doesn't Exist")

        const existingMedia = await this.mediaRepository.findFileMediaByRoomId(dto)
        if (existingMedia.length === 0) throw new NotFoundException("Media Don't Exist In This Room")

        return { data: existingMedia }
    }
}