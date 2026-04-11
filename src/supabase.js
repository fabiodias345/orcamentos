import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkjznhswwuvtxrnoxmnv.supabase.co'
const supabaseKey = 'sb_publishable_slpWGID7WQB6RYDH2qaJrQ_WcektktO'

export const supabase = createClient(supabaseUrl, supabaseKey)
