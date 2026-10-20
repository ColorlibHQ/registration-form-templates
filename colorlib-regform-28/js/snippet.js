/*!
 * colorlib-regform-28 - Colorlib. No jQuery, no framework.
 * Behaviours: native-validate
 */
(function () {
  'use strict';

  /* Native validation, keeping the template's .error / .valid styling. */
  var EQUAL_TO = [["confirm_password","#password"]];
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
})();
