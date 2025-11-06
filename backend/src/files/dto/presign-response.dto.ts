import { ApiProperty } from '@nestjs/swagger'

export class PresignResponseDto {
  @ApiProperty()
  url!: string

  @ApiProperty()
  uploadUrl!: string

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  fields!: Record<string, string>

  @ApiProperty({ example: '123' })
  fileId!: string

  @ApiProperty()
  key!: string

  @ApiProperty()
  expiresAt!: string
}
