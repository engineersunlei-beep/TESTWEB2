/* ===========================================================
   Contact form → Google Apps Script
   ใช้ร่วมกันทั้งหน้าไทย (contact.html) และอังกฤษ (en/contact.html)
   =========================================================== */
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  // ⚠️ วาง URL ของ Web app (ลงท้ายด้วย /exec) ที่ได้จากตอน Deploy ตรงนี้
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwzDe5Wsx326pFP5-v8Y4Vz4DmNnCSLdx0N1Nx1NZSOGOXA_Zms2mko29LnXHf0IiYZCw/exec';

  var isThai = (document.documentElement.lang || 'th').indexOf('th') === 0;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');

  var text = {
    sending: isThai ? 'กำลังส่งข้อมูล...' : 'Sending...',
    success: form.getAttribute('data-success-text') ||
             (isThai ? 'ขอบคุณสำหรับข้อมูล ทีมงานจะติดต่อกลับโดยเร็วที่สุด'
                     : 'Thank you. Our team will get back to you as soon as possible.'),
    error:   isThai ? 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือโทรติดต่อเราโดยตรง'
                    : 'Something went wrong. Please try again, or call us directly.',
    notReady: isThai ? 'ยังไม่ได้ตั้งค่าปลายทางของฟอร์ม (ENDPOINT)'
                     : 'The form endpoint has not been configured yet.'
  };

  // ช่องดักบอท: ซ่อนไว้ คนจริงไม่เห็นและไม่กรอก บอทมักกรอกทุกช่อง
  var trap = document.createElement('input');
  trap.type = 'text';
  trap.name = 'website';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true');
  trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
  form.appendChild(trap);

  function setStatus(msg, isError) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? 'var(--orange-dark)' : 'var(--steel)';
  }

  // ใช้ capture + stopImmediatePropagation เพื่อไม่ให้ตัวจัดการฟอร์มเดิมใน main.js
  // (ที่แค่โชว์ข้อความสำเร็จโดยไม่ได้ส่งอะไร) ทำงานซ้อนกับอันนี้
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (ENDPOINT.indexOf('PASTE_YOUR') === 0) {
      setStatus(text.notReady, true);
      return;
    }

    var data = new FormData(form);
    data.append('lang', document.documentElement.lang || '');
    data.append('page', window.location.href);

    button.disabled = true;
    setStatus(text.sending, false);

    fetch(ENDPOINT, { method: 'POST', body: data })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || !json.ok) throw new Error((json && json.error) || 'failed');
        setStatus(text.success, false);
        form.reset();
      })
      .catch(function () {
        setStatus(text.error, true);
      })
      .then(function () {
        button.disabled = false;
      });
  }, true);
})();