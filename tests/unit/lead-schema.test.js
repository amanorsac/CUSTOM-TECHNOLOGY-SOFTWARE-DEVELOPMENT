import { describe, it, expect } from 'vitest';
import { validateLead } from '../../public/assets/js/lead-schema.js';

const project = () => ({
  kind: 'project',
  org_type: 'church',
  needs: ['website', 'crm'],
  name: 'Ada Lovelace',
  email: 'ada@example.com',
});

const mockup = () => ({
  kind: 'mockup',
  org_name: 'Grace Chapel',
  org_type: 'church',
  style: 'modern',
  name: 'Ada',
  email: 'ada@example.com',
});

describe('validateLead', () => {
  it('accepts a valid project', () => {
    const r = validateLead(project());
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({
      kind: 'project', org_type: 'church', needs: ['website', 'crm'],
      name: 'Ada Lovelace', email: 'ada@example.com',
    });
  });

  it('accepts a valid mockup with needs defaulting to []', () => {
    const r = validateLead(mockup());
    expect(r.ok).toBe(true);
    expect(r.value.needs).toEqual([]);
    expect(r.value.style).toBe('modern');
  });

  it('fails without email, setting errors.email', () => {
    const lead = project();
    delete lead.email;
    const r = validateLead(lead);
    expect(r.ok).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });

  it.each(['nope', 'a@b', 'a b@c.com', 'a@b.com, c@d.com', '<a@b.com>', 'a@b.com\r\nbcc:x@y.com'])(
    'rejects invalid email %j', (email) => {
      const r = validateLead({ ...project(), email });
      expect(r.ok).toBe(false);
      expect(r.errors.email).toBeTruthy();
    });

  it('fails a mockup without style', () => {
    const lead = mockup();
    delete lead.style;
    const r = validateLead(lead);
    expect(r.ok).toBe(false);
    expect(r.errors.style).toBeTruthy();
  });

  it('fails a mockup without org_name', () => {
    const r = validateLead({ ...mockup(), org_name: '   ' });
    expect(r.ok).toBe(false);
    expect(r.errors.org_name).toBeTruthy();
  });

  it("fails needs:['hack']", () => {
    const r = validateLead({ ...project(), needs: ['hack'] });
    expect(r.ok).toBe(false);
    expect(r.errors.needs).toBeTruthy();
  });

  it('fails a project with empty or non-array needs', () => {
    expect(validateLead({ ...project(), needs: [] }).errors.needs).toBeTruthy();
    expect(validateLead({ ...project(), needs: 'website' }).errors.needs).toBeTruthy();
  });

  it('fails an 8,000-character message', () => {
    const r = validateLead({ ...project(), message: 'x'.repeat(8000) });
    expect(r.ok).toBe(false);
    expect(r.errors.message).toBeTruthy();
  });

  it('accepts a 4,000-character message', () => {
    expect(validateLead({ ...project(), message: 'x'.repeat(4000) }).ok).toBe(true);
  });

  it('drops (does not reject) design_slug "../x"', () => {
    const r = validateLead({ ...project(), design_slug: '../x' });
    expect(r.ok).toBe(true);
    expect('design_slug' in r.value).toBe(false);
  });

  it('keeps a valid design_slug', () => {
    expect(validateLead({ ...project(), design_slug: 'modern-church' }).value.design_slug).toBe('modern-church');
  });

  it('trims whitespace', () => {
    const r = validateLead({
      ...project(), name: '  Ada  ', email: ' ada@example.com\n', org_name: ' Grace ',
      message: '\n hi \t', org_type: ' church ', needs: [' website '],
    });
    expect(r.ok).toBe(true);
    expect(r.value.name).toBe('Ada');
    expect(r.value.email).toBe('ada@example.com');
    expect(r.value.org_name).toBe('Grace');
    expect(r.value.message).toBe('hi');
    expect(r.value.org_type).toBe('church');
    expect(r.value.needs).toEqual(['website']);
  });

  it('drops unknown fields, turnstile and the honeypot', () => {
    const r = validateLead({ ...project(), status: 'won', id: 'x', turnstile: 't', website_hp: '', admin: true });
    expect(r.ok).toBe(true);
    for (const k of ['status', 'id', 'turnstile', 'website_hp', 'admin']) expect(k in r.value).toBe(false);
  });

  it('rejects bad enums', () => {
    expect(validateLead({ ...project(), kind: 'spam' }).errors.kind).toBeTruthy();
    expect(validateLead({ ...project(), org_type: 'cult' }).errors.org_type).toBeTruthy();
    expect(validateLead({ ...project(), timeline: 'never' }).errors.timeline).toBeTruthy();
    expect(validateLead({ ...project(), budget: '1m' }).errors.budget).toBeTruthy();
    expect(validateLead({ ...project(), contact_pref: 'fax' }).errors.contact_pref).toBeTruthy();
    expect(validateLead({ ...mockup(), style: 'grunge' }).errors.style).toBeTruthy();
  });

  it('accepts every allowed enum value', () => {
    for (const timeline of ['asap', '1-3m', '3-6m', 'exploring'])
      expect(validateLead({ ...project(), timeline }).ok).toBe(true);
    for (const budget of ['<5k', '5-15k', '15-50k', '50k+', 'not-sure', ''])
      expect(validateLead({ ...project(), budget }).ok).toBe(true);
    for (const contact_pref of ['email', 'phone', 'either'])
      expect(validateLead({ ...project(), contact_pref }).ok).toBe(true);
    const needs = ['website', 'app', 'portal', 'crm', 'crm-integration', 'booking', 'payments', 'automation', 'not-sure'];
    expect(validateLead({ ...project(), needs }).value.needs).toEqual(needs);
  });

  it('drops style from a project lead', () => {
    expect('style' in validateLead({ ...project(), style: 'bold' }).value).toBe(false);
  });

  it('enforces name and org_name lengths', () => {
    expect(validateLead({ ...project(), name: 'x'.repeat(121) }).errors.name).toBeTruthy();
    expect(validateLead({ ...project(), name: 'x'.repeat(120) }).ok).toBe(true);
    expect(validateLead({ ...project(), org_name: 'x'.repeat(161) }).errors.org_name).toBeTruthy();
  });

  it('validates website, phone and tools', () => {
    expect(validateLead({ ...project(), website: 'https://grace.org' }).value.website).toBe('https://grace.org');
    expect(validateLead({ ...project(), website: 'javascript:alert(1)' }).errors.website).toBeTruthy();
    expect(validateLead({ ...project(), website: 'grace.org' }).errors.website).toBeTruthy();
    expect(validateLead({ ...project(), website: 'https://' + 'x'.repeat(300) }).errors.website).toBeTruthy();
    expect(validateLead({ ...project(), phone: 'x'.repeat(41) }).errors.phone).toBeTruthy();
    expect(validateLead({ ...project(), tools: 'x'.repeat(501) }).errors.tools).toBeTruthy();
    expect(validateLead({ ...project(), tools: 'Planning Center' }).value.tools).toBe('Planning Center');
  });

  it('keeps a valid logo_path on mockups only; drops bad ones', () => {
    const good = '0b8f1e2a-1c3d-4e5f-8a9b-0c1d2e3f4a5b-logo.png';
    expect(validateLead({ ...mockup(), logo_path: good }).value.logo_path).toBe(good);
    expect('logo_path' in validateLead({ ...project(), logo_path: good }).value).toBe(false);
    expect('logo_path' in validateLead({ ...mockup(), logo_path: '../../etc/passwd' }).value).toBe(false);
  });

  it('rejects non-string values for string fields', () => {
    expect(validateLead({ ...project(), name: { $ne: 1 } }).errors.name).toBeTruthy();
    expect(validateLead({ ...project(), needs: [{}] }).errors.needs).toBeTruthy();
  });

  it('rejects non-object input', () => {
    for (const input of [null, undefined, 'x', [], 5]) expect(validateLead(input).ok).toBe(false);
  });

  it('omits empty optional fields', () => {
    const r = validateLead({ ...project(), phone: '  ', budget: '', message: '' });
    expect(r.ok).toBe(true);
    expect(Object.keys(r.value).sort()).toEqual(['email', 'kind', 'name', 'needs', 'org_type']);
  });
});
