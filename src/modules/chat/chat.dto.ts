import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createNewChatDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsOptional()
    @IsString()
    parentId: string

    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    message: string
}

export class getChatByRoomIdDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}
