/**
 * FE-a11y-2: Keyboard navigation hooks
 * Implements roving tabindex and arrow key navigation
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseRovingTabIndexOptions {
  /**
   * Total number of items
   */
  count: number
  /**
   * Initially focused index
   */
  initialIndex?: number
  /**
   * Enable loop navigation (wrap around)
   */
  loop?: boolean
  /**
   * Orientation of the list
   */
  orientation?: 'horizontal' | 'vertical' | 'both'
  /**
   * Callback when focus changes
   */
  onFocusChange?: (index: number) => void
}

/**
 * Roving tabindex pattern for lists
 * WCAG 2.1 Keyboard (2.1.1) Level A
 */
export function useRovingTabIndex({
  count,
  initialIndex = 0,
  loop = true,
  orientation = 'vertical',
  onFocusChange,
}: UseRovingTabIndexOptions) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex)
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map())

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      let nextIndex = index

      // Vertical navigation
      if (orientation === 'vertical' || orientation === 'both') {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          nextIndex = index + 1
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          nextIndex = index - 1
        }
      }

      // Horizontal navigation
      if (orientation === 'horizontal' || orientation === 'both') {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          nextIndex = index + 1
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          nextIndex = index - 1
        }
      }

      // Home/End keys
      if (e.key === 'Home') {
        e.preventDefault()
        nextIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIndex = count - 1
      }

      // Handle loop
      if (loop) {
        if (nextIndex < 0) nextIndex = count - 1
        if (nextIndex >= count) nextIndex = 0
      } else {
        nextIndex = Math.max(0, Math.min(count - 1, nextIndex))
      }

      if (nextIndex !== index) {
        setFocusedIndex(nextIndex)
        onFocusChange?.(nextIndex)
        itemsRef.current.get(nextIndex)?.focus()
      }
    },
    [count, loop, orientation, onFocusChange]
  )

  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        if (el) {
          itemsRef.current.set(index, el)
        } else {
          itemsRef.current.delete(index)
        }
      },
      tabIndex: index === focusedIndex ? 0 : -1,
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(e, index),
      onFocus: () => {
        setFocusedIndex(index)
        onFocusChange?.(index)
      },
      'data-focused': index === focusedIndex,
    }),
    [focusedIndex, handleKeyDown, onFocusChange]
  )

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
  }
}

/**
 * Focus trap for modals and dialogs
 * WCAG 2.1 No Keyboard Trap (2.1.2) Level A
 */
export function useFocusTrap(active: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.querySelectorAll<HTMLElement>(selector))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restore previous focus
      previousFocusRef.current?.focus()
    }
  }, [active])

  return containerRef
}

/**
 * Keyboard shortcuts hook
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase()
      const matchesCtrl = options?.ctrl ? e.ctrlKey : !e.ctrlKey || e.ctrlKey
      const matchesShift = options?.shift ? e.shiftKey : !e.shiftKey || e.shiftKey
      const matchesAlt = options?.alt ? e.altKey : !e.altKey || e.altKey
      const matchesMeta = options?.meta ? e.metaKey : !e.metaKey || e.metaKey

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        e.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, options])
}
