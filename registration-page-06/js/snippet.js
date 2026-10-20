/*!
 * registration-page-06 - Colorlib. No jQuery, no framework.
 * Behaviours: select-font-settle, own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register06');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const dob = form && form.elements.dob;
  const guardian = root.querySelector('[data-guardian]');
  const gFields = root.querySelector('[data-guardian-fields]');
  const gNote = root.querySelector('[data-guardian-note]');
  const ageHint = root.querySelector('[data-age]');
  if (!form || !done || !dob || !guardian) return;

  const TERM_START = new Date(2027, 8, 1); 
  const NOTE = gNote.textContent;
  const HINT = ageHint.textContent;

  
  const ageAtStart = (value) => {
    const [y, m, d] = value.split('-').map(Number);
    let age = TERM_START.getFullYear() - y;
    if (TERM_START.getMonth() + 1 < m || (TERM_START.getMonth() + 1 === m && TERM_START.getDate() < d)) age -= 1;
    return age;
  };

  let adult = false;
  const updateGuardian = () => {
    const ok = dob.value && dob.validity.valid;
    const age = ok ? ageAtStart(dob.value) : null;
    ageHint.textContent = age === null ? HINT : `Age on 1 September 2027: ${age}.`;
    ageHint.classList.toggle('is-age', age !== null);
    const nowAdult = age !== null && age >= 18;
    if (nowAdult === adult) return;
    adult = nowAdult;
    gFields.hidden = adult;
    guardian.classList.toggle('is-optional', adult);
    gFields.querySelectorAll('[data-guardian-input]').forEach((el) => { el.disabled = adult; });
    gNote.textContent = adult ? 'Not needed: the student will be 18 or over on 1 September 2027.' : NOTE;
    live.textContent = adult ? 'Parent or guardian details are not needed for students 18 or over.' : 'Parent or guardian details are now required.';
  };
  dob.addEventListener('change', updateGuardian);
  dob.addEventListener('input', updateGuardian);

  const messageFor = (field) => {
    if (field.hasAttribute('data-group')) return field.querySelector('input:checked') ? '' : field.querySelector('input[required]').dataset.msg;
    const el = field.querySelector('input, select');
    if (el.disabled) return '';
    if (el.type === 'checkbox') return el.checked ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.validity.badInput) return 'Enter a full date, like 14/03/2011.';
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email address like name@example.com.';
    if (el.validity.rangeOverflow) return 'The student must be 14 or over on 1 September 2027.';
    if (el.validity.rangeUnderflow) return 'Check the year of birth.';
    if (el.validity.patternMismatch) return el.dataset.pattern || 'Check the format.';
    return '';
  };
  const check = (field) => {
    const msg = messageFor(field);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    field.querySelectorAll('input, select').forEach((el) => { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
    return !msg;
  };
  const fields = Array.from(form.querySelectorAll('[data-field]'));
  fields.forEach((field) => {
    field.addEventListener('focusout', (e) => {
      const el = field.querySelector('input, select');
      if (field.contains(e.relatedTarget) || (e.relatedTarget && e.relatedTarget.matches('button')) || field.hasAttribute('data-group') || el.type === 'checkbox' || (!el.value && !el.validity.badInput)) return;
      field.dataset.touched = '1';
      check(field);
    });
    field.addEventListener('input', () => { if (field.dataset.touched) check(field); });
    field.addEventListener('change', () => { if (field.dataset.touched) check(field); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateGuardian();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = `The form has ${bad.length} ${bad.length === 1 ? 'problem' : 'problems'}. The first one is: ${bad[0].querySelector('[data-error]').textContent}`;
      bad[0].querySelector('input:not(:disabled), select').focus();
      return;
    }
    const f = form.elements;
    const start = form.querySelector('input[name="start"]:checked').value;
    root.querySelector('[data-ref]').textContent = `Reference ASC-27-${String(Math.floor(10000 + Math.random() * 90000))}`;
    root.querySelector('[data-done-title]').textContent = `Thank you, ${f.first.value.trim()}. Your application is in.`;
    root.querySelector('[data-done-text]').textContent = `We have your application for ${f.course.value}, starting ${start}. An interview invitation will go to ${f.email.value.trim()}${adult ? '' : ` with a copy to ${f.gemail.value.trim()}`} within three weeks.`;
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
})();

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
})();
