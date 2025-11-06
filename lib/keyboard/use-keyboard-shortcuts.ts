'use client'

import { useEffect } from 'react'
import { keyboardShortcuts, KeyboardShortcut } from './shortcuts'

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, KeyboardShortcut>,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    // Register shortcuts
    Object.entries(shortcuts).forEach(([id, shortcut]) => {
      keyboardShortcuts.register(id, shortcut)
    })

    // Cleanup on unmount
    return () => {
      Object.keys(shortcuts).forEach((id) => {
        keyboardShortcuts.unregister(id)
      })
    }
  }, [shortcuts, enabled])
}

/**
 * Hook to set up global keyboard event listener
 */
export function useGlobalKeyboardListener() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs (like Cmd+K for search)
        if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) {
          keyboardShortcuts.handleKeyPress(event)
        }
        return
      }

      keyboardShortcuts.handleKeyPress(event)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

/**
 * Hook to get all registered shortcuts
 */
export function useKeyboardShortcutsList() {
  return keyboardShortcuts.getAll()
}
