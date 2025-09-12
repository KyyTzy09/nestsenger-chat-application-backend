import { IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";

export class getProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class UpdateUsernameDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string
}

export class UpdateBioDto {
    @IsString()
    @IsOptional()
    userId: string

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