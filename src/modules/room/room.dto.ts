import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class getChatRoom {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}

export class createPrivateRoomDto {
    @IsString()
    @IsOptional()
    userIdA: string

    @IsString()
    @IsNotEmpty()
    userIdB: string
}