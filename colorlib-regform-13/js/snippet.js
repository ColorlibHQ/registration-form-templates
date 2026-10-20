/*!
 * colorlib-regform-13 - Colorlib. No jQuery, no framework.
 * Behaviours: select-font-settle, simple-bindings
 */
(function () {
  'use strict';

  /* Re-measure selects once web fonts are in (Chrome sizes them on the fallback). */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    document.querySelectorAll('select').forEach(function (s) {
      var d = s.style.display;
      s.style.display = 'none';
      s.offsetHeight;
      s.style.display = d;
    });
  });

  /* One-line jQuery handlers, translated. */
  var SIMPLE = [{"sel":".form-radio .radio-item","ev":"click","steps":[{"op":"removeClass","target":".radio-item","scope":"parent","cls":"cl-active"},{"op":"addClass","target":"this","cls":"cl-active"}]}];
  var calmMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function isHidden(el) { return getComputedStyle(el).display === 'none'; }
  function showEl(el, ms) {
    if (!isHidden(el)) return;
    el.style.display = '';
    if (isHidden(el)) el.style.display = 'block';
    if (calmMotion || !ms) return;
    el.style.opacity = '0'; el.style.transition = 'opacity ' + ms + 'ms';
    requestAnimationFrame(function () { el.style.opacity = '1'; });
  }
  function hideEl(el, ms) {
    if (isHidden(el)) return;
    if (calmMotion || !ms) { el.style.display = 'none'; return; }
    el.style.transition = 'opacity ' + ms + 'ms'; el.style.opacity = '0';
    setTimeout(function () { el.style.display = 'none'; el.style.opacity = ''; }, ms);
  }
  function run(steps, self) {
    steps.forEach(function (s) {
      if (s.op === 'ifChecked') { if (self.checked) run(s.then, self); return; }
      var targets = s.target === 'this' ? [self]
        : s.scope === 'parent' ? [].slice.call(self.parentElement.querySelectorAll(s.target))
        : [].slice.call(document.querySelectorAll(s.target));
      targets.forEach(function (el) {
        if (s.op === 'show') showEl(el, s.ms);
        else if (s.op === 'hide') hideEl(el, s.ms);
        else if (s.op === 'toggle') { if (isHidden(el)) showEl(el, s.ms); else hideEl(el, s.ms); }
        else if (s.op === 'addClass') s.cls.split(' ').forEach(function (k) { el.classList.add(k); });
        else if (s.op === 'removeClass') s.cls.split(' ').forEach(function (k) { el.classList.remove(k); });
        else if (s.op === 'toggleClass') s.cls.split(' ').forEach(function (k) { el.classList.toggle(k); });
      });
    });
  }
  SIMPLE.forEach(function (h) {
    document.querySelectorAll(h.sel).forEach(function (el) {
      el.addEventListener(h.ev, function (e) { run(h.steps, el); });
    });
  });
})();
