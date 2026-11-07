#!/usr/bin/env python3
"""Genera docs/DATASHEET_CODICE.html: come funziona il codice di ARCHEA Platform.

Parte scritta a mano (architettura, flussi, descrizioni delle funzioni principali)
+ parte letta dai file (elenco di tutte le funzioni con il numero di riga,
tabelle e funzioni del database). Da rilanciare quando cambia il codice:
    python3 tools/genera_datasheet.py
"""
import html
import re
from datetime import date
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
E = html.escape

# ---------------------------------------------------------------------------
# Descrizioni delle funzioni principali (le altre compaiono con il solo nome)
# ---------------------------------------------------------------------------
DESC = {
    # servicedesk/app.js
    'api': 'Unico punto che parla con Supabase: aggiunge chiave e token, rinnova la sessione se scade (401) e trasforma gli errori in messaggi.',
    'select': 'Legge righe da una tabella (GET /rest/v1/tabella?filtri).',
    'selectAll': 'Come select ma a pagine da 1000: per tabelle grandi (asset, persone).',
    'insert': 'Inserisce righe (POST). Con ret=true restituisce le righe create.',
    'update': 'Modifica le righe che rispettano il filtro (PATCH).',
    'rpc': 'Chiama una funzione SQL del database (POST /rest/v1/rpc/nome).',
    'refreshSession': 'Rinnova il token di accesso con il refresh token; se un\'altra scheda l\'ha già rinnovato usa quello.',
    'save': 'Salva la sessione in localStorage (archea_sd_session), condivisa con la piattaforma.',
    'clear': 'Cancella sessione e memoria di avvio (uscita).',
    'toast': 'Messaggio breve in basso.',
    'page': 'Imposta titolo e sottotitolo della pagina.',
    'table': 'Disegna una tabella di ticket (con ordinamento ed esportazione Excel).',
    'enableTableTools': 'Aggiunge a ogni tabella ordinamento per colonna e pulsante «Scarica XLS».',
    'notifPopups': 'Mostra i riquadri delle notifiche nuove e, se permesso, la notifica di sistema.',
    'refreshNotifications': 'Ogni 15 secondi legge le notifiche dell\'utente, aggiorna la campanella e i popup.',
    'enableSystemNotifications': 'Pulsante della campanella: passa a archeaEnablePush (push.js).',
    'isITRole': 'Vero per IT e SUPER_IT.', 'isSuperIT': 'Vero solo per il Super admin.', 'isHR': 'Vero per HR.',
    'normSearch': 'Normalizza un testo per la ricerca (minuscole, senza accenti).',
    'userHome': 'Prima pagina dell\'utente: le sue richieste e «Apri un ticket».',
    'legacyUserHome': 'Disegna la pagina «Service Desk · Come possiamo aiutarti?».',
    'home': 'Dashboard IT: contatori, carico del team, ticket più vecchi.',
    'newTicket': 'Modulo «Nuovo ticket»: crea il ticket, il numero TKT-AAAA-NNNNN, avvisa Telegram e scrive lo storico.',
    'mine': 'Elenco «I miei ticket».', 'it': 'Coda «Gestione IT» con filtri e «Prendi».',
    'calendar': 'Appuntamenti IT.', 'bookings': 'Prenotazioni di materiale.',
    'hrNewMovement': 'Modulo HR «Nuovo movimento»: controlla doppioni, crea il ticket IT (MOV-…) e la riga in hr_movements.',
    'loadUnifiedHrMovements': 'Unisce i movimenti del portale (hr_movements) e lo storico HR importato (person_events).',
    'hrHistory': 'Pagina «Movimenti / Storico movimenti».', 'hrStats': 'Statistiche HR (prima pagina dell\'HR).',
    'people': 'Elenco persone (anagrafica).', 'personDetail': 'Scheda persona: dati, asset collegati, licenze e programmi (IT), storico.',
    'personEdit': 'Correzione dei dati di una persona (non è un movimento).',
    'census': 'Censimento asset con lettore di codici.', 'assetDetail': 'Scheda asset con storico.', 'assetEdit': 'Modifica asset.',
    'detail': 'Scheda di un ticket: gestione IT, commenti, appuntamento, checklist.',
    'openAssetScanner': 'Apre il lettore di codici a barre/QR (fotocamera, foto, iPhone come lettore).',
    'getBarcodeDetector': 'Lettore nativo o, se manca, quello ZXing incluso (vendor/).',
    'nav': 'Cambia vista del Service Desk: decide quale funzione disegna la pagina e controlla il ruolo.',
    'setActiveNavigation': 'Evidenzia il pulsante della vista attiva.',
    'boot': 'Avvio: se la sessione è valida e il profilo è in memoria entra subito (niente login), poi ricontrolla in silenzio.',
    'loadIdentity': 'Legge utente, profilo e permessi e li salva per l\'avvio veloce.',
    'applyRoleNav': 'Mostra la barra delle funzioni del proprio ruolo e avvisa la piattaforma (archeaSdReady).',
    'firstView': 'Prima pagina per ruolo: IT → Dashboard, HR → Statistiche HR, utente → le sue richieste.',
    'startApp': 'Mostra l\'app, apre la prima pagina e i collegamenti diretti (?ticket=, ?scan=).',
    'showSignedOut': 'Mostra il login (solo se la sessione non è valida).',
    # start-chat.js
    'startGroups': 'Gruppi di funzioni per ruolo (usati dal menu della piattaforma).',
    'startAction': 'Esegue una funzione dal suo codice (es. "new", "ws:taskmanager").',
    'chatLoad': 'Carica contatti, messaggi diretti, gruppi, sottochat e membri.',
    'chatRender': 'Disegna la chat: Progetti (con sottochat), Gruppi, Colleghi e la conversazione aperta.',
    'chatGroupForm': 'Crea o modifica un gruppo o una sottochat di progetto (nome e persone).',
    'chatSend': 'Invia un messaggio (diretto o di gruppo).', 'chatPoll': 'Ricarica i messaggi ogni pochi secondi.',
    'chatView': 'Entrata nella chat.',
    # agenda.js
    'agendaView': 'Calendario comune.', 'agForm': 'Modulo appuntamento / prenotazione sala o auto (un clic su una casella lo apre).',
    'agDetail': 'Dettaglio di un appuntamento con accetta/rifiuta.', 'agLoad': 'Carica eventi, risorse e partecipanti.',
    # offtopic.js
    'offtopicView': 'Bacheca Off topic.', 'otForm': 'Nuovo argomento o modifica.', 'otOpen': 'Argomento con risposte e sondaggio.',
    # users.js
    'loadPerms': 'Legge i permessi dei gruppi (my_permissions).', 'hasPerm': 'Vero se l\'utente ha il permesso (il Super admin li ha tutti).',
    'usersView': 'Utenti e gruppi.', 'usForm': 'Crea o modifica un account (ruolo, gruppi, password temporanea).',
    'adminUsers': 'Chiama la funzione SQL admin_users (o la Edge Function di riserva).',
    # planimetrie.js
    'planimetrieView': 'Planimetrie: chi siede dove, dispositivi, editor delle piante.',
    'plSeatPanel': 'Pannello di una postazione: assegna o libera.',
    'plConfirmMove': 'Spostamento persona: conferma 1, conferma 2, poi scrittura e verifica.',
    'plRecordMove': 'Scrive posto + movimento (hr_movements, SPOSTAMENTO effettuato) e rilegge dal database per verificarlo.',
    'plSetSeat': 'Aggiorna people.map_position_id e lo storico della persona.',
    'plMoveTo': 'Sposta un dispositivo su un\'altra postazione (asset_history).',
    'plSavePlan': 'Salva la pianta disegnata.',
    # foto.js
    'cantiereView': 'Foto cantiere: progetto, GPS, nota, scatto.', 'fotoUpload': 'Carica una foto ridotta nello Storage «foto».',
    'ctTrovaVicino': 'Trova il cantiere più vicino con il GPS.', 'fotoFlushQueue': 'Invia le foto rimaste in coda senza rete.',
    # fornitori.js
    'fornitoriView': 'Rubrica fornitori.', 'fornForm': 'Scheda fornitore (tutti modificano, resta scritto chi).',
    'personSoftwarePanel': 'Licenze, programmi e account di una persona (solo IT).',
}

FILES = [
    ('servicedesk/app.js', 'Cuore del Service Desk: accesso, chiamate al database, ticket, HR, asset, navigazione.'),
    ('servicedesk/start-chat.js', 'Gruppi di funzioni e chat (dirette, gruppi, progetti, sottochat).'),
    ('servicedesk/agenda.js', 'Calendario comune, sale e auto.'),
    ('servicedesk/offtopic.js', 'Off topic: argomenti, risposte, sondaggi.'),
    ('servicedesk/users.js', 'Permessi e gestione account.'),
    ('servicedesk/planimetrie.js', 'Planimetrie, postazioni, spostamenti.'),
    ('servicedesk/foto.js', 'Foto di cantiere e GPS.'),
    ('servicedesk/fornitori.js', 'Rubrica fornitori e licenze della persona.'),
    ('servicedesk/push.js', 'Notifiche vere del browser (Web Push).'),
    ('assets/sd-shell.js', 'Collega Workspace e Service Desk: iframe unico, menu a sinistra, prima pagina del PM.'),
    ('assets/ws-cloud.js', 'Salva progetti, task, ore, note, squadre e organico del Workspace su Supabase (ws_records).'),
    ('config/platform.js', 'Configurazione, accesso unico (ArcheaAuth) e tema (ArcheaTheme).'),
    ('sw.js', 'Service worker: memoria per l\'uso offline, notifiche push, clic sulle notifiche.'),
]
FN_RE = re.compile(r'^\s*(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)', re.M)
WIN_RE = re.compile(r'window\.([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?(?:function|\()', re.M)


def file_functions(path):
    txt = (ROOT / path).read_text(encoding='utf-8')
    lines = txt.splitlines()
    out = []
    for i, line in enumerate(lines, 1):
        m = FN_RE.match(line) or None
        w = WIN_RE.search(line)
        if m:
            name, args = m.group(1), m.group(2)
        elif w:
            name, args = 'window.' + w.group(1), ''
        else:
            continue
        # commento subito sopra
        note = ''
        j = i - 2
        while j >= 0 and lines[j].strip().startswith('//'):
            c = lines[j].strip()[2:].strip()
            if not re.search(r'[=─-]{5,}', c):  # righe di separazione
                note = c + (' ' + note if note else '')
            j -= 1
        out.append((name, args.strip()[:40], i, DESC.get(name.replace('window.', ''), note)))
    return out, len(lines)


def db_objects():
    tables, funcs = {}, []
    for f in sorted((ROOT / 'supabase/migrations').glob('*.sql')):
        txt = f.read_text(encoding='utf-8')
        for m in re.finditer(r'create table if not exists public\.(\w+)\s*\((.*?)\n\);', txt, re.S):
            cols = [c.strip().split()[0] for c in m.group(2).split('\n') if c.strip() and not c.strip().startswith(('primary', 'unique', 'check', '--', 'constraint'))]
            tables[m.group(1)] = (f.name, cols)
        for m in re.finditer(r'create or replace function public\.(\w+)\(([^)]*)\)', txt):
            before = txt[:m.start()].rstrip().splitlines()
            note = before[-1][2:].strip() if before and before[-1].startswith('--') else ''
            funcs.append((m.group(1), m.group(2)[:60], f.name, note))
    seen, uniq = set(), []
    for fn in reversed(funcs):
        if fn[0] not in seen:
            seen.add(fn[0]); uniq.append(fn)
    return tables, sorted(uniq)


FLOWS = [
    ('Avvio e accesso', [
        'index.html carica config/platform.js (ArcheaAuth, ArcheaTheme), assets/workspace.js (React di Francesco) e assets/sd-shell.js.',
        'ArcheaAuth.signIn() fa il login su Supabase Auth e salva la sessione in localStorage «archea_sd_session»; sessionStorage «archea-live» = 1 indica un account vero.',
        'workspace.js: Bv() mostra l\'animazione solo a chi non è ancora entrato; poi il guscio con il menu.',
        'sd-shell.js crea UNA sola iframe del Service Desk (servicedesk/?embed=1&shell=1) e la appoggia sopra il posto «.sd-slot»: cambiando sezione non si ricarica.',
        'servicedesk/app.js → boot(): se il token è valido e il profilo è in sessionStorage (archea_sd_boot) entra subito con startApp(); loadIdentity() ricontrolla in silenzio.',
        'applyRoleNav() mostra la barra del ruolo e chiama window.parent.archeaSdReady(); firstView() sceglie la prima pagina; il PM viene portato su «Oggi».',
    ]),
    ('Navigazione', [
        'Barra in alto (Service Desk): pulsanti con data-view → nav(v) in app.js disegna la vista.',
        'Menu a sinistra: sd-shell.js navData() raggruppa le sezioni della piattaforma (window.__archeaTabs); run(key) cambia sezione (location.hash) o chiede al Service Desk nav(…).',
        'Chat, Calendario, Off topic, Foto: la classe «sd-free» nasconde la barra in alto.',
    ]),
    ('Ticket', [
        'newTicket() → insert(\'tickets\') → update numero_ticket → api(\'/functions/v1/telegram-new-ticket\') → insert(\'ticket_history\').',
        'Coda IT: it(); scheda: detail(id) con «Prendi in carico», stato, nota, collaboratori, commenti (comments).',
        'I trigger del database creano le notifiche (notifications) per le persone giuste.',
    ]),
    ('Notifiche', [
        'Nel sito: refreshNotifications() ogni 15 s → notifPopups() → riquadro + notifica di sistema.',
        'A sito chiuso: trigger push_on_notification (SQL) → pg_net → Edge Function «push» → Web Push cifrato → sw.js evento «push» → showNotification().',
        'Iscrizione del dispositivo: push.js archeaEnablePush() → Notification.requestPermission() → pushManager.subscribe() → rpc push_claim. Le chiavi VAPID le crea il Super admin al primo accesso (push_setup).',
    ]),
    ('Progetti, task, ore (Workspace)', [
        'Le schermate di Francesco usano useWs/useWsMap, collegati a ArcheaWsCloud (ws-cloud.js).',
        'ArcheaWsCloud.start() → loadPeople() (permessi, colleghi, PM) → loadAll() legge ws_records ogni 20 s.',
        'set(collezione, righe) → persist(): POST nuove, PATCH cambiate, DELETE tolte. Errore di permesso = messaggio in basso.',
        'Nel database: RLS su ws_records (il PM vede tutto, l\'utente le sue task), trigger ws_guard (i campi del PM non si cambiano), chat_sync_project (chat del progetto = squadra).',
    ]),
    ('Spostamento sulla planimetria', [
        'plSeatPanel() → «Assegna» → plConfirmMove(): conferma 1 e conferma 2.',
        'plRecordMove(): plSetSeat() (people.map_position_id + person_events) → insert(\'hr_movements\') SPOSTAMENTO effettuato → rilettura di people e hr_movements: se non torna, errore.',
    ]),
    ('Nuova versione React (app/)', [
        'main.tsx crea React Query e monta App; App.tsx: HashRouter + AuthProvider + rotte.',
        'lib/auth.tsx: la sessione si legge una volta (getSession) e poi si ascolta (onAuthStateChange); profilo e permessi in memoria 5 minuti.',
        'lib/roles.ts: ruoli, permessi, gruppiMenu(), primaPagina() (testati in roles.test.ts).',
        'lib/tickets.ts: accesso ai ticket; pages/*: una pagina per file.',
    ]),
]


def main():
    tables, funcs = db_objects()
    parts = []
    parts.append(f'''<section class="cover"><h1>ARCHEA Platform<br><span>Datasheet del codice</span></h1>
<p>Come è fatto, come funziona, dove sono le funzioni. Generato il {date.today().strftime('%d/%m/%Y')} da <code>tools/genera_datasheet.py</code>.</p>
<p class="cred">Francesco Diamanti · Giuseppe Milano</p></section>''')
    parts.append('''<h2>1. Mappa del progetto</h2>
<table><tr><th>Parte</th><th>Tecnologia</th><th>Cosa fa</th></tr>
<tr><td><code>index.html</code> + <code>assets/workspace.js</code></td><td>React 18 compilato (Francesco)</td><td>Guscio della piattaforma: menu, Oggi, Task Manager, Progetti, Organico…</td></tr>
<tr><td><code>servicedesk/</code></td><td>JavaScript senza framework</td><td>Ticket, asset, HR, planimetrie, calendario, chat, Off topic, foto, fornitori</td></tr>
<tr><td><code>assets/sd-shell.js</code>, <code>ws-cloud.js</code></td><td>JavaScript</td><td>Collegano Workspace, Service Desk e database</td></tr>
<tr><td><code>app/</code> → <code>v2/</code></td><td>React + TypeScript + Vite</td><td>Nuova versione: qui vanno le funzioni nuove</td></tr>
<tr><td><code>supabase/</code></td><td>PostgreSQL, RLS, Edge Functions</td><td>Tabelle, regole di accesso, funzioni, notifiche</td></tr>
<tr><td><code>sw.js</code></td><td>Service worker</td><td>App sul telefono, offline, notifiche push</td></tr></table>''')
    parts.append('<h2>2. Come funziona: i flussi principali</h2>')
    for title, steps in FLOWS:
        parts.append(f'<h3>{E(title)}</h3><ol>' + ''.join(f'<li>{E(s)}</li>' for s in steps) + '</ol>')
    parts.append('<h2>3. Le funzioni, file per file</h2><p class="muted">In grassetto le funzioni principali con la loro descrizione. Il numero è la riga del file: aprilo e cerca il nome.</p>')
    for path, about in FILES:
        fns, n = file_functions(path)
        main_ = [f for f in fns if f[3]]
        other = [f for f in fns if not f[3]]
        parts.append(f'<h3><code>{E(path)}</code> <small>{n} righe · {len(fns)} funzioni</small></h3><p>{E(about)}</p>')
        if main_:
            parts.append('<table class="fn"><tr><th>Funzione</th><th>Riga</th><th>Cosa fa</th></tr>' + ''.join(
                f'<tr><td><b>{E(f[0])}</b>({E(f[1])})</td><td>{f[2]}</td><td>{E(f[3])}</td></tr>' for f in main_) + '</table>')
        if other:
            parts.append('<p class="others"><b>Altre funzioni di supporto:</b> ' + ', '.join(f'{E(f[0])} <span>({f[2]})</span>' for f in other) + '</p>')
    # app React
    parts.append('<h3><code>app/src</code> (React)</h3><table class="fn"><tr><th>File</th><th>Cosa contiene</th></tr>' + ''.join(
        f'<tr><td><code>{E(str(p.relative_to(ROOT / "app/src")))}</code></td><td>{E(_first_comment(p))}</td></tr>'
        for p in sorted((ROOT / 'app/src').rglob('*.ts*'))) + '</table>')
    parts.append('<h2>4. Il database</h2><p>Ogni tabella ha la sicurezza per riga (RLS): il database decide chi legge e chi scrive, non lo schermo.</p>')
    parts.append('<h3>Tabelle create dalle migrazioni</h3><table class="fn"><tr><th>Tabella</th><th>Colonne</th><th>Migrazione</th></tr>' + ''.join(
        f'<tr><td><b>{E(t)}</b></td><td>{E(", ".join(c))}</td><td><small>{E(f)}</small></td></tr>' for t, (f, c) in sorted(tables.items())) + '</table>')
    parts.append('<p class="muted">Tabelle di base già presenti prima delle migrazioni: profiles, tickets, comments, ticket_history, notifications, assets, asset_history, asset_assignments, people, person_events, hr_movements, map_positions, floor_plans, material_bookings, appointments, reference_values…</p>')
    parts.append('<h3>Funzioni SQL (chiamabili con rpc o usate nelle regole)</h3><table class="fn"><tr><th>Funzione</th><th>Parametri</th><th>Note</th></tr>' + ''.join(
        f'<tr><td><b>{E(n)}</b></td><td><small>{E(a)}</small></td><td>{E(note)}</td></tr>' for n, a, f, note in funcs) + '</table>')
    parts.append('<h3>Edge Functions</h3><ul>' + ''.join(f'<li><code>{E(p.parent.name)}</code>: {E(_first_comment(p))}</li>' for p in sorted((ROOT / 'supabase/functions').glob('*/index.ts'))) + '<li><code>telegram-new-ticket</code>: avviso Telegram all\'IT per ogni ticket (pubblicata su Supabase).</li></ul>')
    parts.append('<h2>5. Comandi utili</h2><table><tr><th>Cosa</th><th>Comando</th></tr>'
                 '<tr><td>Nuova versione: sviluppo / test / pubblicazione</td><td><code>cd app &amp;&amp; npm run dev</code> · <code>npm test</code> · <code>npm run build</code></td></tr>'
                 '<tr><td>Rigenerare lo script del database</td><td><code>python3 tools/genera_setup.py</code></td></tr>'
                 '<tr><td>Rigenerare tema scuro e contrasti</td><td><code>python3 tools/genera_dark.py</code></td></tr>'
                 '<tr><td>Rigenerare questo datasheet</td><td><code>python3 tools/genera_datasheet.py</code></td></tr></table>')
    rules = (ROOT / 'AGENTS.md').read_text(encoding='utf-8')
    parts.append('<h2 class="pb">6. Regole per chi scrive codice (AGENTS.md)</h2>' + markdown.markdown(rules.split('\n', 1)[1], extensions=['tables']))
    css = '''@page{size:A4;margin:16mm 14mm}
body{font-family:Inter,"Helvetica Neue",Arial,sans-serif;color:#1d2320;font-size:9.6pt;line-height:1.45}
.cover{height:240mm;display:flex;flex-direction:column;justify-content:center;border-left:6px solid #e8410f;padding-left:12mm;break-after:page}
.cover h1{font-size:30pt;line-height:1.1;margin:0 0 6mm}.cover h1 span{font-size:20pt;color:#5b625e;font-weight:600}.cred{margin-top:20mm;font-weight:700}
h2{font-size:15pt;border-bottom:1.5px solid #1d2320;padding-bottom:1.5mm;margin:8mm 0 3mm;break-after:avoid}h2.pb{break-before:page}
h3{font-size:11.5pt;margin:6mm 0 2mm;break-after:avoid}h3 small{font-weight:400;color:#5b625e;font-size:8.5pt}
table{border-collapse:collapse;width:100%;margin:2mm 0 4mm;font-size:8.6pt}th,td{border:1px solid #d3d6d3;padding:1.3mm 1.8mm;text-align:left;vertical-align:top}th{background:#f0efec}
table.fn td:nth-child(2){white-space:nowrap;color:#5b625e}tr{break-inside:avoid}
code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.92em;background:#f0efec;padding:0 1mm;border-radius:1mm}
.others{font-size:8.3pt;color:#3b423e}.others span{color:#8a918c}.muted{color:#5b625e}
ol li,ul li{margin:.8mm 0}'''
    out = ROOT / 'docs/DATASHEET_CODICE.html'
    out.write_text(f'<!doctype html><html lang="it"><head><meta charset="utf-8"><title>ARCHEA Platform · Datasheet del codice</title>'
                   f'<link rel="icon" type="image/svg+xml" href="../icons/archea-favicon.svg"><style>{css}</style></head><body>{"".join(parts)}</body></html>', encoding='utf-8')
    print(out.relative_to(ROOT), 'scritto')


def _first_comment(p):
    for line in p.read_text(encoding='utf-8').splitlines()[:12]:
        s = line.strip()
        if s.startswith('//'):
            return s.lstrip('/ ').strip()
    return ''


if __name__ == '__main__':
    main()
