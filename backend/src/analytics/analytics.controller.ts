import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { ErrorResponse } from '../common/dto/error.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('analytics')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('summary')
  @ApiOkResponse({ type: Object })
  async summary(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('scope') scope?: 'org'|'team'|'project',
    @Query('scopeId') scopeId?: string,
  ) {
    const s = start ? new Date(start) : new Date(Date.now() - 30 * 86400000)
    const e = end ? new Date(end) : new Date()
    return this.analytics.summary({ start: s, end: e }, { type: scope, id: scopeId })
  }

  @Get('timeseries')
  @ApiOkResponse({ type: Object })
  async timeseries(
    @Query('metric') metric: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('scope') scope?: 'org'|'team'|'project',
    @Query('scopeId') scopeId?: string,
  ) {
    const s = start ? new Date(start) : new Date(Date.now() - 30 * 86400000)
    const e = end ? new Date(end) : new Date()
    return this.analytics.timeseries(metric, { start: s, end: e }, { type: scope, id: scopeId })
  }
}
