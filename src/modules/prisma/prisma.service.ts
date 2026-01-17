import "dotenv/config";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({ adapter: new PrismaPg({ connectionString }) })
    }

    async onModuleInit() {
        console.log("Db Connected")
        await this.$connect()
    }
    async onModuleDestroy() {
        console.log("Db Disconnected")
        await this.$disconnect()
    }
}