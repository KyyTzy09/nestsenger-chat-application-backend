import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class GetSessionDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    password: string
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    userName: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    password: string
}