/*!
 * registration-page-01 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register01');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const pw = form && form.elements.password;
  const meter = root.querySelector('[data-meter]');
  const strength = root.querySelector('[data-strength]');
  if (!form || !done || !pw) return;

  const RULES = {
    length: (v) => v.length >= 8,
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    number: (v) => /\d/.test(v),
    symbol: (v) => /[^A-Za-z0-9]/.test(v)
  };
  const NAMES = { length: '8 or more characters', case: 'upper and lower case', number: 'a number', symbol: 'a symbol' };
  const LEVELS = ['not set', 'weak', 'fair', 'good', 'strong'];
  const ruleEls = Array.from(root.querySelectorAll('[data-rule]'));

  
  const rate = () => {
    const v = pw.value;
    const missing = [];
    ruleEls.forEach((li) => {
      const ok = RULES[li.dataset.rule](v);
      li.classList.toggle('is-met', ok);
      li.querySelector('[data-state]').textContent = ok ? ', met' : ', not met';
      if (!ok) missing.push(NAMES[li.dataset.rule]);
    });
    let level = v ? 4 - missing.length : 0;
    if (v && level === 0) level = 1;
    if (level === 4 && v.length < 10) level = 3; 
    if (meter.dataset.level !== String(level)) {
      meter.dataset.level = String(level);
      strength.textContent = `Strength: ${LEVELS[level]}`;
    }
    return missing;
  };

  const messageFor = (el) => {
    if (el.type === 'checkbox') return el.checked ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email address like name@example.com.';
    if (el === pw) {
      const missing = rate();
      return missing.length ? `Your password still needs ${missing.join(', ')}.` : '';
    }
    if (el.minLength > 0 && val.length < el.minLength) return 'That looks too short.';
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
  pw.addEventListener('input', rate);

  root.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  root.querySelector('[data-social]').addEventListener('click', () => {
    live.textContent = 'Demo — Google sign-up is not connected here. Use the email form below.';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = bad.length === 1 ? 'One field needs attention.' : `${bad.length} fields need attention.`;
      bad[0].querySelector('input').focus();
      return;
    }
    const first = form.elements.name.value.trim().split(/\s+/)[0];
    root.querySelector('[data-done-title]').textContent = `Welcome to Tally, ${first}`;
    root.querySelector('[data-done-text]').textContent = `We sent a confirmation link to ${form.elements.email.value.trim()}. Three quick steps and you can send your first invoice:`;
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
})();

