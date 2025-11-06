import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'
import { Message } from '../entities/message.entity'
import { FileEntity } from '../entities/file.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, OrgUnit, Message, FileEntity])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
