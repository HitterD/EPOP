import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsISO8601, IsOptional, IsString } from 'class-validator'

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title!: string

  @ApiProperty({ example: new Date().toISOString() })
  @IsISO8601()
  startTs!: string

  @ApiProperty({ example: new Date(Date.now() + 3600000).toISOString() })
  @IsISO8601()
  endTs!: string

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
