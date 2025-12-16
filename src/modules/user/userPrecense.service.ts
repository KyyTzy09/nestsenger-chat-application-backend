import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { RoomGateway } from "../room/room.gateway";
import { RoomRepository } from "../room/room.repository";

@Injectable()
export class UserPrecenseService {
    constructor(private readonly userRepository: UserRepository, private readonly roomRepository: RoomRepository, private readonly roomGateway: RoomGateway) { }

    async setOnline(userId: string) {
        const existingUser = await this.userRepository.findById({ userId })
        if (!existingUser) throw new NotFoundException("User Is Not Registered")

        const updatedUser = await this.userRepository.setOnline({ userId })

        const userRooms = await this.roomRepository.findUserRoom({ userId })
        if (userRooms.length === 0) return

        userRooms.forEach(({ roomId }) => {
            this.roomGateway.handleRefreshRoom(roomId)
        })
        return updatedUser
    }

    async setOffline(userId: string) {
        const existingUser = await this.userRepository.findById({ userId })
        if (!existingUser) throw new NotFoundException("User Is Not Registered")

        const updatedUser = await this.userRepository.setOffline({ userId })

        const userRooms = await this.roomRepository.findUserRoom({ userId })
        if (userRooms.length === 0) return

        userRooms.forEach(({ roomId }) => {
            this.roomGateway.handleRefreshRoom(roomId)
        })
        return updatedUser
    }
}