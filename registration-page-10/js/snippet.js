/*!
 * registration-page-10 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const form = document.querySelector('.cl-register10');
  if (!form) return;
  const root = form;
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const seats = form.elements.seats;
  const account = root.querySelector('.cl-register10__account');
  const panel = root.querySelector('[data-plan-panel]');
  if (!done || !seats || !account || !panel) return;

  const TRIAL_DAYS = 14;
  const ANNUAL_DISCOUNT = 0.2;
  const MIN = 1;
  const MAX = 50;
  const gbp = (n) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
  const endText = trialEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const annual = () => form.elements.billing.value === 'annual';
  const seatCount = () => Math.min(MAX, Math.max(MIN, parseInt(seats.value, 10) || MIN));
  const perSeat = (monthly) => (annual() ? Math.round(monthly * (1 - ANNUAL_DISCOUNT) * 100) / 100 : monthly);

  
  const render = () => {
    root.querySelectorAll('input[name="plan"]').forEach((p) => {
      const el = root.querySelector(`[data-price-for="${p.value}"]`);
      el.innerHTML = '';
      const b = document.createElement('b');
      b.textContent = gbp(perSeat(Number(p.dataset.monthly)));
      el.append(b, document.createTextNode(annual() ? 'per seat / mo, yearly' : 'per seat / month'));
    });
    const plan = form.querySelector('input[name="plan"]:checked');
    const n = seatCount();
    const monthly = Number(plan.dataset.monthly);
    const each = perSeat(monthly);
    let total;
    if (annual()) {
      total = Math.round(each * n * 12 * 100) / 100;
      root.querySelector('[data-line]').textContent = `${plan.value}: ${n} seat${n === 1 ? '' : 's'} × ${gbp(each)} × 12 months`;
      root.querySelector('[data-total]').textContent = `${gbp(total)} / year`;
      root.querySelector('[data-saving]').textContent = `You save ${gbp(Math.round((monthly * n * 12 - total) * 100) / 100)} a year compared with monthly.`;
    } else {
      total = each * n;
      root.querySelector('[data-line]').textContent = `${plan.value}: ${n} seat${n === 1 ? '' : 's'} × ${gbp(each)}`;
      root.querySelector('[data-total]').textContent = `${gbp(total)} / month`;
      root.querySelector('[data-saving]').textContent = 'Switch to yearly billing to save 20%.';
    }
    root.querySelector('[data-trial]').textContent = `£0 today. Your trial ends on ${endText}; we’ll email you 3 days before and you won’t be charged unless you add a card.`;
    root.querySelector('[data-seat="-1"]').disabled = n <= MIN;
    root.querySelector('[data-seat="1"]').disabled = n >= MAX;
    return { plan: plan.value, n, total };
  };

  root.querySelectorAll('[data-seat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      seats.value = String(Math.min(MAX, Math.max(MIN, seatCount() + Number(btn.dataset.seat))));
      render();
      if (btn.disabled) seats.focus();
    });
  });
  seats.addEventListener('change', () => { seats.value = String(seatCount()); render(); });
  seats.addEventListener('input', () => { if (seats.value) render(); });
  form.addEventListener('change', (e) => { if (e.target.name === 'billing' || e.target.name === 'plan') render(); });

  
  const messageFor = (el) => {
    if (el.type === 'checkbox') return el.checked ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter a work email like name@company.com.';
    if (el.minLength > 0 && el.value.length < el.minLength) return `Use at least ${el.minLength} characters.`;
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
  const fields = Array.from(account.querySelectorAll('[data-field]'));
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
      live.textContent = `${bad.length} ${bad.length === 1 ? 'field needs' : 'fields need'} attention before your trial can start.`;
      bad[0].querySelector('input').focus();
      return;
    }
    const { plan, n, total } = render();
    root.querySelector('[data-done-title]').textContent = `Your ${plan} trial has started`;
    root.querySelector('[data-done-text]').textContent = `${form.elements.company.value.trim()} has ${n} seat${n === 1 ? '' : 's'} on ${plan} until ${endText}. After that it’s ${gbp(total)} ${annual() ? 'a year' : 'a month'} if you keep going. We sent the details to ${form.elements.email.value.trim()}.`;
    live.textContent = '';
    account.hidden = true;
    panel.hidden = true;
    done.hidden = false;
    done.focus();
  });

  render();
})();

