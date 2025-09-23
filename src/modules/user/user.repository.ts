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
                Profile: {
                    create: {
                        userName: data.userName,
                        bio: "Pengguna belum menambahkan info apapun"
                    }
                }
            }
        })
    }
}