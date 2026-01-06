import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { addGroupMemberDto, getMemberRoleDto, getRoomMemberDto } from "./member.dto";
import { RoomRepository } from "../room/room.repository";
import { Friend, Member, MemberRole, User } from "@prisma/client";
import { UserRepository } from "../user/user.repository";
import { FriendRepository } from "../friend/friend.repository";

@Injectable()
export class MemberService {
    constructor(private readonly memberRepository: MemberRepository, private readonly roomRepository: RoomRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async GetMemberRole(dto: getMemberRoleDto) {
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) throw new NotFoundException("Room Not Found")

        const member = await this.memberRepository.findWithRole({ ...dto })
        if (!member) throw new NotFoundException("Member Not Found")

        return { data: member }
    }

    async getRoomMember(dto: getRoomMemberDto) {
        let result: { member: Member, alias: Friend | Partial<User> | null }[] = []
        const existingRoom = await this.roomRepository.findRoomById({ roomId: dto.roomId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        let existingMember: Member[] | Member | null = await this.memberRepository.findByRoomId({ roomId: dto.roomId })

        if (existingRoom.type === "PRIVATE") {
            existingMember = await this.memberRepository.findPrivateRoomMember({ roomId: dto.roomId, userId: dto.userId })
        } else if (existingRoom.type == "GROUP" && result.length === 0) {
            result = await Promise.all(existingMember.map(async (member) => {
                // Query Friends
                let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: member.userId })
                if (!alias) {
                    alias = await this.userRepository.findUserInfo({ userId: member.userId })
                }

                return { member, alias }
            }))
        }

        return { data: result.length > 0 ? result : existingMember }
    }

    async AddGroupMember(dto: addGroupMemberDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Not Registered")

        const existingRoom = await this.roomRepository.findByGroupId({ groupId: dto.roomId })
        if (!existingRoom) throw new NotFoundException("Group Not Found")

        const isAdmin = await this.memberRepository.isAdminRole({ roomId: dto.roomId, userId: dto.userId })
        if (!isAdmin) throw new ForbiddenException("Access Denied, You don't have access to this feature")

        const existingUsers = await this.userRepository.findManyById({ userId: dto.userIds })
        if (existingUsers.length !== dto.userIds.length) throw new NotFoundException("Users Not Found")

        const createdMembers = await this.memberRepository.createMembers({ user: existingUsers, roomId: dto.roomId, role: MemberRole.MEMBER })

        return { data: createdMembers.count }
    }
}