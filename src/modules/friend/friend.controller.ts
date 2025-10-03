import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { addFriendDto } from "./friend.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";


@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) { }

    @Get(':friendId/by-id/get')
    @UseGuards(AuthGuard)
    getFriendById(@Req() req, @Param('friendId') friendId: string) {
        return this.friendService.getFriendById({ userId: req.user.userId, friendId  })
    }

    @Get("non-friends/get")
    @UseGuards(AuthGuard)
    getNonFriendUsers(@Req() req) {
        return this.friendService.getNonFriendUsers({ userId: req.user.userId })
    }

    @Get("user/get")
    @UseGuards(AuthGuard)
    getUserFriends(@Req() req) {
        return this.friendService.getUserFriends({ userId: req.user.userId })
    }

    @Post("add-friend/post")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    addFriend(@Req() req, @Body() dto: addFriendDto) {
        return this.friendService.addFriend({ userId: req.user.userId, alias: dto.alias, friendId: dto.friendId })
    }

    @Delete("delete-friend/:friendId/delete")
    @UseGuards(AuthGuard)
    deleteFriend(@Req() req, @Param('friendId') friendId: string) {
        return this.friendService.deleteFriend({ userId: req.user.userId, friendId })
    }
}