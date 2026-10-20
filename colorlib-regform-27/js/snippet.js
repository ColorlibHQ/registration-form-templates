/*!
 * colorlib-regform-27 - Colorlib. No jQuery, no framework.
 * Behaviours: wizard, select-font-settle
 */
(function () {
  'use strict';

  /* Step wizard: drives the markup jquery.steps generated, same classes. */
  var WIZARD_BUTTONS = [];
  document.querySelectorAll('.wizard[role="application"]').forEach(function (w) {
    var tabs   = [].slice.call(w.querySelectorAll('.steps [role="tab"]'));
    var titles = [].slice.call(w.querySelectorAll('.content > .title'));
    var bodies = [].slice.call(w.querySelectorAll('.content > .body'));
    var prev   = w.querySelector('.actions a[href="#previous"]');
    var next   = w.querySelector('.actions a[href="#next"]');
    var finish = w.querySelector('.actions a[href="#finish"]');
    if (!bodies.length) return;
    /* A wizard built with enableAllSteps has no disabled tabs to begin with. */
    var freeNav = !tabs.some(function (t) { return t.classList.contains('cl-disabled'); });
    var current = Math.max(0, bodies.findIndex(function (b) { return b.classList.contains('current'); }));

    function stepValid(i) {
      var bad = bodies[i].querySelector('input:invalid, select:invalid, textarea:invalid');
      if (!bad) return true;
      if (bad.reportValidity) bad.reportValidity();
      return false;
    }

    function go(i) {
      if (i < 0 || i >= bodies.length || i === current) return;
      if (i > current && !stepValid(current)) return;
      current = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('current', on);
        if (k < i) t.classList.add('done');
        t.setAttribute('aria-selected', String(on));
        if (!freeNav) {
          var reachable = k <= i || t.classList.contains('done');
          t.classList.toggle('cl-disabled', !reachable);
          t.setAttribute('aria-disabled', String(!reachable));
        }
      });
      titles.forEach(function (t, k) { t.classList.toggle('current', k === i); });
      bodies.forEach(function (b, k) {
        var on = k === i;
        b.classList.toggle('current', on);
        b.style.display = on ? '' : 'none';
        b.setAttribute('aria-hidden', String(!on));
      });
      if (prev) {
        prev.parentElement.classList.toggle('cl-disabled', i === 0);
        prev.parentElement.setAttribute('aria-disabled', String(i === 0));
      }
      var last = i === bodies.length - 1;
      if (next) {
        next.parentElement.style.display = last ? 'none' : '';
        next.parentElement.setAttribute('aria-hidden', String(last));
      }
      if (finish) {
        finish.parentElement.style.display = last ? '' : 'none';
        finish.parentElement.setAttribute('aria-hidden', String(!last));
      }
    }

    function submit() {
      if (!stepValid(current)) return;
      var form = w.tagName === 'FORM' ? w : w.closest('form');
      if (!form) return;
      if (form.requestSubmit) form.requestSubmit(); else form.submit();
    }

    var ACTIONS = { next: function () { go(current + 1); }, previous: function () { go(current - 1); }, finish: submit };

    w.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !w.contains(a)) return;
      var href = a.getAttribute('href');
      if (href === '#previous') { e.preventDefault(); ACTIONS.previous(); }
      else if (href === '#next') { e.preventDefault(); ACTIONS.next(); }
      else if (href === '#finish') { e.preventDefault(); ACTIONS.finish(); }
      else if (a.closest('.steps')) {
        e.preventDefault();
        var k = tabs.indexOf(a.closest('[role="tab"]'));
        if (k >= 0 && (freeNav || tabs[k].classList.contains('done') || k <= current)) go(k);
      }
    });

    WIZARD_BUTTONS.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (btn) {
        btn.addEventListener('click', function (e) { e.preventDefault(); ACTIONS[pair[1]](); });
      });
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
})();
