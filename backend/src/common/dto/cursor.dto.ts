import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator'

export class CursorParamsDto {
  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @ApiPropertyOptional({ example: 'eyJpZCI6IjEyMyJ9' })
  @IsOptional()
  @IsString()
  cursor?: string
}

export class CursorPageDto<T = any> {
  @ApiPropertyOptional({ type: Array })
  items!: T[]

  @ApiPropertyOptional({ example: 'eyJpZCI6IjEyMyJ9' })
  nextCursor?: string

  @ApiPropertyOptional({ example: true })
  hasMore!: boolean
}
