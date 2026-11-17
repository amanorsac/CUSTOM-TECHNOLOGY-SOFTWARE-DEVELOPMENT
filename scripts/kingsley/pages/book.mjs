// Book Kingsley: an invitation form for churches and programmes.
// Works as a reading page with JS off (a mailto link shows); js/forms.js
// validates and posts to /api/lead.
import { field, honeypot, NOJS } from '../parts.mjs';

const ORGS = ['', 'Church', 'Campus or school', 'Ministry or nonprofit', 'Corporate', 'Other'];
const LENGTHS = ['', '15 min', '30 min', '45 min', '1 hour', 'More than 1 hour'];

function body() {
  return (
    `<section class="ka-section ka-musichead"><div class="ka-wrap">` +
    `<p class="ka-eyebrow">Invite Kingsley</p>` +
    `<h1 class="ka-split">Book Kingsley</h1>` +
    `<p class="ka-musichead__lead ka-up">Inviting Kingsley to minister at your church, campus or programme? Tell us about the event and his team will reply.</p>` +
    `</div></section>` +
    `<section class="ka-section ka-formsec"><div class="ka-wrap ka-formwrap">` +
    NOJS +
    `<form class="ka-form" data-ka-form="book" novalidate>` +
    `<p class="ka-form__key">Fields marked <span class="ka-field__req" aria-hidden="true">*</span> are required.</p>` +
    `<fieldset class="ka-form__group"><legend>About you</legend><div class="ka-form__grid">` +
    field({ name: 'orgType', label: 'Organiser type', required: true, control: 'select', options: ORGS }) +
    field({ name: 'orgName', max: 160, label: 'Organisation name', required: true, autocomplete: 'organization' }) +
    field({ name: 'name', max: 120, label: 'Contact name', required: true, autocomplete: 'name' }) +
    field({ name: 'phone', max: 40, label: 'Phone', required: true, type: 'tel', autocomplete: 'tel', placeholder: '+233' }) +
    field({ name: 'email', max: 254, label: 'Email', required: true, type: 'email', autocomplete: 'email' }) +
    field({ name: 'host', max: 160, label: 'Host pastor or minister' }) +
    `</div></fieldset>` +
    `<fieldset class="ka-form__group"><legend>The event</legend><div class="ka-form__grid">` +
    field({ name: 'event', max: 200, label: 'Event name', required: true }) +
    field({ name: 'date', label: 'Event date', required: true, type: 'date' }) +
    field({ name: 'time', label: 'Start time', type: 'time' }) +
    field({ name: 'length', label: 'Length of ministration', control: 'select', options: LENGTHS }) +
    field({ name: 'others', max: 500, label: 'Other ministers', wide: true, hint: 'Who else will be ministering?' }) +
    field({ name: 'venue', max: 200, label: 'Venue and city', required: true }) +
    field({ name: 'country', max: 80, label: 'Country', required: true, value: 'Ghana', autocomplete: 'country-name' }) +
    field({ name: 'notes', max: 2500, label: 'Notes', control: 'textarea', wide: true, rows: 5 }) +
    `</div></fieldset>` +
    honeypot +
    `<div class="ka-form__status" data-status aria-live="polite"></div>` +
    `<button class="ka-btn ka-form__submit" type="submit">Send booking request</button>` +
    `</form>` +
    `</div></section>`
  );
}

export function render({ layout }) {
  return [
    {
      path: 'book',
      html: layout({
        title: 'Book Kingsley',
        description: 'Invite Kingsley Anyenor to minister at your church, campus or programme.',
        active: 'book',
        body: body(),
      }),
    },
  ];
}
