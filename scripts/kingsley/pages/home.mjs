// Home page. Placeholder until Task 7 builds the real one.
export function render({ layout }) {
  return [
    {
      path: '',
      html: layout({
        title: 'Home',
        description: 'Kingsley Anyenor, Ghanaian gospel worship leader, and The Refined. Revived to revive.',
        active: 'home',
        body: '<section class="ka-section"><div class="ka-wrap"><h1>Kingsley Anyenor</h1></div></section>',
      }),
    },
  ];
}
