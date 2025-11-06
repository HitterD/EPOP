import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { SuccessResponse } from '../common/dto/success.dto'
import { User } from '../entities/user.entity'
import { MailerService } from '../mailer/mailer.service'

@ApiTags('notifications')
@ApiDefaultResponse({ type: ErrorResponse })
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(
    @InjectRepository(NotificationPreferencesEntity)
    private readonly prefs: Repository<NotificationPreferencesEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly mailer: MailerService,
  ) {}

  @Get('prefs')
  @ApiOkResponse({ type: NotificationPreferencesEntity })
  async getPrefs(@Req() req: any) {
    const userId = String(req.user.userId)
    let row = await this.prefs.findOne({ where: { userId } })
    if (!row) {
      row = await this.prefs.save(this.prefs.create({ userId, enabled: true, pushEnabled: true, emailEnabled: false, channels: [] }))
    }
    return row
  }

  // Alias for FE contract
  @Get('settings')
  @ApiOkResponse({ type: NotificationPreferencesEntity })
  async getSettings(@Req() req: any) {
    return this.getPrefs(req)
  }

  @Put('prefs')
  @ApiOkResponse({ type: SuccessResponse })
  async setPrefs(
    @Req() req: any,
    @Body() body: { enabled?: boolean; pushEnabled?: boolean; emailEnabled?: boolean; channels?: Array<{ type: 'chat'|'project'|'task'|'system'; id?: string; enabled: boolean }> },
  ) {
    const userId = String(req.user.userId)
    let row = await this.prefs.findOne({ where: { userId } })
    if (!row) row = this.prefs.create({ userId, enabled: true, pushEnabled: true, emailEnabled: false, channels: [] })
    if (typeof body.enabled === 'boolean') row.enabled = body.enabled
    if (typeof body.pushEnabled === 'boolean') row.pushEnabled = body.pushEnabled
    if (typeof body.emailEnabled === 'boolean') row.emailEnabled = body.emailEnabled
    if (Array.isArray(body.channels)) row.channels = body.channels
    await this.prefs.save(row)
    return { success: true }
  }

  // Alias for FE contract
  @Put('settings')
  @ApiOkResponse({ type: SuccessResponse })
  async setSettings(
    @Req() req: any,
    @Body() body: { enabled?: boolean; pushEnabled?: boolean; emailEnabled?: boolean; channels?: Array<{ type: 'chat'|'project'|'task'|'system'; id?: string; enabled: boolean }> },
  ) {
    return this.setPrefs(req, body)
  }

  @Post('test-email')
  @ApiOkResponse({ type: SuccessResponse })
  async testEmail(@Req() req: any) {
    const user = await this.users.findOne({ where: { id: String(req.user.userId) } })
    if (!user?.email) return { success: false }
    const ok = await this.mailer.sendTestEmail(user.email)
    return { success: ok }
  }
}
