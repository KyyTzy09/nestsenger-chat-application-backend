import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "./friend.repository";
import { addFriendDto, deleteFriendDto, getFriendById, getNonFriendUsersDto, getUserFriendDto } from "./friend.dto";
import { Friend, Room, User } from "@prisma/client";
import { RoomService } from "../room/room.service";
import { ResponseType } from "src/shared/types/response";

@Injectable()
export class FriendService {
    constructor(private readonly friendRepository: FriendRepository, private readonly userRepository: UserRepository, private readonly roomService: RoomService) { }

    async getFriendById(dto: getFriendById) {
        const existingUser = await this.userRepository.findById({ userId: dto.friendId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUnique(({ userId: dto.userId, friendId: dto.friendId }))
        if (!existingFriend) {
            throw new HttpException("Friend Not Found", HttpStatus.NOT_FOUND)
        }

        return { data: existingFriend }
    }

    // Dapatkan semua data user yang bukan teman
    async getNonFriendUsers(dto: getNonFriendUsersDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriends = await this.friendRepository.findByUserId({ userId: dto.userId })
        const userIds = existingFriends.map(({ friendId }) => { return friendId })
        userIds.push(dto.userId)

        const nonFriendUsers = await this.userRepository.findManyExcludingUserIds({ userIds })
        if (nonFriendUsers.length === 0) {
            throw new HttpException("All Users Are Already Friends", HttpStatus.NOT_FOUND)
        }

        return { data: nonFriendUsers }
    }

    async getUserFriends(dto: getUserFriendDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUserId({ userId: dto.userId })
        if (existingFriend?.length === 0) {
            throw new HttpException("Friend Not Found", HttpStatus.NOT_FOUND)
        }

        return { data: existingFriend }
    }

    async addFriend(dto: addFriendDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.friendId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingUser.userId })
        if (existingFriend) {
            throw new HttpException("This Friend Already Exist", HttpStatus.CONFLICT)
        }

        const createdFriend = await this.friendRepository.createFriend({ userId: dto.userId, friendId: existingUser.userId, alias: dto.alias })
        const createdRoom = await this.roomService.getOrCreatePrivateRoom({ userIdA: dto.userId, userIdB: dto.friendId })

        return { data: { friend: createdFriend, room: createdRoom.data.room } }
    }

    async deleteFriend(dto: deleteFriendDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: dto.friendId })
        if (!existingFriend) {
            throw new HttpException("Friend Not Found", HttpStatus.NOT_FOUND)
        }

        const deletedFriend = await this.friendRepository.deleteFriend(dto)
        return { data: deletedFriend }
    }
}