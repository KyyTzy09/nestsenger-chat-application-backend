import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class RoomRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findPrivateRoomByMember(){
        return await this.prisma.room.findFirst({
            where : {
                type : "PRIVATE",
                
            }
        })
    }

    async createPrivateRoom() {
        return await this.prisma.$transaction([
            this.prisma.room.create({
                data: {
                    type: "PRIVATE"
                }
            })
        ])
    }
}