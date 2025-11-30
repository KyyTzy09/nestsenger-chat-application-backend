import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class getFriendById {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    friendId: string
}

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

export class updateFriendAliasDto {
    @IsString()
    @IsNotEmpty()
    alias: string

    @IsString()
    @IsNotEmpty()
    friendId: string

    @IsString()
    @IsOptional()
    userId:string
}

export class deleteFriendDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    friendId: string
}