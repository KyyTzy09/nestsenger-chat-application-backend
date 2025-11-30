import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, GetAllUserDto, GetUserByUserIdDto, GetUserByUsernameDto } from './user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import { ResponseType } from 'src/shared/types/response';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findAllUser() {
        const existingUsers = await this.userRepository.findAll()

        if (existingUsers.length === 0) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { data: existingUsers }
    }

    async findUserId(dto: GetUserByUserIdDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { data: existingUser }
    }

    async findByEmail(dto: GetUserByUsernameDto) {
        const existingUser = await this.userRepository.findByEmail({ email: dto.email })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { data: existingUser }
    }
}
