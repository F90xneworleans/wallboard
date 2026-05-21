import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { List } from '../types'

export function ListsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'grocery' | 'todo'>('grocery')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLists()
  }, [])

  async function fetchLists() {
    setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setLists(data ?? [])
    }
    setLoading(false)
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    const { data, error } = await supabase
      .from('lists')
      .insert([{ name: newName.trim(), list_type: newType }])
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setLists(prev => [data, ...prev])
      setNewName('')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="lists-page">
      <header className="page-header">
        <h1>Wallboard</h1>
        <button onClick={handleSignOut} className="sign-out-button" type="button">
          Sign Out
        </button>
      </header>

      <form onSubmit={createList} className="create-form">
        <input
          type="text"
          placeholder="List name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <select value={newType} onChange={e => setNewType(e.target.value as 'grocery' | 'todo')}>
          <option value="grocery">Grocery</option>
          <option value="todo">To-Do</option>
        </select>
        <button type="submit">Create</button>
      </form>

      {error && <p className="error">{error}</p>}

      {!loading && lists.length === 0 && !error && (
        <p>No lists yet. Create one above!</p>
      )}

      <ul className="lists">
        {lists.map(list => (
          <li key={list.id}>
            <Link to={`/list/${list.id}`}>
              <span className="list-name">{list.name}</span>
              <span className="list-type">{list.list_type}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
