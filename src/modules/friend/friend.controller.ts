import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { AddFriendDto } from "./friend.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";


@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) { }

    @Get("user/get")
    @UseGuards(AuthGuard)
    getUserFriends(@Req() req) {
        return this.friendService.getUserFriends({ userId: req.user.userId })
    }

    @Post("add-friend/post")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    addFriend(@Req() req, @Body() dto: AddFriendDto) {
        return this.friendService.addFriend({ userId: req.user.userId, alias: dto.alias, email: dto.email })
    }
}