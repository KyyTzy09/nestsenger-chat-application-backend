import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get("get")
    getAllUsers() {
        return this.userService.findAllUser()
    }

    @Get(":userName/get")
    getUserByUsername(@Param("userName") email: string) {
        return this.userService.findByEmail({ email })
    }

    @Get(":userId/get-id")
    getUserById(@Param("userId") userId: string) {
        return this.userService.findUserId({ userId })
    }
}
