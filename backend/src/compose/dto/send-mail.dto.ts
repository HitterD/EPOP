import { IsArray, ArrayNotEmpty, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class SendMailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  toUsers!: string[]

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  bodyHtml?: string | null
}
