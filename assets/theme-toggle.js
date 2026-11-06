// ARCHEA Platform · pulsante tema chiaro/scuro nell'intestazione del Workspace (e nel login)
(function () {
  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function label() { return document.documentElement.dataset.theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'; }
  function paint(b) { var dark = document.documentElement.dataset.theme === 'dark'; b.innerHTML = dark ? SUN : MOON; b.title = label(); b.setAttribute('aria-label', label()); }
  function make(cls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'archea-theme-btn ' + cls;
    b.addEventListener('click', function (e) { e.stopPropagation(); if (window.ArcheaTheme) window.ArcheaTheme.toggle(); });
    paint(b); return b;
  }
  function place() {
    [['.desk-top-actions', 'desk'], ['.top-actions', 'mobile'], ['.login-screen, .login-shell, .login-page', 'login']].forEach(function (t) {
      document.querySelectorAll(t[0]).forEach(function (host) {
        if (host.querySelector(':scope > .archea-theme-btn')) return;
        var b = make(t[1]);
        host.appendChild(b); // in coda: React non tocca i nodi aggiunti dopo i suoi
      });
    });
  }
  window.addEventListener('archea-theme', function () { document.querySelectorAll('.archea-theme-btn').forEach(paint); });
  new MutationObserver(place).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', place);
})();
