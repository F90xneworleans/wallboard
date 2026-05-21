import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}))

vi.mock('./hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}))

vi.mock('./pages/ListsPage', () => ({
  ListsPage: () => <div>ListsPage Mock</div>,
}))

vi.mock('./pages/ListDetailPage', () => ({
  ListDetailPage: () => <div>ListDetailPage Mock</div>,
}))

vi.mock('./pages/LoginPage', () => ({
  LoginPage: () => <div>LoginPage Mock</div>,
}))

describe('App', () => {
  it('shows a loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true })
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders LoginPage when not authenticated', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('LoginPage Mock')).toBeInTheDocument()
  })

  it('renders ListsPage at root when authenticated', () => {
    mockUseAuth.mockReturnValue({ session: { user: { id: '1' } }, loading: false })
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('ListsPage Mock')).toBeInTheDocument()
  })

  it('renders ListDetailPage at /list/:listId when authenticated', () => {
    mockUseAuth.mockReturnValue({ session: { user: { id: '1' } }, loading: false })
    render(
      <MemoryRouter initialEntries={['/list/abc-123']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('ListDetailPage Mock')).toBeInTheDocument()
  })

  it('redirects to login when accessing /list/:listId unauthenticated', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/list/abc-123']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('LoginPage Mock')).toBeInTheDocument()
    expect(screen.queryByText('ListDetailPage Mock')).not.toBeInTheDocument()
  })
})
