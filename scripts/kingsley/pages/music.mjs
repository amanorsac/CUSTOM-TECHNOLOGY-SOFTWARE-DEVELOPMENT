// Music page. Stub so the player and page swapper have a second page to move to; Task 8 replaces it.
export function render({ layout }) {
  return [
    {
      path: 'music',
      html: layout({
        title: 'Music',
        description: 'Songs, live sessions and medleys by Kingsley Anyenor and The Refined.',
        active: 'music',
        body: '<section class="ka-section"><div class="ka-wrap"><h1>Music</h1></div></section>',
      }),
    },
  ];
}
