import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class GetUserFriendDto {
    @IsString()
    userId: string
}

export class AddFriendDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    alias: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
}