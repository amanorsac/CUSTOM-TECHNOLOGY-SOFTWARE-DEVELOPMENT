import { describe, it, expect } from 'vitest';
import { validateLead } from '../../public/assets/js/lead-schema.js';
import { bookingPayload, contactPayload, validate } from '../../public/assets/preview/kingsley/js/forms.js';

const sample = {
  orgType: 'Campus or school',
  orgName: 'Legon Campus Fellowship',
  name: 'Ama Mensah',
  phone: '+233201234567',
  email: 'ama@example.com',
  host: 'Pastor Kofi',
  event: 'Night of Worship',
  date: '2027-03-12',
  time: '18:00',
  length: '45 min',
  others: 'Minister A',
  venue: 'Main hall, Accra',
  country: 'Ghana',
  notes: 'Please bring a keyboardist.',
  website_hp: '',
};

describe('bookingPayload', () => {
  it('maps the organiser select to org_type', () => {
    const map = {
      Church: 'church', 'Campus or school': 'school', 'Ministry or nonprofit': 'nonprofit',
      Corporate: 'business', Other: 'other',
    };
    for (const [label, value] of Object.entries(map)) {
      expect(bookingPayload({ ...sample, orgType: label }).org_type).toBe(value);
    }
  });

  it('sets kind, slug and passes the contact fields through', () => {
    const p = bookingPayload(sample);
    expect(p.kind).toBe('booking');
    expect(p.design_slug).toBe('kingsley');
    expect(p).toMatchObject({ org_name: 'Legon Campus Fellowship', name: 'Ama Mensah', email: 'ama@example.com', phone: '+233201234567', website_hp: '' });
  });

  it('writes labelled message lines in the agreed order', () => {
    const lines = bookingPayload(sample).message.split('\n');
    expect(lines).toEqual([
      'Event name: Night of Worship',
      'Event date: 2027-03-12',
      'Start time: 18:00',
      'Length of ministration: 45 min',
      'Host pastor or minister: Pastor Kofi',
      'Other ministers: Minister A',
      'Venue and city: Main hall, Accra',
      'Country: Ghana',
      'Notes: Please bring a keyboardist.',
    ]);
  });

  it('omits blank fields', () => {
    const msg = bookingPayload({ ...sample, host: '', others: '  ', time: '', notes: '' }).message;
    expect(msg).not.toMatch(/Host pastor|Other ministers|Start time|Notes/);
    expect(msg).toContain('Event name: Night of Worship');
  });

  it('passes the shared lead validator', () => {
    expect(validateLead(bookingPayload(sample)).ok).toBe(true);
  });
});

describe('contactPayload', () => {
  const c = { name: 'Ama', email: 'ama@example.com', message: 'Hello there', website_hp: '' };
  it('builds a contact lead', () => {
    expect(contactPayload(c)).toEqual({
      kind: 'contact', design_slug: 'kingsley', org_type: 'other',
      name: 'Ama', email: 'ama@example.com', message: 'Hello there', website_hp: '',
    });
  });
  it('passes the shared lead validator', () => {
    expect(validateLead(contactPayload(c)).ok).toBe(true);
  });
});

describe('validate (book)', () => {
  it('accepts the sample', () => {
    expect(validate('book', sample)).toEqual({});
  });
  it('requires the organisation name', () => {
    expect(validate('book', { ...sample, orgName: ' ' }).orgName).toBe('Please enter the organisation name.');
  });
  it('puts an over-long message error on Notes', () => {
    const errors = validate('book', { ...sample, notes: 'x'.repeat(4100) });
    expect(errors.notes).toBeTruthy();
    expect(errors._other).toBeUndefined();
  });
});
