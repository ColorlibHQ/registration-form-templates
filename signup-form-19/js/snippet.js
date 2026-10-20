/*!
 * signup-form-19 - Colorlib. No jQuery, no framework.
 * Behaviours: bootstrap-data-api, toggle-password
 */
(function () {
  'use strict';

  var SHOWN = 'cl-show';
  /* Tabs: the pane and the link carry .active -- or the link's <li>, where the
     markup put it there (Bootstrap 3). */
  document.querySelectorAll('[data-toggle="tab"], [data-toggle="pill"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var pane = document.querySelector(a.getAttribute('data-target') || a.getAttribute('href'));
      var nav = a.closest('ul, ol, .nav');
      if (!pane || !nav) return;
      var onLi = !!nav.querySelector('li.cl-active');
      nav.querySelectorAll('[data-toggle="tab"], [data-toggle="pill"]').forEach(function (o) {
        var on = o === a;
        (onLi && o.parentElement.tagName === 'LI' ? o.parentElement : o).classList.toggle('cl-active', on);
        o.setAttribute('aria-selected', String(on));
      });
      [].slice.call(pane.parentElement.children).forEach(function (p) {
        if (!p.classList.contains('cl-tab-pane')) return;
        var on = p === pane;
        p.classList.toggle('cl-active', on);
        if (p.classList.contains('cl-fade')) {
          if (on) { p.offsetHeight; p.classList.add(SHOWN); } else p.classList.remove(SHOWN);
        }
      });
    });
  });

  /* Show / hide the password named by the eye's toggle="" attribute. */
  document.querySelectorAll('.toggle-password').forEach(function (eye) {
    var input = document.querySelector(eye.getAttribute('toggle'));
    if (!input) return;
    eye.setAttribute('role', 'button');
    eye.setAttribute('tabindex', '0');
    eye.setAttribute('aria-label', 'Show password');
    function flip() {
      eye.classList.toggle('fa-eye'); eye.classList.toggle('fa-eye-slash');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show));
    }
    eye.addEventListener('click', flip);
    eye.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
})();
