import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wjoepadoasqzboeluwmt.supabase.co'
const supabaseAnonKey = 'sb_publishable_fJ2Owis_HO2_-jySDL9U-g_PS3pFMGx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
