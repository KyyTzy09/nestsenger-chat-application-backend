import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { StatusRepository } from "./status.repository";
import { createStatusDto, deleteStatusByIdDto, getTodayStatusDto } from "./status.dto";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { generateFileSize } from "src/shared/helpers/generate-file-size";
import { GetMediaType } from "src/shared/helpers/get-file-type";
import { Friend, Prisma, Status, User } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";

@Injectable()
export class StatusService {
    constructor(private readonly statusRepository: StatusRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    statusGrouper(statuses: Status[]) {
        const groupedResult = statuses.reduce((acc, data) => {
            const creatorIdKey = data?.creatorId || "";

            if (!acc[creatorIdKey]) {
                acc[creatorIdKey] = [];
            }

            acc[creatorIdKey].push(data);

            return acc;
        }, {} as Record<string, Status[]>)

        return groupedResult
    }

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

    async getTodayUserStatuses(dto: getTodayStatusDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const statuses = await this.statusRepository.findTodayUserStatus({ creatorId: dto.userId, now: new Date() })
        if (statuses.length === 0) throw new NotFoundException("Today Status Not Founds")

        return { data: { user: existingUser, statuses } }
    }

    async getTodayStatuses(dto: getTodayStatusDto) {
        type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const existingFriends = await this.friendRepository.findByUserId(dto)
        if (existingFriends.length === 0) throw new NotFoundException("Friend Not Founds")
        const friendIds = existingFriends.map(({ friendId }) => { return friendId }) as string[]

        const statuses = await this.statusRepository.findTodayStatus({ friendIds, now: new Date() })
        if (statuses.length === 0) throw new NotFoundException("Today Status Not Founds")

        const groupedResult = this.statusGrouper(statuses)
        const finalGrouped = Object.entries(groupedResult).map(([userId, statuses]) => ({
            userId,
            statuses
        }))

        const results = await Promise.all(finalGrouped.map(async ({ userId, statuses }) => {
            let alias: friendWithFriend | null = existingFriends.find(({ friendId }) => { return friendId === userId }) || null

            const aliasResult: AliasType = {
                userId: alias ? alias.friendId : "",
                alias: alias ? alias.alias : "",
                avatar: alias ? alias?.friend?.avatar as string : ""
            }

            return { statuses, alias: aliasResult }
        }))

        return { data: results }
    }

    async deleteStatusById(dto: deleteStatusByIdDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Is Not Registered")

        const existingStatus = await this.statusRepository.findByUnique(dto)
        if (!existingStatus) throw new NotFoundException("Status Not Found")

        const deletedStatus = await this.statusRepository.deleteById(dto)
        return { data: deletedStatus }
    }
}