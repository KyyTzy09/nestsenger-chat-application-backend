import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, GetUserByUserIdDto, GetUserByUsernameDto } from './user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findAllUser(): Promise<{ message: string, data: User[] }> {
        const existingUsers = await this.userRepository.findAll()

        if (existingUsers.length === 0) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        return { message: "Getting users successfully", data: existingUsers }
    }

    async findUserId(dto: GetUserByUserIdDto): Promise<{ message: string, data: User }> {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        return { message: "Getting user successfully", data: existingUser }
    }

    async findByUsername(dto: GetUserByUsernameDto): Promise<{ message: string, data: User }> {
        const existingUser = await this.userRepository.findByUsername({ userName: dto.userName })
        if (!existingUser) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        return { message: "Getting user successfully", data: existingUser }
    }
}
