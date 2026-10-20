/*!
 * registration-page-08 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const root = document.querySelector('.cl-register08');
  if (!root) return;
  const form = root.querySelector('[data-form]');
  const live = root.querySelector('[data-live]');
  const done = root.querySelector('[data-success]');
  const file = root.querySelector('[data-file]');
  const img = root.querySelector('[data-avatar-img]');
  const initialsEl = root.querySelector('[data-initials]');
  const removeBtn = root.querySelector('[data-remove]');
  const uploadLabel = root.querySelector('[data-upload-label]');
  const chipsField = root.querySelector('[data-chips]');
  const chipCount = root.querySelector('[data-chip-count]');
  if (!form || !done || !file || !chipsField) return;

  const MAX_MB = 2;
  const MIN_TOPICS = 3;
  let photoUrl = '';

  const initials = () => {
    const name = form.elements.name.value.trim();
    return name ? name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') : '?';
  };
  form.elements.name.addEventListener('input', () => { initialsEl.textContent = initials(); });

  
  const handle = form.elements.handle;
  let handleEdited = false;
  handle.addEventListener('input', () => {
    handleEdited = true;
    const clean = handle.value.toLowerCase().replace(/[\s.-]+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (clean !== handle.value) handle.value = clean;
  });
  form.elements.name.addEventListener('input', () => {
    if (handleEdited) return;
    handle.value = form.elements.name.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20);
  });

  
  const fileField = file.closest('[data-field]');
  const setPhotoError = (msg) => {
    fileField.querySelector('[data-error]').textContent = msg;
    if (msg) file.setAttribute('aria-invalid', 'true'); else file.removeAttribute('aria-invalid');
  };
  const clearPhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = '';
    img.hidden = true;
    img.removeAttribute('src');
    removeBtn.hidden = true;
    uploadLabel.textContent = 'Add a profile photo';
  };
  file.addEventListener('change', () => {
    const f = file.files && file.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(f.type)) {
      setPhotoError(`${f.name} isn’t a JPG, PNG or WebP image.`);
      file.value = '';
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setPhotoError(`${f.name} is ${(f.size / 1048576).toFixed(1)} MB. Please choose one under ${MAX_MB} MB.`);
      file.value = '';
      return;
    }
    setPhotoError('');
    clearPhoto();
    photoUrl = URL.createObjectURL(f);
    img.src = photoUrl;
    img.hidden = false;
    removeBtn.hidden = false;
    uploadLabel.textContent = 'Change photo';
    live.textContent = `Profile photo added: ${f.name}.`;
  });
  removeBtn.addEventListener('click', () => {
    clearPhoto();
    file.value = '';
    live.textContent = 'Profile photo removed.';
    file.focus();
  });

  
  const topics = Array.from(chipsField.querySelectorAll('input'));
  const chosen = () => topics.filter((t) => t.checked);
  const updateCount = () => {
    const n = chosen().length;
    chipCount.textContent = n >= MIN_TOPICS ? `${n} chosen` : `Pick at least ${MIN_TOPICS} (${n} so far)`;
    chipCount.classList.toggle('is-done', n >= MIN_TOPICS);
  };
  topics.forEach((t) => t.addEventListener('change', () => { updateCount(); if (chipsField.classList.contains('is-error')) check(chipsField); }));

  const messageFor = (field) => {
    if (field === chipsField) {
      const n = chosen().length;
      return n >= MIN_TOPICS ? '' : `Choose ${MIN_TOPICS - n} more topic${MIN_TOPICS - n === 1 ? '' : 's'} so we can tailor your feed.`;
    }
    const el = field.querySelector('input');
    const val = el.value.trim();
    if (el.required && !val) return el.dataset.msg || 'This field is required.';
    if (el.validity.typeMismatch) return 'Enter an email like name@example.com.';
    if (el.minLength > 0 && el.value.length < el.minLength) return el.name === 'password' ? `Use at least ${el.minLength} characters.` : `At least ${el.minLength} characters.`;
    if (el.validity.patternMismatch) return el.dataset.pattern || 'Check the format.';
    return '';
  };
  const check = (field) => {
    const msg = messageFor(field);
    field.querySelector('[data-error]').textContent = msg;
    field.classList.toggle('is-error', !!msg);
    if (field !== chipsField) {
      const el = field.querySelector('input');
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
    return !msg;
  };
  const fields = Array.from(form.querySelectorAll('[data-field]')).filter((f) => !f.hasAttribute('data-file-field'));
  fields.forEach((field) => {
    if (field === chipsField) return;
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fields.forEach((f) => { f.dataset.touched = '1'; });
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      live.textContent = `${bad.length} ${bad.length === 1 ? 'thing' : 'things'} to sort out before you join.`;
      bad[0].querySelector('input').focus();
      return;
    }
    const av = root.querySelector('[data-done-avatar]');
    av.textContent = '';
    if (photoUrl) {
      const pic = document.createElement('img');
      pic.src = photoUrl;
      pic.alt = '';
      av.append(pic);
    } else {
      av.textContent = initials();
    }
    root.querySelector('[data-done-title]').textContent = `Welcome to the flock, @${handle.value}`;
    root.querySelector('[data-done-text]').textContent = form.elements.digest.checked
      ? 'Your first sightings digest arrives on Sunday. Your feed is tuned to:'
      : 'Your feed is tuned to:';
    const tags = root.querySelector('[data-done-tags]');
    tags.innerHTML = '';
    chosen().forEach((t) => { const li = document.createElement('li'); li.textContent = t.value; tags.append(li); });
    live.textContent = '';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  updateCount();
})();

