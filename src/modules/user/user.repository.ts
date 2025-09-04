import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<User[]> {
        return await this.prisma.user.findMany()
    }
    async findById(data: { userId: string }): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                userId: data.userId
            }
        })
    }
    async findByUsername(data: { userName: string }): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                userName: data.userName
            }
        })
    }

    async createUser(data: { userName: string, password: string }): Promise<User> {
        return await this.prisma.user.create({
            data: {
                userName: data.userName,
                password: data.password
            }
        })
    }
}