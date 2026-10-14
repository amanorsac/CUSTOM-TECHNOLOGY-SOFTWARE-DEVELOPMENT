// Records one of the three Virtual Assistant events (call_click, form_start, signup_complete). Never throws,
// never delays the visitor: tracking is best effort.
export function track(event) {
  try {
    fetch('/api/event', {
      method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event, page: location.pathname }),
    }).catch(() => {});
  } catch { /* ignore */ }
}

// Every link to the demo number records a call_click.
export function trackCallLinks(root = document) {
  root.querySelectorAll('a[href^="tel:"]').forEach((a) => a.addEventListener('click', () => track('call_click')));
}
