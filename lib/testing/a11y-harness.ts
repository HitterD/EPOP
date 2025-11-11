/**
 * Accessibility Test Harness
 * 
 * Reusable utilities for testing accessibility with jest-axe.
 * Ensures WCAG 2.1 AA compliance across all components.
 */

import { render, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { ReactElement } from 'react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Run accessibility tests on a component
 * 
 * @example
 * ```tsx
 * test('should have no a11y violations', async () => {
 *   await runA11yTests(<Button>Click me</Button>);
 * });
 * ```
 */
export async function runA11yTests(
  component: ReactElement,
  options?: {
    // Axe-core rules to disable (use sparingly!)
    disabledRules?: string[];
    // Custom axe configuration
    axeOptions?: any;
  }
): Promise<{
  violations: any[];
  passes: any[];
  incomplete: any[];
  container: HTMLElement;
}> {
  const { container } = render(component);

  const axeOptions = {
    rules: {},
    ...options?.axeOptions,
  };

  // Disable specified rules if any
  if (options?.disabledRules) {
    options.disabledRules.forEach((rule) => {
      axeOptions.rules[rule] = { enabled: false };
    });
  }

  const results = await axe(container, axeOptions);

  // Fail test if violations found
  expect(results).toHaveNoViolations();

  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    container,
  };
}

/**
 * Test keyboard navigation for a component
 * 
 * @example
 * ```tsx
 * test('should support keyboard navigation', () => {
 *   testKeyboardNavigation(<Menu items={items} />, {
 *     expectedFocusableCount: 5,
 *     testArrowKeys: true,
 *     testEnterKey: true,
 *   });
 * });
 * ```
 */
export function testKeyboardNavigation(
  component: ReactElement,
  options: {
    expectedFocusableCount?: number;
    testTabKey?: boolean;
    testArrowKeys?: boolean;
    testEnterKey?: boolean;
    testEscapeKey?: boolean;
  } = {}
): RenderResult {
  const { container } = render(component);

  // Get all focusable elements
  const focusableElements = getFocusableElements(container);

  // Test expected count
  if (options.expectedFocusableCount !== undefined) {
    expect(focusableElements).toHaveLength(options.expectedFocusableCount);
  }

  // Test Tab key navigation
  if (options.testTabKey) {
    focusableElements.forEach((element, index) => {
      element.focus();
      expect(document.activeElement).toBe(element);
    });
  }

  return { container } as RenderResult;
}

/**
 * Test screen reader announcements
 * 
 * @example
 * ```tsx
 * test('should announce to screen reader', () => {
 *   const { getByRole } = testScreenReaderAnnouncement(<Alert>Warning!</Alert>, {
 *     role: 'alert',
 *     expectedText: 'Warning!',
 *   });
 * });
 * ```
 */
export function testScreenReaderAnnouncement(
  component: ReactElement,
  options: {
    role?: string;
    ariaLive?: 'polite' | 'assertive' | 'off';
    ariaAtomic?: boolean;
    expectedText?: string;
  }
): RenderResult {
  const result = render(component);
  const { container } = result;

  // Find live region
  const liveRegion = options.role
    ? container.querySelector(`[role="${options.role}"]`)
    : container.querySelector('[aria-live]');

  if (liveRegion) {
    // Check aria-live
    if (options.ariaLive) {
      expect(liveRegion).toHaveAttribute('aria-live', options.ariaLive);
    }

    // Check aria-atomic
    if (options.ariaAtomic !== undefined) {
      expect(liveRegion).toHaveAttribute('aria-atomic', String(options.ariaAtomic));
    }

    // Check text content
    if (options.expectedText) {
      expect(liveRegion).toHaveTextContent(options.expectedText);
    }
  }

  return result;
}

/**
 * Test focus trap (for modals, dialogs)
 * 
 * @example
 * ```tsx
 * test('should trap focus in modal', () => {
 *   testFocusTrap(<Modal open={true}>Content</Modal>, {
 *     expectedFocusableCount: 3,
 *   });
 * });
 * ```
 */
export function testFocusTrap(
  component: ReactElement,
  options: {
    expectedFocusableCount?: number;
    testFirstLastFocus?: boolean;
  } = {}
): RenderResult {
  const { container } = render(component);
  const focusableElements = getFocusableElements(container);

  if (options.expectedFocusableCount !== undefined) {
    expect(focusableElements).toHaveLength(options.expectedFocusableCount);
  }

  if (options.testFirstLastFocus && focusableElements.length > 0) {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus should cycle between first and last
    firstElement.focus();
    expect(document.activeElement).toBe(firstElement);

    lastElement.focus();
    expect(document.activeElement).toBe(lastElement);
  }

  return { container } as RenderResult;
}

/**
 * Test color contrast compliance
 * 
 * @example
 * ```tsx
 * test('should meet WCAG AA contrast', () => {
 *   testColorContrast('#3b82f6', '#ffffff', { level: 'AA' });
 * });
 * ```
 */
export function testColorContrast(
  foreground: string,
  background: string,
  options: {
    level: 'AA' | 'AAA';
    size?: 'normal' | 'large';
  } = { level: 'AA', size: 'normal' }
): void {
  const ratio = getContrastRatio(foreground, background);

  // WCAG requirements
  const requirements = {
    AA: options.size === 'large' ? 3.0 : 4.5,
    AAA: options.size === 'large' ? 4.5 : 7.0,
  };

  const minRatio = requirements[options.level];
  expect(ratio).toBeGreaterThanOrEqual(minRatio);
}

/**
 * Test ARIA attributes
 * 
 * @example
 * ```tsx
 * test('should have correct ARIA attributes', () => {
 *   testAriaAttributes(<Button aria-label="Close">X</Button>, {
 *     expectedAttributes: {
 *       'aria-label': 'Close',
 *       'role': 'button',
 *     },
 *   });
 * });
 * ```
 */
export function testAriaAttributes(
  component: ReactElement,
  options: {
    expectedAttributes: Record<string, string | boolean>;
    selector?: string;
  }
): RenderResult {
  const { container } = render(component);
  const element = options.selector
    ? container.querySelector(options.selector)
    : container.firstElementChild;

  expect(element).toBeTruthy();

  Object.entries(options.expectedAttributes).forEach(([attr, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        expect(element).toHaveAttribute(attr);
      } else {
        expect(element).not.toHaveAttribute(attr);
      }
    } else {
      expect(element).toHaveAttribute(attr, value);
    }
  });

  return { container } as RenderResult;
}

// Helper functions

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

function getLuminance(hex: string): number {
  const rgb = parseInt(hex.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Create a test suite for a component's accessibility
 * 
 * @example
 * ```tsx
 * createA11yTestSuite('Button', Button, {
 *   defaultProps: { children: 'Click me' },
 *   scenarios: [
 *     {
 *       name: 'primary variant',
 *       props: { variant: 'primary' },
 *     },
 *     {
 *       name: 'disabled state',
 *       props: { disabled: true },
 *     },
 *   ],
 * });
 * ```
 */
export function createA11yTestSuite<P extends object>(
  componentName: string,
  Component: React.ComponentType<P>,
  options: {
    defaultProps: P;
    scenarios?: Array<{
      name: string;
      props: Partial<P>;
      skip?: boolean;
    }>;
    testKeyboard?: boolean;
    testScreenReader?: boolean;
    testFocusTrap?: boolean;
  }
): void {
  describe(`${componentName} Accessibility`, () => {
    test('should have no axe violations (default props)', async () => {
      await runA11yTests(<Component {...options.defaultProps} />);
    });

    if (options.scenarios) {
      options.scenarios.forEach((scenario) => {
        const testFn = scenario.skip ? test.skip : test;
        testFn(`should have no axe violations (${scenario.name})`, async () => {
          const props = { ...options.defaultProps, ...scenario.props };
          await runA11yTests(<Component {...props} />);
        });
      });
    }

    if (options.testKeyboard) {
      test('should support keyboard navigation', () => {
        testKeyboardNavigation(<Component {...options.defaultProps} />, {
          testTabKey: true,
          testEnterKey: true,
        });
      });
    }

    if (options.testScreenReader) {
      test('should be announced to screen readers', () => {
        testScreenReaderAnnouncement(<Component {...options.defaultProps} />, {
          role: 'status',
        });
      });
    }

    if (options.testFocusTrap) {
      test('should trap focus', () => {
        testFocusTrap(<Component {...options.defaultProps} />);
      });
    }
  });
}
