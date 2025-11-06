import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, Patch, Res } from '@nestjs/common'
import { FilesService } from './files.service'
import { AuthGuard } from '@nestjs/passport'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { CursorParamsDto } from '../common/dto/cursor.dto'
import { PresignResponseDto } from './dto/presign-response.dto'
import { AttachResponseDto } from './dto/attach-response.dto'
import { SuccessResponse } from '../common/dto/success.dto'
import { FileEntity } from '../entities/file.entity'
import { CursorFilesResponse } from '../common/dto/cursor-response.dto'
import type { Response } from 'express'

@UseGuards(AuthGuard('jwt'))
@ApiTags('files')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('presign')
  @ApiOkResponse({ type: PresignResponseDto })
  async presign(@Req() req: any, @Body() body: { filename?: string; fileName?: string }) {
    const fname = (body?.filename || body?.fileName || '').toString()
    return this.files.presign(req.user?.userId ?? null, fname)
  }

  @Post('attach')
  @ApiOkResponse({ type: AttachResponseDto })
  async attach(
    @Body() body: { fileId: string; refTable: 'messages'|'mail_messages'|'tasks'; refId: string; filename?: string; mime?: string; size?: number },
  ) {
    return this.files.attach(body.fileId, body)
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    return this.files.downloadToResponse(id, req.user?.userId ?? null, res)
  }

  @Get('mine/cursor')
  @ApiOkResponse({ type: CursorFilesResponse })
  async listMineCursor(@Req() req: any, @Query() params: CursorParamsDto) {
    const lim = Math.max(1, Math.min(100, Number(params?.limit ?? 20)))
    return this.files.listMineCursor(req.user.userId, lim, params?.cursor || null)
  }

  // Convenience alias for FE hooks: GET /files with cursor params
  @Get()
  @ApiOkResponse({ type: CursorFilesResponse })
  async listMine(@Req() req: any, @Query() params: CursorParamsDto) {
    const lim = Math.max(1, Math.min(100, Number(params?.limit ?? 20)))
    return this.files.listMineCursor(req.user.userId, lim, params?.cursor || null)
  }

  @Get(':id')
  @ApiOkResponse({ type: FileEntity })
  async get(@Param('id') id: string) {
    return this.files.get(id)
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOkResponse({ type: SuccessResponse })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending'|'scanning'|'ready'|'infected'|'failed'; scanResult?: string | null },
  ) {
    return this.files.updateStatus(id, body.status, body.scanResult ?? null)
  }

  // FE shim: confirm upload without attachment linking
  @Post(':id/confirm')
  @ApiOkResponse({ type: FileEntity })
  async confirm(@Param('id') id: string) {
    return this.files.confirm(id)
  }

  @Post('purge-temp')
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async purgeTemp(@Body('olderThanHours') olderThanHours?: number) {
    const hours = Math.max(1, Number(olderThanHours ?? 24))
    return this.files.purgeTemp(hours)
  }
}
