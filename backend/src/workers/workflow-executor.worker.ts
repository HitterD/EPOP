import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workflow } from '../entities/workflow.entity'
import { WorkflowRun } from '../entities/workflow-run.entity'
import { Task } from '../entities/task.entity'
import { TaskAssignee } from '../entities/task-assignee.entity'
import { User } from '../entities/user.entity'
import { MailerService } from '../mailer/mailer.service'
import { REDIS_SUB } from '../redis/redis.module'
import Redis from 'ioredis'
import { Counter, Histogram, register } from 'prom-client'
import { DEAD_QUEUE } from '../queues/queues.module'
import { Queue } from 'bullmq'

@Injectable()
export class WorkflowExecutorWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowExecutorWorker.name)
  private runDuration = new Histogram({ name: 'workflow_run_duration_seconds', help: 'Workflow execution duration', buckets: [0.01,0.05,0.1,0.2,0.5,1,2,5,10], registers: [register] })
  private runsTotal = new Counter({ name: 'workflow_runs_total', help: 'Workflow runs count', labelNames: ['status'] as any, registers: [register] })

  constructor(
    @InjectRepository(Workflow) private readonly workflows: Repository<Workflow>,
    @InjectRepository(WorkflowRun) private readonly runs: Repository<WorkflowRun>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(TaskAssignee) private readonly assignees: Repository<TaskAssignee>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mailer: MailerService,
    @Inject(REDIS_SUB) private readonly sub: Redis,
    @Inject(DEAD_QUEUE) private readonly dead: Queue,
  ) {}

  async onModuleInit() {
    await this.sub.psubscribe('epop.project.task.created')
    this.sub.on('pmessage', async (_p, channel, message) => {
      try {
        if (channel === 'epop.project.task.created') {
          const evt = JSON.parse(message)
          await this.handleTaskCreated(evt)
        }
      } catch (e) {
        this.logger.warn(`workflow executor event error: ${String(e)}`)
      }
    })
  }

  async onModuleDestroy() {
    try { await this.sub.punsubscribe('epop.project.task.created') } catch {}
  }

  private async handleTaskCreated(evt: any) {
    const taskId = String(evt?.taskId || '')
    const actorId = String(evt?.userId || '')
    if (!taskId) return
    const active = await this.workflows.find()
    const candidates = active.filter((w) => !!w.isActive && w.jsonSpec && w.jsonSpec.trigger && w.jsonSpec.trigger.type === 'task.created')
    for (const wf of candidates) {
      const endTimer = this.runDuration.startTimer()
      const run = await this.runs.save(this.runs.create({ workflow: { id: wf.id } as any, status: 'running' as any, logs: { events: [], result: null } }))
      try {
        const action = (wf.jsonSpec.actions || [])[0]
        if (!action) throw new Error('No action configured')
        if (action.type === 'send_email') {
          const recipients = await this.resolveRecipients(action.to, taskId, actorId)
          if (!recipients.length) throw new Error('No recipients resolved')
          const task = await this.tasks.findOne({ where: { id: taskId }, relations: { project: true } })
          const title = task?.title || `Task ${taskId}`
          await Promise.all(recipients.map((email) => this.mailer.sendHtml(email, `Task created: ${title}`, `<!doctype html><html><body><h3>Task created</h3><p>${title}</p></body></html>`)))
          run.status = 'completed' as any
          run.finishedAt = new Date() as any
          run.logs = { ...(run.logs || {}), action: 'send_email', recipients }
          await this.runs.save(run)
          try { this.runsTotal.inc({ status: 'completed' } as any) } catch {}
        } else {
          throw new Error(`Unsupported action: ${action.type}`)
        }
      } catch (e) {
        run.status = 'failed' as any
        run.finishedAt = new Date() as any
        run.logs = { ...(run.logs || {}), error: String((e as any)?.message || e) }
        await this.runs.save(run)
        try {
          await this.dead.add('workflow_failed', { workflowId: wf.id, runId: run.id, event: evt, error: String((e as any)?.message || e) }, { removeOnComplete: 1000, removeOnFail: 2000 })
        } catch {}
        try { this.runsTotal.inc({ status: 'failed' } as any) } catch {}
      } finally {
        try { endTimer() } catch {}
      }
    }
  }

  private async resolveRecipients(to: any, taskId: string, actorId: string): Promise<string[]> {
    const emails = new Set<string>()
    if (typeof to === 'string' && to) {
      if (to.includes('{{task.assignees}}')) {
        const rows = await this.assignees.find({ where: { taskId } })
        for (const r of rows) {
          const u = await this.users.findOne({ where: { id: String(r.userId) } })
          if (u?.email) emails.add(u.email)
        }
      } else if (to.includes('{{actor}}')) {
        const u = await this.users.findOne({ where: { id: String(actorId) } })
        if (u?.email) emails.add(u.email)
      } else {
        emails.add(to)
      }
    }
    return Array.from(emails)
  }
}
