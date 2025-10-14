import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Chat } from "@prisma/client";
import { AliasType } from "src/shared/types/alias";
import { } from '@nestjs/platform-socket.io'
import { Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class ChatGateWay {
    @WebSocketServer()
    server: Socket

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.join(data.roomId)
    }

    @SubscribeMessage("get-current-room")
    handleAllRoom(@ConnectedSocket() client: Socket) {
        client.join("current-room")
    }
}