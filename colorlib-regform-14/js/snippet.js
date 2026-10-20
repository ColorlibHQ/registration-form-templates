/*!
 * colorlib-regform-14 - Colorlib. No jQuery, no framework.
 * Behaviours: native-date, native-validate, select-font-settle, simple-bindings
 */
(function () {
  'use strict';

  /* Date fields labelled only by their placeholder: text until focused. */
  document.querySelectorAll('input[data-date]').forEach(function (d) {
    d.addEventListener('focus', function () {
      if (d.type === 'date') return;
      d.type = 'date';
      try { d.showPicker(); } catch (e) {}
    });
    d.addEventListener('blur', function () { if (!d.value) d.type = 'text'; });
  });
  /* jQuery UI's trigger button, kept for its look: it opens the browser's picker. */
  document.querySelectorAll('.ui-datepicker-trigger').forEach(function (b) {
    var d = b.previousElementSibling;
    if (!d || d.tagName !== 'INPUT') return;
    b.addEventListener('click', function () { d.focus(); try { d.showPicker(); } catch (e) {} });
  });
  /* A check-out date can never be earlier than its check-in. */
  [['input-start', 'input-end'], ['input-start-2', 'input-end-2']].forEach(function (pair) {
    var a = document.getElementById(pair[0]), b = document.getElementById(pair[1]);
    if (!a || !b) return;
    a.addEventListener('change', function () {
      b.min = a.value;
      if (b.value && b.value < a.value) b.value = a.value;
    });
  });

  /* Native validation, keeping the template's .error / .valid styling. */
  var EQUAL_TO = [["re_password","#password"]];
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

  /* One-line jQuery handlers, translated. */
  var SIMPLE = [{"sel":".add-info-link ","ev":"click","steps":[{"op":"toggle","target":".add_info","ms":600}]}];
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
