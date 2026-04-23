// ════════════════════════════════════════
// GONICEON — Supabase Config
// Supabase projenizi oluşturduktan sonra
// aşağıdaki değerleri doldurun.
// ════════════════════════════════════════

// ⚠️ Supabase Dashboard > Settings > API
const SUPABASE_URL  = 'https://qrzonjuhyyempcyeulhf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyem9uanVoeXllbXBjeWV1bGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDE1NzgsImV4cCI6MjA5MjUxNzU3OH0.8SZjA75YjrGeNHV5x9Sks4xUj9yIwpYXYzBy14B2zW4';

// ── Client ─────────────────────────────
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Helpers ────────────────────────────

// İletişim formundan mesaj kaydet
async function saveMessage({ name, email, subject, message }) {
  const { error } = await sb.from('messages').insert({ name, email, subject, message });
  if (error) throw error;
}

// Mesajları çek (CMS için)
async function fetchMessages() {
  const { data, error } = await sb
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
