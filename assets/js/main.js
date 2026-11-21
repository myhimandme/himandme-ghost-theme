// Him & Me — site script (vanilla, deferred). Stage 2: mobile menu, current-page marker, share.
// Later stages add: ED tabs + FAQ (4), load-more + search (5), contents list + progress (6), enquiry form (4).
(function () {
  document.documentElement.classList.add('js');

  // Mark the current navigation item for assistive technology (Ghost adds .nav-current).
  document.querySelectorAll('.nav-current').forEach(function (a) { a.setAttribute('aria-current', 'page'); });

  // Mobile menu
  var menu = document.querySelector('[data-hm-menu]');
  var openers = document.querySelectorAll('[data-hm-menu-open]');
  var lastFocus = null;
  function setOpen(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.documentElement.classList.toggle('hm-menu-open', open);
    openers.forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    if (open) {
      lastFocus = document.activeElement;
      var first = menu.querySelector('a, button'); if (first) first.focus();
    } else if (lastFocus) { lastFocus.focus(); }
  }
  openers.forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
  if (menu) {
    menu.querySelectorAll('[data-hm-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setOpen(false); }); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      var items = menu.querySelectorAll('a[href], button:not([disabled])');
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }

  // Article share button: native share sheet where available, otherwise copy the link.
  document.querySelectorAll('[data-hm-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href);
    });
  });
})();

// FAQ accordions (Ghost toggle cards inside [data-hm-faq]): first question open, as in the prototype;
// Malay labels and aria-expanded kept in sync with Ghost's own toggle script.
(function () {
  document.querySelectorAll('[data-hm-faq]').forEach(function (list) {
    var cards = list.querySelectorAll('.kg-toggle-card');
    cards.forEach(function (card, i) {
      var btn = card.querySelector('.kg-toggle-card-icon');
      var q = card.querySelector('.kg-toggle-heading-text');
      if (i === 0) card.setAttribute('data-kg-toggle-state', 'open');
      function sync() {
        if (!btn) return;
        var open = card.getAttribute('data-kg-toggle-state') === 'open';
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', (open ? 'Tutup jawapan: ' : 'Buka jawapan: ') + (q ? q.textContent.trim() : ''));
      }
      sync();
      new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['data-kg-toggle-state'] });
    });
  });
})();
