import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class getUserWithJoinStatusDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    roomId: string
}

export class getCurrentUserRoomDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class getUserRoomDto {
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class getChatRoomDto {
    @IsString()
    @IsNotEmpty()
    roomId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}

export class getOrCreatePrivateRoom {
    @IsString()
    @IsNotEmpty()
    userIdA: string

    @IsString()
    @IsNotEmpty()
    userIdB: string
}

export class createPrivateRoomDto {
    @IsString()
    @IsOptional()
    userIdA: string

    @IsString()
    @IsNotEmpty()
    userIdB: string
}

export class createGroupRoomDto {
    @IsArray()
    @ArrayMinSize(2)
    @IsString({ each: true })
    userIds: string[]

    @IsNotEmpty()
    @IsString()
    roomName: string

    @IsOptional()
    @IsString()
    avatarUrl: string

    @IsOptional()
    @IsString()
    userId: string
}

export class updateRoomNameDto {
    @IsString()
    @IsNotEmpty()
    roomName: string

    @IsString()
    @IsOptional()
    roomId: string

    @IsString()
    @IsOptional()
    userId: string

}

export class updateRoomDescriptionDto {
    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsOptional()
    roomId: string

    @IsString()
    @IsOptional()
    userId: string
}

export class OutFromGroupDto {
    @IsString()
    @IsNotEmpty()
    groupId: string

    @IsString()
    @IsNotEmpty()
    userId: string
}