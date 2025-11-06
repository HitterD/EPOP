import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ErrorResponse {
  @ApiProperty({ example: 'UnauthorizedException' })
  code!: string

  @ApiProperty({ example: 'Invalid credentials' })
  message!: string

  @ApiPropertyOptional({ example: { field: 'email' } })
  details?: any

  @ApiPropertyOptional({ example: 'c8f1b0d9-1a2b-4b9e-9d0e-1234567890ab' })
  requestId?: string | null

  @ApiPropertyOptional({ example: 'c8f1b0d9-1a2b-4b9e-9d0e-1234567890ab' })
  traceId?: string | null

  @ApiProperty({ example: '2025-11-05T00:00:00.000Z' })
  ts!: string

  @ApiProperty({ example: '/api/v1/auth/login' })
  path!: string
}
