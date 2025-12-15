import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import * as cookie from "cookie"
import { Socket } from "socket.io";
import { jwtSecret } from "../constants/jwt.secret";

@Injectable()
export class WebsocketGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>()
        const cookieHeader = client.handshake.headers.cookie
        if (!cookieHeader) throw new WsException("Cookie not found")

        const cookies = cookie.parse(cookieHeader);
        const token = cookies["access-token"]
        if (!token) {
            throw new WsException("Unauthorized");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret,
            }) as { userId: string };

            client.data.userId = payload.userId;
            return true;
        } catch {
            throw new WsException("Invalid or expired token");
        }
    }
}