import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import {
  CATEGORIES, normalizeCategory, filterDesigns, findDesign,
  relatedDesigns, imageOrPlaceholder, designSections,
} from '../../public/assets/js/catalog.js';

const all = JSON.parse(fs.readFileSync('public/data/designs.json', 'utf8'));

describe('catalog', () => {
  it('exposes categories', () => {
    expect(CATEGORIES).toEqual(['all', 'church', 'education', 'business', 'software']);
  });
  it('has 12 designs', () => expect(all).toHaveLength(12));
  it('filters by category and tag', () => {
    expect(filterDesigns(all, 'church')).toHaveLength(3);
    expect(filterDesigns(all, 'nonprofit')).toHaveLength(3);
    expect(filterDesigns(all, 'all')).toHaveLength(12);
  });
  it('normalizes categories', () => {
    expect(normalizeCategory('xyz')).toBe('all');
    expect(normalizeCategory(null)).toBe('all');
    expect(normalizeCategory('church')).toBe('church');
  });
  it('finds designs', () => {
    expect(findDesign(all, 'nope')).toBeNull();
    expect(findDesign(all, 'restaurant').slug).toBe('restaurant');
  });
  it('relatedDesigns excludes itself, returns 3, same category first', () => {
    const d = findDesign(all, 'modern-church');
    const r = relatedDesigns(all, d);
    expect(r).toHaveLength(3);
    expect(r.map((x) => x.slug)).not.toContain('modern-church');
    expect(r.slice(0, 2).every((x) => x.category === 'church')).toBe(true);
    expect(relatedDesigns(all, d, 1)).toHaveLength(1);
  });
  it('designSections', () => {
    expect(designSections({ images: { website: ['a'], app: [], portal: [] } })).toEqual(['website']);
    expect(designSections({ images: { website: ['a'], app: ['b'], portal: ['c'], admin: ['d'] } }))
      .toEqual(['website', 'app', 'portal', 'admin']);
  });
  it('imageOrPlaceholder', () => {
    expect(imageOrPlaceholder(undefined)).toMatch(/_placeholder\.webp$/);
    expect(imageOrPlaceholder('')).toMatch(/_placeholder\.webp$/);
    expect(imageOrPlaceholder('images/x.webp')).toBe('images/x.webp');
  });
  it('data integrity', () => {
    const slugs = all.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const systems = ['Website','Mobile App','Member Portal','Client Portal','Parent Portal','Student Portal','Admin','CRM','Booking','Payments'];
    for (const d of all) {
      expect(d.concept).toBe(true);
      expect(JSON.stringify(d)).not.toContain('$');
      expect(d.tagline.length).toBeLessThan(90);
      expect(d.features.length).toBeGreaterThanOrEqual(5);
      expect(d.features.length).toBeLessThanOrEqual(7);
      expect(d.integrations.length).toBeGreaterThanOrEqual(2);
      expect(d.integrations.length).toBeLessThanOrEqual(4);
      d.systems.forEach((s) => expect(systems).toContain(s));
      expect(d.images.cover).toBe(`images/designs/${d.slug}/cover.webp`);
      expect(d.images.website).toHaveLength(3);
      expect(d.images.app).toHaveLength(3);
    }
    for (const s of ['modern-church','client-portal','booking-system']) expect(findDesign(all, s).tags).toContain('nonprofit');
    expect(all.filter((d) => d.featured).map((d) => d.slug).sort())
      .toEqual(['consulting-firm','custom-crm','modern-church','private-school']);
  });
});
