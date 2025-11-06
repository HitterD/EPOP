import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

function Thrower() {
  throw new Error('boom')
}

let thrownOnce = false
function ThrowOnce() {
  if (!thrownOnce) {
    thrownOnce = true
    throw new Error('boom-once')
  }
  return <div>OK content</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    thrownOnce = false
  })

  it('renders fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Terjadi kesalahan pada bagian UI ini/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Muat ulang bagian/i })).toBeInTheDocument()
  })

  it('reset button recovers after error', () => {
    render(
      <ErrorBoundary>
        <ThrowOnce />
      </ErrorBoundary>
    )

    // First render throws -> fallback visible
    const resetBtn = screen.getByRole('button', { name: /Muat ulang bagian/i })
    fireEvent.click(resetBtn)

    // After reset ThrowOnce no longer throws -> content visible
    expect(screen.getByText(/OK content/i)).toBeInTheDocument()
  })
})
