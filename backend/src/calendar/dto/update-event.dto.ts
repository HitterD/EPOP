import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsISO8601, IsOptional, IsString } from 'class-validator'

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ example: new Date().toISOString() })
  @IsOptional()
  @IsISO8601()
  startTs?: string

  @ApiPropertyOptional({ example: new Date(Date.now() + 3600000).toISOString() })
  @IsOptional()
  @IsISO8601()
  endTs?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string | null

  @ApiPropertyOptional({ enum: ['internal', 'ics-import'] })
  @IsOptional()
  @IsString()
  source?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string | null

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string | null

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  reminders?: any
}
