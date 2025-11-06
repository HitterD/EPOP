/**
 * Accessibility utilities
 * FE-19: A11y helpers
 */

/**
 * Trap focus within an element (for modals, dialogs)
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    window.getComputedStyle(element).visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Get accessible label for element
 */
export function getAccessibleLabel(element: HTMLElement): string | null {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    return labelElement?.textContent || null
  }

  // Check associated label
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    return label?.textContent || null
  }

  return element.textContent
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcuts {
  private shortcuts: Map<string, () => void> = new Map()

  register(key: string, callback: () => void) {
    this.shortcuts.set(key.toLowerCase(), callback)
  }

  unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase())
  }

  handleKeyDown = (e: KeyboardEvent) => {
    const key = this.getKeyCombo(e)
    const callback = this.shortcuts.get(key)

    if (callback) {
      e.preventDefault()
      callback()
    }
  }

  private getKeyCombo(e: KeyboardEvent): string {
    const parts: string[] = []

    if (e.ctrlKey || e.metaKey) parts.push('ctrl')
    if (e.shiftKey) parts.push('shift')
    if (e.altKey) parts.push('alt')
    parts.push(e.key.toLowerCase())

    return parts.join('+')
  }

  attach() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  detach() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}

/**
 * Focus management for single-page apps
 */
export function moveFocusToMain() {
  const main = document.querySelector('main')
  if (main) {
    main.setAttribute('tabindex', '-1')
    main.focus()
    main.removeAttribute('tabindex')
  }
}

/**
 * Skip to content link functionality
 */
export function skipToContent(targetId: string) {
  const target = document.getElementById(targetId)
  if (target) {
    target.setAttribute('tabindex', '-1')
    target.focus()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if high contrast mode is enabled
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Get ARIA description for loading states
 */
export function getLoadingAriaLabel(isLoading: boolean, loadingText = 'Loading', loadedText = 'Loaded'): string {
  return isLoading ? loadingText : loadedText
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0
export function generateA11yId(prefix = 'a11y'): string {
  idCounter++
  return `${prefix}-${idCounter}`
}

/**
 * Validate color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  // This is a simplified version - you might want to use a library for production
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0]
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsWCAGContrast(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  }
  return size === 'large' ? ratio >= 3 : ratio >= 4.5
}
