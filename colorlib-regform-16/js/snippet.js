/*!
 * colorlib-regform-16 - Colorlib. No jQuery, no framework.
 * Behaviours: range-slider, native-validate, select-font-settle
 */
(function () {
  'use strict';

  /* Range sliders (noUiSlider's markup and classes, no library). */
  [{"id":"slider-margin","start":[500],"min":0,"max":1000,"step":10,"connect":[true,false],"tooltips":true,"format":{"decimals":0,"thousand":",","prefix":"$ "}}].forEach(function (o) {
    var el = document.getElementById(o.id);
    if (!el) return;
    var v11 = !!document.querySelector('.noUi-connects') || [].some.call(document.styleSheets, function (s) {
      try { return [].some.call(s.cssRules, function (r) { return /noUi-connects/.test(r.selectorText || ''); }); } catch (e) { return false; }
    });
    var vals = o.start.slice(), n = vals.length;
    function fmt(x) {
      if (!o.format) return String(Math.round(x));
      var f = o.format, s = x.toFixed(f.decimals || 0);
      if (f.thousand) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, f.thousand);
      return (f.prefix || '') + s + (f.suffix || '');
    }
    function pct(x) { return (x - o.min) / (o.max - o.min) * 100; }
    var old = el.querySelector('.noUi-base'); if (old) old.remove();
    el.classList.add('noUi-target', 'noUi-ltr', 'noUi-horizontal');
    var base = document.createElement('div'); base.className = 'noUi-base';
    var holder = base;
    if (v11) { holder = document.createElement('div'); holder.className = 'noUi-connects'; base.appendChild(holder); }
    var connect = null;
    if (o.connect) { connect = document.createElement('div'); connect.className = 'noUi-connect'; holder.appendChild(connect); }
    var origins = vals.map(function (v, i) {
      var origin = document.createElement('div'); origin.className = 'noUi-origin';
      var h = document.createElement('div');
      h.className = 'noUi-handle noUi-handle-' + (i ? 'upper' : 'lower');
      h.setAttribute('data-handle', i); h.tabIndex = 0; h.setAttribute('role', 'slider');
      h.setAttribute('aria-orientation', 'horizontal');
      if (o.tooltips) { var t = document.createElement('div'); t.className = 'noUi-tooltip'; h.appendChild(t); }
      origin.appendChild(h); base.appendChild(origin);
      return origin;
    });
    el.insertBefore(base, el.firstChild);
    function render() {
      origins.forEach(function (origin, i) {
        origin.style.cssText = 'left:' + pct(vals[i]) + '%;right:auto;width:0;transform:none;z-index:' + (4 + i);
        var h = origin.firstChild;
        h.setAttribute('aria-valuemin', o.min); h.setAttribute('aria-valuemax', o.max);
        h.setAttribute('aria-valuenow', vals[i]); h.setAttribute('aria-valuetext', fmt(vals[i]));
        if (h.firstChild) h.firstChild.textContent = fmt(vals[i]);
      });
      if (connect) {
        var a = n > 1 ? pct(vals[0]) : 0, b = n > 1 ? pct(vals[1]) : pct(vals[0]);
        if (Array.isArray(o.connect) && !o.connect[0]) { a = pct(vals[0]); b = 100; }
        connect.style.cssText = 'left:' + a + '%;right:auto;width:' + (b - a) + '%;transform:none';
      }
      var lower = document.getElementById('value-lower'), upper = document.getElementById('value-upper');
      if (lower) lower.textContent = fmt(vals[0]);
      if (upper && n > 1) upper.textContent = fmt(vals[1]);
      var from = document.querySelector('input[name="from-value"]'), to = document.querySelector('input[name="to-value"]');
      if (from) from.value = Math.round(vals[0]);
      if (to && n > 1) to.value = Math.round(vals[1]);
    }
    function set(i, x) {
      x = Math.round((x - o.min) / o.step) * o.step + o.min;
      var lo = i > 0 ? vals[i - 1] : o.min, hi = i < n - 1 ? vals[i + 1] : o.max;
      vals[i] = Math.min(hi, Math.max(lo, x));
      render();
    }
    function at(e) { var r = base.getBoundingClientRect(); return o.min + Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (o.max - o.min); }
    var drag = -1;
    base.addEventListener('pointerdown', function (e) {
      var x = at(e), h = e.target.closest('.noUi-handle');
      drag = h ? +h.getAttribute('data-handle')
        : vals.reduce(function (best, v, i) { return Math.abs(v - x) < Math.abs(vals[best] - x) ? i : best; }, 0);
      base.setPointerCapture(e.pointerId);
      set(drag, x);
      origins[drag].firstChild.focus();
      e.preventDefault();
    });
    base.addEventListener('pointermove', function (e) { if (drag >= 0) set(drag, at(e)); });
    base.addEventListener('pointerup', function () { drag = -1; });
    base.addEventListener('keydown', function (e) {
      var h = e.target.closest('.noUi-handle'); if (!h) return;
      var i = +h.getAttribute('data-handle'), d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!d) return;
      set(i, vals[i] + d * o.step); e.preventDefault();
    });
    render();
  });

  /* Native validation, keeping the template's .error / .valid styling. */
  var EQUAL_TO = [];
  EQUAL_TO.forEach(function (p) {
    var field = document.querySelector('[name="' + p[0] + '"]'), other = document.querySelector(p[1]);
    if (!field || !other) return;
    function sync() { field.setCustomValidity(field.value && field.value !== other.value ? 'This does not match.' : ''); }
    field.addEventListener('input', sync); other.addEventListener('input', sync);
  });
  document.querySelectorAll('form').forEach(function (form) {
    function mark(el) {
      if (!el.willValidate) return;
      var ok = el.validity.valid;   // checkValidity() would fire the invalid event and recurse
      el.classList.toggle('error', !ok);
      el.classList.toggle('valid', ok);
    }
    form.addEventListener('invalid', function (e) { mark(e.target); }, true);
    form.addEventListener('focusout', function (e) { if (e.target.matches('input, select, textarea') && e.target.value) mark(e.target); });
    form.addEventListener('input', function (e) { if (e.target.classList.contains('error')) mark(e.target); });
  });

  /* Re-measure selects once web fonts are in (Chrome sizes them on the fallback). */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    document.querySelectorAll('select').forEach(function (s) {
      var d = s.style.display;
      s.style.display = 'none';
      s.offsetHeight;
      s.style.display = d;
    });
  });
})();
