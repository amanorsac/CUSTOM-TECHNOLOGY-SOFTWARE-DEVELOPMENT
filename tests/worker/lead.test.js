import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env as baseEnv, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import worker from '../../src/worker.js';

// Outbound fetches (Turnstile, Supabase, Resend) are intercepted by stubbing
// globalThis.fetch: the worker module runs in this same isolate.
// (@cloudflare/vitest-pool-workers 0.22 no longer exports `fetchMock`.)

const SB = 'https://sb.example.supabase.co';

function makeEnv(over = {}) {
  return {
    ...baseEnv,
    SUPABASE_URL: SB,
    SUPABASE_SERVICE_KEY: 'svc-key',
    RESEND_API_KEY: 're_test',
    TURNSTILE_SECRET: 'ts-secret',
    MAIL_FROM: 'CTSD <hello@ctsd.example>',
    ...over,
  };
}

let calls;
let handlers;

function route(match, fn) { handlers.push({ match, fn }); }

function jsonRes(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

beforeEach(() => {
  calls = [];
  handlers = [];
  route((u) => u.startsWith('https://challenges.cloudflare.com/turnstile/v0/siteverify'), () => jsonRes({ success: true }));
  route((u) => u === `${SB}/rest/v1/leads`, () => new Response(null, { status: 201 }));
  route((u) => u === 'https://api.resend.com/emails', () => jsonRes({ id: 'e1' }));
  route((u) => u.startsWith(`${SB}/storage/v1/object/upload/sign/lead-uploads/`),
    (u) => jsonRes({ url: u.slice(`${SB}/storage/v1`.length) + '?token=abc', token: 'abc' }));

  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const req = new Request(input, init);
    const body = await req.text();
    const call = { url: req.url, method: req.method, headers: req.headers, body, signal: init.signal };
    calls.push(call);
    // Last registered handler wins, so tests can override defaults.
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i].match(req.url)) return handlers[i].fn(req.url, call);
    }
    throw new Error(`unexpected fetch ${req.url}`);
  });
});

afterEach(() => vi.restoreAllMocks());

const callsTo = (prefix) => calls.filter((c) => c.url.startsWith(prefix));
const turnstileCalls = () => callsTo('https://challenges.cloudflare.com/');
const supabaseCalls = () => callsTo(SB);
const resendCalls = () => callsTo('https://api.resend.com/');

async function post(path, body, envOver = {}, init = {}) {
  const ctx = createExecutionContext();
  const req = new Request(`https://ctsd.example${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
  });
  const res = await worker.fetch(req, makeEnv(envOver), ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

const lead = (over = {}) => ({
  kind: 'project',
  org_type: 'church',
  org_name: 'Grace Chapel',
  needs: ['website', 'crm'],
  name: 'Ada',
  email: 'ada@example.com',
  message: 'Zebra-message-42',
  turnstile: 'tok-123',
  website_hp: '',
  ...over,
});

describe('POST /api/lead', () => {
  it('valid lead: 200, row inserted with service key, owner emailed at LEAD_EMAIL', async () => {
    const res = await post('/api/lead', lead({ status: 'won', extra: 'x' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ ok: true });

    const [ts] = turnstileCalls();
    const form = new URLSearchParams(ts.body);
    expect(form.get('secret')).toBe('ts-secret');
    expect(form.get('response')).toBe('tok-123');
    expect(form.get('remoteip')).toBe('203.0.113.7');

    const ins = supabaseCalls();
    expect(ins).toHaveLength(1);
    expect(ins[0].method).toBe('POST');
    expect(ins[0].headers.get('apikey')).toBe('svc-key');
    expect(ins[0].headers.get('authorization')).toBe('Bearer svc-key');
    expect(ins[0].headers.get('prefer')).toBe('return=minimal');
    const row = JSON.parse(ins[0].body);
    expect(row.kind).toBe('project');
    expect(row.needs).toEqual(['website', 'crm']);
    for (const k of ['turnstile', 'website_hp', 'status', 'extra']) expect(k in row).toBe(false);

    const mails = resendCalls().map((c) => ({ ...JSON.parse(c.body), auth: c.headers.get('authorization') }));
    expect(baseEnv.LEAD_EMAIL).toBe('amanorsac@gmail.com');
    const owner = mails.find((m) => [].concat(m.to).includes('amanorsac@gmail.com'));
    expect(owner).toBeTruthy();
    expect(owner.auth).toBe('Bearer re_test');
    expect(owner.from).toBe('CTSD <hello@ctsd.example>');
    expect(owner.reply_to).toBe('ada@example.com');
    expect(owner.subject).toBe('New lead: project — church — Grace Chapel');

    const visitor = mails.find((m) => [].concat(m.to).includes('ada@example.com'));
    expect(visitor).toBeTruthy();
    expect(visitor.from).toBe('CTSD <hello@ctsd.example>');
    expect(visitor.reply_to).toBe('amanorsac@gmail.com');
    // No visitor-supplied content is echoed to the (unverified) visitor address.
    for (const s of ['Grace Chapel', 'Zebra-message-42', 'Ada']) {
      expect(visitor.html).not.toContain(s);
      expect(visitor.text).not.toContain(s);
    }
  });

  it('streamed body over 32KB without content-length → 413', async () => {
    const big = new TextEncoder().encode(JSON.stringify(lead({ message: 'x'.repeat(40 * 1024) })));
    const stream = new ReadableStream({
      start(c) { for (let i = 0; i < big.length; i += 4096) c.enqueue(big.slice(i, i + 4096)); c.close(); },
    });
    const req = new Request('https://ctsd.example/api/lead', { method: 'POST', body: stream });
    expect(req.headers.get('content-length')).toBeNull();
    const res = await worker.fetch(req, makeEnv(), createExecutionContext());
    expect(res.status).toBe(413);
    expect(calls).toHaveLength(0);
  });

  it('escapes HTML in the owner email', async () => {
    const res = await post('/api/lead', lead({ org_name: '<img src=x onerror=alert(1)>', message: '"quoted" & \'single\'' }));
    expect(res.status).toBe(200);
    const owner = resendCalls().map((c) => JSON.parse(c.body)).find((m) => [].concat(m.to).includes('amanorsac@gmail.com'));
    expect(owner.html).toContain('&lt;img');
    expect(owner.html).not.toContain('<img src=x');
    expect(owner.html).toContain('&quot;quoted&quot; &amp; &#39;single&#39;');
    expect(owner.text).toContain('<img src=x onerror=alert(1)>');
  });

  it('strips CR/LF from the owner subject', async () => {
    await post('/api/lead', lead({ org_name: 'Evil\r\nBcc: x@y.com' }));
    const owner = JSON.parse(resendCalls()[0].body);
    expect(owner.subject).not.toMatch(/[\r\n]/);
  });

  it('non-empty honeypot: 200 {ok:true} with no Turnstile, Supabase or Resend calls', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await post('/api/lead', lead({ website_hp: 'http://spam.example' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(calls).toHaveLength(0);
    // Logged, without any visitor data.
    expect(warn.mock.calls).toEqual([['[lead] honeypot hit']]);
  });

  it('Turnstile success:false → 403 captcha, nothing stored or sent', async () => {
    route((u) => u.startsWith('https://challenges.cloudflare.com/'), () => jsonRes({ success: false, 'error-codes': ['invalid-input-response'] }));
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: 'captcha' });
    expect(supabaseCalls()).toHaveLength(0);
    expect(resendCalls()).toHaveLength(0);
  });

  it('missing TURNSTILE_SECRET → verification skipped, 200, no siteverify call', async () => {
    const res = await post('/api/lead', lead({ turnstile: '' }), { TURNSTILE_SECRET: '' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(turnstileCalls()).toHaveLength(0);
    expect(supabaseCalls().length).toBeGreaterThan(0);
  });

  it('missing SUPABASE_URL still → 500 server, logged by name', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post('/api/lead', lead(), { SUPABASE_URL: '' });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
    expect(err.mock.calls.flat().join(' ')).toContain('SUPABASE_URL');
    expect(calls).toHaveLength(0);
  });

  it('every outbound fetch carries an abort signal (8s timeout)', async () => {
    await post('/api/lead', lead());
    expect(calls.length).toBe(4); // siteverify, insert, owner email, visitor email
    for (const c of calls) expect(c.signal, c.url).toBeInstanceOf(AbortSignal);
  });

  it('responds as soon as the row is inserted; emails run in ctx.waitUntil', async () => {
    let release;
    const gate = new Promise((r) => { release = r; });
    route((u) => u === 'https://api.resend.com/emails', async () => { await gate; return jsonRes({ id: 'e1' }); });
    const pending = [];
    const ctx = { waitUntil: (p) => pending.push(p), passThroughOnException() {} };
    const req = new Request('https://ctsd.example/api/lead', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead()),
    });
    const res = await Promise.race([
      worker.fetch(req, makeEnv(), ctx),
      new Promise((_, rej) => setTimeout(() => rej(new Error('response waited for Resend')), 1000)),
    ]);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(pending).toHaveLength(1);
    release();
    await Promise.all(pending);
    expect(resendCalls()).toHaveLength(2);
  });

  it('Supabase failure logs status + PostgREST code/message, never the raw body', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === `${SB}/rest/v1/leads`, () => jsonRes({
      code: '23514', message: 'new row violates check constraint "leads_kind_check"',
      details: 'Failing row contains (ada@example.com, Zebra-message-42).', hint: null,
    }, 400));
    expect((await post('/api/lead', lead())).status).toBe(500);
    const logged = err.mock.calls.flat().join(' ');
    expect(logged).toContain('400');
    expect(logged).toContain('23514');
    expect(logged).toContain('leads_kind_check');
    expect(logged).not.toContain('ada@example.com');
    expect(logged).not.toContain('Zebra-message-42');
  });

  it('Resend failure logs status + error name only, never the body', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === 'https://api.resend.com/emails', () => jsonRes({
      statusCode: 422, name: 'validation_error', message: 'Invalid to field: ada@example.com',
    }, 422));
    expect((await post('/api/lead', lead())).status).toBe(200);
    const logged = err.mock.calls.flat().join(' ');
    expect(logged).toContain('422');
    expect(logged).toContain('validation_error');
    expect(logged).not.toContain('ada@example.com');
  });

  it('missing turnstile token → 403 captcha', async () => {
    const res = await post('/api/lead', lead({ turnstile: '' }));
    expect(res.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it('siteverify network error → 403 captcha', async () => {
    route((u) => u.startsWith('https://challenges.cloudflare.com/'), () => { throw new Error('down'); });
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(403);
  });

  it('invalid lead → 400 with errors, nothing stored', async () => {
    const res = await post('/api/lead', lead({ email: 'nope', needs: ['hack'] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeTruthy();
    expect(body.errors.needs).toBeTruthy();
    expect(supabaseCalls()).toHaveLength(0);
    expect(resendCalls()).toHaveLength(0);
  });

  it('bad JSON → 400 bad_json', async () => {
    const res = await post('/api/lead', '{not json');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'bad_json' });
    expect(calls).toHaveLength(0);
  });

  it('JSON that is not an object → 400 bad_json', async () => {
    for (const b of ['null', '[]', '"x"']) {
      const res = await post('/api/lead', b);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ ok: false, error: 'bad_json' });
    }
  });

  it('body over 32KB → 413', async () => {
    const res = await post('/api/lead', lead({ message: 'x'.repeat(33 * 1024) }));
    expect(res.status).toBe(413);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(calls).toHaveLength(0);
  });

  it('missing Supabase config → 500 server and console.error names it', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post('/api/lead', lead(), { SUPABASE_SERVICE_KEY: '' });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
    expect(err.mock.calls.flat().join(' ')).toContain('SUPABASE_SERVICE_KEY');
    expect(resendCalls()).toHaveLength(0);
  });

  it('Supabase returns 500 → 500 server and Resend is not called', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === `${SB}/rest/v1/leads`, () => jsonRes({ message: 'boom' }, 500));
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
    expect(resendCalls()).toHaveLength(0);
    expect(err).toHaveBeenCalled();
  });

  it('Supabase network error → 500 server', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === `${SB}/rest/v1/leads`, () => { throw new Error('net'); });
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(500);
    expect(resendCalls()).toHaveLength(0);
  });

  it('Resend fails after insert → still 200 and the failure is logged', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === 'https://api.resend.com/emails', () => jsonRes({ message: 'nope' }, 422));
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(supabaseCalls()).toHaveLength(1);
    expect(err).toHaveBeenCalled();
  });

  it('Resend throws after insert → still 200 and logged', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u === 'https://api.resend.com/emails', () => { throw new Error('net'); });
    const res = await post('/api/lead', lead());
    expect(res.status).toBe(200);
    expect(err).toHaveBeenCalled();
  });

  it('missing RESEND_API_KEY → still 200, no Resend call, logged', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post('/api/lead', lead(), { RESEND_API_KEY: '' });
    expect(res.status).toBe(200);
    expect(resendCalls()).toHaveLength(0);
    expect(err.mock.calls.flat().join(' ')).toContain('RESEND_API_KEY');
  });

  it('empty MAIL_FROM: visitor confirmation skipped, owner email from onboarding@resend.dev', async () => {
    const res = await post('/api/lead', lead(), { MAIL_FROM: '' });
    expect(res.status).toBe(200);
    const mails = resendCalls().map((c) => JSON.parse(c.body));
    expect(mails).toHaveLength(1);
    expect([].concat(mails[0].to)).toEqual(['amanorsac@gmail.com']);
    expect(mails[0].from).toBe('CTSD Leads <onboarding@resend.dev>');
  });

  it('mockup lead with logo_path is stored', async () => {
    const logo = '0b8f1e2a-1c3d-4e5f-8a9b-0c1d2e3f4a5b-logo.png';
    const res = await post('/api/lead', {
      kind: 'mockup', org_name: 'Grace', org_type: 'church', style: 'bold',
      name: 'Ada', email: 'ada@example.com', logo_path: logo, turnstile: 't',
    });
    expect(res.status).toBe(200);
    const row = JSON.parse(supabaseCalls()[0].body);
    expect(row).toMatchObject({ kind: 'mockup', style: 'bold', logo_path: logo });
  });

  it('GET /api/lead → 405 with Allow: POST', async () => {
    const res = await worker.fetch(new Request('https://ctsd.example/api/lead'), makeEnv(), createExecutionContext());
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('POST /api/upload-url', () => {
  const up = (over = {}) => ({ filename: 'My Logo (final).png', type: 'image/png', size: 1024, turnstile: 'tok', ...over });

  it('valid request → {ok, path, uploadUrl} signed with the service key', async () => {
    const res = await post('/api/upload-url', up());
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.path).toMatch(/^[0-9a-f-]{36}-[a-zA-Z0-9._-]{1,100}$/);
    expect(body.path.endsWith('.png')).toBe(true);
    expect(body.path).not.toMatch(/[ ()]/);
    expect(body.uploadUrl).toBe(`${SB}/storage/v1/object/upload/sign/lead-uploads/${body.path}?token=abc`);

    const [sign] = supabaseCalls();
    expect(sign.method).toBe('POST');
    expect(sign.url).toBe(`${SB}/storage/v1/object/upload/sign/lead-uploads/${body.path}`);
    expect(sign.headers.get('authorization')).toBe('Bearer svc-key');
    expect(sign.headers.get('apikey')).toBe('svc-key');
    expect(new URLSearchParams(turnstileCalls()[0].body).get('response')).toBe('tok');
    expect(JSON.stringify(body)).not.toContain('svc-key');
  });

  it('keeps an absolute signed URL as-is', async () => {
    route((u) => u.startsWith(`${SB}/storage/v1/object/upload/sign/`), (u) => jsonRes({ url: `${u}?token=zz` }));
    const body = await (await post('/api/upload-url', up())).json();
    expect(body.uploadUrl).toBe(`${SB}/storage/v1/object/upload/sign/lead-uploads/${body.path}?token=zz`);
  });

  it("type 'application/pdf' → 400", async () => {
    const res = await post('/api/upload-url', up({ type: 'application/pdf' }));
    expect(res.status).toBe(400);
    expect((await res.json()).ok).toBe(false);
    expect(supabaseCalls()).toHaveLength(0);
  });

  it('size 6MB → 400', async () => {
    const res = await post('/api/upload-url', up({ size: 6 * 1024 * 1024 }));
    expect(res.status).toBe(400);
    expect(supabaseCalls()).toHaveLength(0);
  });

  it('size exactly 5242880 is allowed; 0, negative and non-numeric are not', async () => {
    expect((await post('/api/upload-url', up({ size: 5242880 }))).status).toBe(200);
    for (const size of [0, -1, '1024', null, 1.5]) {
      expect((await post('/api/upload-url', up({ size }))).status).toBe(400);
    }
  });

  it('jpeg and svg are allowed', async () => {
    expect((await post('/api/upload-url', up({ type: 'image/jpeg', filename: 'a.jpg' }))).status).toBe(200);
    expect((await post('/api/upload-url', up({ type: 'image/svg+xml', filename: 'a.svg' }))).status).toBe(200);
  });

  it('sanitizes hostile filenames', async () => {
    for (const filename of ['../../etc/passwd', '', '%2e%2e/x?.png', 'x'.repeat(300) + '.png', '‮gnp.exe']) {
      const body = await (await post('/api/upload-url', up({ filename }))).json();
      expect(body.ok).toBe(true);
      expect(body.path).toMatch(/^[0-9a-f-]{36}-[a-zA-Z0-9._-]{1,100}$/);
      expect(body.path).not.toContain('/');
    }
    const long = await (await post('/api/upload-url', up({ filename: 'x'.repeat(300) + '.png' }))).json();
    expect(long.path.endsWith('.png')).toBe(true);
  });

  it('Turnstile failure → 403 captcha', async () => {
    route((u) => u.startsWith('https://challenges.cloudflare.com/'), () => jsonRes({ success: false }));
    const res = await post('/api/upload-url', up());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: 'captcha' });
    expect(supabaseCalls()).toHaveLength(0);
  });

  it('missing TURNSTILE_SECRET → verification skipped, 200, no siteverify call', async () => {
    const res = await post('/api/upload-url', up({ turnstile: undefined }), { TURNSTILE_SECRET: '' });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(turnstileCalls()).toHaveLength(0);
  });

  it('missing SUPABASE_SERVICE_KEY still → 500 server, nothing signed', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post('/api/upload-url', up(), { SUPABASE_SERVICE_KEY: '' });
    expect(res.status).toBe(500);
    expect(err.mock.calls.flat().join(' ')).toContain('SUPABASE_SERVICE_KEY');
    expect(calls).toHaveLength(0);
  });

  it('sign request carries an abort signal; a failure logs no raw body', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u.startsWith(`${SB}/storage/`), () => jsonRes({ statusCode: '403', error: 'Unauthorized', message: 'invalid signature', raw: 'SECRET-BODY' }, 403));
    expect((await post('/api/upload-url', up())).status).toBe(500);
    for (const c of calls) expect(c.signal, c.url).toBeInstanceOf(AbortSignal);
    const logged = err.mock.calls.flat().join(' ');
    expect(logged).toContain('403');
    expect(logged).toContain('Unauthorized');
    expect(logged).not.toContain('SECRET-BODY');
  });

  it('Supabase sign failure → 500 server', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    route((u) => u.startsWith(`${SB}/storage/`), () => jsonRes({ error: 'x' }, 400));
    const res = await post('/api/upload-url', up());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
  });

  it('missing SUPABASE_URL → 500 server, logged', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post('/api/upload-url', up(), { SUPABASE_URL: '' });
    expect(res.status).toBe(500);
    expect(err.mock.calls.flat().join(' ')).toContain('SUPABASE_URL');
  });

  it('bad JSON → 400 bad_json', async () => {
    const res = await post('/api/upload-url', 'nope');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'bad_json' });
  });

  it('PUT /api/upload-url → 405 with Allow: POST', async () => {
    const res = await worker.fetch(new Request('https://ctsd.example/api/upload-url', { method: 'PUT', body: '{}' }), makeEnv(), createExecutionContext());
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });
});
