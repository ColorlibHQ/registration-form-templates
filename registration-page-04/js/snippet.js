/*!
 * registration-page-04 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register04');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const user = form && form.elements.username;
  const status = root.querySelector('[data-status]');
  const suggest = root.querySelector('[data-suggest]');
  if (!form || !done || !user) return;

  
  const TAKEN = ['admin', 'root', 'api', 'www', 'dev', 'shipyard', 'support', 'test', 'deploy', 'preview'];
  const DELAY = 500;
  let state = 'idle';
  let timer = 0;

  const setStatus = (s, text) => {
    state = s;
    status.className = `cl-register04__status${s === 'idle' ? '' : ` is-${s}`}`;
    status.textContent = text;
  };

  const showSuggestions = (name) => {
    suggest.querySelectorAll('button').forEach((b) => b.remove());
    const year = new Date().getFullYear() % 100;
    [`${name}-${year}`, `${name}-hq`, `${name}-builds`].filter((s) => !TAKEN.includes(s)).forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cl-register04__chip';
      b.textContent = s;
      b.setAttribute('aria-label', `Use ${s}`);
      b.addEventListener('click', () => {
        user.value = s;
        user.focus();
        lookup();
      });
      suggest.append(b);
    });
    suggest.hidden = false;
  };

  const lookup = () => {
    clearTimeout(timer);
    suggest.hidden = true;
    const v = user.value;
    if (!v || !user.validity.valid) { setStatus('idle', ''); return; }
    setStatus('checking', `Checking @${v}…`);
    timer = setTimeout(() => {
      if (TAKEN.includes(v)) {
        setStatus('taken', `✗ @${v} is taken.`);
        showSuggestions(v);
      } else {
        setStatus('ok', `✓ shipyard.dev/@${v} is available`);
      }
    }, DELAY);
  };

  user.addEventListener('input', () => {
    const clean = user.value.toLowerCase().replace(/[\s_.]+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (clean !== user.value) user.value = clean;
    clearTimeout(timer);
    setStatus('idle', '');
    suggest.hidden = true;
    timer = setTimeout(lookup, 400);
  });

  const messageFor = (el) => {
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter a valid email address.';
    if (el.minLength > 0 && el.value.length < el.minLength) return el === user ? `Usernames are ${el.minLength}–39 characters.` : `Use at least ${el.minLength} characters.`;
    if (el.validity.patternMismatch) return el.dataset.pattern || 'Check the format.';
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
      if (field.contains(e.relatedTarget) || (e.relatedTarget && e.relatedTarget.matches('button')) || !el.value) return;
      field.dataset.touched = '1';
      check(field);
    });
    field.addEventListener('input', () => { if (field.dataset.touched) check(field); });
  });

  root.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  root.querySelectorAll('[data-provider]').forEach((btn) => {
    btn.addEventListener('click', () => { live.textContent = `Demo — ${btn.dataset.provider} sign-up is not connected here.`; });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = `${bad.length} field${bad.length === 1 ? ' needs' : 's need'} attention.`;
      bad[0].querySelector('input').focus();
      return;
    }
    if (state === 'taken') {
      live.textContent = `@${user.value} is taken. Pick another username.`;
      user.focus();
      return;
    }
    if (state !== 'ok') {
      lookup();
      live.textContent = 'Checking your username first…';
      setTimeout(() => { if (state === 'ok') form.requestSubmit(); else user.focus(); }, DELAY + 50);
      return;
    }
    root.querySelector('[data-done-title]').textContent = `Welcome aboard, @${user.value}`;
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
})();

