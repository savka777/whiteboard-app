// whiteboard.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WhiteboardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() // have access to the websitesocket server
  server: Server;

  @SubscribeMessage('drawing')
  handleDrawing(client: Socket, payload: any): void {
    client.broadcast.emit('drawing', payload);
  }

  @SubscribeMessage('undo')
  handleUndo(client: Socket): void {
    client.broadcast.emit('undo');
  }

  afterInit(server: Server) {
    console.log('WebSocket Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
