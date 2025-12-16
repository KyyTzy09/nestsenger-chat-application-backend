import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WebsocketGuard } from "src/shared/guards/websocket.guard";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    },
})
export class RoomGateway {
    @WebSocketServer()
    private server: Server

    @SubscribeMessage("room:join")
    @UseGuards(WebsocketGuard)
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.join(data.roomId)
    }

    handleRefreshRoom(roomId: string) {
        this.server.to(roomId).emit(`room:refresh-${roomId}`)
    }
}