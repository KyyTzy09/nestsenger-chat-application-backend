import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { jwtSecret } from "src/shared/constants/jwt.secret";

@Module({
    imports: [UserModule, JwtModule.register({
        global: true,
        secret: jwtSecret,
        signOptions: { expiresIn : 24 * 60 * 60 }
    })],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }