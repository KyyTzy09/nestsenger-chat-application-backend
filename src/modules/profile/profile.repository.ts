import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Profile, User } from "@prisma/client";

@Injectable()
export class ProfileRepository {
    constructor(private readonly prisma: PrismaService) { }
    async getUserProfile(data: { userId: string }): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                userId: data.userId
            }, include: {
                Profile: true
            }
        })
    }

    async updateUserName(data: { userId: string, userName: string }): Promise<Partial<Profile>> {
        return await this.prisma.profile.update({
            where: { userId: data.userId },
            data: {
                userName: data.userName
            },
            omit: {
                avatar: true,
                bio: true
            }
        })
    }

    async updateBio(data: { userId: string, bio: string }): Promise<Partial<Profile>> {
        return await this.prisma.profile.update({
            where: { userId: data.userId },
            data: {
                bio: data.bio
            },
            omit: {
                avatar: true,
                userName: true
            }
        })
    }

    async updateUserAvatar(data: { userId: string, avatar: string }): Promise<Profile> {
        return await this.prisma.profile.update({
            where: {
                userId: data.userId
            }, data: {
                avatar: data.avatar
            }
        })
    }
}