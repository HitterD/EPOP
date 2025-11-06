import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, OrgUnit]), EventsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
