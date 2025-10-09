import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReactionDto {
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