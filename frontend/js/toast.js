function showToast(message, type) {
  var existing = document.getElementById('ct-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'ct-toast';
  var bg = type === 'error' ? '#c0522a' : '#1a7a50';
  toast.setAttribute(
    'style',
    'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:' + bg + ';color:#fff;padding:14px 28px;border-radius:8px;' +
      'font-size:0.92rem;font-weight:600;z-index:9999;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.25);animation:ct-slide .3s ease'
  );
  toast.textContent = message;

  if (!document.getElementById('ct-toast-style')) {
    var s = document.createElement('style');
    s.id = 'ct-toast-style';
    s.textContent =
      '@keyframes ct-slide{from{opacity:0;transform:translateX(-50%) translateY(16px)}' +
      'to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(function () {
    if (toast.parentNode) toast.remove();
  }, 4000);
}
