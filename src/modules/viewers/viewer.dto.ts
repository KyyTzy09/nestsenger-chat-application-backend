import { IsNotEmpty, IsString } from "class-validator";

export class getTodayUserViewersDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}