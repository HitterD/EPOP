'use client'

import React from 'react'
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

type Props<T> = {
  items: T[]
  estimateSize?: number
  row: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export default function VirtualList<T>({ items, estimateSize = 56, row, overscan = 8, className }: Props<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const v = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  return (
    <div ref={parentRef} className={`h-full overflow-auto ${className ?? ''}`}>
      <div style={{ height: v.getTotalSize(), position: 'relative' }}>
        {v.getVirtualItems().map((vi) => {
          const item = items[vi.index]
          if (item === undefined) return null
          return (
            <div
              key={vi.key}
              ref={v.measureElement}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)`, height: vi.size }}
            >
              {row(item as T, vi.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
