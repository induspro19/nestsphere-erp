import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const existing = this.userSockets.get(userId) || [];
      this.userSockets.set(userId, [...existing, client.id]);
      this.logger.log(`Client connected to Notifications WebSocket: ${client.id} (User: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.userSockets.forEach((sockets, userId) => {
      const filtered = sockets.filter((id) => id !== client.id);
      if (filtered.length > 0) {
        this.userSockets.set(userId, filtered);
      } else {
        this.userSockets.delete(userId);
      }
    });
    this.logger.log(`Client disconnected from Notifications WebSocket: ${client.id}`);
  }

  // Real-time Push to User
  sendToUser(userId: string, payload: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((id) => {
        this.server.to(id).emit('notification_received', payload);
      });
    }
  }

  // Broadcast to Society Room
  broadcastToSociety(societyId: string, payload: any) {
    this.server.emit(`society_${societyId}_notification`, payload);
  }
}
