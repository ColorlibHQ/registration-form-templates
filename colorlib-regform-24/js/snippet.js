/*!
 * colorlib-regform-24 - Colorlib. No jQuery, no framework.
 * Behaviours: form-validator
 */
(function () {
  'use strict';

  /* Native validation, marking fields with the template's .error / .valid. */
  document.querySelectorAll('form').forEach(function (form) {
    function mark(el) { if (!el.willValidate) return; var ok = el.validity.valid; el.classList.toggle('error', !ok); el.classList.toggle('valid', ok); }
    form.addEventListener('invalid', function (e) { mark(e.target); }, true);
    form.addEventListener('focusout', function (e) { if (e.target.matches('input, select, textarea') && e.target.value) mark(e.target); });
  });
})();
