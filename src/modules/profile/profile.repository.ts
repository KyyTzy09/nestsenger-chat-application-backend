import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Profile, User } from "@prisma/client";

@Injectable()
export class ProfileRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getUserProfile(data: { userId: string }): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                userId: data.userId
            }, include: {
                Profile: true
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