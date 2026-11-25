/* Replicam — site interactions: nav, reveals, page switcher, team bios */
if (/[?&]pt-preview\b/.test(location.search)) document.documentElement.classList.add('pt-preview');
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: compact capsule after the hero, mobile toggle */
  var nav = document.querySelector('.nav');
  if (nav) {
    // Compact capsule, animated with transforms only (no layout work per frame):
    //  · the dark background is its own layer that glides/resizes from the old box to the new one
    //  · the logo travels between the page corner and the capsule as one object
    //  · buttons that stay slide to their new place; links that leave fade out where they were
    var inner = nav.querySelector('.nav-inner'), bar = nav.querySelector('.nav-bar'), logo = nav.querySelector('.nav-logo');
    var bg = document.createElement('span'); bg.className = 'nav-bg'; bg.setAttribute('aria-hidden', 'true');
    inner.insertBefore(bg, inner.firstChild);
    var compact = null, D = 650, EASE = 'cubic-bezier(.6,.05,.2,1)';
    // the capsule's logo is display:none until the first scroll; decode it now so its first frame is never blank
    var symImg = bar.querySelector('.nav-symbol img');
    if (symImg) { symImg.decoding = 'sync'; if (symImg.decode) symImg.decode().catch(function () {}); }
    function placeBg() {
      var ir = inner.getBoundingClientRect(), r = bar.getBoundingClientRect();
      bg.style.left = (r.left - ir.left) + 'px'; bg.style.top = (r.top - ir.top) + 'px';
      bg.style.width = r.width + 'px'; bg.style.height = r.height + 'px';
    }
    function units() { return [bar.querySelector('.nav-symbol')].concat(Array.prototype.slice.call(bar.querySelectorAll('.nav-links > li')), [bar.querySelector('.nav-cta'), bar.querySelector('.nav-toggle')]).filter(Boolean); }
    function box(el) { if (!el || el.offsetParent === null) return null; var r = el.getBoundingClientRect(); return r.width > 0 ? r : null; }
    // play(): pin the element at its first keyframe with an inline style BEFORE animating, so even if the
    // browser starts the animation a frame late (Safari), the first painted frame is the start, never the end
    var PINNED = ['transform', 'opacity'];
    function unpin(el) { PINNED.forEach(function (k) { el.style[k] = ''; }); }
    function play(el, frames, timing) {
      PINNED.forEach(function (k) { if (frames[0][k] !== undefined) el.style[k] = frames[0][k]; });
      var a = el.animate(frames, Object.assign({}, timing, { fill: 'both' }));
      a.onfinish = function () { unpin(el); a.cancel(); };
      return a;
    }
    function cleanup() {
      [bg, logo].concat(units()).forEach(function (el) { if (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); unpin(el); } });
      inner.querySelectorAll('.nav-ghost').forEach(function (g) { g.remove(); });
      logo.style.visibility = '';
    }
    // a copy of a nav item that leaves: either fades out in place, or (the capsule logo) travels to the corner logo
    function ghost(el, r, home) {
      var ir = inner.getBoundingClientRect(), g = el.cloneNode(true);
      g.classList.add('nav-ghost'); g.setAttribute('aria-hidden', 'true');
      Object.assign(g.style, { display: 'flex', alignItems: 'center', position: 'absolute', margin: '0', listStyle: 'none',
        padding: getComputedStyle(el).padding, pointerEvents: 'none', visibility: 'visible', transform: 'none',
        left: (r.left - ir.left) + 'px', top: (r.top - ir.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
      inner.appendChild(g);
      if (home) {   // fully opaque all the way; on landing the corner logo (same pixels) takes over: no cross-fade
        var gi = g.querySelector('img').getBoundingClientRect(), li = logo.querySelector('img').getBoundingClientRect();
        g.animate([{ transform: 'none' }, { transform: 'translate(' + (li.left - gi.left) + 'px,' + (li.top - gi.top) + 'px)' }],
          { duration: D, easing: EASE, fill: 'forwards' }).onfinish = function () { setTimeout(function () { g.remove(); }, 60); };
      } else {
        g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { g.remove(); };
      }
    }
    function setCompact(c) {
      if (c === compact) return;
      var animate = compact !== null && !reduce && !!bg.animate;
      compact = c;
      if (!animate) { nav.classList.toggle('is-compact', c); placeBg(); return; }
      cleanup();
      var first = bar.getBoundingClientRect(), us = units();
      var before = us.map(box), logoBefore = box(logo);
      var logoImgBefore = logoBefore ? logo.querySelector('img').getBoundingClientRect() : null;
      nav.classList.toggle('is-compact', c);
      placeBg();
      var last = bar.getBoundingClientRect(), after = us.map(box), logoAfter = box(logo);
      var opts = { duration: D, easing: EASE };
      play(bg, [
        { transform: 'translate(' + (first.left - last.left) + 'px,' + (first.top - last.top) + 'px) scale(' + (first.width / last.width) + ',' + (first.height / last.height) + ')' },
        { transform: 'none' }
      ], opts);
      us.forEach(function (u, n) {
        var b = before[n], a = after[n];
        var isSymbol = u.classList.contains('nav-symbol');
        if (b && a) {
          play(u, [{ transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px)' }, { transform: 'none' }], opts);
        } else if (a) {
          if (isSymbol && logoImgBefore) {            // logo flies from its corner into the capsule, fully opaque:
            var si = u.querySelector('img').getBoundingClientRect();   // it starts on the corner logo's exact pixels
            // overlap for exactly one painted frame (both logos on identical pixels), so the hand-off is never blank
            logo.style.visibility = 'visible';
            requestAnimationFrame(function () { requestAnimationFrame(function () { logo.style.visibility = ''; }); });
            play(u, [
              { transform: 'translate(' + (logoImgBefore.left - si.left) + 'px,' + (logoImgBefore.top - si.top) + 'px)' },
              { transform: 'none' }
            ], opts);
          } else {                                    // appearing item fades in once the capsule has moved a little
            play(u, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: D * 0.45, easing: 'ease-out' });
          }
        } else if (b) {
          var home = isSymbol && !!logoAfter;
          ghost(u, b, home);
          if (home) play(logo, [{ opacity: 0 }, { opacity: 0 }], { duration: D });   // hidden while the travelling logo is on its way
        }
      });
    }
    // compact while the header is still over the (dark) hero, so the white logo's flight is always visible;
    // short heroes (e.g. Articles) therefore compact earlier
    var hero = document.querySelector('main > section.hero, body > main section.hero');
    function threshold() {
      var t = window.innerHeight * 0.6;
      if (hero) t = Math.min(t, hero.offsetTop + hero.offsetHeight - 280);
      return Math.max(80, t);
    }
    var onScroll = function () {
      var y = window.scrollY, t = threshold();
      setCompact(compact ? y > t - 80 : y > t);                  // small hysteresis: no flicking at the threshold
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    window.addEventListener('resize', placeBg);
    window.addEventListener('load', placeBg);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeBg);
    var toggle = nav.querySelector('.nav-toggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* Reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .panel').forEach(function (el) { io.observe(el); });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- Page switcher: folder stack in menu order ----------
   Home → Products → Technology → Articles → Contact.
   Leave: the page shrinks into its place in the stack, the stack moves to the destination
   (forward: sheets in front drop away downward; backward: they come back up from below),
   the destination settles in front. Enter: the new page grows from that sheet to full screen. */
(function () {
  if (document.documentElement.classList.contains('pt-preview') || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) {
    document.documentElement.classList.remove('pt-entering'); return;
  }
  var root = document.documentElement, body = document.body, nav = document.querySelector('.nav');
  var ORDER = ['index.html', 'products.html', 'technology.html', 'articles.html', 'contact.html'];
  var LAST = ORDER.length - 1;                   // the stack ends with Contact
  var busy = false;

  function pageIndex(url) {
    var name = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
    return ORDER.indexOf(name);
  }
  function snapSrc(i) { return 'assets/img/snap-' + ORDER[i].replace('.html', '') + (window.innerWidth < 700 ? '-m' : '-d') + '.jpg'; }

  // stack geometry: k = (sheet index − front position). k ≥ 0 sits in the stack (further back = smaller, higher);
  // −1 < k < 0 is a sheet dropping away below; k ≤ −1 is off screen.
  function slot(k, vh) {
    if (k >= 0) return { ty: vh * (0.13 - 0.03 * k), s: 0.88 - 0.035 * k };   // all five edges stay on screen
    var p = Math.min(1, -k);
    return { ty: vh * (0.13 + 1.05 * p), s: 0.88 };
  }
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function layer(cls, html) {
    var el = document.createElement('div');
    el.className = 'pt-layer ' + cls; if (html) el.innerHTML = html;
    root.appendChild(el); return el;           // outside <body>, so body transforms don't move it
  }
  // A sheet = a snapshot of the page (taken without its header) + a real header, laid out by the same CSS
  // as the live one, so the logo and buttons sit exactly where they do on the page at any window size.
  function sheetNav(i) {
    var n = nav.cloneNode(true);
    n.className = 'nav'; n.removeAttribute('style'); n.setAttribute('aria-hidden', 'true'); n.inert = true;
    n.querySelectorAll('.nav-bg, .nav-ghost').forEach(function (x) { x.remove(); });
    n.querySelectorAll('[style]').forEach(function (x) { x.removeAttribute('style'); });
    n.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); });
    n.querySelectorAll('[aria-current]').forEach(function (x) { x.removeAttribute('aria-current'); });
    n.querySelectorAll('.is-current').forEach(function (x) { x.classList.remove('is-current'); });
    n.querySelectorAll('a.nav-link').forEach(function (a) {
      if (pageIndex(new URL(a.getAttribute('href'), location.href)) !== i) return;
      a.setAttribute('aria-current', 'page');
      if (a.parentNode.tagName === 'LI') a.parentNode.classList.add('is-current');
    });
    return n;
  }
  function sheet(i) {
    var el = layer('pt-sheet', '<img class="pt-snap" alt="" src="' + snapSrc(i) + '">');
    if (nav) el.appendChild(sheetNav(i));
    return el;
  }
  function pinNav() {                           // a transformed body re-anchors position:fixed children
    if (!nav) return;
    nav.style.position = 'absolute'; nav.style.top = (window.scrollY + 16) + 'px';
  }

  // the destination sheet carries a live preview of the page over its snapshot (loaded on hover)
  var pending = null;
  function previewUrl(href) {
    var u = new URL(href, location.href);
    u.search = (u.search ? u.search + '&' : '?') + 'pt-preview';
    return u.href;
  }
  function makeNext(href) {
    if (pending && pending.href === href) return pending.el;
    if (pending) pending.el.remove();
    var i = pageIndex(new URL(href, location.href));
    var el = sheet(i < 0 ? 0 : i);
    el.insertAdjacentHTML('beforeend', '<iframe class="pt-frame" tabindex="-1" aria-hidden="true" title="" scrolling="no"></iframe>');
    el.style.visibility = 'hidden';
    var fr = el.querySelector('iframe');
    fr.addEventListener('load', function () { el.classList.add('is-loaded'); });
    fr.src = previewUrl(href);
    pending = { href: href, el: el };
    return el;
  }

  function leave(href) {
    if (busy) return; busy = true;
    var to = pageIndex(new URL(href, location.href)), from = pageIndex(location);
    if (to < 0) to = 0;
    if (from < 0 || from === to) from = to > 0 ? to - 1 : to + 1;
    var vh = window.innerHeight, y = window.scrollY, docH = body.scrollHeight;
    var clip = function (r) { return 'inset(' + y + 'px 0 ' + Math.max(0, docH - y - vh) + 'px 0 round ' + r + 'px)'; };
    body.style.transformOrigin = '50% ' + y + 'px';
    pinNav(); root.classList.add('pt-active');
    var back = layer('pt-backdrop');

    // build the stack: the real page stands in for its own sheet
    var dest = makeNext(href); dest.style.visibility = ''; pending = null;
    var sheets = [];
    for (var i = 0; i <= LAST; i++) {
      if (i === from) { sheets[i] = body; continue; }
      sheets[i] = i === to ? dest : sheet(i);
    }
    // Travel: the stack behind advances with f; each sheet that leaves (forward) or returns (backward)
    // has its own drop, started a fraction of a drop after the previous one, so they overlap.
    var DROP = 650, STAG = 280, steps = Math.abs(to - from), dir = to > from ? 1 : -1;
    var TRAVEL = DROP + STAG * (steps - 1), OFF = vh * 1.18;
    function lerp(a, b, t) { return a + (b - a) * t; }
    function drop(n, t) { return easeInOut(Math.max(0, Math.min(1, (t - n * STAG) / DROP))); }
    function apply(el, ty, sc, z, shrink) {
      if (el === body) {
        body.style.transform = 'translateY(' + ty + 'px) scale(' + sc + ')';
        body.style.clipPath = clip(16 * shrink); body.style.zIndex = z;
      } else { el.style.transform = 'translateY(' + ty + 'px) scale(' + sc + ')'; el.style.zIndex = z; }
    }
    function place(f, shrink, t) {             // shrink: 0 = page still full screen, 1 = in the stack
      for (var i = 0; i <= LAST; i++) {
        var k = Math.max(0, i - f), s = slot(k, vh), ty = s.ty, sc = s.s, z = 100 - Math.round((i - f) * 10);
        if (i < Math.min(from, to)) { apply(sheets[i], OFF, s.s, 0, 1); continue; }   // earlier pages not on the route stay out of sight below
        if (t !== undefined) {
          if (dir > 0 && i >= from && i < to) ty = lerp(s.ty, OFF, drop(i - from, t));            // falls away
          if (dir < 0 && i >= to && i < from) { ty = lerp(OFF, s.ty, drop(from - 1 - i, t)); z = 100 - Math.round((i - to) * 10) + 50; } // comes back up
        } else if (dir < 0 && i >= to && i < from) ty = OFF;                                       // waiting below
        if (sheets[i] === body) apply(body, ty * shrink, 1 - (1 - sc) * shrink, z, shrink);
        else apply(sheets[i], ty, sc, z, 1);
      }
    }
    place(from, 0);
    back.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });

    var SHRINK = 480, t0 = performance.now();
    (function frame(now) {
      var t = now - t0;
      if (t < SHRINK) { place(from, easeOut(t / SHRINK)); }
      else {
        var tt = Math.min(TRAVEL, t - SHRINK), p = tt / TRAVEL;
        place(from + (to - from) * easeInOut(p), 1, tt);
        if (p >= 1) {
          setTimeout(function () {
            try { sessionStorage.setItem('pt-enter', JSON.stringify({ to: to })); } catch (e) {}
            window.location.href = href;
            // if the navigation never happens (offline, stopped), put the page back instead of leaving it in the stack
            setTimeout(function () { try { sessionStorage.removeItem('pt-enter'); } catch (e) {} cleanup(); }, 5000);
          }, 60);
          return;
        }
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  function enter(info) {
    var vh = window.innerHeight, to = info && typeof info.to === 'number' ? info.to : pageIndex(location);
    root.classList.add('pt-active');
    var back = layer('pt-backdrop');
    // the rest of the stack, behind the arriving page
    if (to >= 0) for (var i = to + 1; i <= LAST; i++) {
      var s = slot(i - to, vh), el = sheet(i);
      el.style.transform = 'translateY(' + s.ty + 'px) scale(' + s.s + ')'; el.style.zIndex = 100 - (i - to) * 10;
    }
    // land exactly where the preview card was showing (anchor target, sections already revealed).
    // html.pt-entering keeps every section revealed from the very first paint; the ones on screen are
    // fixed as revealed before that class goes, so nothing blinks during the hand-over
    var target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {                                  // measured from offsets: the page is still transformed here
      for (var top = 0, n = target; n && n !== body; n = n.offsetParent) top += n.offsetTop;
      window.scrollTo({ top: top, behavior: 'instant' });
    }
    document.querySelectorAll('.reveal').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 1.1 && r.bottom > 0) { el.style.transition = 'none'; el.classList.add('is-in'); requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transition = ''; }); }); }
      else { el.style.transition = 'none'; requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transition = ''; }); }); }
    });
    root.classList.remove('pt-entering');
    pinNav();
    var y = window.scrollY, rest = Math.max(0, body.scrollHeight - y - vh);
    body.style.transformOrigin = '50% ' + y + 'px';
    body.style.zIndex = 200;
    var a = body.animate([
      { transform: 'translateY(' + vh * 0.13 + 'px) scale(.88)', clipPath: 'inset(' + y + 'px 0 ' + rest + 'px 0 round 16px)' },
      { transform: 'translateY(0) scale(1)', clipPath: 'inset(' + y + 'px 0 ' + rest + 'px 0 round 0px)' }
    ], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' });
    a.onfinish = function () { cleanup(); };
  }

  function cleanup() {
    body.getAnimations().forEach(function (a) { a.cancel(); });
    body.style.transformOrigin = ''; body.style.transform = ''; body.style.clipPath = ''; body.style.zIndex = '';
    if (nav) { nav.style.position = ''; nav.style.top = ''; }
    document.querySelectorAll('.pt-layer').forEach(function (el) { el.remove(); });
    root.classList.remove('pt-active', 'pt-entering');
    busy = false; pending = null;
  }

  // Internal page links get the transition
  function samePath(p) { return p.replace(/\/index\.html?$/i, '/'); }
  function pageLink(target) {
    var a = target && target.closest && target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self')) return null;
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(raw)) return null;
    var url = new URL(a.href, location.href);
    if (location.protocol === 'file:' ? url.protocol !== 'file:' : url.origin !== location.origin) return null;
    if (samePath(url.pathname) === samePath(location.pathname)) return null;   // same page ("/" and "/index.html" are one page), let anchors scroll
    if (!/\.html?$|\/$/.test(url.pathname)) return null;
    return url.href;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // a link to the page we are already on (no anchor): go to the top instead of reloading
    var same = e.target.closest && e.target.closest('a[href]');
    if (same && !same.hash && same.getAttribute('href').charAt(0) !== '#' && (!same.target || same.target === '_self') &&
        same.protocol === location.protocol && same.host === location.host && samePath(same.pathname) === samePath(location.pathname)) {
      e.preventDefault(); window.scrollTo({ top: 0 }); return;
    }
    var href = pageLink(e.target); if (!href) return;
    e.preventDefault();
    leave(href);
  });
  // Preload the destination's preview when a link is hovered for a moment or focused: not on touch
  // (it would fire while scrolling) and not when the visitor asked to save data
  var saveData = navigator.connection && navigator.connection.saveData, hoverT = 0;
  if (!saveData) {
    document.addEventListener('pointerover', function (e) {
      clearTimeout(hoverT);
      if (busy || e.pointerType === 'touch') return;
      var href = pageLink(e.target);
      if (href) hoverT = setTimeout(function () { if (!busy) makeNext(href); }, 120);
    }, { passive: true });
    ['focusin', 'pointerdown'].forEach(function (type) {      // pressing starts the preview at once, ahead of the click
      document.addEventListener(type, function (e) {
        if (busy || e.pointerType === 'touch') return;      // a touch may be the start of a scroll
        var href = pageLink(e.target); if (href) makeNext(href);
      }, { passive: true });
    });
  }

  // Coming back via the back button restores a frozen page: reset it
  window.addEventListener('pageshow', function (e) { if (e.persisted) cleanup(); });

  var info = null;
  try { var raw = sessionStorage.getItem('pt-enter'); sessionStorage.removeItem('pt-enter'); if (raw) info = JSON.parse(raw); } catch (e) {}
  if (info) enter(info); else root.classList.remove('pt-entering');
})();

/* ---------- Team: press a person to open their bio under their row ----------
   One requestAnimationFrame loop drives the drawer's height, the slide of its content and any scroll
   compensation together, on one easing curve, so nothing drifts apart or jumps. */
(function () {
  var team = document.querySelector('[data-team]');
  if (!team) return;
  var panel = team.querySelector('.team-bio'), notch = panel.querySelector('.team-bio-notch'), inner = panel.querySelector('.team-bio-inner');
  var nameEl = panel.querySelector('.team-bio-name'), roleEl = panel.querySelector('.team-bio-role'), textEl = panel.querySelector('.team-bio-text');
  var members = Array.prototype.slice.call(team.querySelectorAll('.member'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = reduce ? 0 : 620;
  var openCard = null, running = [];
  team.style.overflowAnchor = 'none';                       // we manage scroll ourselves

  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // smooth cubic in-out
  function rowEnd(card) {
    var top = card.offsetTop, last = card;
    members.forEach(function (m) { if (m.offsetTop === top) last = m; });
    return last;
  }
  function notchTo(card, instant) {
    // centre under the person's full name (titles included), measured from the text itself
    var tr = team.getBoundingClientRect(), nm = card.querySelector('.member-name');
    var rg = document.createRange(); rg.selectNodeContents(nm);
    var rs = Array.prototype.slice.call(rg.getClientRects());
    var l = Math.min.apply(null, rs.map(function (r) { return r.left; })), rr = Math.max.apply(null, rs.map(function (r) { return r.right; }));
    var x = Math.round((l + rr) / 2 - tr.left - 10);
    if (instant) { notch.style.transition = 'none'; notch.style.transform = 'translateX(' + x + 'px) rotate(45deg)'; void notch.offsetWidth; notch.style.transition = ''; }
    else notch.style.transform = 'translateX(' + x + 'px) rotate(45deg)';
  }
  function fill(card) {
    nameEl.textContent = card.querySelector('.member-name').textContent;
    roleEl.textContent = card.querySelector('.member-role').textContent;
    var src = document.getElementById(card.getAttribute('data-bio'));
    textEl.innerHTML = src ? src.innerHTML : '';
  }
  function setActive(card) {
    members.forEach(function (m) {
      var on = m === card;
      m.classList.toggle('is-active', on);
      if (m.hasAttribute('aria-expanded')) m.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  function naturalH(p) { var keep = p.style.height; p.style.height = 'auto'; var h = p.getBoundingClientRect().height; p.style.height = keep; return h; }
  function stopAll() { running.forEach(function (r) { r.stopped = true; }); running = []; }

  // drive one drawer: height from→to, content (box + lip) slides with the opening edge, optional opacity
  // and a scroll offset that is applied in the same frame
  function drive(p, from, to, opts) {
    var full = opts.full, clip = p.querySelector('.team-bio-clip'), box = p.querySelector('.team-bio-inner');
    var job = { stopped: false }; running.push(job);
    function set(e) {
      var h = from + (to - from) * e;
      p.style.height = h + 'px';
      clip.style.transform = opts.slide ? 'translateY(' + (h - full) + 'px)' : '';
      if (opts.fade) box.style.opacity = opts.fade[0] + (opts.fade[1] - opts.fade[0]) * e;
      if (opts.scroll) window.scrollTo({ top: opts.scroll[0] + (opts.scroll[1] - opts.scroll[0]) * e, behavior: 'instant' });   // instant: the site's smooth scrolling would lag behind
    }
    if (!D) { set(1); if (opts.done) opts.done(); return; }
    var t0 = performance.now();
    set(0);
    requestAnimationFrame(function step(now) {
      if (job.stopped) return;
      var t = Math.min(1, (now - t0) / (opts.dur || D));
      set(ease(t));
      if (t < 1) requestAnimationFrame(step);
      else { clip.style.transform = ''; box.style.opacity = ''; if (opts.done) opts.done(); }
    });
  }

  // how far to scroll so the pressed card's top stays below the header and its drawer fits on screen
  function viewDelta(cardTop, cardH, drawerH) {
    var vh = window.innerHeight, top = 96, bottom = vh - 24;
    if (cardTop < top) return cardTop - top;
    var over = cardTop + cardH + drawerH - bottom;
    return over > 0 ? Math.min(over, cardTop - top) : 0;
  }
  function open(card) {
    stopAll();
    var vh = window.innerHeight, y0 = window.scrollY;

    if (openCard && rowEnd(openCard) === rowEnd(card)) {             // same row: resize to the new bio
      var hA = panel.getBoundingClientRect().height;
      fill(card); setActive(card); openCard = card; notchTo(card, false);
      var hB = naturalH(panel);
      var d0 = viewDelta(card.getBoundingClientRect().top, card.offsetHeight, hB);
      drive(panel, hA, hB, { full: hB, scroll: Math.abs(d0) > 1 ? [y0, Math.max(0, y0 + d0)] : null, done: function () { panel.style.height = 'auto'; } });
      if (D) inner.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      return;
    }

    var old = null, oldH = 0, oldAbove = false;
    if (openCard) {                                                  // an open drawer elsewhere closes as a copy
      oldH = panel.getBoundingClientRect().height;
      oldAbove = panel.getBoundingClientRect().top < card.getBoundingClientRect().top;
      old = panel.cloneNode(true); old.removeAttribute('id'); old.setAttribute('aria-hidden', 'true');
      old.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
      team.insertBefore(old, panel);
    }
    fill(card); setActive(card); openCard = card;
    panel.hidden = false; panel.style.height = '0px';
    var end = rowEnd(card);
    if (end.nextElementSibling !== panel) team.insertBefore(panel, end.nextElementSibling);
    notchTo(card, true);
    var full = naturalH(panel);

    // scroll: keep the pressed card still while a drawer above it closes, and bring the new drawer into view
    var yEnd = y0 - (oldAbove ? oldH : 0);                     // keeps the pressed card still while a drawer above closes
    yEnd += viewDelta(card.getBoundingClientRect().top, card.offsetHeight, full);
    var scroll = Math.abs(yEnd - y0) > 1 ? [y0, Math.max(0, yEnd)] : null;

    if (old) drive(old, oldH, 0, { full: oldH, slide: true, fade: [1, .35], done: function () { old.remove(); } });
    drive(panel, 0, full, { full: full, slide: true, fade: [.35, 1], scroll: scroll, done: function () { panel.style.height = 'auto'; } });
  }

  function close(focusBack) {
    if (!openCard) return;
    stopAll();
    var card = openCard; openCard = null;
    setActive(null);
    var h = panel.getBoundingClientRect().height;
    drive(panel, h, 0, { full: h, slide: true, fade: [1, .35], dur: D * 0.85, done: function () {
      if (openCard) return;
      panel.hidden = true; panel.style.height = '0px';
    } });
    if (focusBack) card.focus();
  }

  members.forEach(function (m) {
    if (!m.hasAttribute('data-bio')) return;
    m.addEventListener('click', function () { if (openCard === m) close(false); else open(m); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openCard) close(true); });
  // a press anywhere outside the drawer closes it (pressing another person with a bio switches instead)
  document.addEventListener('click', function (e) {
    if (!openCard || panel.contains(e.target)) return;
    if (e.target.closest && e.target.closest('button.member[data-bio]')) return;
    close(false);
  });
  var rt; window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (!openCard) return;
      var end = rowEnd(openCard);
      if (end.nextElementSibling !== panel) team.insertBefore(panel, end.nextElementSibling);
      notchTo(openCard, true); panel.style.height = 'auto';
    }, 100);
  });
})();
