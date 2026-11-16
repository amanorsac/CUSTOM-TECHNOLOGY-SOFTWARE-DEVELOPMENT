import { describe, it, expect } from 'vitest';
import catalogue from '../../public/assets/preview/kingsley/data/catalogue.json' with { type: 'json' };
import { GROUPS, validateCatalogue, findByYoutubeId } from '../../public/assets/preview/kingsley/js/catalogue.js';

const base = { slug: 'a-song', title: 'A Song', group: 'single', year: 2026, youtubeId: 'abcdefghijk' };

describe('kingsley catalogue', () => {
  it('real catalogue is valid', () => {
    expect(validateCatalogue(catalogue)).toEqual([]);
  });

  it('flags a duplicate slug by name', () => {
    const problems = validateCatalogue([base, { ...base, youtubeId: 'zzzzzzzzzzz' }]);
    expect(problems.some((p) => p.includes('a-song'))).toBe(true);
  });

  it('flags a missing youtubeId', () => {
    const { youtubeId, ...rest } = base;
    expect(validateCatalogue([rest]).length).toBeGreaterThan(0);
  });

  it('flags an unknown group', () => {
    expect(validateCatalogue([{ ...base, group: 'nope' }]).length).toBeGreaterThan(0);
  });

  it('flags a non-array input', () => {
    expect(validateCatalogue(null).length).toBeGreaterThan(0);
  });

  it('every slug is url-safe', () => {
    for (const e of catalogue) expect(e.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('exposes the four groups with display names', () => {
    expect(GROUPS['deeper-worship']).toBe('Deeper Worship');
    expect(GROUPS.single).toBe('Singles and live videos');
    expect(GROUPS.medley).toBe('Medleys');
    expect(GROUPS.unveiled).toBe('THE UNVEILED');
  });

  it('finds by youtube id and leads with Deeper Worship 6.0', () => {
    expect(findByYoutubeId(catalogue, 'LqwYHMrrYK0').slug).toBe('deeper-worship-6-0');
    expect(findByYoutubeId(catalogue, 'nope')).toBeUndefined();
    expect(catalogue[0].youtubeId).toBe('LqwYHMrrYK0');
  });
});
