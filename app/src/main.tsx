import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './styles.css';

// Memoria dei dati: ogni elenco si scarica una volta e si riusa per 30 secondi,
// cambiando pagina non si rifanno le stesse chiamate al database.
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: true, retry: 1 } } });

createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={qc}><App /></QueryClientProvider></StrictMode>,
);
