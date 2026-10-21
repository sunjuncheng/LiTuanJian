import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { TeamService } from './team.service';

interface ClientMeta {
  userId: number;
  teamId: number | null;
}

@Injectable()
export class TeamChatGateway {
  private readonly logger = new Logger(TeamChatGateway.name);
  private wss: WebSocketServer | null = null;
  private readonly clientMap = new Map<WebSocket, ClientMeta>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly teamService: TeamService,
  ) {}

  attachServer(server: any) {
    if (this.wss) return;

    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
      const url = new URL(request.url || '/', 'http://localhost');
      if (url.pathname !== '/ws/team-chat') {
        socket.destroy();
        return;
      }

      this.wss?.handleUpgrade(request, socket, head, (ws) => {
        this.wss?.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', async (ws, request) => {
      const userId = this.getUserIdFromRequest(request);
      if (!userId) {
        this.send(ws, { type: 'error', msg: '未登录或登录已过期' });
        ws.close();
        return;
      }

      this.clientMap.set(ws, { userId, teamId: null });
      this.send(ws, { type: 'connected' });

      ws.on('message', async (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          await this.handleMessage(ws, payload);
        } catch (error) {
          this.logger.error((error as Error).message, (error as Error).stack);
          this.send(ws, {
            type: 'error',
            msg: (error as Error).message || '消息处理失败',
          });
        }
      });

      ws.on('close', () => {
        this.clientMap.delete(ws);
      });
    });
  }

  private getUserIdFromRequest(request: IncomingMessage) {
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      const token = url.searchParams.get('token');
      if (!token) return 0;
      const payload = this.jwtService.verify(token) as { id?: number; role?: string };
      if (payload.role !== 'user') return 0;
      return Number(payload.id) || 0;
    } catch {
      return 0;
    }
  }

  private async handleMessage(ws: WebSocket, payload: any) {
    const meta = this.clientMap.get(ws);
    if (!meta) return;

    if (payload.type === 'join') {
      const chat = await this.teamService.getTeamChat(meta.userId);
      meta.teamId = chat.teamId;
      this.clientMap.set(ws, meta);
      this.send(ws, {
        type: 'joined',
        data: {
          conversationId: chat.conversationId,
          teamId: chat.teamId,
          teamName: chat.teamName,
        },
      });
      return;
    }

    if (payload.type === 'send') {
      const message = await this.teamService.sendTeamChatMessage(meta.userId, payload.content);
      meta.teamId = message.teamId;
      this.clientMap.set(ws, meta);
      this.broadcastToTeam(message.teamId, {
        type: 'new_message',
        data: message,
      });
    }
  }

  private broadcastToTeam(teamId: number, data: Record<string, any>) {
    for (const [client, meta] of this.clientMap.entries()) {
      if (meta.teamId === teamId && client.readyState === WebSocket.OPEN) {
        this.send(client, data);
      }
    }
  }

  private send(client: WebSocket, data: Record<string, any>) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  getOnlineUserIdsByTeam(teamId: number) {
    const userIds = new Set<number>();
    for (const [, meta] of this.clientMap.entries()) {
      if (meta.teamId === teamId) {
        userIds.add(meta.userId);
      }
    }
    return [...userIds];
  }
}
