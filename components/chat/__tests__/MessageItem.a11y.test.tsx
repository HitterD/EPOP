/**
 * MessageItem Accessibility Tests
 * 
 * Example of using the a11y test harness
 */

import React from 'react';
import { MessageItem } from '../MessageItem';
import {
  runA11yTests,
  testKeyboardNavigation,
  testAriaAttributes,
  createA11yTestSuite,
} from '@/lib/testing/a11y-harness';

const mockMessage = {
  id: '1',
  author: {
    id: 'user-1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    presence: 'online' as const,
  },
  content: 'Hello world!',
  timestamp: new Date('2024-01-01T12:00:00Z'),
  status: 'sent' as const,
  reactions: [],
  readBy: [],
  attachments: [],
};

describe('MessageItem Accessibility', () => {
  test('should have no axe violations', async () => {
    await runA11yTests(
      <MessageItem
        message={mockMessage}
        isMine={false}
        onReply={() => {}}
        onReact={() => {}}
      />
    );
  });

  test('should have correct ARIA attributes', () => {
    testAriaAttributes(
      <MessageItem
        message={mockMessage}
        isMine={false}
        onReply={() => {}}
        onReact={() => {}}
      />,
      {
        expectedAttributes: {
          role: 'article',
          'aria-label': expect.stringContaining('Alice Chen'),
        },
      }
    );
  });

  test('should support keyboard navigation for actions', () => {
    testKeyboardNavigation(
      <MessageItem
        message={mockMessage}
        isMine={true}
        onReply={() => {}}
        onReact={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
      {
        testTabKey: true,
        expectedFocusableCount: 4, // Reply, React, Edit, Delete buttons
      }
    );
  });
});

// Alternative: Use test suite creator
createA11yTestSuite('MessageItem', MessageItem, {
  defaultProps: {
    message: mockMessage,
    isMine: false,
    onReply: () => {},
    onReact: () => {},
  },
  scenarios: [
    {
      name: 'my message',
      props: { isMine: true },
    },
    {
      name: 'with reactions',
      props: {
        message: {
          ...mockMessage,
          reactions: [
            {
              id: 'r1',
              messageId: '1',
              emoji: '👍',
              userId: 'user-2',
              user: mockMessage.author,
              createdAt: new Date(),
            },
          ],
        },
      },
    },
  ],
  testKeyboard: true,
});
