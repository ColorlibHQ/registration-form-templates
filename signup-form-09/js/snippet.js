/*!
 * signup-form-09 - Colorlib. No jQuery, no framework.
 * Behaviours: field-not-empty
 */
(function () {
  'use strict';

  /* Floating labels: the field's group is marked while the field has a value. */
  document.querySelectorAll(".cl-form-control").forEach(function (f) {
    var g = f.closest(".cl-form-group");
    if (!g) return;
    function sync() { g.classList.toggle("field--not-empty", !!f.value); }
    f.addEventListener('input', sync);
    sync();
  });
})();
