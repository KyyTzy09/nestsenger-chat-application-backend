import { IsNumber, IsOptional, IsString } from "class-validator"

export class createStatusDto {
    @IsString()
    @IsOptional()
    fileName: string

    @IsString()
    @IsOptional()
    fileUrl: string

    @IsString()
    @IsOptional()
    message: string

    @IsString()
    @IsOptional()
    userId: string
}