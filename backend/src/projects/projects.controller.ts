import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards, Delete } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ProjectsService } from './projects.service'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { CursorParamsDto } from '../common/dto/cursor.dto'
import { ProjectMember } from '../common/decorators/project-member.decorator'
import { ProjectMemberGuard } from '../common/guards/project-member.guard'
import { Project } from '../entities/project.entity'
import { Task } from '../entities/task.entity'
import { CursorTasksResponse } from '../common/dto/cursor-response.dto'
import { AddDependencyDto, AddMemberDto, CreateBucketDto, CreateProjectDto, CreateTaskDto, MoveTaskDto, ReorderTasksDto, RescheduleTaskDto } from './dto/requests.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('projects')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get('mine')
  @ApiOkResponse({ type: Project, isArray: true })
  async mine(@Req() req: any) {
    return this.projects.myProjects(req.user.userId)
  }

  @Post()
  @ApiOkResponse({ type: Project })
  async create(@Req() req: any, @Body() body: CreateProjectDto) {
    return this.projects.createProject(req.user.userId, body)
  }

  @Post(':projectId/members')
  @UseGuards(ProjectMemberGuard)
  @ProjectMember()
  @ApiOkResponse({ type: Object })
  async addMember(@Req() req: any, @Param('projectId') projectId: string, @Body() body: AddMemberDto) {
    return this.projects.addMember(req.user.userId, projectId, body.userId, body.role ?? 'member')
  }

  @Post(':projectId/buckets')
  @UseGuards(ProjectMemberGuard)
  @ProjectMember()
  @ApiOkResponse({ type: Object })
  async createBucket(@Req() req: any, @Param('projectId') projectId: string, @Body() body: CreateBucketDto) {
    return this.projects.createBucket(req.user.userId, projectId, body.name, body.position)
  }

  @Post(':projectId/tasks')
  @UseGuards(ProjectMemberGuard)
  @ProjectMember()
  @ApiOkResponse({ type: Task })
  async createTask(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() body: CreateTaskDto,
  ) {
    return this.projects.createTask(req.user.userId, { projectId, bucketId: body.bucketId ?? null, title: body.title, description: body.description ?? null, position: body.position })
  }

  @Get(':projectId/tasks/cursor')
  @ApiOkResponse({ type: CursorTasksResponse })
  async listTasksCursor(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query() params: CursorParamsDto,
  ) {
    const lim = Math.max(1, Math.min(100, Number(params?.limit ?? 20)))
    return this.projects.listProjectTasksCursor(req.user.userId, projectId, lim, params?.cursor || null)
  }

  // FE compatibility alias: GET /projects/:projectId/tasks (same as cursor endpoint)
  @Get(':projectId/tasks')
  @ApiOkResponse({ type: CursorTasksResponse })
  async listTasks(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query() params: CursorParamsDto,
  ) {
    const lim = Math.max(1, Math.min(100, Number(params?.limit ?? 20)))
    return this.projects.listProjectTasksCursor(req.user.userId, projectId, lim, params?.cursor || null)
  }

  @Post(':projectId/tasks/:taskId/move')
  @ApiOkResponse({ type: Object })
  async moveTask(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: MoveTaskDto,
  ) {
    const pos = body.position ?? body.orderIndex ?? 0
    return this.projects.moveTask(req.user.userId, taskId, { projectId, bucketId: body.bucketId ?? null, position: pos })
  }

  // FE compatibility alias: PATCH for move
  @Patch(':projectId/tasks/:taskId/move')
  @ApiOkResponse({ type: Object })
  async moveTaskPatch(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: MoveTaskDto,
  ) {
    const pos = body.position ?? body.orderIndex ?? 0
    return this.projects.moveTask(req.user.userId, taskId, { projectId, bucketId: body.bucketId ?? null, position: pos })
  }

  @Post(':projectId/tasks/:taskId/comments')
  @ApiOkResponse({ type: Object })
  async comment(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body('body') text: string,
  ) {
    return this.projects.comment(req.user.userId, taskId, text)
  }

  // FE compatibility: list buckets
  @Get(':projectId/buckets')
  @ApiOkResponse({ type: Object })
  async listBuckets(@Req() req: any, @Param('projectId') projectId: string) {
    return this.projects.listBuckets(req.user.userId, projectId)
  }

  // FE compatibility: reorder tasks within bucket
  @Post(':projectId/buckets/:bucketId/reorder')
  @ApiOkResponse({ type: Object })
  async reorder(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('bucketId') bucketId: string,
    @Body() dto: ReorderTasksDto,
  ) {
    return this.projects.reorderBucket(req.user.userId, projectId, bucketId, dto.taskIds || [])
  }

  // --- Task Dependencies ---
  @Get(':projectId/dependencies')
  @ApiOkResponse({ type: Object })
  async listDependencies(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query('taskId') taskId?: string,
  ) {
    return this.projects.listDependencies(req.user.userId, projectId, taskId || null)
  }

  @Get(':projectId/tasks/:taskId/dependencies')
  @ApiOkResponse({ type: Object })
  async listTaskDependencies(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.projects.listDependencies(req.user.userId, projectId, taskId)
  }

  @Post(':projectId/dependencies')
  @ApiOkResponse({ type: Object })
  async addDependency(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() body: AddDependencyDto,
  ) {
    const lag = typeof body.lagDays === 'number' ? body.lagDays : 0
    return this.projects.addDependency(req.user.userId, projectId, body.predecessorId, body.successorId, lag)
  }

  @Delete(':projectId/dependencies/:predecessorId/:successorId')
  @ApiOkResponse({ type: Object })
  async removeDependency(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('predecessorId') predecessorId: string,
    @Param('successorId') successorId: string,
  ) {
    return this.projects.removeDependency(req.user.userId, projectId, predecessorId, successorId)
  }

  // --- Reschedule ---
  @Post(':projectId/tasks/:taskId/reschedule')
  @ApiOkResponse({ type: Object })
  async reschedule(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: RescheduleTaskDto,
  ) {
    return this.projects.rescheduleTask(req.user.userId, projectId, taskId, body)
  }
}
