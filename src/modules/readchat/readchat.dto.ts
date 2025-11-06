import { Member } from "@prisma/client";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class GetReadChatsDto {
    @IsNotEmpty()
    @IsString()
    chatId: string


    @IsNotEmpty()
    @IsString()
    userId: string
}

export class CountRoomUnreadChatsDto {
    @IsNotEmpty()
    @IsString()
    roomId: string

    @IsNotEmpty()
    @IsString()
    userId: string
}

export class CreateReadChatsDto {
    @IsNotEmpty()
    @IsArray()
    members: Member[]

    @IsNotEmpty()
    @IsString()
    chatId: string
}

export class UpdateReadChatDto {
    @IsNotEmpty()
    @IsString()
    userId: string

    @IsNotEmpty()
    @IsString()
    roomId: string
}