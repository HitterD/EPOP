import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailMessage } from '../entities/mail-message.entity'
import { ComposeService } from './compose.service'
import { ComposeController } from './compose.controller'

@Module({
  imports: [TypeOrmModule.forFeature([MailMessage])],
  providers: [ComposeService],
  controllers: [ComposeController],
})
export class ComposeModule {}
