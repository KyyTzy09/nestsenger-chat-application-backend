import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";
import { StatusModule } from "../status/status.module";
import { StatusService } from "../status/status.service";
import { ViewerController } from "./viewer.controller";
import { ViewerRepository } from "./viewer.repository";
import { ViewerService } from "./viewer.service";

@Module({
    imports: [UserModule, PrismaModule, StatusModule],
    controllers: [ViewerController],
    providers: [ViewerService, ViewerRepository],
    exports: [ViewerRepository]
})
export class ViewerModule { }