import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        console.log("Db Connected")
        await this.$connect()
    }
    async onModuleDestroy() {
        console.log("Db Disconnected")
        await this.$disconnect()
    }
}