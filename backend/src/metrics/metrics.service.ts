import { Injectable, OnModuleInit } from '@nestjs/common'
import { collectDefaultMetrics, register } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  onModuleInit() {
    // Collect default Node.js/process metrics once per process
    collectDefaultMetrics({ register, prefix: 'epop_' })
  }
}
