// Share bar on /resources articles. The network buttons are plain links and work without this
// file. This adds two things: "Copy link" puts the article's link on the clipboard, and on a
// phone that can share, a "Share" button opens the phone's own share sheet. Nothing is sent
// anywhere by this page; no tracking, no cookies.
(function () {
  document.querySelectorAll('button[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var link = btn.getAttribute('data-copy');
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, function () { window.prompt('Copy this link', link); });
      else window.prompt('Copy this link', link);
    });
    if (navigator.share) {
      var native = document.createElement('button');
      native.type = 'button';
      native.className = 'share-btn share-native';
      native.textContent = 'Share';
      native.addEventListener('click', function () {
        navigator.share({ title: document.title, url: btn.getAttribute('data-copy').replace('utm_source=link', 'utm_source=phone') }).catch(function () {});
      });
      btn.parentNode.insertBefore(native, btn.parentNode.querySelector('.share-btn'));
    }
  });
})();
