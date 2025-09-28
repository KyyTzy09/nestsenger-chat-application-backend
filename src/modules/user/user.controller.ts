import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    
    @Get("get")
    getAllUsers() {
        return this.userService.findAllUser()
    }

    @Get(":email/get")
    getUserByUsername(@Param("email") email: string) {
        return this.userService.findByEmail({ email })
    }

    @Get(":userId/get-id")
    getUserById(@Param("userId") userId: string) {
        return this.userService.findUserId({ userId })
    }
}
