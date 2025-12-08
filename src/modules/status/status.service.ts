import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { StatusRepository } from "./status.repository";
import { createStatusDto, getTodayStatusDto } from "./status.dto";
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

    async getTodayStatus(dto: getTodayStatusDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const existingFriends = await this.friendRepository.findByUserId(dto)
        if (existingFriends.length === 0) throw new NotFoundException("Friend Not Founds")

        const friendIds = existingFriends.map(({ friendId }) => { return friendId }) as string[]
        const statuses = await this.statusRepository.findTodayStatus({ friendIds })
        if (statuses.length === 0) throw new NotFoundException("Today Status Not Founds")

        const filteredStatuses = statuses.filter(({ expiredAt }) => { return expiredAt > new Date() })
        if (filteredStatuses.length === 0) throw new NotFoundException("Today Status Not Founds")

        return { data: filteredStatuses }
    }
}