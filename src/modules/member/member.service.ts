import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { getRoomMemberDto } from "./member.dto";
import { RoomRepository } from "../room/room.repository";
import { Member } from "@prisma/client";

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository, private readonly roomRepository: RoomRepository) { }

    async getRoomMember(dto: getRoomMemberDto): Promise<{ message: string, statusCode: number, data: Member[] | Member | null }> {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        let existingMember: Member[] | Member | null = await this.memberRepository.findByRoomId({ roomId: dto.roomId })
        if (existingRoom.type === "PRIVATE") {
            existingMember = await this.memberRepository.findPrivateRoomMember({ roomId: dto.roomId, userId: dto.userId })
        }

        return { message: "Member Retrieved Successfully", statusCode: HttpStatus.OK, data: existingMember }
    }
}