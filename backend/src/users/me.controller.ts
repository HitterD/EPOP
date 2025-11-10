import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { Project } from '../entities/project.entity'
import { ProjectMember } from '../entities/project-member.entity'
import { Task } from '../entities/task.entity'
import { CalendarEvent } from '../entities/calendar-event.entity'

@UseGuards(AuthGuard('jwt'))
@ApiTags('me')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller({ path: 'me', version: '1' })
export class MeController {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(CalendarEvent) private readonly events: Repository<CalendarEvent>,
  ) {}

  @Get('summary')
  @ApiOkResponse({ type: Object })
  async summary(@Req() req: any) {
    const userId = String(req.user.userId)

    // Current projects for the user (via membership)
    const memberships = await this.members.find({ where: { userId } })
    const projectIds = memberships.map((m) => m.projectId)
    const currentProjects = projectIds.length
      ? await this.projects.find({ where: projectIds.map((id) => ({ id })) as any })
      : []

    // Simple unread messages placeholder (backend detailed impl later)
    const unreadMessages = 0

    // My tasks: created by me (fast path). Load relations for IDs.
    const myTaskRows = await this.tasks.find({
      where: { createdBy: { id: userId } as any },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['project', 'bucket'],
    })

    // Upcoming agenda
    const upcomingAgenda = await this.events.find({
      where: { ownerId: userId as any },
      take: 5,
      order: { startTs: 'ASC' },
    })

    // Storage usage placeholder
    const storageUsage = { used: 0, total: 10 * 1024 * 1024 * 1024, percentage: 0 }

    return {
      currentProjects,
      unreadMessages,
      myTasks: myTaskRows.map((t: any) => ({
        id: String(t.id),
        projectId: t.project?.id ? String(t.project.id) : '',
        bucketId: t.bucket?.id ? String(t.bucket.id) : '',
        title: t.title,
        description: t.description || '',
        assigneeIds: [],
        labels: [],
        priority: t.priority || 'medium',
        status: (t as any).status || 'todo',
        progress: (t as any).progress || 0,
        startDate: t.startAt ? new Date(t.startAt).toISOString() : undefined,
        dueDate: t.dueAt ? new Date(t.dueAt).toISOString() : undefined,
        checklist: [],
        attachments: [],
        comments: [],
        order: t.position || 0,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: (t as any).updatedAt ? new Date((t as any).updatedAt).toISOString() : new Date().toISOString(),
      })),
      upcomingAgenda: upcomingAgenda.map((e) => ({
        id: String(e.id),
        title: e.title,
        type: 'meeting',
        startDate: e.startTs ? new Date(e.startTs as any).toISOString() : new Date().toISOString(),
        endDate: e.endTs ? new Date(e.endTs as any).toISOString() : undefined,
        projectId: undefined,
      })),
      storageUsage,
    }
  }
}
