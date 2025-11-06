import { Module } from '@nestjs/common'
import { MailerService } from './mailer.service'
import { ConfigModule } from '@nestjs/config'
import { QueuesModule } from '../queues/queues.module'

@Module({
  imports: [ConfigModule, QueuesModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
