/*!
 * colorlib-regform-11 - Colorlib. No jQuery, no framework.
 * Behaviours: native-date, inline-handlers
 */
/* Functions this page's inline handlers call. */
function Tang(){
    var x = document.getElementById("quantity").value;
    if(parseInt(x) >= 0){
        document.getElementById("quantity").value = parseInt(x) +1;
    }
}

function Giam(){
    var x = document.getElementById("quantity").value;
    if(parseInt(x) >= 1){
        document.getElementById("quantity").value = parseInt(x) -1;
    }
}

(function () {
  'use strict';

  /* Date fields labelled only by their placeholder: text until focused. */
  document.querySelectorAll('input[data-date]').forEach(function (d) {
    d.addEventListener('focus', function () {
      if (d.type === 'date') return;
      d.type = 'date';
      try { d.showPicker(); } catch (e) {}
    });
    d.addEventListener('blur', function () { if (!d.value) d.type = 'text'; });
  });
  /* jQuery UI's trigger button, kept for its look: it opens the browser's picker. */
  document.querySelectorAll('.ui-datepicker-trigger').forEach(function (b) {
    var d = b.previousElementSibling;
    if (!d || d.tagName !== 'INPUT') return;
    b.addEventListener('click', function () { d.focus(); try { d.showPicker(); } catch (e) {} });
  });
  /* A check-out date can never be earlier than its check-in. */
  [['input-start', 'input-end'], ['input-start-2', 'input-end-2']].forEach(function (pair) {
    var a = document.getElementById(pair[0]), b = document.getElementById(pair[1]);
    if (!a || !b) return;
    a.addEventListener('change', function () {
      b.min = a.value;
      if (b.value && b.value < a.value) b.value = a.value;
    });
  });
})();
