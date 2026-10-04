import { describe, it, expect } from 'vitest';
import {
  ORG_TYPES, NEEDS, TIMELINES, BUDGETS, STYLES, CONTACT_PREFS,
} from '../../public/assets/js/lead-schema.js';
import {
  OPTIONS, LABELS, PROJECT_STEPS, MOCKUP_FIELDS, MAX_LOGO, LOGO_TYPES,
  checkLogo, stepErrors, firstErrorStep, fallbackHref, cleanDraft,
} from '../../public/assets/js/form-model.js';
import { MAX_UPLOAD, UPLOAD_TYPES } from '../../src/routes/lead.js';

describe('form-model options', () => {
  it('uses the lead-schema enums as option values (same arrays, not copies)', () => {
    expect(OPTIONS.org_type).toBe(ORG_TYPES);
    expect(OPTIONS.needs).toBe(NEEDS);
    expect(OPTIONS.timeline).toBe(TIMELINES);
    expect(OPTIONS.budget).toBe(BUDGETS);
    expect(OPTIONS.style).toBe(STYLES);
    expect(OPTIONS.contact_pref).toBe(CONTACT_PREFS);
  });

  it('has a label for every enum value and nothing extra', () => {
    for (const [field, values] of Object.entries(OPTIONS)) {
      expect(Object.keys(LABELS[field]).sort()).toEqual([...values].sort());
      for (const v of values) expect(LABELS[field][v].title).toBeTruthy();
    }
  });

  it('budget labels are the spec ranges, with a way to say nothing', () => {
    const t = (v) => LABELS.budget[v].title;
    expect(t('<5k')).toBe('Under $5K');
    expect(t('5-15k')).toBe('$5K–$15K');
    expect(t('15-50k')).toBe('$15K–$50K');
    expect(t('50k+')).toBe('$50K+');
    expect(t('not-sure')).toBe('Not sure');
    expect(t('')).toBe('Prefer not to say');
  });

  it('logo limits match the Worker', () => {
    expect(MAX_LOGO).toBe(MAX_UPLOAD);
    expect(LOGO_TYPES).toEqual(UPLOAD_TYPES);
  });
});

describe('project steps', () => {
  it('has the five spec steps and covers every project field once', () => {
    expect(PROJECT_STEPS.map((s) => s.id)).toEqual(['org', 'needs', 'about', 'timeline', 'contact']);
    const all = PROJECT_STEPS.flatMap((s) => s.fields);
    expect(all).toEqual(['org_type', 'needs', 'org_name', 'website', 'tools', 'timeline', 'budget',
      'name', 'email', 'phone', 'contact_pref', 'message']);
  });

  it('stepErrors only reports fields of the given step', () => {
    const data = { kind: 'project', org_type: 'church', needs: [] };
    expect(stepErrors(data, PROJECT_STEPS[0].fields)).toEqual({});
    expect(Object.keys(stepErrors(data, PROJECT_STEPS[1].fields))).toEqual(['needs']);
    expect(Object.keys(stepErrors({ kind: 'project' }, PROJECT_STEPS[0].fields))).toEqual(['org_type']);
    expect(stepErrors({ kind: 'project', website: 'nope' }, PROJECT_STEPS[2].fields))
      .toEqual({ website: expect.stringMatching(/http/) });
    expect(Object.keys(stepErrors({ kind: 'project' }, PROJECT_STEPS[4].fields)).sort()).toEqual(['email', 'name']);
  });

  it('firstErrorStep finds the earliest step with an error', () => {
    expect(firstErrorStep({ email: 'x', website: 'y' }, PROJECT_STEPS)).toBe(2);
    expect(firstErrorStep({ email: 'x' }, PROJECT_STEPS)).toBe(4);
    expect(firstErrorStep({}, PROJECT_STEPS)).toBe(-1);
    expect(firstErrorStep({ form: 'x' }, PROJECT_STEPS)).toBe(-1);
  });

  it('mockup fields are the spec fields', () => {
    expect(MOCKUP_FIELDS).toEqual(['org_name', 'org_type', 'website', 'style', 'name', 'email']);
    const e = stepErrors({ kind: 'mockup' }, MOCKUP_FIELDS);
    expect(Object.keys(e).sort()).toEqual(['email', 'name', 'org_name', 'org_type', 'style']);
  });
});

describe('checkLogo', () => {
  const MB = 1024 * 1024;
  it('accepts png, jpg and svg up to 5MB', () => {
    expect(checkLogo({ name: 'a.png', type: 'image/png', size: MAX_LOGO })).toEqual({ ok: true, type: 'image/png' });
    expect(checkLogo({ name: 'a.jpg', type: 'image/jpeg', size: 10 }).ok).toBe(true);
    expect(checkLogo({ name: 'a.svg', type: 'image/svg+xml', size: 10 }).ok).toBe(true);
  });
  it('falls back to the extension when the browser gives no type', () => {
    expect(checkLogo({ name: 'logo.JPEG', type: '', size: 10 })).toEqual({ ok: true, type: 'image/jpeg' });
    expect(checkLogo({ name: 'logo.svg', type: '', size: 10 })).toEqual({ ok: true, type: 'image/svg+xml' });
  });
  it('rejects other types and big files with clear messages', () => {
    expect(checkLogo({ name: 'a.pdf', type: 'application/pdf', size: 10 }))
      .toEqual({ ok: false, error: 'Logo must be a PNG, JPG or SVG file' });
    expect(checkLogo({ name: 'a.gif', type: '', size: 10 }).ok).toBe(false);
    expect(checkLogo({ name: 'a.png', type: 'image/png', size: 6 * MB }))
      .toEqual({ ok: false, error: 'Logo must be 5MB or smaller' });
    expect(checkLogo({ name: 'a.png', type: 'image/png', size: 0 }).ok).toBe(false);
  });
});

describe('fallbackHref', () => {
  it('builds a mailto with subject and a summary of what was typed', () => {
    const href = fallbackHref('owner@example.com', 'Project inquiry', {
      kind: 'project', org_type: 'church', needs: ['website', 'crm'], name: 'Ada', email: 'ada@example.com',
      message: 'Hello & welcome',
    });
    expect(href.startsWith('mailto:owner@example.com?subject=Project%20inquiry&body=')).toBe(true);
    const body = decodeURIComponent(href.split('&body=')[1]);
    expect(body).toContain('Organization type: Church');
    expect(body).toContain('What you need: Website, CRM');
    expect(body).toContain('Message: Hello & welcome');
    expect(body).not.toContain('kind');
  });
  it('stays a reasonable length', () => {
    const href = fallbackHref('o@example.com', 'Project inquiry', { message: 'x'.repeat(5000) });
    expect(href.length).toBeLessThan(2000);
  });
  it('without an address returns null', () => {
    expect(fallbackHref('', 'x', {})).toBeNull();
  });
});

describe('cleanDraft', () => {
  it('keeps only known string/array fields', () => {
    expect(cleanDraft({ name: 'Ada', needs: ['crm', 5], website_hp: 'bot', turnstile: 't', step: 3, junk: {} }))
      .toEqual({ name: 'Ada', needs: ['crm'], step: 3 });
    expect(cleanDraft(null)).toEqual({});
    expect(cleanDraft('nope')).toEqual({});
  });
});
