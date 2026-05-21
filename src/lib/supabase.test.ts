import { describe, it, expect } from 'vitest'
import { supabase } from './supabase'

describe('supabase client', () => {
  it('exports a supabase client instance', () => {
    expect(supabase).toBeDefined()
  })

  it('is configured with the correct project URL', () => {
    expect(supabase.supabaseUrl).toBe('https://wjoepadoasqzboeluwmt.supabase.co')
  })

  it('is configured with the correct anon key', () => {
    expect(supabase.supabaseKey).toBe('sb_publishable_fJ2Owis_HO2_-jySDL9U-g_PS3pFMGx')
  })
})
