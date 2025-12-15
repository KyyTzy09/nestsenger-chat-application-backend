import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebsocketGuard } from "src/shared/guards/websocket.guard";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    },
})
export class UserGateWay {
    @WebSocketServer()
    private server: Server

    @SubscribeMessage("user:online")
    @UseGuards(WebsocketGuard)
    joinUserRoom(@ConnectedSocket() client: Socket) {
        client.join(`user-${client.data.userId}`)
    }

    emitToUserRoom<T>(userId: string, event: string, value: T) {
        this.server.to(`user-${userId}`).emit(event, value)
    }
}