import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppRoutes } from './App'

vi.mock('./pages/ListsPage', () => ({
  ListsPage: () => <div>ListsPage Mock</div>,
}))

vi.mock('./pages/ListDetailPage', () => ({
  ListDetailPage: () => <div>ListDetailPage Mock</div>,
}))

describe('App', () => {
  it('renders the ListsPage at the root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('ListsPage Mock')).toBeInTheDocument()
  })

  it('renders the ListDetailPage at /list/:listId', () => {
    render(
      <MemoryRouter initialEntries={['/list/abc-123']}>
        <AppRoutes />
      </MemoryRouter>
    )
    expect(screen.getByText('ListDetailPage Mock')).toBeInTheDocument()
  })
})
