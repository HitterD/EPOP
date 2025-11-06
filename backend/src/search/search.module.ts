import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { Message } from '../entities/message.entity'
import { MailMessage } from '../entities/mail-message.entity'
import { FileEntity } from '../entities/file.entity'
import { Task } from '../entities/task.entity'
import { SearchEventsSubscriber } from './search.subscriber'
import { QueuesModule } from '../queues/queues.module'

@Module({
  imports: [TypeOrmModule.forFeature([Message, MailMessage, FileEntity, Task]), QueuesModule],
  providers: [SearchService, SearchEventsSubscriber],
  controllers: [SearchController],
})
export class SearchModule {}
