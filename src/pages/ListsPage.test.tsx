import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ListsPage } from './ListsPage'

const { mockSelect, mockInsert, mockOrder, mockSignOut, mockDeleteEq } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockOrder: vi.fn(),
  mockSignOut: vi.fn(),
  mockDeleteEq: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'lists') {
        return {
          select: mockSelect,
          insert: mockInsert,
          delete: vi.fn().mockReturnValue({ eq: mockDeleteEq }),
        }
      }
      return {}
    }),
    auth: {
      signOut: mockSignOut,
    },
  },
}))

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ListsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({
      data: [
        { id: '1', name: 'Weekly Groceries', list_type: 'grocery', created_at: '2025-01-01' },
        { id: '2', name: 'House Chores', list_type: 'todo', created_at: '2025-01-02' },
      ],
      error: null,
    })
    mockSelect.mockReturnValue({ order: mockOrder })
  })

  it('renders a heading', async () => {
    renderWithRouter(<ListsPage />)
    expect(screen.getByRole('heading', { name: /wallboard/i })).toBeInTheDocument()
  })

  it('displays lists fetched from supabase', async () => {
    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
      expect(screen.getByText('House Chores')).toBeInTheDocument()
    })
  })

  it('shows list type badges', async () => {
    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('grocery')).toBeInTheDocument()
      expect(screen.getByText('todo')).toBeInTheDocument()
    })
  })

  it('shows an empty state when there are no lists', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })
    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText(/no lists yet/i)).toBeInTheDocument()
    })
  })

  it('can create a new list', async () => {
    const user = userEvent.setup()
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: '3', name: 'New List', list_type: 'grocery', created_at: '2025-01-03' },
          error: null,
        }),
      }),
    })

    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    })

    const nameInput = screen.getByPlaceholderText(/list name/i)
    await user.type(nameInput, 'New List')

    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([{ name: 'New List', list_type: 'grocery' }])
    })
  })

  it('shows an error message when fetch fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Network error' } })
    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('can delete a list', async () => {
    const user = userEvent.setup()
    mockDeleteEq.mockResolvedValue({ error: null })

    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteEq).toHaveBeenCalledWith('id', '1')
      expect(screen.queryByText('Weekly Groceries')).not.toBeInTheDocument()
    })
  })

  it('has a sign out button that calls supabase signOut', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: null })

    renderWithRouter(<ListsPage />)
    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    })

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })
})
