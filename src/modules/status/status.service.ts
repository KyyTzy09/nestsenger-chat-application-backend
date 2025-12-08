import { Injectable, UnauthorizedException } from "@nestjs/common";
import { StatusRepository } from "./status.repository";
import { createStatusDto } from "./status.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { generateFileSize } from "src/shared/helpers/generate-file-size";
import { GetMediaType } from "src/shared/helpers/get-file-type";

@Injectable()
export class StatusService {
    constructor(private readonly statusRepository: StatusRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async createNewStatus(dto: createStatusDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const mediaType = GetMediaType(dto.fileName)
        const now = new Date();
        const expiredDate = new Date(now);
        expiredDate.setDate(now.getDate() + 1);

        const createdStatus = await this.statusRepository.createNewStatus({ creatorId: dto.userId, mediaName: dto.fileName, mediaUrl: dto.fileUrl, mediaType, message: dto.message, createdAt: now, expiredAt: expiredDate })
        return { data: createdStatus }
    }
}