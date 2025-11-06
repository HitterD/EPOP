import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { WorkflowsService } from './workflows.service'
import { ErrorResponse } from '../common/dto/error.dto'
import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'
import { TestRunDto } from './dto/test-run.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('workflows')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflows: WorkflowsService) {}

  @Get()
  @ApiOkResponse({ type: Object })
  list() {
    return this.workflows.list()
  }

  @Get(':id')
  @ApiOkResponse({ type: Object })
  get(@Param('id') id: string) {
    return this.workflows.get(id)
  }

  @Post()
  @ApiOkResponse({ type: Object })
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflows.create({ name: dto.name, jsonSpec: dto.jsonSpec, isActive: !!dto.isActive })
  }

  @Put(':id')
  @ApiOkResponse({ type: Object })
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflows.update(id, dto as any)
  }

  @Delete(':id')
  @ApiOkResponse({ type: Object })
  remove(@Param('id') id: string) {
    return this.workflows.remove(id)
  }

  @Post(':id/enable')
  @ApiOkResponse({ type: Object })
  enable(@Param('id') id: string) {
    return this.workflows.setActive(id, true)
  }

  @Post(':id/disable')
  @ApiOkResponse({ type: Object })
  disable(@Param('id') id: string) {
    return this.workflows.setActive(id, false)
  }

  @Post('run:test')
  @ApiOkResponse({ type: Object })
  runTest(@Body() dto: TestRunDto) {
    return this.workflows.runTest({ workflowId: dto.workflowId, spec: dto.spec })
  }
}
