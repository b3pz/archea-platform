import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { Permesso, Profilo, Utente } from './roles';

type Stato =
  | { fase: 'avvio' }                       // sto leggendo la sessione salvata (un attimo, nessun login a schermo)
  | { fase: 'fuori' }                       // nessuna sessione: login
  | { fase: 'dentro'; utente: Utente }
  | { fase: 'errore'; messaggio: string };

const Ctx = createContext<{ stato: Stato; esci: () => Promise<void> }>({ stato: { fase: 'avvio' }, esci: async () => {} });

async function caricaUtente(uid: string): Promise<Utente> {
  const [{ data: p, error: e1 }, { data: perms }] = await Promise.all([
    supabase.from('profiles').select('id,email,nome,ruolo').eq('id', uid).maybeSingle(),
    supabase.rpc('my_permissions'),
  ]);
  if (e1) throw e1;
  if (!p) throw new Error('Profilo non trovato: chiedi all\'IT di completare il tuo account.');
  return { profilo: p as Profilo, permessi: ((perms as Permesso[] | null) ?? []) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const qc = useQueryClient();

  useEffect(() => {
    // la sessione si legge UNA volta; poi la libreria avvisa solo quando cambia (accesso, uscita, rinnovo)
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;
  const profilo = useQuery({
    queryKey: ['utente', uid],
    queryFn: () => caricaUtente(uid!),
    enabled: !!uid,
    staleTime: 5 * 60_000, // profilo e permessi: si ricontrollano al massimo ogni 5 minuti
    retry: 1,
  });

  let stato: Stato;
  if (session === undefined) stato = { fase: 'avvio' };
  else if (!session) stato = { fase: 'fuori' };
  else if (profilo.data) stato = { fase: 'dentro', utente: profilo.data };
  else if (profilo.error) stato = { fase: 'errore', messaggio: (profilo.error as Error).message };
  else stato = { fase: 'avvio' };

  const esci = async () => { await supabase.auth.signOut(); qc.clear(); };
  return <Ctx.Provider value={{ stato, esci }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

/** Solo dentro le pagine protette: l'utente c'è sempre. */
export function useUtente(): Utente {
  const { stato } = useAuth();
  if (stato.fase !== 'dentro') throw new Error('useUtente fuori dalle pagine protette');
  return stato.utente;
}
