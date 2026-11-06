import { useCallback, useState } from 'react';

type Tema = 'light' | 'dark';
const KEY = 'archea-theme'; // la stessa chiave del sito attuale: il tema scelto vale in entrambi

export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const cambia = useCallback(() => {
    const t: Tema = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch { /* navigazione privata */ }
    setTema(t);
  }, [tema]);
  return [tema, cambia];
}
