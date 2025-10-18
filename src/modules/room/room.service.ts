import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { createGroupRoomDto, createPrivateRoomDto, getChatRoomDto, getCurrentUserRoomDto, getOrCreatePrivateRoom, getUserRoomDto, OutFromGroupDto } from "./room.dto";
import { RoomRepository } from "./room.repository";
import { MemberRepository } from "../member/member.repository";
import { UserRepository } from "../user/user.repository";
import { generateGroupRoomId, generatePrivateRoomId } from "src/shared/helpers/generate.room-key";
import { Friend, Member, Room, User } from "@prisma/client";
import { FriendRepository } from "../friend/friend.repository";
import { GetBatchResult } from "@prisma/client/runtime/library";
import { ResponseType } from "src/shared/types/response";

@Injectable()
export class RoomService {
    constructor(private readonly roomRepository: RoomRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository) { }

    async getCurrentUSerRoom(dto: getCurrentUserRoomDto): Promise<ResponseType<{ room: Room, alias: Friend | Partial<User> | null }[] | {}[]>> {
        const existingRooms = await this.roomRepository.findWhereLastChatExist({ userId: dto.userId })
        if (existingRooms.length === 0) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        const result = await Promise.all(
            existingRooms.map(async (room) => {
                const fullRoom = await this.roomRepository.findChatRoom({ roomId: room.roomId, userId: dto.userId })
                let roomAlias: Friend | Partial<User> | null = null
                if (fullRoom?.type === 'PRIVATE' && fullRoom?.members.length === 1) {
                    roomAlias = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: fullRoom.members[0].userId })
                    if (!roomAlias) {
                        roomAlias = await this.userRepository.findUserInfo({ userId: fullRoom.members[0].userId })
                    }
                }

                return { room: fullRoom, alias: roomAlias }
            })
        )
        if (result.length === 0) {
            throw new NotFoundException("Rooms Data Not Found")
        }

        return { message: "Current User Rooms data Retrieved Successfull", statusCode: HttpStatus.OK, data: result }
    }

    async getUserRoom(dto: getUserRoomDto): Promise<ResponseType<{ room: Room, alias: Friend | Partial<User> | null }[] | {}[]>> {
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
                if (fullRoom?.type === 'PRIVATE' && fullRoom?.members.length === 1) {
                    roomAlias = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: fullRoom.members[0].userId })
                    if (!roomAlias) {
                        roomAlias = await this.userRepository.findUserInfo({ userId: fullRoom.members[0].userId })
                    }
                }

                return { room: fullRoom, alias: roomAlias || null }
            })
        )

        return { message: "User Room Retrieved Successfully", statusCode: HttpStatus.OK, data: result }
    }

    async getRoomById(dto: getChatRoomDto): Promise<ResponseType<{ room: Room, alias?: Friend | Partial<User> | null }>> {
        let existingFriend: Friend | Partial<User> | null = null
        const existingRoom = await this.roomRepository.findChatRoom({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        if (existingRoom.members.length === 1) {
            existingFriend = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingRoom.members[0].userId })
            if (!existingFriend) {
                existingFriend = await this.userRepository.findUserInfo({ userId: existingRoom.members[0].userId })
            }
        }

        return { message: "Room Retrieved Successfully", statusCode: HttpStatus.OK, data: { room: existingRoom, alias: existingFriend } }
    }

    async getOrCreatePrivateRoom(dto: getOrCreatePrivateRoom): Promise<ResponseType<{ room: Room, member: Member[] | GetBatchResult }>> {
        const userId = [dto.userIdA, dto.userIdB]
        const roomId = generatePrivateRoomId(dto)

        const existingUser = await this.userRepository.findManyById({ userId })
        if (existingUser.length < 2) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        let existingRoom = await this.roomRepository.findRoomById({ roomId })
        if (!existingRoom) {
            existingRoom = await this.roomRepository.createPrivateRoom({ roomId })
        }

        let existingMember: GetBatchResult | Member[] = await this.memberRepository.findByRoomId({ roomId: existingRoom.roomId })
        if (existingMember.length === 0) {
            existingMember = await this.memberRepository.createMembers({ user: existingUser, roomId: existingRoom.roomId })
        }

        return { message: "Room Data Retrieved Successfull", statusCode: HttpStatus.OK, data: { room: existingRoom, member: existingMember } }
    }

    async createPrivateRoom(dto: createPrivateRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
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

    async createGroupRoom(dto: createGroupRoomDto): Promise<ResponseType<{ room: Room, member: GetBatchResult }>> {
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

    async outFromGroup(dto: OutFromGroupDto): Promise<ResponseType<Member>> {
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