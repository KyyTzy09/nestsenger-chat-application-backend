import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { FriendService } from "./friend.service";
import { addFriendDto, updateFriendAliasDto } from "./friend.dto";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { ResponseType } from "src/shared/types/response";
import { Friend, Room, User } from "@prisma/client";


@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) { }

    @Get(':friendId/by-id/get')
    @UseGuards(AuthGuard)
    async getFriendById(@Req() req, @Param('friendId') friendId: string): Promise<ResponseType<Friend>> {
        const friend = await this.friendService.getFriendById({ userId: req.user.userId, friendId })
        return { message: "Friend data Retrieved Successfull", statusCode: HttpStatus.OK, data: friend.data }
    }

    @Get("non-friends/get")
    @UseGuards(AuthGuard)
    async getNonFriendUsers(@Req() req): Promise<ResponseType<Partial<User>[]>> {
        const nonFriends = await this.friendService.getNonFriendUsers({ userId: req.user.userId })
        return { message: "Non Friend Users Data Retrieved Successfull", statusCode: HttpStatus.OK, data: nonFriends.data }
    }

    @Get("user/get")
    @UseGuards(AuthGuard)
    async getUserFriends(@Req() req): Promise<ResponseType<Friend[]>> {
        const friends = await this.friendService.getUserFriends({ userId: req.user.userId })
        return { message: "User Retrieved Successfully", statusCode: HttpStatus.OK, data: friends.data }
    }

    @Post("add-friend/post")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async addFriend(@Req() req, @Body() dto: addFriendDto): Promise<ResponseType<{ friend: Friend, room: Room }>> {
        const result = await this.friendService.addFriend({ userId: req.user.userId, alias: dto.alias, friendId: dto.friendId })
        return { message: "Friend Created Successfull", statusCode: HttpStatus.CREATED, data: { friend: result.data.friend, room: result.data.room } }
    }

    @Patch("update-alias/patch")
    async updateFriendAlias(@Req() req, @Body() dto: updateFriendAliasDto): Promise<ResponseType<Friend>> {
        const result = await this.friendService.updateFriendAlias({ userId: req.user.userId, friendId: dto.friendId, alias: dto.alias })
        return { message: "Friend Alias Updated Successfully", statusCode: HttpStatus.OK, data: result.data }
    }

    @Delete("delete-friend/:friendId/delete")
    @UseGuards(AuthGuard)
    async deleteFriend(@Req() req, @Param('friendId') friendId: string): Promise<ResponseType<Friend>> {
        const deletedFriend = await this.friendService.deleteFriend({ userId: req.user.userId, friendId })
        return { message: "Friend Deleted Successfull", statusCode: HttpStatus.OK, data: deletedFriend.data }
    }
}