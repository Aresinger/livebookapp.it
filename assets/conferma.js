(function () {
  // (E130) I parametri arrivano da Supabase dopo la conferma: nell'ancora (#…)
  // o nell'indirizzo (?…). Non vengono inviati a nessun server.
  var hash = location.hash || '';
  var query = location.search || '';
  var params = new URLSearchParams((hash || query).replace(/^[#?]/, ''));
  var type = params.get('type') || '';
  var error = params.get('error_code') || params.get('error') || '';
  var hasAccess = !!(params.get('access_token') || params.get('code') || params.get('token_hash'));
  var mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // (E162) All'app passano solo codice, tipo ed errori: mai token o altro scelto da chi ha
  // creato il link, altrimenti un link potrebbe sostituire l'account collegato.
  var forwarded = new URLSearchParams();
  ['code', 'type', 'error', 'error_code', 'error_description'].forEach(function (key) {
    if (params.get(key)) forwarded.set(key, params.get(key));
  });
  var appLink = 'livebook://login-callback' + (forwarded.toString() ? '?' + forwarded.toString() : '');
  // via i dati dell'accesso dalla barra degli indirizzi e dalla cronologia
  if (hash || query) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  function show(id) {
    var all = ['c-attesa', 'c-telefono', 'c-neutro', 'c-computer', 'c-password', 'c-errore'];
    for (var i = 0; i < all.length; i++) {
      var el = document.getElementById(all[i]);
      if (el) el.hidden = all[i] !== id;
    }
  }
  if (error) { show('c-errore'); return; }
  if (mobile && (hasAccess || type)) {
    var a = document.getElementById('c-apri');
    if (a) a.setAttribute('href', appLink);
    show('c-telefono');
    location.href = appLink;
    return;
  }
  if (type === 'recovery') { show('c-password'); return; }
  // (E167) «Account confermato» solo se il link lo dice, non ricaricando una pagina vuota
  show(type || params.get('access_token') ? 'c-computer' : 'c-neutro');
})();
