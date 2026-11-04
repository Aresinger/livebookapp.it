(function () {
  var AUTH = 'https://wlyyizoqztgmxriamkws.supabase.co/auth/v1';
  var KEY = 'sb_publishable_e3DkfYjiO_TJEsCEp-TBqg_nH-kttmn';
  // (E130) I parametri arrivano da Supabase dopo la conferma: nell'ancora (#…)
  // o nell'indirizzo (?…). Non vengono inviati a nessun server, salvo il codice
  // della nuova password al momento del salvataggio (E170).
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
  function chiama(path, method, body, token) {
    var headers = { 'Content-Type': 'application/json', 'apikey': KEY };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(AUTH + path, {
      method: method, headers: headers, body: body ? JSON.stringify(body) : undefined,
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        return { ok: r.ok, status: r.status, data: data };
      });
    });
  }
  function nuovaPassword(hash) {
    var form = document.getElementById('c-form');
    var p1 = document.getElementById('c-p1');
    var p2 = document.getElementById('c-p2');
    var msg = document.getElementById('c-msg');
    var salva = document.getElementById('c-salva');
    var accesso = '';
    var email = '';
    function avviso(testo, campo) {
      msg.textContent = testo;
      msg.hidden = !testo;
      if (campo) campo.focus();
    }
    function sblocca() { salva.disabled = false; }
    function fine() {
      // la sessione serviva solo per questo: si chiude e non resta nulla nel browser
      chiama('/logout?scope=local', 'POST', null, accesso).catch(function () {});
      accesso = '';
      p1.value = '';
      p2.value = '';
      var account = document.getElementById('c-account');
      if (email) {
        account.textContent = 'Account: ' + email;
        account.hidden = false;
      }
      show('c-fatto');
      window.scrollTo(0, 0);
      document.querySelector('#c-fatto h1').focus({ preventScroll: true });
    }
    document.getElementById('c-mostra').addEventListener('change', function (e) {
      p1.type = p2.type = e.target.checked ? 'text' : 'password';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (salva.disabled) return;
      if (p1.value.length < 8) { avviso('La password deve avere almeno 8 caratteri.', p1); return; }
      if (p1.value !== p2.value) { avviso('Le due password non coincidono.', p2); return; }
      avviso('');
      salva.disabled = true;
      var pronto = accesso ? Promise.resolve(true) : chiama('/verify', 'POST', { type: 'recovery', token_hash: hash }).then(function (r) {
        if (r.ok && r.data.access_token) {
          accesso = r.data.access_token;
          email = (r.data.user && r.data.user.email) || '';
          return true;
        }
        if (r.status === 429 || r.status >= 500) {
          avviso('Il servizio non risponde: riprova tra qualche minuto.');
          sblocca();
          return false;
        }
        show('c-errore');
        return false;
      });
      pronto.then(function (ok) {
        if (!ok) return null;
        return chiama('/user', 'PUT', { password: p1.value }, accesso).then(function (r) {
          if (r.ok) { fine(); return; }
          var codice = r.data.error_code || '';
          if (codice === 'same_password') {
            avviso('La nuova password deve essere diversa da quella di prima.', p1);
          } else if (codice === 'weak_password') {
            avviso('Questa password è troppo debole: scegline una più difficile da indovinare.', p1);
          } else if (r.status === 401 || r.status === 403) {
            show('c-errore');
            return;
          } else {
            avviso('Il servizio non risponde: riprova tra qualche minuto.');
          }
          sblocca();
        });
      }).catch(function () {
        avviso('Connessione non riuscita: controlla la rete e riprova.');
        sblocca();
      });
    });
    show('c-nuova');
    p1.focus({ preventScroll: true });
  }
  function show(id) {
    var all = ['c-attesa', 'c-telefono', 'c-neutro', 'c-computer', 'c-password', 'c-nuova', 'c-fatto', 'c-errore'];
    for (var i = 0; i < all.length; i++) {
      var el = document.getElementById(all[i]);
      if (el) el.hidden = all[i] !== id;
    }
  }
  if (error) { show('c-errore'); return; }
  // (E170) Link della nuova password: il codice si usa solo al salvataggio, così un antivirus
  // che apre il link in anticipo non lo consuma.
  var tokenHash = params.get('token_hash') || '';
  if (type === 'recovery' && /^[A-Za-z0-9_-]{16,}$/.test(tokenHash)) {
    if (mobile) {
      // dal telefono si rientra nel percorso di sempre: Supabase rimanda qui con il codice per l'app
      var verify = AUTH + '/verify?token=' + encodeURIComponent(tokenHash) + '&type=recovery&redirect_to=' +
        encodeURIComponent(location.origin + location.pathname);
      var apri = document.getElementById('c-apri');
      if (apri) apri.setAttribute('href', verify);
      show('c-telefono');
      location.href = verify;
      return;
    }
    nuovaPassword(tokenHash);
    return;
  }
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
