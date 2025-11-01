import { IsNotEmpty, IsString } from "class-validator";

export class GetReadChatsDto {
    @IsNotEmpty()
    @IsString()
    chatId: string
}