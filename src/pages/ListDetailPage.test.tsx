import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ListDetailPage } from './ListDetailPage'

const { mockEq, mockOrder, mockUpdate, mockInsert, mockDelete, mockFromReturn } = vi.hoisted(() => ({
  mockEq: vi.fn(),
  mockOrder: vi.fn(),
  mockUpdate: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
  mockFromReturn: {} as Record<string, unknown>,
}))

vi.mock('../lib/supabase', () => {
  const mockOn = vi.fn().mockReturnThis()
  return {
    supabase: {
      from: vi.fn((table: string) => {
      if (table === 'lists') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFromReturn.listData ?? { id: 'list-1', name: 'Weekly Groceries', list_type: 'grocery', created_at: '2025-01-01' },
                error: mockFromReturn.listError ?? null,
              }),
            }),
          }),
        }
      }
      if (table === 'items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: mockEq,
          }),
          insert: mockInsert,
          update: mockUpdate,
          delete: vi.fn().mockReturnValue({
            eq: mockDelete,
          }),
        }
      }
      return {}
    }),
    channel: vi.fn().mockReturnValue({
      on: mockOn,
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      unsubscribe: vi.fn(),
    }),
  },
}})

function renderWithRoute(listId = 'list-1') {
  return render(
    <MemoryRouter initialEntries={[`/list/${listId}`]}>
      <Routes>
        <Route path="/list/:listId" element={<ListDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ListDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFromReturn.listData = { id: 'list-1', name: 'Weekly Groceries', list_type: 'grocery', created_at: '2025-01-01' }
    mockFromReturn.listError = null

    mockEq.mockReturnValue({
      order: mockOrder,
    })
    mockOrder.mockResolvedValue({
      data: [
        { id: 'item-1', list_id: 'list-1', name: 'Milk', checked: false, position: 0, created_at: '2025-01-01' },
        { id: 'item-2', list_id: 'list-1', name: 'Bread', checked: true, position: 1, created_at: '2025-01-01' },
      ],
      error: null,
    })
  })

  it('displays the list name as heading', async () => {
    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /weekly groceries/i })).toBeInTheDocument()
    })
  })

  it('displays items from the list', async () => {
    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText('Bread')).toBeInTheDocument()
    })
  })

  it('shows checked state on items', async () => {
    renderWithRoute()
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(2)
      expect(checkboxes[0]).not.toBeChecked()
      expect(checkboxes[1]).toBeChecked()
    })
  })

  it('can toggle an item checked state', async () => {
    const user = userEvent.setup()
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ checked: true })
    })
  })

  it('can add a new item', async () => {
    const user = userEvent.setup()
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'item-3', list_id: 'list-1', name: 'Eggs', checked: false, position: 2, created_at: '2025-01-02' },
          error: null,
        }),
      }),
    })

    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/add item/i)
    await user.type(input, 'Eggs')

    const addButton = screen.getByRole('button', { name: /add/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'Eggs', list_id: 'list-1', checked: false }),
      ])
    })
  })

  it('can delete an item', async () => {
    const user = userEvent.setup()
    mockDelete.mockResolvedValue({ error: null })

    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('id', 'item-1')
    })
  })

  it('shows empty state when list has no items', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })
    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByText(/no items yet/i)).toBeInTheDocument()
    })
  })

  it('has a back link to the lists page', async () => {
    renderWithRoute()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
    })
  })
})
