import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class getTodayUserViewersDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class updateStatusViewDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    viewerId: string

    @IsString()
    @IsNotEmpty()
    statusId: string
}