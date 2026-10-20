/*!
 * registration-page-02 - Colorlib. No jQuery, no framework.
 * Behaviours: select-font-settle, own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register02');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const panels = Array.from(root.querySelectorAll('[data-panel]'));
  const items = Array.from(root.querySelectorAll('[data-step-item]'));
  const progress = root.querySelector('[data-progress]');
  const bar = root.querySelector('[data-bar]');
  const back = root.querySelector('[data-back]');
  const next = root.querySelector('[data-next]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const review = root.querySelector('[data-review]');
  if (!form || panels.length !== 4 || !done) return;
  const NAMES = ['Account', 'Profile', 'Plan', 'Review'];
  let step = 0;

  const messageFor = (field) => {
    if (field.hasAttribute('data-group')) {
      const first = field.querySelector('input');
      return field.querySelector('input:checked') ? '' : first.dataset.msg;
    }
    const el = field.querySelector('input, select');
    if (el.type === 'checkbox') return el.checked ? '' : el.dataset.msg;
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email like name@company.com.';
    if (el.minLength > 0 && el.value.length < el.minLength) return `Use at least ${el.minLength} characters (${el.minLength - el.value.length} more).`;
    return '';
  };
  const check = (field) => {
    const msg = messageFor(field);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    field.querySelectorAll('input, select').forEach((el) => { if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
    return !msg;
  };
  root.querySelectorAll('[data-field]').forEach((field) => {
    field.addEventListener('input', () => { if (field.classList.contains('is-error')) check(field); });
    field.addEventListener('change', () => { if (field.classList.contains('is-error')) check(field); });
  });

  root.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
    const input = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
    });
  });

  
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const buildReview = () => {
    const f = form.elements;
    const plan = form.querySelector('input[name="plan"]:checked');
    const rows = [
      ['Account', `${f.email.value.trim()} · password set (${f.password.value.length} characters)`, 0],
      ['Profile', `${f.first.value.trim()} ${f.last.value.trim()} · ${f.role.value} · team of ${form.querySelector('input[name="size"]:checked').value}`, 1],
      ['Plan', `${plan.value} · ${plan.dataset.price}`, 2]
    ];
    review.innerHTML = rows.map(([h, v, i]) => `<div class="cl-register02__rv"><div><h3>${h}</h3><p>${esc(v)}</p></div><button class="cl-register02__edit" type="button" data-edit="${i}" aria-label="Edit ${h}">Edit</button></div>`).join('');
  };
  review.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-edit]');
    if (btn) go(Number(btn.dataset.edit));
  });

  const go = (i) => {
    step = i;
    panels.forEach((p, k) => { p.hidden = k !== i; });
    items.forEach((li, k) => {
      li.classList.toggle('is-done', k < i);
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    const pct = (i + 1) * 25;
    bar.style.width = `${pct}%`;
    progress.setAttribute('aria-valuenow', String(pct));
    progress.setAttribute('aria-valuetext', `Step ${i + 1} of 4`);
    back.hidden = i === 0;
    next.textContent = i === 3 ? 'Create workspace' : 'Continue';
    if (i === 3) buildReview();
    live.textContent = `Step ${i + 1} of 4: ${NAMES[i]}`;
    panels[i].querySelector('[data-heading]').focus();
  };

  back.addEventListener('click', () => go(step - 1));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = Array.from(panels[step].querySelectorAll('[data-field]')).filter((f) => !f.parentElement.closest('[data-field]'));
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = bad.length === 1 ? bad.map((f) => f.querySelector('[data-error]').textContent)[0] : `${bad.length} fields need attention on this step.`;
      bad[0].querySelector('input, select').focus();
      return;
    }
    if (step < 3) { go(step + 1); return; }
    const f = form.elements;
    const plan = form.querySelector('input[name="plan"]:checked').value;
    root.querySelector('[data-done-title]').textContent = `You're in, ${f.first.value.trim()}`;
    root.querySelector('[data-done-text]').textContent = `Your ${plan} workspace is ready. We sent a confirmation to ${f.email.value.trim()}.`;
    items.forEach((li) => { li.classList.add('is-done'); li.removeAttribute('aria-current'); });
    bar.style.width = '100%';
    progress.setAttribute('aria-valuenow', '100');
    progress.setAttribute('aria-valuetext', 'Complete');
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
