import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Item } from '../types'

type SetItems = React.Dispatch<React.SetStateAction<Item[]>>

export function useRealtimeItems(listId: string, setItems: SetItems) {
  useEffect(() => {
    const channel = supabase
      .channel(`items:${listId}`)
      .on(
        'postgres_changes',
        'INSERT',
        { schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload: { new: Item }) => {
          setItems(prev => {
            if (prev.some(i => i.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        'UPDATE',
        { schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload: { new: Item }) => {
          setItems(prev => prev.map(i => (i.id === payload.new.id ? payload.new : i)))
        }
      )
      .on(
        'postgres_changes',
        'DELETE',
        { schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload: { old: { id: string } }) => {
          setItems(prev => prev.filter(i => i.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [listId, setItems])
}
