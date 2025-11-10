import { Body, Controller, HttpCode, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiDefaultResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ErrorResponse } from '../common/dto/error.dto'
import { VitalsService } from './vitals.service'
import { VitalsDto } from './dto/vitals.dto'

@ApiTags('vitals')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller({ path: 'vitals', version: '1' })
export class VitalsController {
  constructor(private readonly vitals: VitalsService) {}

  // Accept vitals anonymously, with light rate-limit
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true, forbidUnknownValues: false }))
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 1 } })
  async record(@Req() req: any, @Body() body: VitalsDto) {
    const userId = req?.user?.userId || null
    return this.vitals.record(body, userId)
  }
}
