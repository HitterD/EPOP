import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Chat } from '../entities/chat.entity'
import { ChatParticipant } from '../entities/chat-participant.entity'
import { Message } from '../entities/message.entity'
import { MessageReaction } from '../entities/message-reaction.entity'
import { MessageRead } from '../entities/message-read.entity'
import { MessageHistory } from '../entities/message-history.entity'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { EventsModule } from '../events/events.module'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatParticipant, Message, MessageReaction, MessageRead, MessageHistory]),
    EventsModule,
    RedisModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
