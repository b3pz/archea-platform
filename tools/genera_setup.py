#!/usr/bin/env python3
"""Ricostruisce supabase/SETUP_COMPLETO.sql unendo le migrazioni nell'ordine giusto.
Uso: python3 tools/genera_setup.py   (aggiungere qui le nuove migrazioni)"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
ORDER = ['20261106_chat', '20261106_calendario', '20261106_offtopic', '20261106_sondaggi', '20261106_utenti_gruppi',
         '20261106_planimetrie', '20261106_foto', '20261107_utenti_dal_sito', '20261107_scan_telefono',
         '20261107_offtopic_modifica', '20261107_ruoli', '20261107_progetti_task', '20261107_chat_gruppi', '20261108_push', '20261108_licenze_fornitori', '20261108_fornitori_tutti', '20261108_sottochat', '20261107_gruppi_operativi', '20261108_licenze_uscite_bim', '20261107180000_task_workflow']
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

# Pagina per copiare lo script dal browser (anche da telefono): supabase/setup.html
import html as _html
STEPS_SQL = '<li>Premi <b>Copia tutto</b>.</li><li>Apri Supabase → <b>SQL Editor</b> → <b>New query</b>.</li><li>Incolla e premi <b>Run</b>.</li>'
def _page(title, sql_name, sql_text, note, steps=STEPS_SQL, btn='Copia tutto'):
    return f"""<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="icon" type="image/svg+xml" href="../icons/archea-favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="../icons/archea-favicon-32.png">
<style>
:root{{--bg:#f6f6f3;--ink:#1d2320;--muted:#5d6661;--line:#e5e8e5;--card:#fff;--btn:#222624;--btnink:#fff}}
@media (prefers-color-scheme:dark){{:root{{--bg:#141714;--ink:#e3e8e5;--muted:#a3aca7;--line:#2e332f;--card:#1b1d1b;--btn:#e3e8e5;--btnink:#1b1d1b}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}}
main{{max-width:900px;margin:0 auto;padding:20px 16px 40px}}h1{{font-size:26px;letter-spacing:-.03em;margin:8px 0 4px}}
p{{color:var(--muted);margin:6px 0}}ol{{padding-left:20px;color:var(--muted)}}
.bar{{position:sticky;top:0;display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:12px 0;background:var(--bg)}}
button,a.btn{{appearance:none;border:0;border-radius:12px;padding:12px 18px;font:700 16px/1 inherit;background:var(--btn);color:var(--btnink);cursor:pointer;text-decoration:none}}
a.btn.sec{{background:var(--card);color:var(--ink);border:1px solid var(--line)}}
#ok{{font-weight:700;color:#2f7a4f}}
textarea{{width:100%;height:60vh;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);padding:12px;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace}}
</style></head><body><main>
<h1>{title}</h1>
<p>{note}</p>
<ol>{steps}</ol>
<div class="bar"><button id="copy" type="button">Copia tutto</button><a class="btn sec" href="https://supabase.com/dashboard" target="_blank" rel="noopener">Apri Supabase</a><span id="ok"></span></div>
<textarea id="sql" readonly spellcheck="false">{_html.escape(sql_text)}</textarea>
<p>File: <code>supabase/{sql_name}</code> · {sum(1 for _ in sql_text.splitlines())} righe</p>
</main>
<script>
document.getElementById('copy').onclick=async()=>{{const t=document.getElementById('sql');let ok=false;
try{{await navigator.clipboard.writeText(t.value);ok=true}}catch(e){{t.focus();t.select();t.setSelectionRange(0,t.value.length);try{{ok=document.execCommand('copy')}}catch(e2){{}}}}
document.getElementById('ok').textContent=ok?'Copiato ✓':'Seleziona il testo e copia a mano';}};
</script></body></html>
"""
_setup = (ROOT / 'supabase/SETUP_COMPLETO.sql').read_text(encoding='utf-8')
(ROOT / 'supabase/setup.html').write_text(_page('Setup Supabase · ARCHEA', 'SETUP_COMPLETO.sql', _setup,
    'Crea o aggiorna tabelle, regole e funzioni della piattaforma. Si può rieseguire senza danni.'), encoding='utf-8')
_pul = (ROOT / 'supabase/PULIZIA_DATI.sql').read_text(encoding='utf-8')
(ROOT / 'supabase/pulizia.html').write_text(_page('Pulizia dati · ARCHEA', 'PULIZIA_DATI.sql', _pul,
    'ATTENZIONE: cancella i dati in modo definitivo. Prima di eseguirlo, scegli in cima cosa pulire (true/false) e fai un backup.'), encoding='utf-8')
print('setup.html e pulizia.html aggiornati')

_push = (ROOT / 'supabase/functions/push/index.ts').read_text(encoding='utf-8')
(ROOT / 'supabase/push.html').write_text(_page('Notifiche vere · Edge Function push', 'functions/push/index.ts', _push,
    'Serve una volta sola, dopo aver eseguito SETUP_COMPLETO.sql. Fa arrivare le notifiche su computer e telefono anche a sito chiuso.',
    '<li>Premi <b>Copia tutto</b>.</li><li>Apri Supabase → <b>Edge Functions</b> → <b>Deploy a new function</b> → <b>Via Editor</b>.</li>'
    '<li>Nome della funzione: <b>push</b>. Cancella il testo di esempio, incolla e premi <b>Deploy function</b>.</li>'
    '<li>Nella pagina della funzione apri <b>Details</b> e <b>disattiva «Verify JWT»</b> (Enforce JWT Verification), poi <b>Save</b>.</li>'
    '<li>Entra nel sito come Super admin e premi <b>Attiva le notifiche</b> in Inizio: le chiavi si creano da sole.</li>'), encoding='utf-8')
print('push.html aggiornato')
