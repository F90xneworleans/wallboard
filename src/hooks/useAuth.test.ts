import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

const { mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

describe('useAuth', () => {
  const mockUnsubscribe = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({
      data: { session: null },
    })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })
  })

  it('starts with loading true', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
  })

  it('sets session to null when not logged in', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {})

    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('sets session when logged in', async () => {
    const fakeSession = { user: { id: 'user-1', email: 'test@test.com' } }
    mockGetSession.mockResolvedValue({
      data: { session: fakeSession },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {})

    expect(result.current.session).toEqual(fakeSession)
    expect(result.current.loading).toBe(false)
  })

  it('subscribes to auth state changes', () => {
    renderHook(() => useAuth())
    expect(mockOnAuthStateChange).toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useAuth())
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('updates session when auth state changes', async () => {
    let authCallback: (_event: string, session: unknown) => void = () => {}
    mockOnAuthStateChange.mockImplementation((cb: (_event: string, session: unknown) => void) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })

    const { result } = renderHook(() => useAuth())
    await act(async () => {})

    const newSession = { user: { id: 'user-2', email: 'new@test.com' } }
    act(() => {
      authCallback('SIGNED_IN', newSession)
    })

    expect(result.current.session).toEqual(newSession)
  })
})
