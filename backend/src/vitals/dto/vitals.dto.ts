import { IsIn, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator'

export class VitalsDto {
  @IsString()
  @IsIn(['CLS', 'FID', 'INP', 'LCP', 'FCP', 'TTFB'])
  name!: string

  @IsNumber()
  @Min(0)
  @Max(60000)
  value!: number

  @IsString()
  @IsIn(['good', 'needs-improvement', 'poor'])
  rating!: string

  @IsNumber()
  @IsOptional()
  delta?: number

  @IsString()
  @IsOptional()
  @MaxLength(100)
  id?: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  navigationType?: string

  @IsUrl({ require_protocol: true, require_tld: false })
  @MaxLength(2000)
  url!: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  userAgent?: string

  // passthrough metadata
  @IsOptional()
  metadata?: Record<string, any>
}
