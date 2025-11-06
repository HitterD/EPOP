import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DirectoryService } from './directory.service'
import { DirectoryController } from './directory.controller'
import { OrgUnit } from '../entities/org-unit.entity'
import { User } from '../entities/user.entity'
import { DirectoryAudit } from '../entities/directory-audit.entity'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([OrgUnit, User, DirectoryAudit]), EventsModule],
  providers: [DirectoryService],
  controllers: [DirectoryController],
})
export class DirectoryModule {}
