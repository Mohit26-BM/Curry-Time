document.addEventListener('DOMContentLoaded', function () {
  var loginForm  = document.getElementById('login-form');
  var signupForm = document.getElementById('signup-form');

  // ── Login ──────────────────────────────────────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in…';

      var data = {};
      new FormData(loginForm).forEach(function (v, k) { data[k] = v; });

      try {
        var res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        var json = await res.json();
        if (json.success) {
          showToast('Welcome back, ' + json.user.first_name + '!');
          setTimeout(function () { window.location.href = '/'; }, 1200);
        } else {
          showToast(json.message || 'Login failed', 'error');
          btn.disabled = false;
          btn.textContent = 'Sign In';
        }
      } catch (_) {
        showToast('Network error — please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = signupForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating account…';

      var data = {};
      new FormData(signupForm).forEach(function (v, k) { data[k] = v; });

      if (data.password !== data.confirm_password) {
        showToast('Passwords do not match', 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
        return;
      }

      try {
        var res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        var json = await res.json();
        if (json.success) {
          showToast('Account created! Welcome to Curry Time!');
          setTimeout(function () { window.location.href = '/'; }, 1500);
        } else {
          showToast(json.message || 'Sign up failed', 'error');
          btn.disabled = false;
          btn.textContent = 'Create Account';
        }
      } catch (_) {
        showToast('Network error — please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }
});
