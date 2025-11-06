import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { DirectoryService } from './directory.service'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { Roles } from '../common/decorators/roles.decorator'
import type { Express } from 'express'

@ApiTags('directory')
@UseGuards(AuthGuard('jwt'))
@Controller('directory')
export class DirectoryController {
  constructor(private readonly dir: DirectoryService) {}

  @Get('tree')
  @ApiOkResponse({ type: Object })
  async tree() {
    return this.dir.tree()
  }

  @Post()
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async create(@Body() dto: { name: string; code?: string | null; parentId?: string | null }) {
    return this.dir.create(dto)
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async update(@Param('id') id: string, @Body() dto: { name?: string; code?: string | null }) {
    return this.dir.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async remove(@Param('id') id: string) {
    return this.dir.remove(id)
  }

  @Post(':id/move')
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async move(@Req() req: any, @Param('id') id: string, @Body('parentId') parentId: string | null) {
    return this.dir.move(req.user.userId, id, parentId)
  }

  @Get(':id/users')
  @ApiOkResponse({ type: Object, isArray: true })
  async users(@Param('id') id: string) {
    return this.dir.usersInOrg(id)
  }

  @Post('users/:userId/move')
  @Roles('admin')
  @ApiOkResponse({ type: Object })
  async moveUser(@Req() req: any, @Param('userId') userId: string, @Body('orgId') orgId: string) {
    return this.dir.moveUserToOrg(req.user.userId, userId, orgId)
  }

  // Admin-only: Import org units
  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post('import/dry-run')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOkResponse({ type: Object })
  async importDryRun(@UploadedFile() file: Express.Multer.File) {
    return this.dir.importDryRun(file?.buffer)
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('admin')
  @Post('import/commit')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOkResponse({ type: Object })
  async importCommit(@UploadedFile() file: Express.Multer.File) {
    return this.dir.importCommit(file?.buffer)
  }
}
