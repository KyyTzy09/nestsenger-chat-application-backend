import { Member } from "@prisma/client";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class GetReadChatsDto {
    @IsNotEmpty()
    @IsString()
    chatId: string
}

export class CreateReadChatsDto {
    @IsNotEmpty()
    @IsArray()
    members: Member[]

    @IsNotEmpty()
    @IsString()
    chatId: string
}