import { IsNotEmpty, IsString, MinLength } from "class-validator";

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