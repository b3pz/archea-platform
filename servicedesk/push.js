// ARCHEA Platform · Notifiche vere del browser (Web Push)
// Iscrive questo computer/telefono: le notifiche arrivano dal server anche con il sito chiuso.
// Serve: SETUP_COMPLETO.sql eseguito + Edge Function "push" pubblicata (vedi supabase/push.html).
(function () {
  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true ||
    (window.top !== window && (() => { try { return window.top.matchMedia('(display-mode: standalone)').matches || window.top.navigator.standalone === true; } catch (e) { return false; } })());
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromB64u = s => { const p = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4); return Uint8Array.from(atob(p), c => c.charCodeAt(0)); };
  const rootUrl = () => new URL('../', location.href).href;

  async function registration() {
    let reg = await navigator.serviceWorker.getRegistration(rootUrl());
    if (!reg) reg = await navigator.serviceWorker.register(rootUrl() + 'sw.js', { scope: rootUrl(), updateViaCache: 'none' });
    if (!reg.active) await navigator.serviceWorker.ready;
    return reg;
  }

  // Prima volta in assoluto: il Super admin crea le chiavi (restano nel database, mai nel codice)
  async function setupKeys() {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey);
    await rpc('push_setup', { p_public: b64u(pub), p_private: jwk.d, p_url: BASE + '/functions/v1/push', p_force: false });
  }

  async function publicKey() {
    let k = null;
    try { k = await rpc('push_public_key', {}); } catch (e) { return { error: /push_public_key|PGRST|schema cache/i.test(e.message) ? 'setup' : e.message }; }
    if (!k && profile?.ruolo === 'SUPER_IT') { await setupKeys(); k = await rpc('push_public_key', {}); }
    return k ? { key: k } : { error: 'nokey' };
  }

  async function subscribe() {
    const pk = await publicKey();
    if (pk.error) return pk.error;
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (sub) { // iscrizione fatta con una chiave vecchia: si rifà
      const cur = sub.options && sub.options.applicationServerKey ? b64u(sub.options.applicationServerKey) : pk.key;
      if (cur !== pk.key) { await sub.unsubscribe().catch(() => {}); sub = null; }
    }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64u(pk.key) });
    const j = sub.toJSON();
    const device = (isIOS() ? 'iPhone/iPad' : /Android/i.test(navigator.userAgent) ? 'Android' : /Mac/i.test(navigator.platform) ? 'Mac' : /Win/i.test(navigator.platform) ? 'Windows' : 'Computer') +
      ' · ' + (/Edg\//.test(navigator.userAgent) ? 'Edge' : /Chrome\//.test(navigator.userAgent) ? 'Chrome' : /Firefox\//.test(navigator.userAgent) ? 'Firefox' : 'Safari');
    // un dispositivo appartiene a chi è entrato per ultimo
    await rpc('push_claim', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_device: device });
    return 'ok';
  }

  const messages = {
    setup: 'Le notifiche vere sono quasi pronte: l\'IT deve eseguire SETUP_COMPLETO.sql e pubblicare la funzione "push".',
    nokey: 'Le notifiche vere non sono ancora attive: deve entrare una volta il Super admin.',
  };

  // dal pulsante (serve un tocco dell'utente per chiedere il permesso)
  window.archeaEnablePush = async function () {
    if (!supported()) {
      toast(isIOS() && !standalone()
        ? 'Su iPhone: tocca Condividi → «Aggiungi alla schermata Home», apri ARCHEA da lì e attiva le notifiche.'
        : 'Questo browser non supporta le notifiche.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Notifiche bloccate: si riattivano dalle impostazioni del browser (lucchetto accanto all\'indirizzo).'); window.archeaPushBanner(); return; }
    try {
      const r = await subscribe();
      toast(r === 'ok' ? 'Notifiche attivate su questo dispositivo ✓' : (messages[r] || r));
    } catch (e) { toast('Notifiche: ' + e.message); }
    window.archeaPushBanner();
    if (typeof syncNotifButton === 'function') syncNotifButton();
  };

  // a ogni avvio: se il permesso c'è già, rinnova l'iscrizione in silenzio
  window.archeaPushSync = async function () {
    if (!supported() || Notification.permission !== 'granted') return;
    try { await subscribe(); } catch (e) { console.warn('Push:', e.message); }
  };

  // riquadro in Inizio finché le notifiche non sono attive
  window.archeaPushBanner = function () {
    const host = document.getElementById('content');
    document.getElementById('pushBanner')?.remove();
    if (!host || !['start', 'home', 'hr-stats'].includes(typeof currentView === 'string' ? currentView : '')) return;
    let html = '';
    if (!supported() && isIOS() && !standalone()) {
      html = '<b>🔔 Notifiche sul telefono</b><span>Tocca Condividi → «Aggiungi alla schermata Home», poi apri ARCHEA dall\'icona: lì si attivano.</span>';
    } else if (supported() && Notification.permission === 'default') {
      html = '<b>🔔 Ricevi le notifiche anche a sito chiuso</b><span>Task assegnate o da verificare, ticket, messaggi in chat e inviti in calendario.</span><button class="primary" type="button" id="pushOn">Attiva le notifiche</button>';
    } else if (supported() && Notification.permission === 'denied') {
      html = '<b>🔕 Notifiche bloccate</b><span>Riattivale dalle impostazioni del browser (lucchetto accanto all\'indirizzo), poi ricarica.</span>';
    }
    if (!html) return;
    const el = document.createElement('div');
    el.id = 'pushBanner'; el.className = 'push-banner'; el.innerHTML = html;
    host.prepend(el);
    const b = document.getElementById('pushOn'); if (b) b.onclick = window.archeaEnablePush;
  };
})();
