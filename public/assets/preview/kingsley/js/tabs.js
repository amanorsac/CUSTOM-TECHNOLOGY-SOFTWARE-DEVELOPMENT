// Accessible tabs for .ka-tabs[data-tabs]. The server markup is a list of
// in-page links plus every panel, so it reads fine with JS off; this turns the
// links into a WAI-ARIA tablist (click, ArrowLeft/Right, Home, End).
// Idempotent: safe to call on load and after every page swap.
const done = new WeakSet();

export function initTabs(root = document) {
  if (!root) return;
  for (const el of root.querySelectorAll('[data-tabs]')) {
    if (done.has(el)) continue;
    done.add(el);
    const list = el.querySelector('.ka-tabs__list');
    const links = list ? [...list.querySelectorAll('a')] : [];
    const panels = links.map((a) => el.querySelector(a.getAttribute('href')));
    if (!links.length || panels.some((p) => !p)) continue;

    list.setAttribute('role', 'tablist');
    list.querySelectorAll('li').forEach((li) => li.setAttribute('role', 'presentation'));
    el.classList.add('is-ready');

    const select = (i, focus) => {
      links.forEach((a, n) => {
        const on = n === i;
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        a.tabIndex = on ? 0 : -1;
        panels[n].hidden = !on;
      });
      if (focus) links[i].focus();
    };

    links.forEach((a, i) => {
      a.setAttribute('role', 'tab');
      a.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      a.addEventListener('click', (e) => {
        e.preventDefault();
        select(i, false);
      });
      a.addEventListener('keydown', (e) => {
        const n = links.length;
        let to = null;
        if (e.key === 'ArrowRight') to = (i + 1) % n;
        else if (e.key === 'ArrowLeft') to = (i - 1 + n) % n;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = n - 1;
        if (to === null) return;
        e.preventDefault();
        select(to, true);
      });
    });
    select(0, false);
  }
}
