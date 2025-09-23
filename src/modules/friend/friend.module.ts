import { Module } from "@nestjs/common";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { FriendRepository } from "./friend.repository";
import { UserModule } from "../user/user.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [UserModule, PrismaModule],
    controllers: [FriendController],
    providers: [FriendService, FriendRepository],
    exports: [FriendRepository]
})
export class FriendModule { }