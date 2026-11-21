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

// ED page: the sticky tab bar marks the section currently in view.
(function () {
  var bar = document.querySelector('[data-hm-tabs]');
  if (!bar || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(bar.querySelectorAll('a[href^="#"]')).filter(function (a) { return !a.classList.contains('hm-tabs__cta'); });
  var map = {};
  links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map[s.id] = a; });
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    var current = null;
    links.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (visible[id] && !current) current = a; });
    if (!current) return;
    links.forEach(function (a) { a.classList.toggle('is-active', a === current); a.toggleAttribute('aria-current', a === current); });
    if (current.scrollIntoView && bar.scrollWidth > bar.clientWidth) {
      var inner = current.parentNode; inner.scrollTo({ left: current.offsetLeft - 16, behavior: 'smooth' });
    }
  }, { rootMargin: '-80px 0px -55% 0px' });
  Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
})();

// ED page: WhatsApp enquiry form. Builds a message from the visitor's input and opens WhatsApp.
// Nothing is sent to or stored on this website. Without JavaScript the form still opens WhatsApp
// (the message box is named "text", which WhatsApp uses as the prefilled message).
(function () {
  var form = document.querySelector('[data-hm-enquiry]');
  if (!form) return;
  var number = form.getAttribute('data-wa');
  var error = form.querySelector('[data-hm-form-error]');
  var date = form.querySelector('input[name="hm_tarikh"]');
  if (date) { var d = new Date(); date.min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // "Buat Temu Janji" links under a treatment preselect that service.
  document.querySelectorAll('[data-hm-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = form.querySelector('select[name="hm_perkhidmatan"]'); var want = a.getAttribute('data-hm-service');
      if (sel) Array.prototype.forEach.call(sel.options, function (o) { if (o.text === want) sel.value = o.value; });
    });
  });

  function val(name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
  function fmtDate(iso) { var p = iso.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = form.elements.hm_nama, consent = form.elements.hm_consent;
    var ok = nama.value.trim() !== '' && consent.checked;
    nama.setAttribute('aria-invalid', String(nama.value.trim() === ''));
    if (!ok) { error.hidden = false; (nama.value.trim() === '' ? nama : consent).focus(); return; }
    error.hidden = true;
    var masa = form.querySelector('input[name="hm_masa"]:checked');
    var lines = ['Salam Him & Me, saya ingin membuat pertanyaan temu janji.', '', 'Nama: ' + val('hm_nama')];
    if (val('hm_telefon')) lines.push('No. telefon: ' + val('hm_telefon'));
    lines.push('Perkhidmatan: ' + val('hm_perkhidmatan'));
    if (val('hm_tarikh')) lines.push('Tarikh pilihan: ' + fmtDate(val('hm_tarikh')));
    if (masa) lines.push('Masa pilihan: ' + masa.value);
    if (val('text')) lines.push('', 'Mesej: ' + val('text'));
    var url = 'https://wa.me/' + encodeURIComponent(number) + '?text=' + encodeURIComponent(lines.join('\n'));
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
  });
})();

// First Trial section on the ED page: add a "Lihat butiran →" link under each included service,
// pointing at that service's section (order: consultation, Shockwave, Kegel EMS).
(function () {
  document.querySelectorAll('[data-hm-offer-links]').forEach(function (list) {
    var ids = list.getAttribute('data-hm-offer-links').split(',');
    list.querySelectorAll('li').forEach(function (li, i) {
      if (!ids[i] || !document.getElementById(ids[i])) return;
      var a = document.createElement('a'); a.className = 'hm-offer__more'; a.href = '#' + ids[i]; a.textContent = 'Lihat butiran →';
      li.appendChild(a);
    });
  });
})();

// Plain pages: "Dalam halaman ini" contents, built from the H2 headings (Ghost gives each an id).
// Open as a sticky rail on wide screens, a collapsed box on smaller ones; marks the section in view.
(function () {
  const toc = document.querySelector('[data-hm-toc]');
  if (!toc) return;
  const heads = [...document.querySelectorAll('.hm-doc__body h2[id]')];
  if (heads.length < 3) return;
  const list = toc.querySelector('ol');
  const links = heads.map((h) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id; a.textContent = h.textContent.trim();
    li.appendChild(a); list.appendChild(li);
    return a;
  });
  const wide = window.matchMedia('(min-width: 1101px)');
  const sync = () => { toc.open = wide.matches; };
  sync(); wide.addEventListener('change', sync);
  toc.hidden = false;
  list.addEventListener('click', (e) => { if (e.target.closest('a') && !wide.matches) toc.open = false; });
  const mark = (i) => links.forEach((a, j) => a.setAttribute('aria-current', String(i === j)));
  mark(0);
  if ('IntersectionObserver' in window) {
    // A heading entering the top quarter of the screen becomes the current section.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) mark(heads.indexOf(en.target)); });
    }, { rootMargin: '0px 0px -75% 0px' });
    heads.forEach((h) => io.observe(h));
  }
})();
