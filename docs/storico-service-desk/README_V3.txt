ARCHEA SERVICE DESK V3.0

PRINCIPALI NOVITÀ
- Ruoli USER / IT / SUPER_IT
- SUPER_IT vede tutti i ticket
- IT vede:
  * ticket non assegnati
  * ticket assegnati a sé
  * ticket dove è collaboratore
- Riassegnazione ticket fra IT
- Collaboratori multipli su ticket
- Ticket collettivi
- IT può creare ticket per conto di un utente indicando la mail
- Origine ticket: Portale / Telefono / Presenza in IT / Email / Altro
- Dashboard SUPER_IT con carico team e ticket fermi
- Ultima attività e ticket >48h evidenziati
- Chiusura con esito + nota risoluzione
- Riapertura ticket
- Prenotazioni:
  * Note facoltative
  * stato PRONTA
  * restituzione effettiva
  * stato materiale al rientro
  * note rientro
- Verbale A4 con:
  * firme consegna
  * firme restituzione
  * sempre a penna
  * nessun PDF salvato nel DB

INSTALLAZIONE
1. Supabase -> SQL Editor -> New query
2. Eseguire migration_v3_0.sql UNA SOLA VOLTA
3. La migration trasforma superit@archea.it in SUPER_IT
4. GitHub: sostituire
   - index.html
   - styles.css
   - app.js
   - logo_archea.png
5. Non toccare Edge Function Telegram o Secrets
6. Commit
7. Cmd + Shift + R

TEST CONSIGLIATO
A. superit@archea.it -> deve vedere tutto
B. it1@archea.it -> prende ticket A
C. it2@archea.it -> non deve vedere A dopo l'assegnazione, salvo essere collaboratore
D. IT1 passa A a IT2 -> IT1 non lo vede più, IT2 sì
E. aggiungi IT1 come collaboratore -> entrambi lo vedono
F. crea ticket da IT per user.test@archea.it
G. prova chiusura / riapertura
H. prova prenotazione e verbale consegna/restituzione

NOTA
La login Google aziendale NON è inclusa in V3. Verrà gestita come step separato.
