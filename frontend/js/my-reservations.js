document.addEventListener('DOMContentLoaded', async function () {
  var container = document.getElementById('reservations-container');

  // Protected — redirect to login if not authenticated
  var meRes;
  try {
    meRes = await fetch('/api/auth/session', { credentials: 'include' });
    if (!meRes.ok) { window.location.href = '/login'; return; }
  } catch (_) {
    window.location.href = '/login';
    return;
  }

  var { user } = await meRes.json();
  if (!user) { window.location.href = '/login'; return; }

  // Greet the user
  var greeting = document.getElementById('greeting');
  if (greeting) greeting.textContent = 'Your reservations, ' + user.first_name;

  // Fetch reservations
  try {
    var res = await fetch('/api/reservations/my', { credentials: 'include' });
    var json = await res.json();

    if (!json.success || json.reservations.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<p>You haven\'t made any reservations yet.</p>' +
        '<a href="/contact#book-table" class="btn btn-primary">Book a Table</a>' +
        '</div>';
      return;
    }

    // Booking details are visitor-typed text, so they are escaped before going into the page
    var esc = function (v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    };

    container.innerHTML = json.reservations.map(function (r) {
      var statusClass = 'status-' + r.status;
      var date = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
      });
      return (
        '<div class="res-card">' +
          '<div class="res-card-header">' +
            '<div>' +
              '<div class="res-date">' + esc(date) + ' &mdash; ' + esc(r.time) + '</div>' +
              '<div class="res-guests">' + esc(r.guests) + ' guest' + (r.guests > 1 ? 's' : '') + '</div>' +
            '</div>' +
            '<span class="res-status ' + esc(statusClass) + '">' + esc(r.status) + '</span>' +
          '</div>' +
          (r.special_requests
            ? '<p class="res-notes">' + esc(r.special_requests) + '</p>'
            : '') +
        '</div>'
      );
    }).join('');
  } catch (_) {
    container.innerHTML = '<p class="error-msg">Could not load reservations. Please try again.</p>';
  }
});
