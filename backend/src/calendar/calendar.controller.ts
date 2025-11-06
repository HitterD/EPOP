import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { CalendarService } from './calendar.service'
import { ErrorResponse } from '../common/dto/error.dto'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { RangeQueryDto } from './dto/range-query.dto'
import { IcsImportDto } from './dto/ics-import.dto'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'

@ApiTags('calendar')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService, private readonly config: ConfigService) {}

  @Get('events')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Object })
  async listMy(@Query() q: RangeQueryDto, @Req() req: any) {
    const userId = String(req.user?.userId)
    const start = q.start ? new Date(q.start) : new Date(Date.now() - 7 * 86400000)
    const end = q.end ? new Date(q.end) : new Date(Date.now() + 30 * 86400000)
    return this.calendar.listMyRange(userId, start, end)
  }

  @Post('events')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Object })
  async create(@Body() dto: CreateEventDto, @Req() req: any) {
    const userId = String(req.user?.userId)
    return this.calendar.create(userId, {
      title: dto.title,
      startTs: new Date(dto.startTs),
      endTs: new Date(dto.endTs),
      location: dto.location ?? null,
      source: dto.source ?? 'internal',
      projectId: dto.projectId ?? null,
      taskId: dto.taskId ?? null,
      allDay: !!dto.allDay,
      reminders: dto.reminders ?? [],
    })
  }

  @Patch('events/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Object })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    const userId = String(req.user?.userId)
    return this.calendar.update(userId, id, {
      title: dto.title,
      startTs: dto.startTs ? new Date(dto.startTs) : undefined as any,
      endTs: dto.endTs ? new Date(dto.endTs) : undefined as any,
      location: dto.location,
      source: dto.source,
      projectId: dto.projectId as any,
      taskId: dto.taskId as any,
      allDay: dto.allDay as any,
      reminders: dto.reminders as any,
    } as any)
  }

  @Delete('events/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Object })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = String(req.user?.userId)
    return this.calendar.remove(userId, id)
  }

  // ICS feed is public via token
  @Get('ics/feed')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  async icsFeed(@Query('token') token: string, @Query() q: RangeQueryDto, @Res() res: Response) {
    const secret = this.config.get<string>('ICS_FEED_SECRET') || this.config.get<string>('JWT_REFRESH_SECRET') || 'dev_ics_secret'
    const userId = this.calendar.verifyFeedToken(token, secret)
    if (!userId) return res.status(401).end()
    const start = q.start ? new Date(q.start) : new Date(Date.now() - 30 * 86400000)
    const end = q.end ? new Date(q.end) : new Date(Date.now() + 180 * 86400000)
    const ics = await this.calendar.generateIcsForUser(userId, start, end)
    return res.send(ics)
  }

  @Post('ics/import')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: Object })
  async import(@Body() dto: IcsImportDto, @Req() req: any) {
    const userId = String(req.user?.userId)
    return this.calendar.importIcs(userId, dto.ics)
  }
}
