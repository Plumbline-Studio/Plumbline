// Plain-language / Technical switch on a case-study page (PLU-720).
// Without JavaScript the plain version shows and the switch does nothing, which is fine.
// The choice is remembered for the next case study, and #technical opens that version.
(function () {
  var body = document.querySelector('.body');
  var buttons = document.querySelectorAll('.switch button');
  if (!body || !buttons.length) return;
  function show(v) {
    body.setAttribute('data-current', v);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-show') === v)); });
  }
  var saved = null;
  try { saved = localStorage.getItem('cs-version'); } catch (e) {}
  show(location.hash === '#technical' ? 'technical' : location.hash === '#plain' ? 'plain' : (saved === 'technical' ? 'technical' : 'plain'));
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-show');
      show(v);
      try { localStorage.setItem('cs-version', v); } catch (e) {}
      history.replaceState(null, '', '#' + v);
    });
  });
})();
