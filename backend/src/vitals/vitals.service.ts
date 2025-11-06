import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WebVital } from '../entities/web-vital.entity'
import { VitalsDto } from './dto/vitals.dto'

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(WebVital) private readonly repo: Repository<WebVital>,
  ) {}

  async record(dto: VitalsDto, userId?: string | null) {
    const row = this.repo.create({
      user: userId ? ({ id: String(userId) } as any) : null,
      metricName: dto.name,
      metricValue: dto.value,
      rating: dto.rating,
      delta: dto.delta ?? null,
      metricId: dto.id ?? null,
      navigationType: dto.navigationType ?? null,
      url: dto.url,
      userAgent: dto.userAgent ?? null,
      metadata: dto.metadata ?? null,
    })
    await this.repo.save(row)
    return { success: true }
  }
}
