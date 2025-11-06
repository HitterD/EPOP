import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AnalyticsDaily } from '../entities/analytics-daily.entity'
import Redis from 'ioredis'
import { REDIS_PUB } from '../redis/redis.module'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsDaily) private readonly daily: Repository<AnalyticsDaily>,
    @Inject(REDIS_PUB) private readonly kv: Redis,
  ) {}

  async summary(range: { start: Date; end: Date }, scope?: { type?: string; id?: string | null }) {
    const key = `analytics:summary:${range.start.toISOString()}:${range.end.toISOString()}:${scope?.type || ''}:${scope?.id || ''}`
    try {
      const cached = await this.kv.get(key)
      if (cached) return JSON.parse(cached)
    } catch {}
    const qb = this.daily.createQueryBuilder('d')
      .select('d.metric', 'metric')
      .addSelect('SUM(d.value)::bigint', 'value')
      .where('d.date BETWEEN :start AND :end', { start: range.start, end: range.end })
    if (scope?.type) qb.andWhere('d.scope_type = :st', { st: scope.type })
    if (scope?.id) qb.andWhere('d.scope_id = :sid', { sid: scope.id })
    qb.groupBy('d.metric')
    const rows = await qb.getRawMany()
    const res = { range, scope, metrics: rows }
    try { await this.kv.set(key, JSON.stringify(res), 'EX', 300) } catch {}
    return res
  }

  async timeseries(metric: string, range: { start: Date; end: Date }, scope?: { type?: string; id?: string | null }) {
    const key = `analytics:ts:${metric}:${range.start.toISOString()}:${range.end.toISOString()}:${scope?.type || ''}:${scope?.id || ''}`
    try {
      const cached = await this.kv.get(key)
      if (cached) return JSON.parse(cached)
    } catch {}
    const qb = this.daily.createQueryBuilder('d')
      .select('d.date', 'date')
      .addSelect('SUM(d.value)::bigint', 'value')
      .where('d.date BETWEEN :start AND :end', { start: range.start, end: range.end })
      .andWhere('d.metric = :m', { m: metric })
    if (scope?.type) qb.andWhere('d.scope_type = :st', { st: scope.type })
    if (scope?.id) qb.andWhere('d.scope_id = :sid', { sid: scope.id })
    qb.groupBy('d.date').orderBy('d.date', 'ASC')
    const rows = await qb.getRawMany()
    const res = { metric, range, scope, points: rows }
    try { await this.kv.set(key, JSON.stringify(res), 'EX', 300) } catch {}
    return res
  }
}
