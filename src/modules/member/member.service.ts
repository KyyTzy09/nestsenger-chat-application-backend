import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { getRoomMemberDto } from "./member.dto";
import { RoomRepository } from "../room/room.repository";
import { Friend, Member, User } from "@prisma/client";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";
import { ResponseType } from "src/shared/types/response";

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository, private readonly roomRepository: RoomRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async getRoomMember(dto: getRoomMemberDto): Promise<ResponseType<({ member: Member, alias: Friend | Partial<User> | null }[] | {}[]) | (Member | null)>> {
        let result: { member: Member, alias: Friend | Partial<User> | null }[] = []
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        let existingMember: Member[] | Member | null = await this.memberRepository.findByRoomId({ roomId: dto.roomId })

        if (existingRoom.type === "PRIVATE") {
            existingMember = await this.memberRepository.findPrivateRoomMember({ roomId: dto.roomId, userId: dto.userId })
        } else if (existingRoom.type == "GROUP" && result.length === 0) {
            result = await Promise.all(existingMember.map(async ({ userId }) => {
                const member = await this.memberRepository.findByUnique({ roomId: dto.roomId, userId })
                if (!member) {
                    throw new HttpException("Member Not Found", HttpStatus.NOT_FOUND)
                }

                let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: userId })
                if (!alias) {
                    alias = await this.userRepository.findUserInfo({ userId: userId })
                }

                return { member, alias }
            }))
        }

        return { message: "Member Retrieved Successfully", statusCode: HttpStatus.OK, data: result.length > 0 ? result : existingMember }
    }
}