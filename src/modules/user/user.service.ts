import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, GetAllUserDto, GetUserByUserIdDto, GetUserByUsernameDto } from './user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import { ResponseType } from 'src/shared/types/response';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findAllUser(): Promise<ResponseType<Partial<User[]>>> {
        const existingUsers = await this.userRepository.findAll()

        if (existingUsers.length === 0) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { message: "Users retrieved successfully", statusCode: HttpStatus.OK, data: existingUsers }
    }

    async findUserId(dto: GetUserByUserIdDto): Promise<ResponseType<User>> {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { message: "Getting user successfully", statusCode: HttpStatus.OK, data: existingUser }
    }

    async findByEmail(dto: GetUserByUsernameDto): Promise<ResponseType<User>> {
        const existingUser = await this.userRepository.findByEmail({ email: dto.email })
        if (!existingUser) {
            throw new HttpException("User not registered", HttpStatus.NOT_FOUND)
        }

        return { message: "User retrieved successfully", statusCode: HttpStatus.OK, data: existingUser }
    }
}
