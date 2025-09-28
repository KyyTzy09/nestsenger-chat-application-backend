import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class getNonFriendUsersDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class getUserFriendDto {
    @IsString()
    userId: string
}

export class addFriendDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    alias: string

    @IsNotEmpty()
    @IsString()
    friendId: string
}

export class deleteFriendDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    friendId: string
}