# ARCHEA SERVICE DESK V6.0.4 — Controlled Values Fix

Hotfix da applicare sopra V6.0.3 già installata.

## Cosa corregge
- `Dipartimento` = unità/reparto operativo.
- `Profilo operativo` = profilo HR, non qualifica pubblica del PDF.
- Le qualifiche del PDF restano visibili come `Ruolo PDF` e nelle Fonti originali.
- `ICT DEPARTMENT` viene normalizzato in `IT` nel master, mantenendo il raw PDF.
- `HEAD OF STUDIO`, `TECHNICAL DIRECTOR`, `PERSONAL ASSISTANTS` non vengono più proposti come dipartimenti approvati.
- Migliora i menu a tendina controllati.
- Aggiunge messaggi espliciti quando HR o Device non sono ancora stati importati.

## Installazione sopra V6.0.3
1. Supabase SQL Editor: eseguire `sql/07_migration_v6_0_4_controlled_values.sql`.
2. GitHub Pages: sostituire `index.html`, `app.js`, `styles.css`. `logo_archea.png` è invariato.
3. Fare Ctrl+F5.
4. Nessun redeploy delle Edge Functions necessario.
5. Poi importare prima `HR_Collaboratori.xlsx` e poi `Censimento_smaltimento.xlsx` dal portale.

## Nota importante
Prima degli import è normale vedere:
- Persone valorizzate (provengono dal PDF seed).
- Movimenti vuoti (HR non ancora importato).
- Censimento quasi vuoto (Device non ancora importato).
- Nessun asset nella scheda persona (Device non ancora importato).
