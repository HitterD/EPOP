import { Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Express } from 'express'
import { AdminService } from './admin.service'
import { memoryStorage } from 'multer'
import { Roles } from '../common/decorators/roles.decorator'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'

@UseGuards(AuthGuard('jwt'))
@Roles('admin')
@ApiTags('admin')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('users/bulk-import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOkResponse({ type: Object })
  async bulk(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) throw new BadRequestException('Missing CSV file')
    const name = (file.originalname || '').toLowerCase()
    const type = (file.mimetype || '').toLowerCase()
    const looksCsv = name.endsWith('.csv') || type === 'text/csv' || type === 'application/vnd.ms-excel'
    if (!looksCsv) throw new BadRequestException('Invalid file type, expected CSV')
    return this.admin.bulkImportUsersFromCSV(file.buffer)
  }

  @Get('analytics')
  @ApiOkResponse({ type: Object })
  async analytics() {
    return this.admin.analyticsSummary()
  }
}
