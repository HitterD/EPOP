import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'
import { EventsModule } from '../events/events.module'
import { MeController } from './me.controller'
import { Project } from '../entities/project.entity'
import { ProjectMember } from '../entities/project-member.entity'
import { Task } from '../entities/task.entity'
import { CalendarEvent } from '../entities/calendar-event.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OrgUnit, Project, ProjectMember, Task, CalendarEvent]),
    EventsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController, MeController],
  exports: [UsersService],
})
export class UsersModule {}
