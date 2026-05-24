document.addEventListener('DOMContentLoaded', function () {
  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.user) return;
      var user = data.user;

      // Replace "Login" with first name + logout on click
      var loginLink = document.querySelector('.nav-login');
      if (loginLink) {
        loginLink.textContent = user.first_name;
        loginLink.title = 'Click to sign out';
        loginLink.href = '#';

        // Inject "My Bookings" link just before the login <li>
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '/my-reservations';
        a.textContent = 'My Bookings';
        if (window.location.pathname.includes('my-reservations')) a.className = 'active';
        li.appendChild(a);
        loginLink.parentElement.before(li);

        loginLink.addEventListener('click', function (e) {
          e.preventDefault();
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(function () {
            window.location.href = '/';
          });
        });
      }

      // Personalised hero greeting on the home page
      var eyebrow = document.querySelector('.hero-eyebrow');
      if (eyebrow) eyebrow.textContent = 'Welcome back, ' + user.first_name + '!';
    })
    .catch(function () {});
});
