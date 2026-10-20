/*!
 * colorlib-regform-9 - Colorlib. No jQuery, no framework.
 * Behaviours: toggle-password
 */
(function () {
  'use strict';

  /* Show / hide the password named by the eye's toggle="" attribute. */
  document.querySelectorAll('.toggle-password').forEach(function (eye) {
    var input = document.querySelector(eye.getAttribute('toggle'));
    if (!input) return;
    eye.setAttribute('role', 'button');
    eye.setAttribute('tabindex', '0');
    eye.setAttribute('aria-label', 'Show password');
    function flip() {
      eye.classList.toggle('zmdi-eye'); eye.classList.toggle('zmdi-eye-off');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show));
    }
    eye.addEventListener('click', flip);
    eye.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
})();
