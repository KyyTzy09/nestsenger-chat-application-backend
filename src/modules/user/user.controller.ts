import { Body, Controller, Get, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ResponseType } from 'src/shared/types/response';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get("get")
    async getAllUsers(): Promise<ResponseType<Partial<User[]>>> {
        const users = await this.userService.findAllUser()
        return { message: "Users retrieved successfully", statusCode: HttpStatus.OK, data: users.data }
    }

    @Get(":email/get")
    async getUserByUsername(@Param("email") email: string): Promise<ResponseType<User>> {
        const user = await this.userService.findByEmail({ email })
        return { message: "User retrieved successfully", statusCode: HttpStatus.OK, data: user.data }
    }

    @Get(":userId/get-id")
    async getUserById(@Param("userId") userId: string): Promise<ResponseType<User>> {
        const user = await this.userService.findUserId({ userId })
        return { message: "Getting user successfully", statusCode: HttpStatus.OK, data: user.data }
    }
}
