import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class GetSessionDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class RegisterDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

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
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    password: string
}