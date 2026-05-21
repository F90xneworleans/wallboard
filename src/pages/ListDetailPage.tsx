import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useRealtimeItems } from '../hooks/useRealtimeItems'
import type { List, Item } from '../types'

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [loading, setLoading] = useState(true)

  const stableSetItems = useCallback<React.Dispatch<React.SetStateAction<Item[]>>>(
    (action) => setItems(action),
    []
  )
  useRealtimeItems(listId ?? '', stableSetItems)

  useEffect(() => {
    if (listId) {
      fetchList()
      fetchItems()
    }
  }, [listId])

  async function fetchList() {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId!)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setList(data)
    }
  }

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', listId!)
      .order('position', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }

  async function toggleItem(item: Item) {
    const { error } = await supabase
      .from('items')
      .update({ checked: !item.checked })
      .eq('id', item.id)

    if (error) {
      setError(error.message)
    } else {
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, checked: !i.checked } : i))
      )
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return

    const nextPosition = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 0

    const { data, error } = await supabase
      .from('items')
      .insert([{ name: newItemName.trim(), list_id: listId!, checked: false, position: nextPosition }])
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setItems(prev => [...prev, data])
      setNewItemName('')
    }
  }

  async function deleteItem(itemId: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (error) {
      setError(error.message)
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId))
    }
  }

  return (
    <div className="list-detail-page">
      <Link to="/">← Back</Link>

      {list && <h1>{list.name}</h1>}

      <form onSubmit={addItem} className="add-item-form">
        <input
          type="text"
          placeholder="Add item..."
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p>No items yet. Add one above!</p>
      )}

      <ul className="items">
        {items.map(item => (
          <li key={item.id} className={item.checked ? 'checked' : ''}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item)}
              />
              <span>{item.name}</span>
            </label>
            <button onClick={() => deleteItem(item.id)} aria-label="Delete">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
