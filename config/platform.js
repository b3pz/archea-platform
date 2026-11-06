/*
 * ARCHEA Platform · configurazione e accesso condivisi
 * ----------------------------------------------------
 * Caricato sia dal Workspace (index.html) sia dal Service Desk (servicedesk/).
 * Qui c'è l'unico punto in cui si configura Supabase.
 *
 * La chiave è quella PUBBLICA (publishable/anon): è normale che stia nel browser.
 * La sicurezza dei dati dipende dalle policy RLS su Supabase, non da questo file.
 * Non inserire mai qui la service_role key o token di terze parti (es. Telegram).
 */
(function () {
  'use strict';

  var CONFIG = {
    supabaseUrl: 'https://igfpkpcksllmofqfoxkf.supabase.co',
    supabaseKey: 'sb_publishable_wuq5rwy4w6ca7nvJTbrXzA_izhCmrf9',
    version: '1.0.0'
  };

  var SESSION_KEY = 'archea_sd_session'; // sessione Supabase reale (stessa chiave del Service Desk storico)

  function read(key) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function write(key, value) {
    try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  async function call(path, opts) {
    opts = opts || {};
    var headers = { apikey: CONFIG.supabaseKey, 'Content-Type': 'application/json' };
    if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
    var r = await fetch(CONFIG.supabaseUrl + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : null
    });
    var text = await r.text();
    var data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!r.ok) {
      var msg = data && (data.msg || data.message || data.error_description || data.error);
      var err = new Error(msg || ('HTTP ' + r.status));
      err.status = r.status;
      throw err;
    }
    return data;
  }

  /** Ruolo del Service Desk (profiles.ruolo) → profilo applicativo del Workspace. */
  function appRoleFor(sdRole) {
    if (sdRole === 'IT' || sdRole === 'SUPER_IT') return 'it_manager';
    if (sdRole === 'HR') return 'hr_manager';
    return 'architect';
  }

  async function loadProfile(session) {
    var rows = await call('/rest/v1/profiles?select=*&id=eq.' + encodeURIComponent(session.user.id), { token: session.access_token });
    var p = rows && rows[0];
    if (!p) throw new Error('Account senza profilo nel Service Desk. Chiedi al reparto IT di abilitarlo.');
    return {
      id: p.id,
      email: p.email || session.user.email,
      nome: p.nome || session.user.email,
      sdRole: p.ruolo || 'USER',
      appRole: appRoleFor(p.ruolo)
    };
  }

  var ArcheaAuth = {
    config: CONFIG,
    SESSION_KEY: SESSION_KEY,
    appRoleFor: appRoleFor,

    /** Accesso reale con Supabase Auth. Restituisce il profilo unificato. */
    async signIn(email, password) {
      var session = await call('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email: String(email || '').trim(), password: password }
      });
      write(SESSION_KEY, session);
      try {
        return await loadProfile(session);
      } catch (e) {
        write(SESSION_KEY, null);
        throw e;
      }
    },

    /** Ripristina una sessione reale salvata (rinnovandola se scaduta). */
    async restore() {
      var session = read(SESSION_KEY);
      if (!session || !session.access_token) return null;
      try {
        return await loadProfile(session);
      } catch (e) {
        if (!session.refresh_token) { write(SESSION_KEY, null); return null; }
        var latest = read(SESSION_KEY);
        if (latest && latest.access_token && latest.access_token !== session.access_token) {
          try { return await loadProfile(latest); } catch (e3) { session = latest; }
        }
        try {
          var fresh = await call('/auth/v1/token?grant_type=refresh_token', {
            method: 'POST', body: { refresh_token: session.refresh_token }
          });
          write(SESSION_KEY, fresh);
          return await loadProfile(fresh);
        } catch (e2) {
          write(SESSION_KEY, null);
          return null;
        }
      }
    },

    hasSession: function () { return !!(read(SESSION_KEY) || {}).access_token; },

    signOut: function () {
      var s = read(SESSION_KEY);
      if (s && s.access_token) {
        // Best effort: invalida il refresh token lato server.
        call('/auth/v1/logout', { method: 'POST', token: s.access_token }).catch(function () {});
      }
      write(SESSION_KEY, null);
    }
  };

  // Solo account registrati: si cancellano i resti delle vecchie sessioni di prova
  try {
    ['archea_sd_demo', 'archea_sd_demo_db_v1'].forEach(function (k) { localStorage.removeItem(k); });
    if (window.indexedDB && indexedDB.deleteDatabase) indexedDB.deleteDatabase('archea-demo-foto');
  } catch (e) {}

  window.ARCHEA_CONFIG = CONFIG;
  window.ArcheaAuth = ArcheaAuth;
})();

// ---------------------------------------------------------------------------
// Tema chiaro / scuro, unico per Workspace e Service Desk
// archea-theme = 'auto' (come il telefono/computer) | 'light' | 'dark'
// ---------------------------------------------------------------------------
(function () {
  var KEY = 'archea-theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function mode() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark' || v === 'auto') return v;
      var old = localStorage.getItem('archea_sd_theme'); // vecchia scelta del Service Desk
      if (old === 'light' || old === 'dark') return old;
    } catch (e) {}
    return 'auto';
  }
  function resolved(m) { m = m || mode(); return m === 'auto' ? (mq && mq.matches ? 'dark' : 'light') : m; }
  function apply() {
    var t = resolved();
    var el = document.documentElement;
    el.dataset.theme = t;
    el.style.colorScheme = t;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#1b1d1b' : '#222624');
    try { window.dispatchEvent(new CustomEvent('archea-theme', { detail: t })); } catch (e) {}
    return t;
  }
  function set(m) {
    try { localStorage.setItem(KEY, m); localStorage.setItem('archea_sd_theme', resolved(m)); } catch (e) {}
    return apply();
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (mode() === 'auto') apply(); });
  // un cambio fatto in un'altra scheda o nel riquadro del Service Desk vale anche qui
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(); });
  window.ArcheaTheme = { mode: mode, resolved: resolved, apply: apply, set: set,
    toggle: function () { return set(resolved() === 'dark' ? 'light' : 'dark'); } };
  apply();
})();
