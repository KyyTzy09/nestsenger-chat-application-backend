import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get("get")
    @UseGuards(AuthGuard)
    getAllUsers(@Req() req) {
        return this.userService.findAllUser({ userId: req.user.userId })
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
