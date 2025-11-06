import { Body, Controller, Get, Patch, Post, UseGuards, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'
import { UpdateMeDto } from './dto/update-me.dto'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { User } from '../entities/user.entity'
import { SuccessResponse } from '../common/dto/success.dto'

@UseGuards(AuthGuard('jwt'))
@ApiTags('users')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: User })
  async me(@Req() req: any) {
    return this.users.me(req.user.userId)
  }

  @Patch('me')
  @ApiOkResponse({ type: User })
  async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(req.user.userId, dto)
  }

  @Post('me/presence')
  @ApiOkResponse({ type: SuccessResponse })
  async presence(@Req() req: any, @Body('presence') presence: 'available'|'busy'|'away'|'offline') {
    return this.users.setPresence(req.user.userId, presence)
  }
}
