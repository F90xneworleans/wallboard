import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRealtimeItems } from './useRealtimeItems'

const { mockOn, mockSubscribe, mockUnsubscribe, mockChannel } = vi.hoisted(() => {
  const mockOn = vi.fn()
  const mockSubscribe = vi.fn()
  const mockUnsubscribe = vi.fn()
  const mockChannel = vi.fn()
  return { mockOn, mockSubscribe, mockUnsubscribe, mockChannel }
})

vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: mockChannel,
  },
}))

describe('useRealtimeItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOn.mockReturnThis()
    mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe })
    mockChannel.mockReturnValue({
      on: mockOn,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    })
  })

  it('subscribes to the items channel on mount', () => {
    const setItems = vi.fn()
    renderHook(() => useRealtimeItems('list-1', setItems))

    expect(mockChannel).toHaveBeenCalledWith('items:list-1')
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const setItems = vi.fn()
    const { unmount } = renderHook(() => useRealtimeItems('list-1', setItems))
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('listens for INSERT, UPDATE, and DELETE events', () => {
    const setItems = vi.fn()
    renderHook(() => useRealtimeItems('list-1', setItems))

    const eventTypes = mockOn.mock.calls.map(
      (call: unknown[]) => (call[1] as { event: string }).event
    )
    expect(eventTypes).toContain('INSERT')
    expect(eventTypes).toContain('UPDATE')
    expect(eventTypes).toContain('DELETE')
  })
})
