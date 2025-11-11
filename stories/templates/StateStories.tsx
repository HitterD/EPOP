/**
 * State Stories Template
 * 
 * Use this template to create stories for components that use the 5-state taxonomy.
 * Copy and customize for your component.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useAsyncState } from '@/styles/states';

// Example component that uses state
function ExampleComponent({ 
  initialState = 'idle',
  mockData,
  mockError,
}: {
  initialState?: 'idle' | 'loading' | 'optimistic' | 'success' | 'error';
  mockData?: any;
  mockError?: Error;
}) {
  const state = useAsyncState(initialState);

  React.useEffect(() => {
    if (initialState === 'loading') state.setLoading();
    if (initialState === 'optimistic' && mockData) state.setOptimistic(mockData);
    if (initialState === 'success' && mockData) state.setSuccess(mockData);
    if (initialState === 'error' && mockError) state.setError(mockError);
  }, [initialState, mockData, mockError]);

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <h3 className="font-semibold">Current State: {state.state}</h3>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => state.setIdle()}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Set Idle
          </button>
          <button
            onClick={() => state.setLoading()}
            className="px-3 py-1 bg-blue-200 rounded"
          >
            Set Loading
          </button>
          <button
            onClick={() => state.setOptimistic({ message: 'Optimistic data' })}
            className="px-3 py-1 bg-yellow-200 rounded"
          >
            Set Optimistic
          </button>
          <button
            onClick={() => state.setSuccess({ message: 'Success data' })}
            className="px-3 py-1 bg-green-200 rounded"
          >
            Set Success
          </button>
          <button
            onClick={() => state.setError(new Error('Something went wrong'))}
            className="px-3 py-1 bg-red-200 rounded"
          >
            Set Error
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {state.isIdle && (
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-gray-600">Idle state - No action taken</p>
          </div>
        )}

        {state.isLoading && (
          <div className="p-4 bg-blue-50 rounded flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-700">Loading...</p>
          </div>
        )}

        {state.isOptimistic && (
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-yellow-700">Optimistic update</p>
            {state.data && <pre className="text-xs mt-2">{JSON.stringify(state.data, null, 2)}</pre>}
          </div>
        )}

        {state.isSuccess && (
          <div className="p-4 bg-green-50 rounded">
            <p className="text-green-700">✓ Success!</p>
            {state.data && <pre className="text-xs mt-2">{JSON.stringify(state.data, null, 2)}</pre>}
          </div>
        )}

        {state.isError && (
          <div className="p-4 bg-red-50 rounded">
            <p className="text-red-700">✗ Error occurred</p>
            {state.error && (
              <p className="text-sm text-red-600 mt-1">{state.error.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Storybook meta
const meta: Meta<typeof ExampleComponent> = {
  title: 'Templates/State Stories',
  component: ExampleComponent,
  parameters: {
    docs: {
      description: {
        component: `
# State Stories Template

This template demonstrates how to create stories for all 5 states in the state taxonomy:
- **idle**: Initial/rest state
- **loading**: Async operation in progress (show spinner)
- **optimistic**: UI updated before server confirms (instant feedback)
- **success**: Operation completed successfully (transient state)
- **error**: Operation failed (show error message)

## Usage

Copy this template and customize for your component:

\`\`\`tsx
import { useAsyncState } from '@/styles/states';

function YourComponent() {
  const state = useAsyncState<YourDataType>();
  
  async function loadData() {
    state.setLoading();
    try {
      const data = await api.fetch();
      state.setSuccess(data);
    } catch (error) {
      state.setError(error);
    }
  }
  
  return (
    <>
      {state.isLoading && <Spinner />}
      {state.isError && <Error message={state.error?.message} />}
      {state.isSuccess && <Data items={state.data} />}
    </>
  );
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExampleComponent>;

// Story 1: Idle State
export const Idle: Story = {
  args: {
    initialState: 'idle',
  },
  parameters: {
    docs: {
      description: {
        story: 'Initial state - no action taken yet. This is the default state.',
      },
    },
  },
};

// Story 2: Loading State
export const Loading: Story = {
  args: {
    initialState: 'loading',
  },
  parameters: {
    docs: {
      description: {
        story: 'Async operation in progress. Show a spinner or loading indicator.',
      },
    },
  },
};

// Story 3: Optimistic State
export const Optimistic: Story = {
  args: {
    initialState: 'optimistic',
    mockData: {
      id: '123',
      message: 'Optimistically created item',
      createdAt: new Date().toISOString(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'UI updated immediately before server confirms. Provides instant feedback.',
      },
    },
  },
};

// Story 4: Success State
export const Success: Story = {
  args: {
    initialState: 'success',
    mockData: {
      id: '123',
      message: 'Operation completed successfully',
      items: [1, 2, 3],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Operation completed successfully. Show success message or data.',
      },
    },
  },
};

// Story 5: Error State
export const Error: Story = {
  args: {
    initialState: 'error',
    mockError: new Error('Network request failed: 500 Internal Server Error'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Operation failed. Show error message with retry option.',
      },
    },
  },
};

// Story 6: Interactive Demo
export const InteractiveDemo: Story = {
  args: {
    initialState: 'idle',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - click buttons to transition between states.',
      },
    },
  },
};
