import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsISO8601, IsOptional } from 'class-validator'

export class RangeQueryDto {
  @ApiPropertyOptional({ example: new Date(Date.now() - 7 * 86400000).toISOString() })
  @IsOptional()
  @IsISO8601()
  start?: string

  @ApiPropertyOptional({ example: new Date(Date.now() + 30 * 86400000).toISOString() })
  @IsOptional()
  @IsISO8601()
  end?: string
}
