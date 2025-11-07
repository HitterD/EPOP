import { IsArray, ArrayNotEmpty, IsEmail, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, IsBoolean } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null
}

export class AddMemberDto {
  @IsString()
  userId!: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string
}

export class CreateBucketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string

  @IsInt()
  @Min(0)
  position!: number
}

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  bucketId?: string | null

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null

  @IsInt()
  @Min(0)
  position!: number
}

export class MoveTaskDto {
  @IsOptional()
  @IsString()
  bucketId?: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number
}

export class ReorderTasksDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  taskIds!: string[]
}

export class AddDependencyDto {
  @IsString()
  predecessorId!: string

  @IsString()
  successorId!: string

  @IsOptional()
  @IsInt()
  @Min(0)
  lagDays?: number
}

export class RescheduleTaskDto {
  @IsOptional()
  @IsString()
  startAt?: string | null

  @IsOptional()
  @IsString()
  dueAt?: string | null

  @IsOptional()
  @IsBoolean()
  cascade?: boolean
}
