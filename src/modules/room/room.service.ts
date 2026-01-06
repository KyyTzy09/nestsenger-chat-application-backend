import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createGroupRoomDto, createPrivateRoomDto, getChatRoomDto, getCurrentUserRoomDto, getOrCreatePrivateRoom, getUserRoomDto, OutFromGroupDto, updateRoomDescriptionDto, updateRoomNameDto } from "./room.dto";
import { RoomRepository } from "./room.repository";
import { MemberRepository } from "../member/member.repository";
import { UserRepository } from "../user/user.repository";
import { generateGroupRoomId, generatePrivateRoomId } from "src/shared/helpers/generate.room-key";
import { Friend, Member, MemberRole, Prisma, Room, User } from "@prisma/client";
import { FriendRepository } from "../friend/friend.repository";
import { GetBatchResult } from "@prisma/client/runtime/client";
import { AliasType } from "src/shared/types/alias";
import { UserGateWay } from "../user/user.gateway";

@Injectable()
export class RoomService {
    constructor(private readonly roomRepository: RoomRepository, private readonly memberRepository: MemberRepository, private readonly userRepository: UserRepository, private readonly friendRepository: FriendRepository, private readonly userGateway: UserGateWay) { }

    async getCurrentUserRoom(dto: getCurrentUserRoomDto) {
        const existingRooms = await this.roomRepository.findWhereLastChatExist({ userId: dto.userId })
        if (existingRooms.length === 0) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        const result = await Promise.all(
            existingRooms.map(async (room) => {
                type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
                type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: true } }>

                let roomAlias: Friend | Partial<User> | null = null
                if (room?.type === 'PRIVATE' && room?.members.length === 1) {
                    roomAlias = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: room.members[0].userId })
                    if (!roomAlias) {
                        roomAlias = await this.userRepository.findUserInfo({ userId: room.members[0].userId })
                    }
                }
                const aliasResult: AliasType = {
                    userId: roomAlias?.userId as string,
                    alias: roomAlias ? (roomAlias as friendWithFriend)?.alias || (roomAlias as User)?.email : "",
                    avatar: roomAlias ? (roomAlias as friendWithFriend)?.friend?.avatar as string || (roomAlias as userWithProfile)?.profile?.avatar as string : "",
                }

                return { room, user: aliasResult }
            })
        )
        if (result.length === 0) {
            throw new NotFoundException("Rooms Data Not Found")
        }

        return { data: result }
    }

    async getUserRoom(dto: getUserRoomDto) {
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

        return { data: result }
    }

    async getRoomById(dto: getChatRoomDto) {
        type userWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>
        type friendWithFriend = Prisma.FriendGetPayload<{ include: { friend: { include: { user: true } } } }>


        let aliasResult: AliasType | null = null
        const existingRoom = await this.roomRepository.findChatRoom({ roomId: dto.roomId, userId: dto.userId })
        if (!existingRoom) {
            throw new HttpException("Room Not Found", HttpStatus.NOT_FOUND)
        }

        if (existingRoom.members.length === 1) {
            let alias: Friend | Partial<User> | null = await this.friendRepository.findByUnique({ userId: dto.userId, friendId: existingRoom.members[0]?.userId! })
            if (!alias) {
                alias = await this.userRepository.findUserInfo({ userId: existingRoom.members[0]?.userId! })
            }

            aliasResult = {
                userId: alias?.userId as string,
                alias: alias ? (alias as friendWithFriend)?.alias : "",
                avatar: alias ? (alias as friendWithFriend)?.friend?.avatar as string || (alias as userWithProfile)?.profile?.avatar as string : "",
                email: alias ? (alias as friendWithFriend)?.friend?.user?.email as string || (alias as userWithProfile)?.email as string : "",
                userName: alias ? (alias as friendWithFriend)?.friend?.userName as string || (alias as userWithProfile)?.profile?.userName as string : "",
                bio: alias ? (alias as friendWithFriend)?.friend?.bio as string || (alias as userWithProfile)?.profile?.bio as string : "",
                isOnline: alias ? (alias as friendWithFriend)?.friend?.user?.isOnline as boolean || (alias as userWithProfile)?.isOnline : false
            }
        }

        return { data: { room: existingRoom, user: aliasResult } }
    }

    async getOrCreatePrivateRoom(dto: getOrCreatePrivateRoom) {
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
            existingMember = await this.memberRepository.createMembers({ user: existingUser, roomId: existingRoom.roomId, role: MemberRole.MEMBER })
        }

        return { data: { room: existingRoom, member: existingMember } }
    }

    async createPrivateRoom(dto: createPrivateRoomDto) {
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
        const createdMember = await this.memberRepository.createMembers({ user: existingUser, roomId: createdRoom.roomId, role: MemberRole.MEMBER })

        return { message: "Private Room created successfull", statusCode: HttpStatus.CREATED, data: { room: createdRoom, member: createdMember } }
    }

    async createGroupRoom(dto: createGroupRoomDto) {
        const roomId = generateGroupRoomId()
        dto.userIds.push(dto.userId)
        const existingUser = await this.userRepository.findManyById({ userId: dto.userIds })
        if (existingUser.length !== dto.userIds.length) {
            throw new HttpException("User Not Registered", HttpStatus.NOT_FOUND)
        }

        const createdRoom = await this.roomRepository.createGroupRoom({ userId: dto.userId, avatar: dto.avatarUrl, roomId, roomName: dto.roomName })
        const isCreator = existingUser.some(({ userId }) => { return userId === dto.userId })
        const createdMember = await this.memberRepository.createMembers({ user: existingUser, roomId: createdRoom.roomId, role: isCreator ? MemberRole.ADMIN : MemberRole.MEMBER })

        existingUser.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", createdRoom)
        })
        return { data: { room: createdRoom, member: createdMember } }
    }

    async updateRoomName(dto: updateRoomNameDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Not Registered")

        const existingRoom = await this.roomRepository.findByGroupId({ groupId: dto.roomId })
        if (!existingRoom) throw new NotFoundException("Group Not Found")

        const isAdmin = await this.memberRepository.isAdminRole({ roomId: dto.roomId, userId: dto.userId })
        if (!isAdmin) throw new ForbiddenException("Access Denied, You don't have access to this feature")

        const updatedRoomName = await this.roomRepository.updateRoomName(dto)

        existingRoom.members.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", updatedRoomName)
        })
        return { data: updatedRoomName }
    }


    async updateRoomDescription(dto: updateRoomDescriptionDto) {
        const existingUser = await this.userRepository.findById({ userId: dto.userId })
        if (!existingUser) throw new UnauthorizedException("User Not Registered")

        const existingRoom = await this.roomRepository.findByGroupId({ groupId: dto.roomId })
        if (!existingRoom) throw new NotFoundException("Group Not Found")

        const isAdmin = await this.memberRepository.isAdminRole({ roomId: dto.roomId, userId: dto.userId })
        if (!isAdmin) throw new ForbiddenException("Access Denied, You don't have access to this feature")

        const updatedRoomDescription = await this.roomRepository.updateRoomDescription(dto)

        existingRoom.members.forEach(({ userId }) => {
            this.userGateway.emitToUserRoom(userId, "room:refresh", updatedRoomDescription)
        })
        return { data: updatedRoomDescription }
    }

    async outFromGroup(dto: OutFromGroupDto) {
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