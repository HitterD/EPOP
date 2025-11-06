import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Project } from '../entities/project.entity'
import { ProjectMember } from '../entities/project-member.entity'
import { TaskBucket } from '../entities/task-bucket.entity'
import { Task } from '../entities/task.entity'
import { TaskAssignee } from '../entities/task-assignee.entity'
import { TaskDependency } from '../entities/task-dependency.entity'
import { TaskComment } from '../entities/task-comment.entity'
import { ProjectsService } from './projects.service'
import { ProjectsController } from './projects.controller'
import { EventsModule } from '../events/events.module'
import { ProjectMemberGuard } from '../common/guards/project-member.guard'

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, TaskBucket, Task, TaskAssignee, TaskComment, TaskDependency]),
    EventsModule,
  ],
  providers: [ProjectsService, ProjectMemberGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
