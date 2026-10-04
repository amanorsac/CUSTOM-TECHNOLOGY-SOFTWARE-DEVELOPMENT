/* =====================================================================
   CTSD live demo: state store. Pure ES module, no DOM, so it runs in node.

   createStore(seeds, storage?) -> { getState, subscribe, dispatch, reset }
     seeds    { church, school, business } seed objects (never mutated)
     storage  a Storage-like object; omitted = sessionStorage when it is
              reachable, null = memory only. Every call is try/catch'd:
              a browser that blocks storage still gets a working demo.

   State: { org: 'church', orgs: { church: {...seed, sent: []}, ... } }
   Each org keeps its own edits, so switching orgs never loses work.
   ===================================================================== */

export const STORAGE_KEY = 'ctsd-demo-v1';
const PAGE_FIELDS = ['heading', 'body', 'image'];
const EVENT_FIELDS = ['title', 'date', 'location'];

const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';

function defaultStorage() {
  try {
    return typeof globalThis.sessionStorage === 'undefined' ? null : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

/* A saved org is trusted only when it has every part the views read. */
function validOrg(o) {
  return isObj(o)
    && isObj(o.org) && isStr(o.org.name)
    && Array.isArray(o.kpis) && Array.isArray(o.series)
    && isObj(o.page) && PAGE_FIELDS.every((f) => isStr(o.page[f]))
    && Array.isArray(o.events) && o.events.every((e) => isObj(e) && isStr(e.id) && isStr(e.title) && isStr(e.date))
    && Array.isArray(o.people) && Array.isArray(o.inbox)
    && (o.sent === undefined || Array.isArray(o.sent));
}

let seq = 0;
const newId = (prefix) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

export function createStore(seeds, storage) {
  const ids = Object.keys(seeds);
  const firstOrg = ids.includes('church') ? 'church' : ids[0];
  const store = storage === undefined ? defaultStorage() : storage;

  const seedOrg = (id) => ({ sent: [], ...clone(seeds[id]) });
  const fresh = () => ({ org: firstOrg, orgs: Object.fromEntries(ids.map((id) => [id, seedOrg(id)])) });

  function read() {
    let raw = null;
    try { raw = store ? store.getItem(STORAGE_KEY) : null; } catch { raw = null; }
    if (!raw) return fresh();
    let saved;
    try { saved = JSON.parse(raw); } catch { return fresh(); }
    if (!isObj(saved)) return fresh();
    const savedOrgs = isObj(saved.orgs) ? saved.orgs : {};
    const orgs = Object.fromEntries(ids.map((id) => [
      id,
      validOrg(savedOrgs[id]) ? { sent: [], ...savedOrgs[id] } : seedOrg(id),
    ]));
    return { org: ids.includes(saved.org) ? saved.org : firstOrg, orgs };
  }

  function write() {
    try { if (store) store.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }

  let state = read();
  const listeners = new Set();
  const emit = (action) => listeners.forEach((fn) => fn(state, action));

  /* Returns the next org object, or null when the action changes nothing. */
  function reduceOrg(o, a) {
    switch (a.type) {
      case 'page/update':
        if (!PAGE_FIELDS.includes(a.field) || !isStr(a.value)) return null;
        return { ...o, page: { ...o.page, [a.field]: a.value } };
      case 'event/add': {
        const e = a.event || {};
        if (!isStr(e.title) || !e.title.trim() || !isStr(e.date) || !e.date) return null;
        const event = { id: isStr(e.id) && e.id ? e.id : newId('e'), title: e.title.trim(), date: e.date, location: isStr(e.location) ? e.location.trim() : '' };
        return { ...o, events: [...o.events, event] };
      }
      case 'event/update': {
        const patch = {};
        for (const f of EVENT_FIELDS) if (a.patch && isStr(a.patch[f])) patch[f] = f === 'date' ? a.patch[f] : a.patch[f].trim();
        if (patch.title === '' || patch.date === '') return null;
        if (!o.events.some((e) => e.id === a.id)) return null;
        return { ...o, events: o.events.map((e) => (e.id === a.id ? { ...e, ...patch } : e)) };
      }
      case 'event/delete':
        if (!o.events.some((e) => e.id === a.id)) return null;
        return { ...o, events: o.events.filter((e) => e.id !== a.id) };
      case 'inbox/handle':
        if (!o.inbox.some((m) => m.id === a.id && !m.handled)) return null;
        return { ...o, inbox: o.inbox.map((m) => (m.id === a.id ? { ...m, handled: true } : m)) };
      case 'notify/send': {
        if (!isStr(a.title) || !a.title.trim() || !isStr(a.body) || !a.body.trim()) return null;
        const item = { id: newId('n'), title: a.title.trim(), body: a.body.trim(), sentAt: a.at || new Date().toISOString() };
        return { ...o, sent: [item, ...(o.sent || [])] };
      }
      default:
        return null;
    }
  }

  function dispatch(action) {
    if (!action || !isStr(action.type)) return;
    if (action.type === 'org/switch') {
      if (!ids.includes(action.org) || action.org === state.org) return;
      state = { ...state, org: action.org };
    } else {
      const next = reduceOrg(state.orgs[state.org], action);
      if (!next) return;
      state = { ...state, orgs: { ...state.orgs, [state.org]: next } };
    }
    write();
    emit(action);
  }

  function reset() {
    state = fresh();
    try { if (store) store.removeItem(STORAGE_KEY); } catch { /* blocked */ }
    emit({ type: 'reset' });
  }

  return {
    getState: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    dispatch,
    reset,
  };
}
