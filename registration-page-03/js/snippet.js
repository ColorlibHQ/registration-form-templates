/*!
 * registration-page-03 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register03');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const email = form && form.elements.email;
  const avail = root.querySelector('[data-avail]');
  const badge = root.querySelector('[data-badge]');
  if (!form || !done || !email) return;

  
  const TAKEN = ['ana@example.com', 'hello@example.com', 'taken@example.com'];
  const DELAY = 600;
  let state = 'idle'; 
  let timer = 0;
  let checked = '';

  const setAvail = (s, text) => {
    state = s;
    avail.className = `cl-register03__avail${s === 'idle' ? '' : ` is-${s}`}`;
    badge.className = `cl-register03__badge${s === 'idle' ? '' : ` is-${s}`}`;
    avail.textContent = text;
  };

  const lookup = () => {
    clearTimeout(timer);
    const v = email.value.trim().toLowerCase();
    if (!v || !email.validity.valid) { setAvail('idle', ''); checked = ''; return; }
    if (v === checked && state !== 'checking') return;
    setAvail('checking', 'Checking availability…');
    timer = setTimeout(() => {
      checked = v;
      if (TAKEN.includes(v)) setAvail('taken', 'That email already has a Folio notebook. Sign in instead?');
      else setAvail('ok', 'Good news: that email is free to use.');
    }, DELAY);
  };
  email.addEventListener('input', () => {
    clearTimeout(timer);
    if (state !== 'idle') setAvail('idle', '');
    timer = setTimeout(lookup, 500); 
  });
  email.addEventListener('blur', lookup);

  const messageFor = (el) => {
    if (el.type === 'checkbox') return el.checked ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'That email looks incomplete — check the part after the @.';
    if (el.minLength > 0 && el.value.length < el.minLength) return `A few more characters, please (${el.minLength} minimum).`;
    return '';
  };
  const check = (field) => {
    const el = field.querySelector('input');
    const msg = messageFor(el);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !msg;
  };
  const fields = Array.from(form.querySelectorAll('[data-field]'));
  fields.forEach((field) => {
    field.addEventListener('focusout', (e) => {
      const el = field.querySelector('input');
      if (field.contains(e.relatedTarget) || (e.relatedTarget && e.relatedTarget.matches('button')) || el.type === 'checkbox' || !el.value) return;
      field.dataset.touched = '1';
      check(field);
    });
    field.addEventListener('input', () => { if (field.dataset.touched) check(field); });
    field.addEventListener('change', () => { if (field.dataset.touched) check(field); });
  });

  root.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = bad.length === 1 ? 'One thing to fix before we continue.' : `${bad.length} things to fix before we continue.`;
      bad[0].querySelector('input').focus();
      return;
    }
    if (state === 'taken') {
      live.textContent = 'That email already has an account. Sign in, or use a different email.';
      email.focus();
      return;
    }
    if (state !== 'ok') {
      lookup();
      live.textContent = 'Checking your email first…';
      setTimeout(() => { if (state === 'ok') form.requestSubmit(); else if (state === 'taken') email.focus(); }, DELAY + 50);
      return;
    }
    const name = form.elements.name.value.trim();
    root.querySelector('[data-done-title]').textContent = `Welcome, ${name}.`;
    root.querySelector('[data-done-text]').textContent = `Your first notebook is ready. We sent a note to ${email.value.trim()} so you can find your way back${form.elements.letters.checked ? ', and the first monthly letter arrives on the 1st' : ''}.`;
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
})();

