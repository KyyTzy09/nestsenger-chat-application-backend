import { IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class GetAllUserDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class GetUserByUsernameDto {
    @IsString()
    @IsNotEmpty()
    email: string
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
    email: string

    @IsString()
    @MinLength(7)
    @IsNotEmpty()
    password: string
}