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

export class createNewChatWithMediaDto {
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
    @IsOptional()
    mediaUrl: string

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

export class getChatParentDto {
    @IsNotEmpty()
    @IsString()
    userId: string

    @IsNotEmpty()
    @IsString()
    chatId: string
}

export class getDeletedChatDto {
    @IsNotEmpty()
    @IsString()
    roomId: string
}

export class deleteChatForAllDto {
    @IsNotEmpty()
    @IsString()
    userId: string

    @IsNotEmpty()
    @IsString()
    chatId: string
}

export class deleteChatForYourselfDto {
    @IsOptional()
    @IsString()
    userId: string

    @IsNotEmpty()
    @IsString()
    chatId: string
}