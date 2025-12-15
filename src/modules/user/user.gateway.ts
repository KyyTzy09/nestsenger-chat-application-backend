import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebsocketGuard } from "src/shared/guards/websocket.guard";
import { UserPrecenseService } from "./userPrecense.service";
import { JwtService } from "@nestjs/jwt";
import * as cookie from "cookie"
import { jwtSecret } from "src/shared/constants/jwt.secret";


@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    },
})
export class UserGateWay implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly userPrecenseService: UserPrecenseService, private readonly jwtService: JwtService) { }
    @WebSocketServer()
    private server: Server

    // Get Cookie
    async getUserId(client: Socket): Promise<string | null> {
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

            return payload.userId;
        } catch {
            return null
        }
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        try {
            const userId = await this.getUserId(client)
            await this.userPrecenseService.setOnline(userId ?? "")
            client.join(`user-${userId}`)
        } catch {
            client.disconnect()
        }
    }

    @UseGuards(WebsocketGuard)
    async handleDisconnect(@ConnectedSocket() client: Socket) {
        const userId = await this.getUserId(client)
        await this.userPrecenseService.setOffline(userId ?? "")
        client.join(`user-${userId}`)
    }

    emitToUserRoom<T>(userId: string, event: string, value: T) {
        this.server.to(`user-${userId}`).emit(event, value)
    }
}