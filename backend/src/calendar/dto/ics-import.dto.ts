import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class IcsImportDto {
  @ApiProperty({ description: 'Raw ICS (.ics) file contents' })
  @IsString()
  @IsNotEmpty()
  ics!: string
}
