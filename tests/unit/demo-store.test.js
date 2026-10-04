import { describe, it, expect } from 'vitest';
import { createStore, STORAGE_KEY } from '../../public/demo/store.js';
import church from '../../public/demo/seed/church.js';
import school from '../../public/demo/seed/school.js';
import business from '../../public/demo/seed/business.js';

const seeds = { church, school, business };

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}

const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); },
};

const cur = (store) => store.getState().orgs[store.getState().org];

describe('demo store', () => {
  it('uses the ctsd-demo-v1 key', () => expect(STORAGE_KEY).toBe('ctsd-demo-v1'));

  it('starts on the church org', () => {
    const store = createStore(seeds, memoryStorage());
    expect(store.getState().org).toBe('church');
    expect(cur(store).org.name).toBe('Grace Fellowship');
  });

  it('page/update changes the heading and persists', () => {
    const storage = memoryStorage();
    const store = createStore(seeds, storage);
    store.dispatch({ type: 'page/update', field: 'heading', value: 'Welcome home' });
    expect(cur(store).page.heading).toBe('Welcome home');
    expect(JSON.parse(storage.data[STORAGE_KEY]).orgs.church.page.heading).toBe('Welcome home');
  });

  it('page/update ignores unknown fields', () => {
    const store = createStore(seeds, null);
    store.dispatch({ type: 'page/update', field: 'nope', value: 'x' });
    expect(cur(store).page).toEqual(church.page);
  });

  it('event/add then event/delete restores the count', () => {
    const store = createStore(seeds, memoryStorage());
    const before = cur(store).events.length;
    store.dispatch({ type: 'event/add', event: { title: 'Choir rehearsal', date: '2026-11-03', location: 'Chapel' } });
    expect(cur(store).events).toHaveLength(before + 1);
    const added = cur(store).events.find((e) => e.title === 'Choir rehearsal');
    expect(added.id).toBeTruthy();
    store.dispatch({ type: 'event/delete', id: added.id });
    expect(cur(store).events).toHaveLength(before);
  });

  it('event/add rejects an event without a title or date', () => {
    const store = createStore(seeds, null);
    const before = cur(store).events.length;
    store.dispatch({ type: 'event/add', event: { title: '', date: '2026-11-03' } });
    store.dispatch({ type: 'event/add', event: { title: 'X', date: '' } });
    expect(cur(store).events).toHaveLength(before);
  });

  it('event/update patches an event but keeps its id', () => {
    const store = createStore(seeds, null);
    const id = cur(store).events[0].id;
    store.dispatch({ type: 'event/update', id, patch: { title: 'Renamed', id: 'hijack' } });
    const e = cur(store).events.find((x) => x.id === id);
    expect(e.title).toBe('Renamed');
  });

  it('inbox/handle marks an item handled', () => {
    const store = createStore(seeds, null);
    const open = cur(store).inbox.find((m) => !m.handled);
    store.dispatch({ type: 'inbox/handle', id: open.id });
    expect(cur(store).inbox.find((m) => m.id === open.id).handled).toBe(true);
  });

  it('notify/send adds to the sent list, newest first', () => {
    const store = createStore(seeds, null);
    expect(cur(store).sent).toEqual([]);
    store.dispatch({ type: 'notify/send', title: 'One', body: 'First' });
    store.dispatch({ type: 'notify/send', title: 'Two', body: 'Second' });
    expect(cur(store).sent.map((s) => s.title)).toEqual(['Two', 'One']);
    store.dispatch({ type: 'notify/send', title: '', body: 'no title' });
    expect(cur(store).sent).toHaveLength(2);
  });

  it('org/switch keeps each org edits separate', () => {
    const store = createStore(seeds, memoryStorage());
    store.dispatch({ type: 'page/update', field: 'heading', value: 'Church edit' });
    store.dispatch({ type: 'org/switch', org: 'school' });
    expect(store.getState().org).toBe('school');
    expect(cur(store).page.heading).toBe(school.page.heading);
    store.dispatch({ type: 'page/update', field: 'heading', value: 'School edit' });
    store.dispatch({ type: 'org/switch', org: 'church' });
    expect(cur(store).page.heading).toBe('Church edit');
    expect(store.getState().orgs.school.page.heading).toBe('School edit');
    store.dispatch({ type: 'org/switch', org: 'nope' });
    expect(store.getState().org).toBe('church');
  });

  it('rehydrates per-org edits from storage', () => {
    const storage = memoryStorage();
    const a = createStore(seeds, storage);
    a.dispatch({ type: 'org/switch', org: 'business' });
    a.dispatch({ type: 'page/update', field: 'body', value: 'Saved body' });
    const b = createStore(seeds, storage);
    expect(b.getState().org).toBe('business');
    expect(cur(b).page.body).toBe('Saved body');
  });

  it('reset() restores the seeds and clears storage', () => {
    const storage = memoryStorage();
    const store = createStore(seeds, storage);
    store.dispatch({ type: 'page/update', field: 'heading', value: 'Changed' });
    store.dispatch({ type: 'org/switch', org: 'school' });
    store.dispatch({ type: 'event/delete', id: school.events[0].id });
    store.reset();
    expect(store.getState().org).toBe('church');
    expect(store.getState().orgs.church.page.heading).toBe(church.page.heading);
    expect(store.getState().orgs.school.events).toHaveLength(school.events.length);
    expect(STORAGE_KEY in storage.data).toBe(false);
  });

  it('never mutates the seeds', () => {
    const heading = church.page.heading;
    const store = createStore(seeds, null);
    store.dispatch({ type: 'page/update', field: 'heading', value: 'Mutated?' });
    expect(church.page.heading).toBe(heading);
  });

  it('subscribe notifies and unsubscribes', () => {
    const store = createStore(seeds, null);
    const calls = [];
    const off = store.subscribe((s, a) => calls.push(a.type));
    store.dispatch({ type: 'page/update', field: 'heading', value: 'A' });
    off();
    store.dispatch({ type: 'page/update', field: 'heading', value: 'B' });
    expect(calls).toEqual(['page/update']);
  });

  it('works when every storage method throws', () => {
    const store = createStore(seeds, throwingStorage);
    expect(store.getState().org).toBe('church');
    store.dispatch({ type: 'page/update', field: 'heading', value: 'Still works' });
    expect(cur(store).page.heading).toBe('Still works');
    expect(() => store.reset()).not.toThrow();
  });

  it('works with null storage', () => {
    const store = createStore(seeds, null);
    store.dispatch({ type: 'event/add', event: { title: 'T', date: '2026-12-01' } });
    expect(cur(store).events.length).toBe(church.events.length + 1);
  });

  it('falls back to seeds on invalid JSON', () => {
    const store = createStore(seeds, memoryStorage({ [STORAGE_KEY]: '{not json' }));
    expect(store.getState().org).toBe('church');
    expect(cur(store).page.heading).toBe(church.page.heading);
  });

  it('falls back per org on a wrong shape or missing org', () => {
    const saved = {
      org: 'school',
      orgs: {
        church: { page: 'broken' },
        school: { ...school, page: { ...school.page, heading: 'Kept' }, sent: [] },
      },
    };
    const store = createStore(seeds, memoryStorage({ [STORAGE_KEY]: JSON.stringify(saved) }));
    expect(store.getState().org).toBe('school');
    expect(cur(store).page.heading).toBe('Kept');
    expect(store.getState().orgs.church.page.heading).toBe(church.page.heading);
    expect(store.getState().orgs.business.org.name).toBe('Summit Consulting');
    const bad = createStore(seeds, memoryStorage({ [STORAGE_KEY]: JSON.stringify({ org: 'mars', orgs: [] }) }));
    expect(bad.getState().org).toBe('church');
  });
});

describe('demo seeds', () => {
  const names = { church: 'Grace Fellowship', school: 'Oakridge Academy', business: 'Summit Consulting' };
  for (const [id, seed] of Object.entries(seeds)) {
    describe(id, () => {
      it('has the org name and shape', () => {
        expect(seed.org.name).toBe(names[id]);
        expect(typeof seed.org.logoText).toBe('string');
        expect(seed.org.palette).toBeTruthy();
      });
      it('has 4 KPIs and 2 series of 12 points', () => {
        expect(seed.kpis).toHaveLength(4);
        seed.kpis.forEach((k) => expect(k.delta).toMatch(/^[+−-]/));
        expect(seed.series).toHaveLength(2);
        seed.series.forEach((s) => {
          expect(s.points).toHaveLength(12);
          s.points.forEach((p) => expect(typeof p).toBe('number'));
        });
      });
      it('has a homepage', () => {
        expect(seed.page.heading.length).toBeGreaterThan(5);
        expect(seed.page.body.length).toBeGreaterThan(20);
        expect(['sunrise', 'arches', 'grove', 'skyline']).toContain(seed.page.image);
      });
      it('has 5-6 upcoming events in late 2026', () => {
        expect(seed.events.length).toBeGreaterThanOrEqual(5);
        expect(seed.events.length).toBeLessThanOrEqual(6);
        seed.events.forEach((e) => {
          expect(e.date >= '2026-10-04' && e.date <= '2026-12-31T23:59').toBe(true);
          expect(e.title && e.location && e.id).toBeTruthy();
        });
      });
      it('has 10-12 people at the org .example domain', () => {
        expect(seed.people.length).toBeGreaterThanOrEqual(10);
        expect(seed.people.length).toBeLessThanOrEqual(12);
        seed.people.forEach((p) => expect(p.email.endsWith(`@${seed.org.domain}`)).toBe(true));
        expect(seed.org.domain.endsWith('.example')).toBe(true);
        expect(new Set(seed.people.map((p) => p.id)).size).toBe(seed.people.length);
      });
      it('has 6-8 inbox items', () => {
        expect(seed.inbox.length).toBeGreaterThanOrEqual(6);
        expect(seed.inbox.length).toBeLessThanOrEqual(8);
        expect(seed.inbox.some((m) => !m.handled)).toBe(true);
      });
      it('shows no prices', () => expect(JSON.stringify(seed)).not.toMatch(/\$\s?\d/));
    });
  }
});
