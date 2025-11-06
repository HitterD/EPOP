import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { RedisModule } from '../redis/redis.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatParticipant } from '../entities/chat-participant.entity'
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity'
import { NotificationsController } from './notifications.controller'
import { MailerModule } from '../mailer/mailer.module'
import { User } from '../entities/user.entity'

@Module({
  imports: [RedisModule, MailerModule, TypeOrmModule.forFeature([ChatParticipant, NotificationPreferencesEntity, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
