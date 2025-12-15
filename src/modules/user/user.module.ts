import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './user.repository';
import { UserGateWay } from './user.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserGateWay],
  exports: [UserRepository, UserGateWay]
})
export class UserModule { }
