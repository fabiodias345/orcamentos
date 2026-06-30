import { createClient } from '@supabase/supabase-js'

// Detectar ambiente
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// URLs e chaves
const supabaseRemoteUrl = 'https://mkjznhswwuvtxrnoxmnv.supabase.co'
const supabaseRemoteKey = 'sb_publishable_slpWGID7WQB6RYDH2qaJrQ_WcektktO'

// Supabase Local (rodando em http://localhost:54321)
const supabaseLocalUrl = 'http://localhost:54321'
const supabaseLocalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ranpuaHN3d3V2dHhybm94bW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTk5OTk5OTk5OX0.PLACEHOLDER'

// Escolher entre local e remoto
const supabaseUrl = isLocal ? supabaseLocalUrl : supabaseRemoteUrl
const supabaseKey = isLocal ? supabaseLocalKey : supabaseRemoteKey

console.log(`[Supabase] Conectando a: ${isLocal ? 'LOCAL' : 'REMOTO'} (${supabaseUrl})`)

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: sessionStorage,
    persistSession: true,
  }
})
