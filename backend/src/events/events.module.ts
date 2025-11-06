import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DomainOutbox } from './outbox.entity'
import { OutboxService } from './outbox.service'
import { OutboxPublisherService } from './publisher.service'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [TypeOrmModule.forFeature([DomainOutbox]), RedisModule],
  providers: [OutboxService, OutboxPublisherService],
  exports: [OutboxService],
})
export class EventsModule {}
