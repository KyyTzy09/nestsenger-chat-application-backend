import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Member, User } from "@prisma/client";

@Injectable()
export class MemberRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByRoomId(data: { roomId: string }): Promise<Member[]> {
        return await this.prisma.member.findMany({
            where: {
                roomId: data.roomId
            },
            include: {
                room: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                updatedAt: "asc"
            }
        })
    }

    async findWithoutSpecificUSerId(data: { userId: string, roomId: string }) {
        return await this.prisma.member.findMany({
            where: {
                roomId: data.roomId,
                NOT: {
                    userId: data.userId
                }
            }
        })
    }

    async findPrivateRoomMember(data: { userId: string, roomId: string }) {
        return await this.prisma.member.findFirst({
            where: {
                roomId: data.roomId,
                userId: {
                    not: data.userId
                },
                room: {
                    type: "PRIVATE"
                }
            },
            include: {
                room: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                }
            }
        })
    }

    async findByUnique(data: { roomId: string, userId: string }): Promise<Member | null> {
        return await this.prisma.member.findUnique({
            where: {
                userId_roomId: {
                    roomId: data.roomId,
                    userId: data.userId
                }
            }
        })
    }

    async createMembers(data: { user: User[], roomId: string }) {
        return await this.prisma.member.createMany({
            data: data.user.map(({ userId }) => {
                return ({
                    userId: userId,
                    roomId: data.roomId
                })
            }),
            skipDuplicates: true
        })
    }

    async deleteByUnique(data: { userId: string, roomId: string }): Promise<Member> {
        return await this.prisma.member.delete({
            where: {
                userId_roomId: {
                    roomId: data.roomId,
                    userId: data.userId
                }
            }
        })
    }
}