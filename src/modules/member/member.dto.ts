import { IsNotEmpty, IsString } from "class-validator";

export class getRoomMemberDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}