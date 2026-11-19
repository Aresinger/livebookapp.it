(function () {
  var m = location.pathname.match(/^\/u\/([0-9a-fA-F-]{36})\/?$/);
  if (!m) return;
  var id = m[1].toLowerCase();
  document.getElementById('non-trovata').hidden = true;
  document.getElementById('profilo').hidden = false;
  document.title = 'Profilo su LiveBook';
  var apri = document.getElementById('profilo-apri');
  var android = /Android/i.test(navigator.userAgent);
  apri.href = android
    ? 'intent://u/' + id + '#Intent;scheme=livebook;package=com.livebook.livebook;S.browser_fallback_url=' +
      encodeURIComponent('https://livebookapp.it/android.html') + ';end'
    : 'livebook://u/' + id;
})();
