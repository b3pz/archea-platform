import type { IconaNome } from '../lib/roles';

const PATHS: Record<IconaNome | 'sole' | 'luna' | 'esci' | 'menu' | 'esterno', string> = {
  home: 'M3 11l9-7 9 7v9H3z',
  lavoro: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  progetti: 'M4 8h3l2-3h6l2 3h3v11H4z M12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7',
  it: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  persone: 'M9 7a4 4 0 1 0 0 .01M2 21v-2a7 7 0 0 1 14 0v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a6 6 0 0 0-4-5.6',
  calendario: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  chat: 'M4 5h16v10H9l-5 4V5Z',
  admin: 'M9 7a4 4 0 1 0 0 .01M2 21v-2a7 7 0 0 1 14 0v2M19 8v6M16 11h6',
  sole: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8',
  luna: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  esci: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  menu: 'M4 7h16M4 12h16M4 17h16',
  esterno: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
};

export function Icona({ nome, size = 20 }: { nome: keyof typeof PATHS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[nome]} /></svg>
  );
}
