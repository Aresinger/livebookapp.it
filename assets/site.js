(function () {
  var v = document.getElementById('video-logo');
  if (!v) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function update() {
    if (reduce && reduce.matches) { v.pause(); v.removeAttribute('autoplay'); }
    else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  }
  update();
  if (reduce && reduce.addEventListener) reduce.addEventListener('change', update);
})();
