import { Module } from "@nestjs/common";
import { RoomRepository } from "./room.repository";
import { RoomService } from "./room.service";

@Module({
    exports: [RoomRepository],
    providers: [RoomService, RoomRepository]
})
export class RoomModule { }