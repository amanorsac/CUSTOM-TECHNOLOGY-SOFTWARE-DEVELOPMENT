// Phone, tablet and small-laptop menu (<= 1179px, where the full header row
// would wrap to two lines): the header is one slim row with the logo
// and a Menu button; the button opens a panel with the page links and the
// social icons. On wider screens the button is hidden and the links sit in
// the header row as usual (site.css). The header lives outside #main, so this
// runs once; page swaps (ka:page) just close the panel.

export function initMenu() {
  const header = document.querySelector('.ka-header');
  const btn = header && header.querySelector('.ka-menu-btn');
  const panel = btn && document.getElementById(btn.getAttribute('aria-controls'));
  if (!btn || !panel || btn.dataset.kaMenu) return;
  btn.dataset.kaMenu = '1';

  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  function set(open, { focusButton = false } = {}) {
    btn.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-open', open);
    if (!open && focusButton) btn.focus();
  }

  btn.addEventListener('click', () => {
    const open = !isOpen();
    set(open);
    if (open) {
      const first = panel.querySelector('a[aria-current="page"]') || panel.querySelector('a');
      if (first) first.focus();
    }
  });
  // A link in the panel was chosen (the page swap or a new tab takes over).
  panel.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) set(false, { focusButton: header.contains(document.activeElement) });
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && e.target instanceof Node && !header.contains(e.target)) set(false);
  });
  // Tabbing out of the open menu closes it.
  header.addEventListener('focusout', (e) => {
    if (isOpen() && e.relatedTarget instanceof Node && !header.contains(e.relatedTarget)) set(false);
  });
  document.addEventListener('ka:page', () => set(false));
  // Growing past the breakpoint with the panel open: reset it.
  const wide = window.matchMedia('(min-width: 1180px)');
  const onWide = () => { if (wide.matches) set(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
}
