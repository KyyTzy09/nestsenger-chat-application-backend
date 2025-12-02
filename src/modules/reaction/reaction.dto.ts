import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createReactionDto {
    @IsString()
    @IsOptional()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string

    @IsString()
    @IsNotEmpty()
    content: string
}

export class deleteReactionByIdDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    reactionId: string
}

export class getUserReactionDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string
}

export class getChatReactionsByRoomIdDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    roomId: string
}

export class getChatReactionsDto {
    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    chatId: string
}