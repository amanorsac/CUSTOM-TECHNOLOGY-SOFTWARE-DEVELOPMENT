// Contact: a short message form plus the social and streaming links.
import { SOCIAL, icon } from '../layout.mjs';
import { field, honeypot, NOJS, formOpen } from '../parts.mjs';

function body() {
  const links = SOCIAL.map(
    (s) =>
      `<li><a class="ka-btn ka-btn--ghost" href="${s.href}" target="_blank" rel="noopener">${icon(s.icon)}${s.label}` +
      `<span class="ka-sr"> (opens in a new tab)</span></a></li>`,
  ).join('');
  return (
    `<section class="ka-section ka-musichead"><div class="ka-wrap">` +
    `<p class="ka-eyebrow">Get in touch</p>` +
    `<h1 class="ka-split">Contact</h1>` +
    `<p class="ka-musichead__lead ka-up">A word of encouragement, a question, or a note for the team. Send it here.</p>` +
    `</div></section>` +
    `<section class="ka-section ka-formsec"><div class="ka-wrap ka-formwrap ka-formwrap--split">` +
    `<div>` +
    NOJS +
    formOpen('contact') +
    `<p class="ka-form__key">Fields marked <span class="ka-field__req" aria-hidden="true">*</span> are required.</p>` +
    `<div class="ka-form__grid ka-form__grid--one">` +
    field({ name: 'name', max: 120, label: 'Your name', required: true, autocomplete: 'name' }) +
    field({ name: 'email', max: 254, label: 'Email', required: true, type: 'email', autocomplete: 'email' }) +
    field({ name: 'message', max: 4000, label: 'Message', required: true, control: 'textarea', rows: 6 }) +
    `</div>` +
    honeypot +
    `<div class="ka-form__status" data-status aria-live="polite"></div>` +
    `<button class="ka-btn ka-form__submit" type="submit">Send message</button>` +
    `</form></div>` +
    `<aside class="ka-follow" aria-labelledby="follow-h"><h2 id="follow-h">Listen and follow</h2>` +
    `<p>Music, videos and updates live on these channels.</p>` +
    `<ul class="ka-follow__list">${links}</ul>` +
    `<p class="ka-follow__book">Inviting Kingsley to minister? <a class="ka-textlink" href="/preview/kingsley/book/">Book him here</a>.</p>` +
    `</aside>` +
    `</div></section>`
  );
}

export function render({ layout }) {
  return [
    {
      path: 'contact',
      html: layout({
        title: 'Contact',
        description: 'Send a message to Kingsley Anyenor’s team, or follow his music on YouTube, Spotify, Apple Music and Instagram.',
        active: 'contact',
        body: body(),
      }),
    },
  ];
}
