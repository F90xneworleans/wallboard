import { describe, it, expect } from 'vitest'
import { supabase } from './supabase'

describe('supabase client', () => {
  it('exports a supabase client instance', () => {
    expect(supabase).toBeDefined()
  })

  it('is configured with the correct project URL', () => {
    // Access via the REST URL which includes the project URL
    expect(supabase['rest']['url']).toContain('wjoepadoasqzboeluwmt.supabase.co')
  })

  it('can access the auth module', () => {
    expect(supabase.auth).toBeDefined()
  })
})
