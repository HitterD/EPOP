import * as React from 'react'
import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from './avatar'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string
  fallback?: string
  className?: string
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ src, alt, size = 'md', fallback, className }: AvatarProps) {
  const sizeClass = typeof size === 'string' && size in sizeClasses 
    ? sizeClasses[size as keyof typeof sizeClasses]
    : size

  const fallbackText = fallback || alt?.charAt(0)?.toUpperCase() || '?'

  return (
    <BaseAvatar className={cn(sizeClass, className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </BaseAvatar>
  )
}
