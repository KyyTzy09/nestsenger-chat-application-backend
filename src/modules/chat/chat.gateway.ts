import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
})
export class ChatGateWay {
    @WebSocketServer()
    server: Server

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.join(data.roomId)
    }

    @SubscribeMessage("get-current-room")
    handleAllRoom(@ConnectedSocket() client: Socket) {
        client.join("current-room")
    }
}