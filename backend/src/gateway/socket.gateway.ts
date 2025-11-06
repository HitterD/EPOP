import { Inject, Logger } from '@nestjs/common'
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { REDIS_SUB, REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'
import { createAdapter } from '@socket.io/redis-adapter'

@WebSocketGateway({ namespace: '/ws', cors: { origin: true, credentials: true } })
export class SocketGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SocketGateway.name)
  private typingCooldowns = new Map<string, number>()

  @WebSocketServer()
  server!: Server

  constructor(@Inject(REDIS_SUB) private readonly sub: Redis, @Inject(REDIS_PUB) private readonly pub: Redis) {}

  async onModuleInit() {
    // Configure Socket.IO to use Redis adapter for horizontal scaling
    if (this.server) {
      this.server.adapter(createAdapter(this.pub, this.sub))
    }
    await this.sub.psubscribe('epop.*')
    this.sub.on('pmessage', (_pattern, channel, message) => {
      try {
        const evt = JSON.parse(message)
        this.routeEvent(channel, evt)
      } catch (e) {
        this.logger.warn(`Invalid event on ${channel}: ${String(e)}`)
      }
    })
    this.logger.log('SocketGateway initialized and subscribed to epop.*')
  }

  async onModuleDestroy() {
    try { await this.sub.punsubscribe('epop.*') } catch {}
  }

  // Room helpers
  private routeEvent(channel: string, evt: any) {
    // Expected evt fields include aggregateType, aggregateId, userId, and domain-specific payload
    // Route to chat, project, or user rooms based on payload
    const rooms: string[] = []
    if (evt.chatId) rooms.push(`chat:${evt.chatId}`)
    if (evt.projectId) rooms.push(`project:${evt.projectId}`)
    if (evt.userId) rooms.push(`user:${evt.userId}`)
    // Fallback by aggregate type/id
    if (rooms.length === 0 && evt.aggregateType && evt.aggregateId) {
      rooms.push(`${evt.aggregateType}:${evt.aggregateId}`)
    }
    const eventNameDot = channel.replace('epop.', '') // e.g., chat.message.created
    // Also support colon naming (chat:message_created) for FE compatibility
    const [domain, entity, action] = eventNameDot.split('.')
    const eventNameColon = (domain && entity && action) ? `${domain}:${entity}_${action}` : eventNameDot

    // Standardized payload
    const ids = Array.from(new Set([
      evt.aggregateId,
      evt.messageId,
      evt.taskId,
      evt.chatId,
      evt.projectId,
      evt.fileId,
      evt.mailId,
    ].filter(Boolean).map(String)))
    const payload = {
      ...evt,
      ids,
      patch: evt.patch ?? undefined,
      ts: evt.timestamp ?? new Date().toISOString(),
      actorId: evt.userId ?? null,
      requestId: evt.requestId ?? null,
    }

    for (const room of rooms) {
      this.server.to(room).emit(eventNameDot, payload)
      this.server.to(room).emit(eventNameColon, payload)
    }
  }

  // Client API
  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() socket: Socket, @MessageBody() chatId: string) {
    socket.join(`chat:${chatId}`)
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() socket: Socket, @MessageBody() chatId: string) {
    socket.leave(`chat:${chatId}`)
  }

  @SubscribeMessage('join_project')
  handleJoinProject(@ConnectedSocket() socket: Socket, @MessageBody() projectId: string) {
    socket.join(`project:${projectId}`)
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(@ConnectedSocket() socket: Socket, @MessageBody() projectId: string) {
    socket.leave(`project:${projectId}`)
  }

  @SubscribeMessage('join_user')
  handleJoinUser(@ConnectedSocket() socket: Socket, @MessageBody() userId: string) {
    socket.join(`user:${userId}`)
  }

  @SubscribeMessage('leave_user')
  handleLeaveUser(@ConnectedSocket() socket: Socket, @MessageBody() userId: string) {
    socket.leave(`user:${userId}`)
  }

  // Typing indicators (throttled)
  @SubscribeMessage('chat:typing_start')
  handleTypingStart(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string; userId: string; userName?: string }) {
    const chatId = String(body?.chatId || '')
    const userId = String(body?.userId || '')
    if (!chatId || !userId) return
    const key = `${chatId}:${userId}`
    const now = Date.now()
    const last = this.typingCooldowns.get(key) || 0
    if (now - last < 1000) return // throttle to 1/sec per user per chat
    this.typingCooldowns.set(key, now)
    this.server.to(`chat:${chatId}`).emit('chat:typing_start', { chatId, userId, userName: body?.userName })
    this.server.to(`chat:${chatId}`).emit('chat.typing.start', { chatId, userId, userName: body?.userName })
  }

  @SubscribeMessage('chat:typing_stop')
  handleTypingStop(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string; userId: string }) {
    const chatId = String(body?.chatId || '')
    const userId = String(body?.userId || '')
    if (!chatId || !userId) return
    this.server.to(`chat:${chatId}`).emit('chat:typing_stop', { chatId, userId })
    this.server.to(`chat:${chatId}`).emit('chat.typing.stop', { chatId, userId })
  }

  @SubscribeMessage('chat.typing.start')
  handleTypingStartDot(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string; userId: string; userName?: string }) {
    const chatId = String(body?.chatId || '')
    const userId = String(body?.userId || '')
    if (!chatId || !userId) return
    const key = `${chatId}:${userId}`
    const now = Date.now()
    const last = this.typingCooldowns.get(key) || 0
    if (now - last < 1000) return
    this.typingCooldowns.set(key, now)
    this.server.to(`chat:${chatId}`).emit('chat:typing_start', { chatId, userId, userName: body?.userName })
    this.server.to(`chat:${chatId}`).emit('chat.typing.start', { chatId, userId, userName: body?.userName })
  }

  @SubscribeMessage('chat.typing.stop')
  handleTypingStopDot(@ConnectedSocket() socket: Socket, @MessageBody() body: { chatId: string; userId: string }) {
    const chatId = String(body?.chatId || '')
    const userId = String(body?.userId || '')
    if (!chatId || !userId) return
    this.server.to(`chat:${chatId}`).emit('chat:typing_stop', { chatId, userId })
    this.server.to(`chat:${chatId}`).emit('chat.typing.stop', { chatId, userId })
  }
}
