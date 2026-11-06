// ARCHEA Platform · aggiornamento automatico (anche per l'icona sulla schermata Home)
// Quando torni sull'app, controlla se è uscita una versione nuova e ricarica la pagina da sola.
(function () {
  function current() {
    var s = document.querySelector('script[src*="workspace.js"]');
    return s ? (s.getAttribute('src').split('?v=')[1] || '') : '';
  }
  var mine = current(), last = 0;
  async function check() {
    if (Date.now() - last < 60000) return; // al massimo una volta al minuto
    last = Date.now();
    try {
      var html = await (await fetch('./index.html?check=' + Date.now(), { cache: 'no-store' })).text();
      var m = html.match(/workspace\.js\?v=([^"']+)/);
      if (!m || !mine || m[1] === mine) return;
      // non interrompere chi sta scrivendo
      var a = document.activeElement;
      if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) { banner(); return; }
      location.reload();
    } catch (e) {}
  }
  function banner() {
    if (document.getElementById('archeaUpdate')) return;
    var b = document.createElement('button');
    b.id = 'archeaUpdate'; b.type = 'button'; b.className = 'archea-ws-toast';
    b.textContent = 'È disponibile una versione nuova · tocca per aggiornare';
    b.style.cursor = 'pointer'; b.onclick = function () { location.reload(); };
    document.body.appendChild(b);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); });
  window.addEventListener('focus', check);
  setInterval(function () { if (document.visibilityState === 'visible') check(); }, 30 * 60 * 1000);
})();
