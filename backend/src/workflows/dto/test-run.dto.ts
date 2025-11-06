import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class TestRunDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowId?: string

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  spec?: any
}
