#!/usr/bin/env python3
"""Ricostruisce supabase/SETUP_COMPLETO.sql unendo le migrazioni nell'ordine giusto.
Uso: python3 tools/genera_setup.py   (aggiungere qui le nuove migrazioni)"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ORDER = ['20261106_chat', '20261106_calendario', '20261106_offtopic', '20261106_sondaggi', '20261106_utenti_gruppi',
         '20261106_planimetrie', '20261106_foto', '20261107_utenti_dal_sito', '20261107_scan_telefono',
         '20261107_offtopic_modifica', '20261107_ruoli']
HEAD = """-- ARCHEA Platform · SETUP COMPLETO
-- Supabase → SQL Editor → New query → incolla TUTTO questo file → Run.
-- Si può rieseguire senza danni: crea solo ciò che manca e aggiorna le funzioni.
-- GENERATO da tools/genera_setup.py unendo, in ordine, i file in supabase/migrations/.
"""
parts = [HEAD]
for name in ORDER:
    f = ROOT / 'supabase/migrations' / f'{name}.sql'
    if not f.exists():
        continue
    parts.append(f"\n-- ================================================================\n-- {name}.sql\n-- ================================================================\n")
    parts.append(f.read_text(encoding='utf-8').rstrip() + '\n')
(ROOT / 'supabase/SETUP_COMPLETO.sql').write_text(''.join(parts), encoding='utf-8')
print('SETUP_COMPLETO.sql:', sum(1 for _ in ''.join(parts).splitlines()), 'righe')
