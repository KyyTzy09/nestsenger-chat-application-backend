import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Friend } from "@prisma/client";

@Injectable()
export class FriendRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(data: { userId: string }): Promise<Friend[]> {
        return await this.prisma.friend.findMany({
            where: {
                userId: data.userId
            },
            include: {
                friend: true
            },
            orderBy: {
                alias: "asc"
            }
        })
    }

    async findByUnique(data: { userId: string, friendId: string }): Promise<Friend | null> {
        return await this.prisma.friend.findUnique({
            where: {
                userId_friendId: {
                    userId: data.userId,
                    friendId: data.friendId
                }
            },
            include: {
                friend: {
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        })
    }

    async createFriend(data: { userId: string, friendId: string, alias: string }): Promise<Friend> {
        return await this.prisma.friend.create({
            data: {
                friendId: data.friendId,
                userId: data.userId,
                alias: data.alias,
            }
        })
    }

    async deleteFriend(data: { userId: string, friendId: string }): Promise<Friend> {
        return await this.prisma.friend.delete({
            where: {
                userId_friendId: {
                    userId: data.userId,
                    friendId: data.friendId
                }
            }
        })
    }
}