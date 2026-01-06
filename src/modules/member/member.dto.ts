import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class getMemberRoleDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}

export class getRoomMemberDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}

export class addGroupMemberDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string

    @IsArray()
    @MinLength(1)
    userIds: string[]
}

export class updateMemberRoleDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    memberId: string

    @IsString()
    @IsNotEmpty()
    role: string

    @IsString()
    @IsOptional()
    userId: string
}