import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { StatusController } from "./status.controller";
import { StatusService } from "./status.service";
import { StatusRepository } from "./status.repository";
import { UserModule } from "../user/user.module";
import { FriendModule } from "../friend/friend.module";
import { ViewerModule } from "../viewers/viewer.module";

@Module({
    imports: [PrismaModule, UserModule, FriendModule, ViewerModule],
    controllers: [StatusController],
    providers: [StatusService, StatusRepository],
    exports: [StatusRepository]
})
export class StatusModule { }