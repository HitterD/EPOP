import { Controller, Get, Header } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { register } from 'prom-client'

@SkipThrottle()
@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', register.contentType)
  async metrics() {
    return register.metrics()
  }
}
