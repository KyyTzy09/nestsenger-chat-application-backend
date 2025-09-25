import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createGroupRoomDto, createPrivateRoomDto, getChatRoom } from "./room.dto";
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

    async getRoomById(dto: getChatRoom): Promise<{ message: string, statusCode: number, data: { room: Room, alias?: Friend | Partial<User> | null } }> {
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
}