import { createClient } from '@supabase/supabase-js';

// Chiave pubblica (publishable): può stare nel codice. La service_role NON va mai qui.
export const SUPABASE_URL = 'https://igfpkpcksllmofqfoxkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wuq5rwy4w6ca7nvJTbrXzA_izhCmrf9';

// Una sola sessione per tutta l'app: la libreria la salva, la rinnova da sola prima che scada
// e avvisa quando cambia. Nessun controllo ripetuto a ogni chiamata.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'archea-v2-auth' },
});
