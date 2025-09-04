import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get("get")
    getAllUsers() {
        return this.userService.findAllUser()
    }

    @Get(":userName/get")
    getUserByUsername(@Param("userName") userName: string) {
        return this.userService.findByUsername({ userName })
    }

    @Get(":userId/get-id")
    getUserById(@Param("userId") userId: string) {
        return this.userService.findUserId({ userId })
    }

    @Post("create")
    createUser(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto)
    }
}
