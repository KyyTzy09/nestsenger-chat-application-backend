import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createReactionDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string

    @IsString()
    @IsNotEmpty()
    content: string
}

export class getUserReactionDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string
}

export class getChatReactionsDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string
}