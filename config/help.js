/*
 * ARCHEA Platform · aiuto contestuale "?"
 * Aggiunge accanto a ogni campo da compilare un piccolo "?" che spiega a cosa serve.
 * Funziona sia nel Workspace sia nel Service Desk (anche su contenuti creati dopo).
 * Per aggiungere o cambiare una spiegazione: modifica HELP_BY_ID (id del campo)
 * oppure HELP_BY_LABEL (testo dell'etichetta, minuscolo).
 */
(function () {
  'use strict';

  var HELP_BY_ID = {
    // accesso
    email: 'La tua email aziendale, ad esempio nome.cognome@archea.it.',
    password: 'La password del tuo account. Per gli account di prova è "demo".',
    // ticket
    cat: 'Scegli il tipo di problema: serve all\'IT per capire subito chi se ne occupa. Se non sai quale scegliere, usa "Altro".',
    sub: 'Una frase breve che riassume il problema, ad esempio "Il monitor non si accende".',
    desc: 'Spiega cosa succede, da quando, e cosa hai già provato. Più dettagli dai, più veloce è la soluzione.',
    requesterMode: 'Scegli "Altro utente" se stai aprendo il ticket per conto di un collega.',
    requesterEmail: 'L\'email aziendale del collega per cui apri il ticket.',
    origin: 'Da dove è arrivata la richiesta: portale, telefono, di persona in IT o via email.',
    ticketSite: 'La sede dove si trova il problema (Firenze, Milano…).',
    ticketSiteEdit: 'La sede dove si trova il problema (Firenze, Milano…).',
    st: 'Lo stato del ticket: APERTO (da fare), IN LAVORAZIONE, IN ATTESA (aspetti l\'utente o un fornitore), CHIUSO (risolto).',
    priority: 'Quanto è urgente: URGENTE blocca il lavoro, ALTA va fatto oggi, NORMALE nei prossimi giorni, BASSA quando c\'è tempo.',
    assigneeSelect: 'Il tecnico IT responsabile del ticket. Riceve le notifiche.',
    outcome: 'Come si è concluso il ticket. Si compila quando lo chiudi.',
    resolutionNote: 'Cosa è stato fatto per risolvere: utile se il problema si ripresenta.',
    ct: 'Scrivi un messaggio sul ticket. L\'altra persona riceve una notifica.',
    checkText: 'Un\'attività da spuntare per completare il ticket, ad esempio "Creare account email".',
    apptStart: 'Giorno e ora proposti per l\'intervento. L\'utente riceve la proposta e può confermare.',
    apptDur: 'Quanti minuti pensi che servano.',
    apptMode: 'Dove avviene l\'intervento: in IT, alla postazione dell\'utente, da remoto o in sala.',
    apptNote: 'Indicazioni per l\'utente, ad esempio "Porta il caricabatterie".',
    // prenotazione materiale
    matType: 'Cosa ti serve in prestito (Matterport, iPad, laptop…).',
    matQty: 'Quanti pezzi ti servono.',
    pickupDate: 'Il giorno in cui passi a ritirare il materiale.',
    returnDate: 'Il giorno in cui pensi di riportarlo.',
    bookSite: 'Da quale sede ritiri il materiale.',
    bookReason: 'Per quale progetto o attività ti serve: aiuta a dare priorità.',
    bookAccessories: 'Accessori in più: treppiede, cavi, custodia…',
    bookNotes: 'Qualsiasi altra informazione utile per l\'IT.',
    // asset
    assetCode: 'Il codice scritto sull\'etichetta dell\'asset, ad esempio A4021.',
    scannerManualCode: 'Se la fotocamera non legge l\'etichetta, scrivi qui il codice (es. A4021).',
    assetSerial: 'Il numero di serie del produttore, di solito su un\'etichetta sotto il dispositivo.',
    assetModel: 'Marca e modello, ad esempio "Dell Precision 5680".',
    aBrand: 'Il produttore: Dell, Apple, HP…',
    aModel: 'Il modello esatto del dispositivo.',
    aStatus: 'Se l\'asset è assegnato a qualcuno, disponibile in magazzino, in prestito o da verificare.',
    aVerify: 'VERIFICATO se l\'hai controllato di persona, DA VERIFICARE se i dati vanno confermati.',
    aSite: 'In quale sede si trova fisicamente.',
    aPosition: 'La postazione o lo scaffale di magazzino (es. FI-A3 oppure M-A1).',
    aUserName: 'La persona che usa l\'asset.',
    aUserEmail: 'L\'email aziendale della persona che usa l\'asset.',
    aAccount: 'L\'account con cui è configurato il dispositivo, se diverso da quello dell\'utente.',
    aCpu: 'Il processore (es. Intel i7-13800H).', aRam: 'La memoria RAM (es. 32 GB).',
    aStorage: 'Il disco (es. SSD 1 TB).', aGpu: 'La scheda video (es. NVIDIA RTX 3000).',
    aNotes: 'Qualsiasi informazione utile: danni, accessori mancanti, garanzia…',
    aChangeReason: 'Perché stai facendo questa modifica: resta nello storico dell\'asset.',
    aEffectiveDate: 'Il giorno in cui il cambiamento è avvenuto davvero.',
    assetFile: 'Il file Excel del censimento dispositivi da importare.',
    // persone e movimenti
    npFirst: 'Il nome della persona.', npSurname: 'Il cognome della persona.',
    npEmail: 'L\'email aziendale, se è già stata creata.',
    npDate: 'Il primo giorno di lavoro previsto.',
    npSite: 'La sede in cui lavorerà.', npDepartment: 'Il reparto (Architettura, Interior, Visual…).',
    npProfile: 'Il ruolo professionale (Architect, Senior Architect…).',
    npCompany: 'La società con cui ha il contratto.',
    npDesk: 'La postazione assegnata, se già decisa.',
    npNotes: 'Cosa preparare: laptop, monitor, accessi particolari…',
    peFirst: 'Il nome della persona.', peSurname: 'Il cognome della persona.',
    peDisplay: 'Come deve comparire il nome nelle liste.',
    peEmail: 'L\'email aziendale.', peSite: 'La sede in cui lavora.',
    peDepartment: 'Il reparto.', peProfile: 'Il ruolo operativo.', peCompany: 'La società del contratto.',
    peReason: 'Perché stai correggendo questi dati: resta nello storico.',
    peNotes: 'Altre informazioni utili.',
    hrPeopleFile: 'Il file Excel HR con l\'elenco aggiornato dei collaboratori.',
    refType: 'Che tipo di valore stai aggiungendo: sede, reparto, società, profilo o categoria asset.',
    refValue: 'Il nuovo valore da rendere selezionabile nei menu.',
    // mappa
    mpSite: 'La sede della postazione.', mpType: 'Postazione di lavoro oppure scaffale di magazzino.',
    mpZone: 'La zona o il piano (es. A, B, 2P).',
    mpCode: 'Il codice univoco. Le posizioni di magazzino iniziano sempre con "M-" (es. M-A1).',
    mpLabel: 'Una descrizione breve, ad esempio "Vicino alla finestra".',
    mapSite: 'Scegli la sede da visualizzare.', mapPersonSelect: 'La persona da assegnare a questa postazione.',
    // calendario comune
    agTitle: 'Il motivo dell\'appuntamento o della prenotazione: lo vedono tutti nel calendario.',
    agDate: 'Il giorno.', agStart: 'L\'ora di inizio.', agEnd: 'L\'ora di fine: deve essere dopo l\'inizio.',
    agRes: 'La sala o l\'auto da prenotare. Sotto vedi subito se è libera.',
    agPlace: 'Dove vi vedete: studio, cantiere, indirizzo del cliente…',
    agOnline: 'Se la riunione è online, scegli la piattaforma.',
    agLink: 'Il link della riunione online. Se non l\'hai ancora, usa il pulsante "Crea" per aprire la piattaforma e poi incolla qui il link.',
    agPeopleSearch: 'Scrivi il nome di un collega per trovarlo nell\'elenco.',
    agNotes: 'Ordine del giorno, materiale da portare, altre indicazioni.',
    chatSearch: 'Scrivi il nome di un collega per trovarlo.',
    otSearch: 'Scrivi una parola per trovare un argomento.',
    otPollQ: 'La domanda del sondaggio, ad esempio "Che giorno facciamo la festa?".',
    otPollClose: 'Dopo questa data non si vota più. Lascia vuoto per tenerlo aperto.',
    usSearch: 'Cerca un collega per nome, email o ruolo.',
    usNome: 'Nome e cognome come devono comparire nel sito.',
    usEmail: 'L\'email aziendale: sarà il nome utente per entrare.',
    usPass: 'Almeno 8 caratteri. Comunicala alla persona: potrà cambiarla dopo il primo accesso.',
    ugNome: 'Un nome chiaro, ad esempio "Segreteria" o "Moderatori Off topic".',
    ugDesc: 'Una riga che spiega a cosa serve il gruppo.',
    ugSearch: 'Cerca una persona da aggiungere al gruppo.',
    otCat: 'Scegli dove pubblicarlo: aiuta i colleghi a trovarlo.',
    otTitle: 'Una frase breve e chiara, ad esempio "Calcetto giovedì sera, chi c\'è?".',
    otBodyText: 'Il messaggio per tutto lo studio. I link che iniziano con https:// diventano cliccabili.',
    otReply: 'La tua risposta: chi ha aperto l\'argomento e chi ha risposto ricevono una notifica.',
    chatText: 'Scrivi il messaggio. Invio per mandarlo, Maiusc+Invio per andare a capo.'
  };

  var HELP_BY_LABEL = {
    'email aziendale': 'La tua email aziendale, ad esempio nome.cognome@archea.it.',
    'company email': 'Your company email, e.g. name.surname@archea.it.',
    'password': 'La password del tuo account. Per gli account di prova è "demo".',
    'note': 'Informazioni in più utili a chi legge.',
    'descrizione': 'Spiega in poche righe di cosa si tratta.',
    'titolo': 'Un nome breve e chiaro.',
    'data': 'Il giorno.',
    'sede': 'La sede dello studio (Firenze, Milano…).',
    'progetto': 'La commessa a cui si riferisce (es. P51).',
    'commessa': 'Il codice della commessa (es. P51).',
    'ore': 'Le ore lavorate, anche con decimali (es. 1,5 = un\'ora e mezza).',
    'assegnatario': 'La persona che deve svolgere l\'attività.',
    'scadenza': 'Entro quando va completata.',
    'priorità': 'Quanto è urgente.',
    'stato': 'A che punto è.',
    'cerca': 'Scrivi qualche lettera per filtrare l\'elenco.'
  };

  function norm(s) { return String(s || '').replace(/\s+/g, ' ').replace(/[(:].*$/, '').trim().toLowerCase(); }

  function labelText(label) {
    var t = '';
    label.childNodes.forEach(function (n) { if (n.nodeType === 3) t += n.textContent; });
    return norm(t);
  }

  function helpFor(label, control) {
    if (control && control.id && HELP_BY_ID[control.id]) return HELP_BY_ID[control.id];
    var t = labelText(label);
    return HELP_BY_LABEL[t] || null;
  }

  var openTip = null;
  function closeTip() { if (openTip) { openTip.remove(); openTip = null; } }

  function showTip(btn, text) {
    closeTip();
    var tip = document.createElement('div');
    tip.className = 'help-tip';
    tip.setAttribute('role', 'tooltip');
    tip.textContent = text;
    document.body.appendChild(tip);
    var r = btn.getBoundingClientRect();
    var w = Math.min(300, window.innerWidth - 24);
    tip.style.maxWidth = w + 'px';
    var left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12));
    tip.style.left = left + 'px';
    tip.style.top = (r.bottom + window.scrollY + 8) + 'px';
    openTip = tip;
  }

  function decorate(root) {
    (root.querySelectorAll ? root : document).querySelectorAll('label').forEach(function (label) {
      if (label.dataset.helpDone) return;
      var control = label.querySelector('input:not([type=checkbox]):not([type=radio]):not([type=hidden]), select, textarea');
      if (!control && label.htmlFor) control = document.getElementById(label.htmlFor);
      if (!control) return;
      var text = helpFor(label, control);
      label.dataset.helpDone = '1';
      if (!text) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'help-q';
      btn.textContent = '?';
      btn.setAttribute('aria-label', 'Aiuto: ' + text);
      btn.title = text;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (openTip && openTip.dataset.for === text) { closeTip(); return; }
        showTip(btn, text);
        openTip.dataset.for = text;
      });
      // in alto a destra dell'etichetta, sulla stessa riga del testo
      if (getComputedStyle(label).position === 'static') label.style.position = 'relative';
      label.classList.add('has-help');
      label.insertBefore(btn, label.firstChild);
    });
  }

  var style = document.createElement('style');
  style.textContent =
    'label.has-help{min-height:20px}' +
    '.help-q{position:absolute;top:0;right:0;display:grid;place-items:center;width:20px;height:20px;min-height:0!important;margin:0!important;padding:0!important;' +
    'border:1px solid #b9c1ba;border-radius:50%;background:#fff;color:#4a5a4f;font:700 11px/1 -apple-system,Segoe UI,Arial,sans-serif;' +
    'cursor:help;vertical-align:1px;box-shadow:none!important;flex:none}' +
    '.help-q:hover,.help-q:focus-visible{background:#222624;border-color:#222624;color:#fff;outline:none}' +
    '.help-tip{position:absolute;z-index:99999;padding:10px 12px;border-radius:12px;background:#222624;color:#fff;' +
    'font:400 13.5px/1.45 -apple-system,Segoe UI,Arial,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.22)}';

  function start() {
    document.head.appendChild(style);
    decorate(document);
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; decorate(document); });
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.help-q')) closeTip(); });
    window.addEventListener('scroll', closeTip, { passive: true });
  }

  window.ArcheaHelp = { byId: HELP_BY_ID, byLabel: HELP_BY_LABEL, refresh: function () { decorate(document); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
