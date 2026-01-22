import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
})
export class ReadChatGateway {
    @WebSocketServer()
    private server: Server

    handleUpdateReadChat(roomId: string) {
        this.server.to(roomId).emit("readchat:update", roomId)
    }
}