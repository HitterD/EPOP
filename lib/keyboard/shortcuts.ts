/**
 * Keyboard Shortcuts Registry
 * Centralized keyboard shortcuts management
 */

export interface KeyboardShortcut {
  key: string
  modifier?: 'ctrl' | 'cmd' | 'alt' | 'shift'
  description: string
  action: () => void
  category: string
  enabled?: boolean
}

export type ShortcutCategory = 'navigation' | 'actions' | 'search' | 'chat' | 'projects' | 'general'

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private enabled = true

  /**
   * Register a keyboard shortcut
   */
  register(id: string, shortcut: KeyboardShortcut): void {
    this.shortcuts.set(id, { ...shortcut, enabled: true })
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): Map<string, KeyboardShortcut> {
    return this.shortcuts
  }

  /**
   * Get shortcuts by category
   */
  getByCategory(category: ShortcutCategory): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.category === category)
  }

  /**
   * Handle keyboard event
   */
  handleKeyPress(event: KeyboardEvent): boolean {
    if (!this.enabled) return false

    const key = event.key.toLowerCase()
    const modifier = this.getModifier(event)

    for (const [id, shortcut] of this.shortcuts) {
      if (!shortcut.enabled) continue

      const matchKey = shortcut.key.toLowerCase() === key
      const matchModifier = this.matchModifier(event, shortcut.modifier)

      if (matchKey && matchModifier) {
        event.preventDefault()
        shortcut.action()
        return true
      }
    }

    return false
  }

  /**
   * Enable/disable shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Get modifier key from event
   */
  private getModifier(event: KeyboardEvent): string | undefined {
    if (event.ctrlKey || event.metaKey) return 'ctrl'
    if (event.altKey) return 'alt'
    if (event.shiftKey) return 'shift'
    return undefined
  }

  /**
   * Match modifier key
   */
  private matchModifier(event: KeyboardEvent, modifier?: string): boolean {
    if (!modifier) {
      return !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey
    }

    switch (modifier) {
      case 'ctrl':
      case 'cmd':
        return event.ctrlKey || event.metaKey
      case 'alt':
        return event.altKey
      case 'shift':
        return event.shiftKey
      default:
        return false
    }
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.modifier) {
      const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
      switch (shortcut.modifier) {
        case 'ctrl':
        case 'cmd':
          parts.push(isMac ? '⌘' : 'Ctrl')
          break
        case 'alt':
          parts.push(isMac ? '⌥' : 'Alt')
          break
        case 'shift':
          parts.push(isMac ? '⇧' : 'Shift')
          break
      }
    }

    parts.push(shortcut.key.toUpperCase())
    return parts.join('+')
  }
}

export const keyboardShortcuts = new KeyboardShortcutsManager()

/**
 * Default keyboard shortcuts
 */
export const defaultShortcuts = {
  // Navigation
  'nav.search': {
    key: 'k',
    modifier: 'cmd',
    description: 'Open global search',
    category: 'navigation',
  },
  'nav.home': {
    key: 'h',
    modifier: 'cmd',
    description: 'Go to home',
    category: 'navigation',
  },
  'nav.chat': {
    key: '1',
    modifier: 'cmd',
    description: 'Go to chat',
    category: 'navigation',
  },
  'nav.projects': {
    key: '2',
    modifier: 'cmd',
    description: 'Go to projects',
    category: 'navigation',
  },
  'nav.directory': {
    key: '3',
    modifier: 'cmd',
    description: 'Go to directory',
    category: 'navigation',
  },
  'nav.notifications': {
    key: 'n',
    modifier: 'cmd',
    description: 'Open notifications',
    category: 'navigation',
  },

  // Actions
  'action.new': {
    key: 'n',
    modifier: 'cmd',
    description: 'Create new item',
    category: 'actions',
  },
  'action.save': {
    key: 's',
    modifier: 'cmd',
    description: 'Save current item',
    category: 'actions',
  },
  'action.refresh': {
    key: 'r',
    modifier: 'cmd',
    description: 'Refresh current view',
    category: 'actions',
  },

  // Chat
  'chat.send': {
    key: 'Enter',
    modifier: 'cmd',
    description: 'Send message',
    category: 'chat',
  },
  'chat.newline': {
    key: 'Enter',
    modifier: 'shift',
    description: 'New line in message',
    category: 'chat',
  },

  // General
  'general.help': {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'general',
  },
  'general.close': {
    key: 'Escape',
    description: 'Close dialog/modal',
    category: 'general',
  },
} as const
