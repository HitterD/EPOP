import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../use-debounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still old value

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated') // Now updated
  })

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'first', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(300)
    })

    rerender({ value: 'second', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('initial') // Still initial

    rerender({ value: 'third', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('third') // Jumps to latest
  })

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })
    
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('works with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 123, delay: 500 } }
    )

    expect(result.current).toBe(123)

    rerender({ value: 456, delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe(456)
  })

  it('handles object values', () => {
    const obj1 = { name: 'John' }
    const obj2 = { name: 'Jane' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 500 } }
    )

    expect(result.current).toBe(obj1)

    rerender({ value: obj2, delay: 500 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe(obj2)
  })
})
