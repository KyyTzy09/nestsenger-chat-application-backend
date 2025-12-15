import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserPrecenseService {
    constructor(private readonly userRepository: UserRepository) { }

    async setOnline(userId: string) {
        const existingUser = await this.userRepository.findById({ userId })
        if (!existingUser) throw new NotFoundException("User Is Not Registered")

        const updatedUser = await this.userRepository.setOnline({ userId })
        return updatedUser
    }

    async setOffline(userId: string) {
        const existingUser = await this.userRepository.findById({ userId })
        if (!existingUser) throw new NotFoundException("User Is Not Registered")

        const updatedUser = await this.userRepository.setOffline({ userId })
        return updatedUser
    }
}