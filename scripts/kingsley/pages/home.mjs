// Home page. Placeholder until Task 7 builds the real one.
// The two play buttons are temporary (Task 5 player tests); Task 7 replaces them.
export function render({ layout }) {
  const btn = (id, title) =>
    `<button type="button" class="ka-btn" data-play="${id}" data-title="${title}" data-queue="deeper-worship">Play ${title}</button>`;
  return [
    {
      path: '',
      html: layout({
        title: 'Home',
        description: 'Kingsley Anyenor, Ghanaian gospel worship leader, and The Refined. Revived to revive.',
        active: 'home',
        body:
          '<section class="ka-section"><div class="ka-wrap"><h1>Kingsley Anyenor</h1>' +
          `<div class="ka-actions">${btn('LqwYHMrrYK0', 'Deeper Worship 6.0')}${btn('JfxWXop_01c', 'Deeper Worship 5.0')}</div>` +
          '</div></section>',
      }),
    },
  ];
}
