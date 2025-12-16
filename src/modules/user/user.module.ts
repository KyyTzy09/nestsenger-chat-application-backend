import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './user.repository';
import { UserGateWay } from './user.gateway';
import { UserPrecenseService } from './userPrecense.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [PrismaModule, forwardRef(() => RoomModule)],
  controllers: [UserController],
  providers: [UserService, UserPrecenseService, UserRepository, UserGateWay],
  exports: [UserRepository, UserGateWay]
})
export class UserModule { }
