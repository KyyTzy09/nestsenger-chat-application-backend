import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Member, User } from "@prisma/client";

@Injectable()
export class MemberRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createMembers(data: { user: User[], roomId: string }) {
        return await this.prisma.member.createMany({
            data: data.user.map(({ userId }) => {
                return ({
                    userId: userId,
                    roomId: data.roomId
                })
            })
        })
    }
}