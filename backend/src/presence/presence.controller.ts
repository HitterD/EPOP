import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PresenceService } from './presence.service'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { SuccessResponse } from '../common/dto/success.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('presence')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('presence')
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @Post('heartbeat')
  @ApiOkResponse({ type: SuccessResponse })
  async heartbeat(@Req() req: any, @Body('ttl') ttl?: number) {
    return this.presence.heartbeat(req.user.userId, ttl ?? 60)
  }

  @Get('me')
  @ApiOkResponse({ type: Object })
  async me(@Req() req: any) {
    return this.presence.get(req.user.userId)
  }
}
