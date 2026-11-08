(function () {
  var ua = navigator.userAgent || '';
  // Browser interni delle app: WebView di Android («; wv)») e le app più diffuse.
  var inApp = /; wv\)|FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|WhatsApp|TikTok|musical_ly|Bytedance|Telegram|Snapchat|Line\/|LinkedInApp|Pinterest|GSA\//i.test(ua);
  var android = /Android/i.test(ua);
  var box = document.getElementById('apk-inapp');
  if (inApp && box) {
    box.hidden = false;
    var apri = document.getElementById('apk-apri');
    // Fuori da Android il link intent:// non serve: resta solo «Copia l'indirizzo».
    if (apri && !android) apri.parentNode.removeChild(apri);
  }
  var url = 'https://livebookapp.it/android.html';
  var copia = document.getElementById('apk-copia');
  var esito = document.getElementById('apk-copiato');
  function mostra(testo) { if (esito) esito.textContent = testo; }
  function copiaVecchio() {
    var t = document.createElement('textarea');
    t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(t);
    mostra(ok ? 'Indirizzo copiato: incollalo nel browser del telefono.'
              : 'Scrivi nel browser del telefono: livebookapp.it/android.html');
  }
  if (copia) {
    copia.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          mostra('Indirizzo copiato: incollalo nel browser del telefono.');
        }, copiaVecchio);
      } else {
        copiaVecchio();
      }
    });
  }
  var avviato = document.getElementById('apk-avviato');
  var links = document.querySelectorAll('.apk-link');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function () {
      // Il download parte comunque: qui si conferma soltanto, perché la pagina non cambia.
      if (avviato) avviato.hidden = false;
      if (inApp && box) box.scrollIntoView && box.scrollIntoView();
    });
  }
})();
