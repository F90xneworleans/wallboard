export interface List {
  id: string
  name: string
  list_type: 'grocery' | 'todo'
  created_at: string
}

export interface Item {
  id: string
  list_id: string
  name: string
  checked: boolean
  position: number
  created_at: string
}
