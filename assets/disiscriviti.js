(function () {
  var RPC = 'https://wlyyizoqztgmxriamkws.supabase.co/rest/v1/rpc/email_unsubscribe';
  var KEY = 'sb_publishable_e3DkfYjiO_TJEsCEp-TBqg_nH-kttmn';
  var m = /(?:^|[#&])t=([0-9a-fA-F-]{36})(?:&|$)/.exec(location.hash || '');
  var token = m ? m[1] : '';
  // il codice esce dall'indirizzo: non resta nella cronologia né in un eventuale inoltro
  if (history.replaceState) history.replaceState(null, '', location.pathname);
  function mostra(id) {
    ['d-chiedi', 'd-fatto', 'd-errore'].forEach(function (x) {
      document.getElementById(x).hidden = x !== id;
    });
  }
  if (!token) { mostra('d-errore'); return; }
  var ok = document.getElementById('d-ok');
  var msg = document.getElementById('d-msg');
  ok.disabled = false;
  ok.addEventListener('click', function () {
    ok.disabled = true;
    msg.textContent = 'Un attimo…';
    fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY },
      body: JSON.stringify({ p_token: token }),
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (data) {
        msg.textContent = '';
        if (r.ok && data === true) { mostra('d-fatto'); }
        else if (r.ok) { mostra('d-errore'); }
        else { ok.disabled = false; msg.textContent = 'Non è stato possibile completare: riprova tra poco.'; }
      });
    }).catch(function () {
      ok.disabled = false;
      msg.textContent = 'Connessione assente: riprova tra poco.';
    });
  });
})();
