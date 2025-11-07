import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength, ArrayNotEmpty } from 'class-validator'

export class CreateChatDto {
  @IsBoolean()
  isGroup!: boolean

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantIds!: string[]
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string

  @IsOptional()
  @IsIn(['normal', 'important', 'urgent'])
  delivery?: 'normal' | 'important' | 'urgent'

  @IsOptional()
  @IsString()
  rootMessageId?: string | null
}

export class ReactionDto {
  @IsString()
  messageId!: string

  @IsString()
  @MaxLength(16)
  emoji!: string
}

export class EditMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string
}
