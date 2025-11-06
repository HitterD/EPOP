import { Module, OnModuleDestroy } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmRootAsyncOptions } from '../database/typeorm.config'
import { Message } from '../entities/message.entity'
import { MailMessage } from '../entities/mail-message.entity'
import { FileEntity } from '../entities/file.entity'
import { Task } from '../entities/task.entity'
import { EmailWorkerService } from './email.worker'
import { SearchWorkerService } from './search.worker'
import { SearchService } from '../search/search.service'
import { QueuesModule } from '../queues/queues.module'
import { RedisModule } from '../redis/redis.module'
import { NotificationWorkerService } from './notification.worker'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmRootAsyncOptions),
    TypeOrmModule.forFeature([Message, MailMessage, FileEntity, Task]),
    QueuesModule,
    RedisModule,
  ],
  providers: [EmailWorkerService, SearchWorkerService, NotificationWorkerService, SearchService],
})
export class WorkersModule implements OnModuleDestroy {
  async onModuleDestroy() {}
}
