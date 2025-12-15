import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Reaction } from "@prisma/client";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    }
})
export class ReactionGateway {
    @WebSocketServer()
    private server: Server

    handleUpdateReaction(roomId: string, data: Reaction) {
        this.server.to(roomId).emit("reaction:update", data)
    }
}