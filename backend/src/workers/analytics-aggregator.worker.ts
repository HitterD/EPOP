import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalyticsDaily } from '../entities/analytics-daily.entity'
import { Message } from '../entities/message.entity'
import { Task } from '../entities/task.entity'
import { FileEntity } from '../entities/file.entity'

@Injectable()
export class AnalyticsAggregatorWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsAggregatorWorker.name)
  private timer?: NodeJS.Timeout

  constructor(
    @InjectRepository(AnalyticsDaily) private readonly daily: Repository<AnalyticsDaily>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(FileEntity) private readonly files: Repository<FileEntity>,
  ) {}

  onModuleInit() {
    // run every 5 minutes, aggregate last 30 days
    this.timer = setInterval(() => this.aggregate(30).catch((e) => this.logger.warn(String(e))), 5 * 60 * 1000)
    // also run once on boot
    this.aggregate(7).catch(() => undefined)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }

  private async aggregate(days: number) {
    const end = new Date()
    const start = new Date(end.getTime() - Math.max(1, days) * 24 * 60 * 60 * 1000)

    // messages_per_day (org-wide)
    await this.upsertFromQuery(
      `SELECT DATE_TRUNC('day', created_at)::date AS d, COUNT(*)::bigint AS v
       FROM messages
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY d`,
      [start, end],
      'messages_per_day',
      'org',
      null,
    )

    // tasks_created_per_day (org-wide)
    await this.upsertFromQuery(
      `SELECT DATE_TRUNC('day', created_at)::date AS d, COUNT(*)::bigint AS v
       FROM tasks
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY d`,
      [start, end],
      'tasks_created_per_day',
      'org',
      null,
    )

    // storage_bytes_per_day (sum of file sizes created that day)
    await this.upsertFromQuery(
      `SELECT DATE_TRUNC('day', created_at)::date AS d, COALESCE(SUM(size::bigint),0)::bigint AS v
       FROM files
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY d`,
      [start, end],
      'storage_bytes_per_day',
      'org',
      null,
    )
  }

  private async upsertFromQuery(sql: string, params: any[], metric: string, scopeType: string, scopeId: string | null) {
    const rows: Array<{ d: string; v: string }> = await this.daily.query(sql, params)
    for (const r of rows) {
      await this.daily.query(
        `INSERT INTO analytics_daily(date, metric, scope_type, scope_id, value, created_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (date, metric, scope_type, scope_id)
         DO UPDATE SET value = EXCLUDED.value`,
        [r.d, metric, scopeType, scopeId, r.v],
      )
    }
  }
}
