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
  var appLink = 'livebook://login-callback' + query + hash;
  // via i dati dell'accesso dalla barra degli indirizzi e dalla cronologia
  if (hash || query) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  function show(id) {
    var all = ['c-attesa', 'c-telefono', 'c-computer', 'c-password', 'c-errore'];
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
  show('c-computer');
})();
