import { IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class GetUserByUsernameDto {
    @IsString()
    @IsNotEmpty()
    userName: string
}

export class GetUserByUserIdDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @IsString()
    @MinLength(7)
    @IsNotEmpty()
    password: string
}