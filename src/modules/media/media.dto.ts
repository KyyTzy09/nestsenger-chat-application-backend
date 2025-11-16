import { IsNotEmpty, IsString } from "class-validator";

export class GetMediaByRoomIdDto {
    @IsString()
    @IsNotEmpty()
    roomId: string
}

