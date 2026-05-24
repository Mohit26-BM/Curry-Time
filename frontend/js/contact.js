document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  // Pre-fill name/email when logged in
  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.user) return;
      var u = data.user;
      var fn = form.querySelector('[name="first_name"]');
      var ln = form.querySelector('[name="last_name"]');
      var em = form.querySelector('[name="email"]');
      if (fn) fn.value = u.first_name;
      if (ln) ln.value = u.last_name;
      if (em) em.value = u.email;
    })
    .catch(function () {});

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });

    try {
      var res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      var json = await res.json();
      if (json.success) {
        showToast(json.message);
        form.reset();
      } else {
        showToast(json.message || 'Something went wrong', 'error');
      }
    } catch (_) {
      showToast('Network error — please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
});
