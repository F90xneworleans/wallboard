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
        { event: 'INSERT', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload) => {
          const newItem = payload.new as Item
          setItems(prev => {
            if (prev.some(i => i.id === newItem.id)) return prev
            return [...prev, newItem]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload) => {
          const updated = payload.new as Item
          setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'items', filter: `list_id=eq.${listId}` },
        (payload) => {
          const deleted = payload.old as { id: string }
          setItems(prev => prev.filter(i => i.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [listId, setItems])
}
