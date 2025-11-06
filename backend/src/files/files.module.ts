import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileEntity } from '../entities/file.entity'
import { FileLink } from '../entities/file-link.entity'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, FileLink])],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
