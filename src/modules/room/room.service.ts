import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createGroupRoomDto, createPrivateRoomDto, getChatRoomDto, getUserRoomDto, OutFromGroupDto } from "./room.dto";
import { RoomRepository } from "./room.repository";
import { MemberRepository } from "../member/member.repository";
import { UserRepository } from "../user/user.repository";
import { generateGroupRoomId, generatePrivateRoomId } from "src/shared/helpers/generate.room-key";
import { Friend, Member, Room, User } from "@prisma/client";
import { FriendRepository } from "../friend/friend.repository";
import { GetBatchResult } from "@prisma/client/runtime/library";

@Injectable()
export class RoomService {
    constructor(private readonly roomRepository: RoomRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async getUserRoom(dto: getUserRoomDto): Promise<{ message: string, statusCode: number, data: { room: Room, alias: Friend | User | null }[] | {}[] }> {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) {
            throw new HttpException("User Not Registered", HttpStatus.NOT_FOUND)
        }

        const existingRoom = await this.roomRepository.findUserRoom({ userId: dto.userId })
        if (existingRoom.length === 0) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        const result = await Promise.all(
            existingRoom.map(async (room) => {
                let roomAlias
                const fullRoom = await this.roomRepository.findChatRoom({ roomId: room.roomId, userId: dto.userId })
                if (fullRoom?.type === 'PRIVATE' && fullRoom?.member.length === 1) {
                    roomAlias = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: fullRoom.member[0].userId })
                    if (!roomAlias) {
                        roomAlias = await this.userRepository.findUserInfo({ userId: fullRoom.member[0].userId })
                    }
                }

                return { room: fullRoom, alias: roomAlias || null }
            })
        )

        return { message: "User Room Retrieved Successfully", statusCode: HttpStatus.OK, data: result }
    }

    async getRoomById(dto: getChatRoomDto): Promise<{ message: string, statusCode: number, data: { room: Room, alias?: Friend | Partial<User> | null } }> {
        let existingFriend: Friend | Partial<User> | null = null
        const existingRoom = await this.roomRepository.findChatRoom({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        if (existingRoom.member.length === 1) {
            existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingRoom.member[0].userId })
            if (!existingFriend) {
                existingFriend = await this.userRepository.findUserInfo({ userId: existingRoom.member[0].userId })
            }
        }

        return { message: "Room Retrieved Successfully", statusCode: HttpStatus.OK, data: { room: existingRoom, alias: existingFriend } }
    }

    async createPrivateRoom(dto: createPrivateRoomDto): Promise<{ message: string, statusCode: number, data: { room: Room, member: GetBatchResult } }> {
        const userId = [dto.userIdA, dto.userIdB]
        const roomId = generatePrivateRoomId(dto)

        const existingUser = await this.userRepository.findManyById({ userId })
        if (existingUser.length < 2) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        const existingRoom = await this.roomRepository.findRoomById({ roomId })
        if (existingRoom) {
            throw new HttpException("Room Already Exist", HttpStatus.CONFLICT)
        }

        const createdRoom = await this.roomRepository.createPrivateRoom({ roomId })
        const createdMember = await this.memberRepository.createMembers({ user: existingUser, roomId: createdRoom.roomId })

        return { message: "Private Room created successfull", statusCode: HttpStatus.CREATED, data: { room: createdRoom, member: createdMember } }
    }

    async createGroupRoom(dto: createGroupRoomDto): Promise<{ message: string, statusCode: number, data: { room: Room, member: GetBatchResult } }> {
        const roomId = generateGroupRoomId()
        dto.memberId.push(dto.userId)
        const existingUser = await this.userRepository.findManyById({ userId: dto.memberId })
        if (existingUser.length !== dto.memberId.length) {
            throw new HttpException("User Not Registered", HttpStatus.NOT_FOUND)
        }

        const createdRoom = await this.roomRepository.createGroupRoom({ roomId, roomName: dto.roomName })
        const createdMember = await this.memberRepository.createMembers({ user: existingUser, roomId: createdRoom.roomId })

        return { message: "Group Created Successfully", statusCode: HttpStatus.CREATED, data: { room: createdRoom, member: createdMember } }
    }

    async outFromGroup(dto: OutFromGroupDto): Promise<{ message: string, statusCode: number, data: Member }> {
        const existingGroup = await this.roomRepository.findByGroupId({ groupId: dto.groupId })
        if (!existingGroup || existingGroup.type === "PRIVATE") {
            throw new HttpException("Group Not Found", HttpStatus.NOT_FOUND)
        }

        const existingMember = await this.memberRepository.findByUnique({ roomId: dto.groupId, userId: dto.userId })
        if (!existingMember) {
            throw new HttpException("This Member Is Not In This Room yet", HttpStatus.NOT_FOUND)
        }

        const deletedMember = await this.memberRepository.deleteByUnique({ roomId: dto.groupId, userId: dto.userId })
        return { message: "Member Deleted Successfull", statusCode: HttpStatus.OK, data: deletedMember }
    }
}