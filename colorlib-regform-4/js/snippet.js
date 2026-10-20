/*!
 * colorlib-regform-4 - Colorlib. No jQuery, no framework.
 * Behaviours: native-date, select-font-settle, calendar-button
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

  /* Re-measure selects once web fonts are in (Chrome sizes them on the fallback). */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
    document.querySelectorAll('select').forEach(function (s) {
      var d = s.style.display;
      s.style.display = 'none';
      s.offsetHeight;
      s.style.display = d;
    });
  });

  document.querySelectorAll('.js-btn-calendar').forEach(function (btn) {
    var box = btn.closest('.cl-input-group, .form-group, .rs-input-group, .input-group-icon') || btn.parentElement;
    var input = box && box.querySelector('input[type="date"], input');
    if (!input) return;
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Choose a date');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (input.type !== 'date') { input.focus(); return; }   // a placeholder-labelled field turns into a date input on focus
      if (input.showPicker) { try { input.showPicker(); return; } catch (err) {} }
      input.focus();
    });
  });
})();
