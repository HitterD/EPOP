import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ComposeService } from './compose.service'
import type { Mailbox } from '../entities/mail-message.entity'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { SuccessResponse } from '../common/dto/success.dto'
import { MailMessage } from '../entities/mail-message.entity'
import { SendMailDto } from './dto/send-mail.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('compose')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('compose')
export class ComposeController {
  constructor(private readonly compose: ComposeService) {}

  @Get('mails')
  @ApiOkResponse({ type: MailMessage, isArray: true })
  async list(
    @Req() req: any,
    @Query('folder') folder: Mailbox = 'received',
    @Query('limit') limit?: string,
    @Query('beforeId') beforeId?: string,
  ) {
    const lim = Math.max(1, Math.min(100, Number(limit ?? 50)))
    return this.compose.list(req.user.userId, folder, lim, beforeId)
  }

  @Post('send')
  @ApiOkResponse({ type: MailMessage })
  async send(
    @Req() req: any,
    @Body() body: SendMailDto,
  ) {
    return this.compose.send(req.user.userId, body)
  }

  @Post(':id/move')
  @ApiOkResponse({ type: SuccessResponse })
  async move(@Req() req: any, @Param('id') id: string, @Body('folder') folder: Mailbox) {
    return this.compose.move(req.user.userId, id, folder)
  }
}
