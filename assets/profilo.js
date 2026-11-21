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
  // (E235) codice presenza dal pulsante «Registra su LB - LiveBook» di StoNait
  var codice = leggiCodice(location.search);
  var query = codice ? '?codice=' + codice : '';
  var apri = document.getElementById('profilo-apri');
  apri.href = android
    ? 'intent://u/' + id + query + '#Intent;scheme=livebook;package=com.livebook.livebook;S.browser_fallback_url=' +
      encodeURIComponent('https://livebookapp.it/android.html') + ';end'
    : 'livebook://u/' + id + query;
  if (codice) {
    // niente passaggio allo store: chi arriva deve vedere e poter copiare il codice
    mostraCodice(codice, apri.href);
    return;
  }
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

  // Il codice in ?codice=: 8 caratteri di 23456789ABCDEFGHJKMNPQRSTUVWXYZ, anche con
  // trattini, spazi e minuscole (stesse regole dell'app). Null se non è valido.
  function leggiCodice(search) {
    var m = /[?&]codice=([^&#]*)/.exec(search);
    if (!m) return null;
    var raw;
    try { raw = decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { return null; }
    var code = raw.toUpperCase().replace(/[\s\-‐-―−]/g, '');
    return /^[2-9A-HJKMNP-Z]{8}$/.test(code) ? code : null;
  }

  function mostraCodice(code, apriHref) {
    var nonTrovata = document.getElementById('non-trovata');
    if (nonTrovata) nonTrovata.hidden = true;
    document.getElementById('profilo').hidden = true;
    document.getElementById('presenza').hidden = false;
    document.title = 'Codice presenza StoNait · LiveBook';
    var testo = code.slice(0, 4) + '-' + code.slice(4);
    document.getElementById('presenza-codice').textContent = testo;
    document.getElementById('presenza-apri').href = apriHref;
    var stato = document.getElementById('presenza-copiato');
    function fatto(ok) {
      stato.textContent = ok ? 'Codice copiato: in LB - LiveBook tocca «Incolla».' : 'Copia non riuscita: tieni premuto il codice per copiarlo.';
      stato.hidden = false;
    }
    document.getElementById('presenza-copia').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(testo).then(function () { fatto(true); }, function () { fatto(copiaVecchia(testo)); });
      } else {
        fatto(copiaVecchia(testo));
      }
    });
  }

  // Browser senza navigator.clipboard (o dentro altre app): copia da un campo nascosto.
  function copiaVecchia(testo) {
    var campo = document.createElement('textarea');
    campo.value = testo;
    campo.setAttribute('readonly', '');
    campo.className = 'fuori-schermo';
    document.body.appendChild(campo);
    campo.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(campo);
    return ok;
  }
})();
