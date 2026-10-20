/*!
 * registration-page-09 - Colorlib. No jQuery, no framework.
 * Behaviours: select-font-settle, own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register09');
  if (!root) return;
  const stepPhone = root.querySelector('[data-step="phone"]');
  const stepCode = root.querySelector('[data-step="code"]');
  const done = root.querySelector('[data-success]');
  const live = root.querySelector('[data-live]');
  const back = root.querySelector('[data-back]');
  const progress = root.querySelector('[data-progress]');
  const bar = root.querySelector('[data-bar]');
  const stepnum = root.querySelector('[data-stepnum]');
  const cc = root.querySelector('[data-cc]');
  const phone = stepPhone && stepPhone.elements.phone;
  const code = stepCode && stepCode.elements.code;
  const resend = root.querySelector('[data-resend]');
  const count = root.querySelector('[data-count]');
  const verify = root.querySelector('[data-verify]');
  if (!stepPhone || !stepCode || !done || !phone || !code) return;
  const WAIT = 30;
  let tick = 0;
  let fullNumber = '';

  
  const national = () => phone.value.replace(/\D/g, '').replace(/^0+/, '');
  const opt = () => cc.options[cc.selectedIndex];
  const pretty = () => {
    const d = national();
    const groups = d.length > 6 ? [d.slice(0, d.length - 6), d.slice(-6, -3), d.slice(-3)] : [d];
    return `+${cc.value} ${groups.join(' ')}`;
  };

  const messageFor = (el) => {
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el === phone) {
      if (/[^0-9 ()+\-]/.test(el.value)) return 'Use digits only, like the example.';
      const lens = opt().dataset.len.split(',').map(Number);
      if (!lens.includes(national().length)) return `That doesn’t look like a ${opt().textContent.split(' ')[0]} mobile number. Example: ${opt().dataset.example}.`;
    }
    if (el === code) {
      if (!/^\d{6}$/.test(val)) return 'Codes are 6 digits.';
    }
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
  root.querySelectorAll('[data-field]').forEach((field) => {
    field.addEventListener('input', () => { if (field.classList.contains('is-error')) check(field); });
  });
  cc.addEventListener('change', () => {
    phone.placeholder = opt().dataset.example;
    const field = phone.closest('[data-field]');
    if (field.classList.contains('is-error')) check(field);
  });
  code.addEventListener('input', () => {
    const digits = code.value.replace(/\D/g, '').slice(0, 6);
    if (digits !== code.value) code.value = digits;
    if (digits.length === 6) stepCode.requestSubmit();
  });

  const setStep = (n) => {
    progress.setAttribute('aria-valuenow', String(n));
    progress.setAttribute('aria-valuetext', n === 1 ? 'Step 1 of 2: your number' : 'Step 2 of 2: verify');
    bar.style.width = n === 1 ? '50%' : '100%';
    stepnum.textContent = `${n} / 2`;
    back.hidden = n !== 2;
  };

  const startTimer = () => {
    let left = WAIT;
    resend.disabled = true;
    count.hidden = false;
    const render = () => { count.textContent = `in 0:${String(left).padStart(2, '0')}`; };
    render();
    clearInterval(tick);
    tick = setInterval(() => {
      left -= 1;
      if (left <= 0) { clearInterval(tick); resend.disabled = false; count.hidden = true; return; }
      render();
    }, 1000);
  };

  stepPhone.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = Array.from(stepPhone.querySelectorAll('[data-field]'));
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = bad.map((f) => f.querySelector('[data-error]').textContent).join(' ');
      bad[0].querySelector('input').focus();
      return;
    }
    fullNumber = pretty();
    root.querySelector('[data-number]').textContent = fullNumber;
    stepPhone.hidden = true;
    stepCode.hidden = false;
    setStep(2);
    startTimer();
    live.textContent = `Code sent to ${fullNumber}.`;
    code.focus();
  });

  const backToPhone = () => {
    clearInterval(tick);
    stepCode.reset();
    const f = stepCode.querySelector('[data-field]');
    f.classList.remove('is-error');
    f.querySelector('[data-error]').textContent = '';
    code.removeAttribute('aria-invalid');
    stepCode.hidden = true;
    stepPhone.hidden = false;
    setStep(1);
    live.textContent = 'Change your number.';
    phone.focus();
    phone.select();
  };
  back.addEventListener('click', backToPhone);
  root.querySelector('[data-change]').addEventListener('click', backToPhone);
  resend.addEventListener('click', () => {
    code.value = '';
    startTimer();
    live.textContent = `A new code is on its way to ${fullNumber}.`;
    code.focus();
  });

  let busy = false;
  stepCode.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const field = stepCode.querySelector('[data-field]');
    if (!check(field)) { live.textContent = field.querySelector('[data-error]').textContent; code.focus(); return; }
    busy = true;
    verify.setAttribute('aria-disabled', 'true');
    verify.textContent = 'Checking…';
    setTimeout(() => {
      busy = false;
      verify.removeAttribute('aria-disabled');
      verify.textContent = 'Verify and create account';
      if (code.value === '000000') {
        field.classList.add('is-error');
        const msg = 'That code didn’t match. Check the latest text, or resend.';
        field.querySelector('[data-error]').textContent = msg;
        code.setAttribute('aria-invalid', 'true');
        live.textContent = msg;
        code.select();
        return;
      }
      clearInterval(tick);
      root.querySelector('[data-done-title]').textContent = `You’re all set, ${stepPhone.elements.name.value.trim()}!`;
      stepCode.hidden = true;
      back.hidden = true;
      progress.setAttribute('aria-valuetext', 'Complete');
      live.textContent = '';
      done.hidden = false;
      done.focus();
    }, 500);
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
