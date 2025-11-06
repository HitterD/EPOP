import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Workflow } from '../entities/workflow.entity'
import { WorkflowRun } from '../entities/workflow-run.entity'
import { WorkflowsService } from './workflows.service'
import { WorkflowsController } from './workflows.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowRun])],
  providers: [WorkflowsService],
  controllers: [WorkflowsController],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
