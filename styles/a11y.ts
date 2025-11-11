/**
 * Accessibility (A11y) Utilities and ARIA Helpers
 * 
 * Provides reusable helpers for WCAG 2.1 AA compliance,
 * keyboard navigation, screen reader support, and focus management.
 */

export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

// ARIA attribute helpers
export const ariaHelpers = {
  /**
   * Generate aria-label for a button
   */
  buttonLabel(label: string, state?: string): string {
    return state ? `${label}, ${state}` : label;
  },

  /**
   * Generate aria-label for a link
   */
  linkLabel(text: string, opensNewTab?: boolean): string {
    return opensNewTab ? `${text} (opens in new tab)` : text;
  },

  /**
   * Generate aria-label for a list
   */
  listLabel(itemCount: number, listName?: string): string {
    const items = itemCount === 1 ? 'item' : 'items';
    return listName ? `${listName}, ${itemCount} ${items}` : `List with ${itemCount} ${items}`;
  },

  /**
   * Generate aria-label for pagination
   */
  paginationLabel(current: number, total: number): string {
    return `Page ${current} of ${total}`;
  },

  /**
   * Generate aria-label for a progress bar
   */
  progressLabel(value: number, max: number, label?: string): string {
    const percentage = Math.round((value / max) * 100);
    return label ? `${label}, ${percentage}% complete` : `${percentage}% complete`;
  },

  /**
   * Generate aria-label for search results
   */
  searchResultsLabel(count: number, query?: string): string {
    const results = count === 1 ? 'result' : 'results';
    return query
      ? `${count} ${results} for "${query}"`
      : `${count} ${results}`;
  },

  /**
   * Generate aria-label for notifications
   */
  notificationLabel(count: number): string {
    if (count === 0) return 'No notifications';
    const notifications = count === 1 ? 'notification' : 'notifications';
    return `${count} unread ${notifications}`;
  },

  /**
   * Generate aria-live announcement
   */
  liveAnnouncement(message: string, assertive?: boolean): {
    'aria-live': 'polite' | 'assertive';
    'aria-atomic': 'true';
    children: string;
  } {
    return {
      'aria-live': assertive ? 'assertive' : 'polite',
      'aria-atomic': 'true',
      children: message,
    };
  },
};

// Keyboard navigation utilities
export const keyboardUtils = {
  /**
   * Check if key is Enter or Space (activation keys)
   */
  isActivationKey(event: React.KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === ' ';
  },

  /**
   * Check if key is Escape
   */
  isEscapeKey(event: React.KeyboardEvent): boolean {
    return event.key === 'Escape' || event.key === 'Esc';
  },

  /**
   * Check if key is arrow key
   */
  isArrowKey(event: React.KeyboardEvent): boolean {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  /**
   * Check if key is Tab
   */
  isTabKey(event: React.KeyboardEvent): boolean {
    return event.key === 'Tab';
  },

  /**
   * Get navigation direction from arrow key
   */
  getArrowDirection(event: React.KeyboardEvent): 'up' | 'down' | 'left' | 'right' | null {
    switch (event.key) {
      case 'ArrowUp':
        return 'up';
      case 'ArrowDown':
        return 'down';
      case 'ArrowLeft':
        return 'left';
      case 'ArrowRight':
        return 'right';
      default:
        return null;
    }
  },

  /**
   * Prevent default for activation keys
   */
  handleActivation(event: React.KeyboardEvent, callback: () => void): void {
    if (this.isActivationKey(event)) {
      event.preventDefault();
      callback();
    }
  },
};

// Focus management utilities
export const focusUtils = {
  /**
   * Focus an element by ref or selector
   */
  focus(target: HTMLElement | string, options?: FocusOptions): void {
    const element = typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target;
    
    if (element) {
      element.focus(options);
    }
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll<HTMLElement>(selector));
  },

  /**
   * Trap focus within a container (for modals/dialogs)
   */
  trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (!keyboardUtils.isTabKey(event as any)) return;

    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: focus last element if currently on first
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab: focus first element if currently on last
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  },

  /**
   * Restore focus to previously focused element
   */
  createFocusGuard() {
    let previousFocus: HTMLElement | null = null;

    return {
      save() {
        previousFocus = document.activeElement as HTMLElement;
      },
      restore() {
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }
      },
    };
  },
};

// Screen reader utilities
export const screenReaderUtils = {
  /**
   * Create a visually hidden element for screen readers
   */
  visuallyHiddenProps(): React.CSSProperties {
    return {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    };
  },

  /**
   * Announce a message to screen readers
   */
  announce(message: string, assertive = false): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    Object.assign(announcement.style, this.visuallyHiddenProps());
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};

// Color contrast utilities
export const contrastUtils = {
  /**
   * Calculate relative luminance
   */
  getLuminance(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(hex1: string, hex2: string): number {
    const l1 = this.getLuminance(hex1);
    const l2 = this.getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standard (4.5:1)
   */
  meetsWCAGAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 4.5;
  },

  /**
   * Check if contrast meets WCAG AAA standard (7:1)
   */
  meetsWCAGAAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 7.0;
  },
};

// React hooks for accessibility
export function useA11yAnnounce() {
  const announce = React.useCallback((message: string, assertive = false) => {
    screenReaderUtils.announce(message, assertive);
  }, []);

  return { announce };
}

export function useFocusTrap(enabled: boolean) {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      focusUtils.trapFocus(container, event);
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return containerRef;
}

export function useRovingTabIndex(items: number) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const getTabIndex = React.useCallback(
    (index: number) => (index === activeIndex ? 0 : -1),
    [activeIndex]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const direction = keyboardUtils.getArrowDirection(event);
      if (!direction) return;

      event.preventDefault();

      let newIndex = index;
      if (direction === 'down' || direction === 'right') {
        newIndex = (index + 1) % items;
      } else if (direction === 'up' || direction === 'left') {
        newIndex = (index - 1 + items) % items;
      }

      setActiveIndex(newIndex);
    },
    [items]
  );

  return { activeIndex, getTabIndex, handleKeyDown, setActiveIndex };
}

// React import
import React from 'react';
