import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findManyById(dto: { userId: string[] }): Promise<User[]> {
        return await this.prisma.user.findMany({
            where: {
                userId: {
                    in: dto.userId
                }
            }
        })
    }

    async findManyExcludingUserIds(data: { userIds: string[] }): Promise<Partial<User>[]> {
        return await this.prisma.user.findMany({
            where: {
                userId: {
                    notIn: data.userIds
                }
            },
            include: {
                profile: true,
            },
            omit: {
                password: true
            },
            orderBy: {
                profile: {
                    userName: "asc"
                }
            }
        })
    }

    async findAll(): Promise<User[]> {
        return await this.prisma.user.findMany()
    }

    async findById(data: { userId: string }) {
        return await this.prisma.user.findUnique({
            where: {
                userId: data.userId
            },
            include: {
                profile: true
            }
        })
    }

    async findUserInfo(data: { userId: string }): Promise<Partial<User | null>> {
        return await this.prisma.user.findUnique({
            where: {
                userId: data.userId
            },
            include: {
                profile: {
                    select: {
                        userName: true,
                        bio: true,
                        avatar: true
                    }
                }
            },
            omit: {
                password: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }

    async findByEmail(data: { email: string }): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
    }

    async createUser(data: { email: string, userName: string, password: string }): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                profile: {
                    create: {
                        userName: data.userName,
                        bio: "Pengguna belum menambahkan info apapun"
                    }
                }
            }
        })
    }
}