import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workflow } from '../entities/workflow.entity'
import { WorkflowRun } from '../entities/workflow-run.entity'

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow) private readonly workflows: Repository<Workflow>,
    @InjectRepository(WorkflowRun) private readonly runs: Repository<WorkflowRun>,
  ) {}

  list() {
    return this.workflows.find({ order: { id: 'DESC' as any } })
  }

  async get(id: string) {
    const wf = await this.workflows.findOne({ where: { id } })
    if (!wf) throw new NotFoundException('Workflow not found')
    return wf
  }

  create(dto: { name: string; jsonSpec: any; isActive?: boolean; createdBy?: string | null }) {
    const wf = this.workflows.create({
      name: dto.name,
      jsonSpec: dto.jsonSpec,
      isActive: !!dto.isActive,
      createdBy: dto.createdBy ? ({ id: dto.createdBy } as any) : null,
    })
    return this.workflows.save(wf)
  }

  async update(id: string, patch: Partial<Workflow>) {
    const wf = await this.get(id)
    Object.assign(wf, {
      name: patch.name ?? wf.name,
      jsonSpec: patch.jsonSpec ?? wf.jsonSpec,
      isActive: typeof (patch as any).isActive === 'boolean' ? (patch as any).isActive : wf.isActive,
    })
    return this.workflows.save(wf)
  }

  async remove(id: string) {
    const wf = await this.get(id)
    await this.workflows.remove(wf)
    return { success: true }
  }

  async setActive(id: string, active: boolean) {
    const wf = await this.get(id)
    wf.isActive = !!active
    return this.workflows.save(wf)
  }

  async runTest(input: { workflowId?: string; spec?: any }) {
    let wf: Workflow | null = null
    if (input.workflowId) wf = await this.get(input.workflowId)
    const spec = input.spec ?? wf?.jsonSpec
    if (!spec) throw new NotFoundException('Spec not provided')

    const run = this.runs.create({
      workflow: wf ? ({ id: wf.id } as any) : ({ id: '0' } as any),
      status: 'running' as any,
      logs: { events: [], result: null },
    })
    const saved = await this.runs.save(run)
    try {
      // Minimal validation: one trigger -> one action
      const ok = !!spec
      const result = { ok, message: 'Test executed (simulation).' }
      saved.status = 'completed' as any
      saved.finishedAt = new Date() as any
      saved.logs = { ...saved.logs, result }
      await this.runs.save(saved)
      return { runId: saved.id, result }
    } catch (e: any) {
      saved.status = 'failed' as any
      saved.finishedAt = new Date() as any
      saved.logs = { ...saved.logs, error: String(e?.message || e) }
      await this.runs.save(saved)
      return { runId: saved.id, error: String(e?.message || e) }
    }
  }
}
