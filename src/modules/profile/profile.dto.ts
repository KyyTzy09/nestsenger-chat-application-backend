import { IsNotEmpty, IsString } from "class-validator";

export class getProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class UpdateAvatarDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    avatar: string
}