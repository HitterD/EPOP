import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WebVital } from '../entities/web-vital.entity'
import { VitalsService } from './vitals.service'
import { VitalsController } from './vitals.controller'

@Module({
  imports: [TypeOrmModule.forFeature([WebVital])],
  controllers: [VitalsController],
  providers: [VitalsService],
})
export class VitalsModule {}
