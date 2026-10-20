/*!
 * registration-page-07 - Colorlib. No jQuery, no framework.
 * Behaviours: select-font-settle, own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register07');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const rows = root.querySelector('[data-rows]');
  const tpl = root.querySelector('[data-row-template]');
  const addBtn = root.querySelector('[data-add]');
  const limit = root.querySelector('[data-limit]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  if (!form || !rows || !tpl || !done) return;
  const MAX = 8;
  const COLORS = ['#6d28d9', '#be185d', '#0e7490', '#a16207', '#15803d', '#c2410c', '#4338ca', '#0f766e'];
  let uid = 0;

  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
  const initials = (s) => {
    const base = s.includes('@') ? s.split('@')[0].replace(/[._-]+/g, ' ') : s;
    return base.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';
  };

  
  const preview = () => {
    const ws = form.elements.workspace.value.trim();
    const s = slug(ws) || 'your-team';
    root.querySelector('[data-url]').textContent = `huddle.so/${s}`;
    root.querySelector('[data-ws-url]').textContent = `huddle.so/${s}`;
    root.querySelector('[data-ws-name]').textContent = ws || 'Your team';
    root.querySelector('[data-ws-initial]').textContent = ws ? ws.charAt(0).toUpperCase() : '?';
    const people = [form.elements.name.value.trim() || form.elements.email.value.trim() || 'You'];
    rows.querySelectorAll('[data-invite-email]').forEach((el) => { if (el.value.trim()) people.push(el.value.trim()); });
    const list = root.querySelector('[data-avatars]');
    list.innerHTML = '';
    people.slice(0, 6).forEach((p, i) => {
      const li = document.createElement('li');
      li.style.background = COLORS[i % COLORS.length];
      li.textContent = initials(p);
      li.title = p;
      list.append(li);
    });
    const n = people.length - 1;
    root.querySelector('[data-count]').textContent = n ? `You + ${n} teammate${n === 1 ? '' : 's'}` : 'Just you so far';
  };

  
  const relabel = () => {
    const all = Array.from(rows.querySelectorAll('[data-row]'));
    all.forEach((row, i) => {
      const email = row.querySelector('[data-invite-email]').value.trim();
      row.querySelector('[data-email-label]').textContent = `Teammate ${i + 1} email`;
      row.querySelector('[data-role-label]').textContent = `Teammate ${i + 1} role`;
      row.querySelector('[data-remove]').setAttribute('aria-label', `Remove teammate ${i + 1}${email ? `, ${email}` : ''}`);
    });
    const full = all.length >= MAX;
    addBtn.disabled = full;
    limit.hidden = !full;
  };

  const addRow = (focus) => {
    const count = rows.querySelectorAll('[data-row]').length;
    if (count >= MAX) return;
    const row = tpl.content.firstElementChild.cloneNode(true);
    uid += 1;
    const eId = `cl-register07-inv-${uid}`;
    const rId = `cl-register07-role-${uid}`;
    const errId = `cl-register07-inv-err-${uid}`;
    const email = row.querySelector('[data-invite-email]');
    email.id = eId;
    email.setAttribute('aria-describedby', errId);
    row.querySelector('[data-email-label]').htmlFor = eId;
    row.querySelector('[data-invite-role]').id = rId;
    row.querySelector('[data-role-label]').htmlFor = rId;
    row.querySelector('[data-error]').id = errId;
    email.addEventListener('input', () => { preview(); relabel(); if (row.classList.contains('is-error')) checkRow(row); });
    email.addEventListener('blur', (e) => {
      if (e.relatedTarget && e.relatedTarget.matches('button')) return; 
      if (email.value.trim()) checkRow(row);
    });
    row.querySelector('[data-remove]').addEventListener('click', () => removeRow(row));
    rows.append(row);
    relabel();
    if (focus) {
      email.focus();
      live.textContent = `Teammate ${count + 1} added.`;
    }
  };

  const removeRow = (row) => {
    const all = Array.from(rows.querySelectorAll('[data-row]'));
    const i = all.indexOf(row);
    row.remove();
    if (!rows.querySelector('[data-row]')) addRow(false);
    relabel();
    preview();
    live.textContent = `Teammate ${i + 1} removed.`;
    const left = Array.from(rows.querySelectorAll('[data-row]'));
    const target = left[i] || left[left.length - 1];
    (target ? target.querySelector('[data-remove]') : addBtn).focus();
  };

  const checkRow = (row) => {
    const email = row.querySelector('[data-invite-email]');
    const v = email.value.trim().toLowerCase();
    let msg = '';
    if (v) {
      if (!email.validity.valid) msg = 'Enter a full email address, like sam@company.com.';
      else if (v === form.elements.email.value.trim().toLowerCase()) msg = 'That’s your own email — you’re already in.';
      else {
        const before = Array.from(rows.querySelectorAll('[data-invite-email]')).slice(0, Array.from(rows.children).indexOf(row));
        if (before.some((el) => el.value.trim().toLowerCase() === v)) msg = 'This teammate is already on the list.';
      }
    }
    row.querySelector('[data-error]').textContent = msg;
    row.classList.toggle('is-error', !!msg);
    if (msg) email.setAttribute('aria-invalid', 'true'); else email.removeAttribute('aria-invalid');
    return !msg;
  };

  addBtn.addEventListener('click', () => addRow(true));

  
  const messageFor = (el) => {
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email address like name@company.com.';
    if (el.minLength > 0 && el.value.length < el.minLength) return el.name === 'password' ? `Use at least ${el.minLength} characters.` : 'That name is a little short.';
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
    field.addEventListener('input', () => { preview(); if (field.dataset.touched) check(field); });
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
    const badRows = Array.from(rows.querySelectorAll('[data-row]')).filter((row) => !checkRow(row));
    const total = bad.length + badRows.length;
    if (total) {
      live.textContent = `${total} ${total === 1 ? 'thing needs' : 'things need'} fixing before we create the workspace.`;
      (bad[0] ? bad[0].querySelector('input') : badRows[0].querySelector('[data-invite-email]')).focus();
      return;
    }
    const invites = Array.from(rows.querySelectorAll('[data-invite-email]')).filter((el) => el.value.trim());
    const f = form.elements;
    root.querySelector('[data-done-title]').textContent = `${f.workspace.value.trim()} is ready`;
    root.querySelector('[data-done-text]').textContent = invites.length
      ? `We sent ${invites.length} invite${invites.length === 1 ? '' : 's'}. Your first stand-up goes out tomorrow at 9:30 from huddle.so/${slug(f.workspace.value)}.`
      : `No invites yet — you can add teammates from Settings. Your workspace lives at huddle.so/${slug(f.workspace.value)}.`;
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  addRow(false);
  addRow(false);
  preview();
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
