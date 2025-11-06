import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Message } from '../../entities/message.entity'
import { Task } from '../../entities/task.entity'
import { FileEntity } from '../../entities/file.entity'

export class CursorMessagesResponse {
  @ApiProperty({ type: () => Message, isArray: true })
  items!: Message[]

  @ApiPropertyOptional({ nullable: true })
  nextCursor?: string

  @ApiProperty()
  hasMore!: boolean
}

export class CursorTasksResponse {
  @ApiProperty({ type: () => Task, isArray: true })
  items!: Task[]

  @ApiPropertyOptional({ nullable: true })
  nextCursor?: string

  @ApiProperty()
  hasMore!: boolean
}

export class CursorFilesResponse {
  @ApiProperty({ type: () => FileEntity, isArray: true })
  items!: FileEntity[]

  @ApiPropertyOptional({ nullable: true })
  nextCursor?: string

  @ApiProperty()
  hasMore!: boolean
}
