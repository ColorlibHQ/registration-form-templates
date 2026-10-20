/*!
 * registration-page-05 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register05');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const lines = root.querySelector('[data-lines]');
  const totalEl = root.querySelector('[data-total]');
  const live = root.querySelector('[data-live]');
  const card = root.querySelector('[data-sum-card]');
  const done = root.querySelector('[data-success]');
  const qty = form && form.elements.qty;
  const promoInput = root.querySelector('#cl-register05-promo');
  const promoMsg = root.querySelector('[data-promo-msg]');
  if (!form || !done || !qty) return;

  const CODES = { FRIEND10: 0.1 };
  const MIN = 1;
  const MAX = 5;
  let discount = 0;
  let codeUsed = '';
  const euro = (n) => `€${n.toLocaleString('en-IE', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

  
  const render = () => {
    const n = Math.min(MAX, Math.max(MIN, parseInt(qty.value, 10) || MIN));
    const ticket = form.querySelector('input[name="ticket"]:checked');
    const rows = [];
    let sum = 0;
    if (ticket) {
      const p = Number(ticket.dataset.price);
      rows.push([`${n} × ${ticket.value} ticket`, p * n]);
      sum += p * n;
    }
    [['workshop', 'Workshop'], ['recordings', 'Recordings']].forEach(([name, label]) => {
      const box = form.elements[name];
      if (box.checked) {
        const p = Number(box.dataset.price);
        rows.push([`${n} × ${label}`, p * n]);
        sum += p * n;
      }
    });
    const off = Math.round(sum * discount * 100) / 100;
    lines.innerHTML = '';
    if (!rows.length) rows.push(['Choose a ticket', null]);
    rows.forEach(([label, amount]) => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><span></span>';
      li.children[0].textContent = label;
      li.children[1].textContent = amount === null ? '—' : euro(amount);
      lines.append(li);
    });
    if (off) {
      const li = document.createElement('li');
      li.className = 'cl-register05__lines-off is-discount';
      li.innerHTML = '<span></span><span></span>';
      li.children[0].textContent = `${codeUsed} (−${discount * 100}%)`;
      li.children[1].textContent = `−${euro(off)}`;
      lines.append(li);
    }
    totalEl.textContent = euro(sum - off);
    root.querySelector('[data-qty="-1"]').disabled = n <= MIN;
    root.querySelector('[data-qty="1"]').disabled = n >= MAX;
    return sum - off;
  };

  root.querySelectorAll('[data-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = Math.min(MAX, Math.max(MIN, (parseInt(qty.value, 10) || MIN) + Number(btn.dataset.qty)));
      qty.value = String(n);
      render();
      if (btn.disabled) qty.focus(); 
    });
  });
  qty.addEventListener('change', () => {
    qty.value = String(Math.min(MAX, Math.max(MIN, parseInt(qty.value, 10) || MIN)));
    render();
  });
  form.addEventListener('change', render);

  const applyPromo = () => {
    const code = promoInput.value.trim().toUpperCase();
    promoMsg.className = 'cl-register05__promo-msg';
    if (!code) { promoMsg.textContent = 'Enter a code first.'; promoMsg.classList.add('is-bad'); return; }
    if (CODES[code]) {
      discount = CODES[code];
      codeUsed = code;
      promoMsg.textContent = `${code} applied: ${discount * 100}% off.`;
      promoMsg.classList.add('is-ok');
    } else {
      discount = 0;
      codeUsed = '';
      promoMsg.textContent = `${code} isn’t a valid code.`;
      promoMsg.classList.add('is-bad');
    }
    render();
  };
  root.querySelector('[data-promo]').addEventListener('click', applyPromo);
  promoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });

  
  const messageFor = (field) => {
    if (field.hasAttribute('data-group')) {
      return field.querySelector('input:checked') ? '' : field.querySelector('input[required]').dataset.msg;
    }
    const el = field.querySelector('input, textarea');
    if (el.type === 'checkbox') return el.checked || !el.required ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email like name@example.com.';
    return '';
  };
  const check = (field) => {
    const msg = messageFor(field);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    field.querySelectorAll('input, textarea').forEach((el) => { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
    return !msg;
  };
  const fields = Array.from(form.querySelectorAll('[data-field]'));
  fields.forEach((field) => {
    field.addEventListener('focusout', (e) => {
      const el = field.querySelector('input, textarea');
      if (field.contains(e.relatedTarget) || (e.relatedTarget && e.relatedTarget.matches('button')) || field.hasAttribute('data-group') || el.type === 'checkbox' || !el.value) return;
      field.dataset.touched = '1';
      check(field);
    });
    field.addEventListener('input', () => { if (field.dataset.touched) check(field); });
    field.addEventListener('change', () => { if (field.dataset.touched) check(field); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = `Almost there. ${bad.length} item${bad.length === 1 ? ' needs' : 's need'} your attention in the form.`;
      bad[0].querySelector('input:not([disabled]), textarea').focus();
      return;
    }
    const total = render();
    const n = qty.value;
    const ref = `FL26-${String(Math.floor(1000 + Math.random() * 9000))}`;
    root.querySelector('[data-ref]').textContent = `Order ${ref}`;
    root.querySelector('[data-done-title]').textContent = `See you in Lisbon, ${form.elements.first.value.trim()}!`;
    root.querySelector('[data-done-text]').textContent = `${n} ticket${n === '1' ? '' : 's'} booked, ${euro(total)} in total. Your QR ${n === '1' ? 'badge is' : 'badges are'} on the way to ${form.elements.email.value.trim()}.`;
    live.textContent = '';
    card.hidden = true;
    form.querySelectorAll('input, textarea, button').forEach((el) => { el.disabled = true; });
    done.hidden = false;
    done.focus();
  });

  render();
})();

