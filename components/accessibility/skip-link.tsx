/**
 * FE-a11y-2: Skip to main content link
 * WCAG 2.1 Bypass Blocks (2.4.1) Level A
 */

'use client'

import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href?: string
  children?: string
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Initially hidden
        'sr-only',
        // Visible when focused
        'focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4',
        'focus:z-50',
        'focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Transition
        'transition-all duration-200'
      )}
      onClick={(e) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.setAttribute('tabindex', '-1')
          ;(target as HTMLElement).focus()
          target.removeAttribute('tabindex')
        }
      }}
    >
      {children}
    </a>
  )
}

/**
 * Multiple skip links for complex layouts
 */
export function SkipLinks() {
  return (
    <nav aria-label="Skip navigation" className="sr-only focus-within:not-sr-only">
      <ul className="fixed top-4 left-4 z-50 space-y-2">
        <li>
          <SkipLink href="#main-content">Skip to main content</SkipLink>
        </li>
        <li>
          <SkipLink href="#navigation">Skip to navigation</SkipLink>
        </li>
        <li>
          <SkipLink href="#search">Skip to search</SkipLink>
        </li>
      </ul>
    </nav>
  )
}
