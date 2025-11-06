import type { Preview } from '@storybook/react'
import { ThemeProvider } from 'next-themes'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
    // FE-a11y-1: Comprehensive accessibility testing
    a11y: {
      // Run all WCAG 2.1 AA rules
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'link-name',
            enabled: true,
          },
        ],
      },
      // Severity: violations, incomplete, passes
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default preview
