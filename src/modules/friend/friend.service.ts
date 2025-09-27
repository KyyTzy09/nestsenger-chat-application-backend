import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "./friend.repository";
import { AddFriendDto, DeleteFriendDto, GetUserFriendDto } from "./friend.dto";
import { Friend } from "@prisma/client";

@Injectable()
export class FriendService {
    constructor(private readonly friendRepository: FriendRepository, private readonly userRepository: UserRepository) { }

    async getUserFriends(dto: GetUserFriendDto): Promise<{ message: string, statusCode: number, data: Friend[] }> {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUserId({ userId: dto.userId })
        if (existingFriend?.length === 0) {
            throw new HttpException("Friend Not Found", HttpStatus.NOT_FOUND)
        }

        return { message: "user retrieved successfully", statusCode: HttpStatus.OK, data: existingFriend }
    }

    async addFriend(dto: AddFriendDto): Promise<{ message: string, statusCode: number, data: Friend }> {
        const existingUser = await this.userRepository.findById({ userId: dto.friendId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingUser.userId })
        if (existingFriend) {
            throw new HttpException("This Friend Already Exist", HttpStatus.CONFLICT)
        }

        const createdFriend = await this.friendRepository.createFriend({ userId: dto.userId, friendId: existingUser.userId, alias: dto.alias })
        return { message: "Friend Created Successfull", statusCode: HttpStatus.CREATED, data: createdFriend }
    }

    async deleteFriend(dto: DeleteFriendDto): Promise<{ message: string, statusCode: number, data: Friend }> {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        const existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: dto.friendId })
        if (!existingFriend) {
            throw new HttpException("Friend Not Found", HttpStatus.NOT_FOUND)
        }

        const deletedFriend = await this.friendRepository.deleteFriend(dto)
        return { message: "Friend Deleted Successfull", statusCode: HttpStatus.OK, data: deletedFriend }
    }
}