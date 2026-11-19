(function () {
  var m = location.pathname.match(/^\/u\/([0-9a-fA-F-]{36})\/?(index\.html)?$/);
  if (!m) return;
  var id = m[1].toLowerCase();
  var nonTrovata = document.getElementById('non-trovata');
  if (nonTrovata) nonTrovata.hidden = true;
  document.getElementById('profilo').hidden = false;
  document.title = 'Profilo su LiveBook';
  var ua = navigator.userAgent;
  var android = /Android/i.test(ua);
  // l'iPad si presenta come Mac con lo schermo touch; Android ha sempre la precedenza
  var ios = !android && (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  var apri = document.getElementById('profilo-apri');
  apri.href = android
    ? 'intent://u/' + id + '#Intent;scheme=livebook;package=com.livebook.livebook;S.browser_fallback_url=' +
      encodeURIComponent('https://livebookapp.it/android.html') + ';end'
    : 'livebook://u/' + id;
  // (E221) Se questa pagina si apre sul telefono, l'app non c'è (o è vecchia): con l'app
  // il link si apre direttamente in LiveBook. Si va subito allo store; i pulsanti restano
  // come riserva. Dal computer la pagina resta com'è. ?resta=1 la mostra senza passaggio.
  if (/[?&]resta=1/.test(location.search)) return;
  var store = ios ? 'https://apps.apple.com/it/app/id6827290935' : android ? 'https://livebookapp.it/android.html#scarica' : null;
  if (!store) return;
  var avviso = document.getElementById('profilo-store');
  avviso.textContent = ios ? 'Ti porto all’App Store per scaricare LiveBook…' : 'Ti porto al download di LiveBook per Android…';
  avviso.hidden = false;
  location.replace(store);
})();
