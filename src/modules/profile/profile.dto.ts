import { IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";

export class getProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    bio: string
}

export class UpdateAvatarDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    avatar: string
}