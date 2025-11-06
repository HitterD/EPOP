import { ApiProperty } from '@nestjs/swagger'

export class AttachResponseDto {
  @ApiProperty({ example: true })
  success!: boolean

  @ApiProperty({ example: '123' })
  linkId!: string
}
