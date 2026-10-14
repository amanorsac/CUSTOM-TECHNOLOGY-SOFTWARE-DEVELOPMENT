// Virtual Assistant product page: the sample-call player and the missed-call calculator (ported from the
// Adelaide demo, live chat removed), plus call-click tracking.
import { trackCallLinks } from './va-track.js';
import { missedCallCost, money } from './va-plans.js';

trackCallLinks();
const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Sample call ---------------------------------------------------------------------------------- */
const SCRIPT = [
  ['assistant', 'Hi, thanks for calling Mango and Ember, this is Adelaide. How can I help you?'],
  ['caller', 'Hey, um, can I get a table for four this Friday? Like seven thirty?'],
  ['assistant', 'Sure, let me check Friday for you.'],
  ['tool', 'Checks availability · Fri 7:30 PM · party of 4'],
  ['assistant', "Okay, so seven thirty's full, but I've got seven or eight o'clock. Would either of those work?"],
  ['caller', "Seven's fine. Oh, and one of us is vegan. Is there anything for her?"],
  ['assistant', 'Yeah, definitely. The veggie jollof and the red red with plantain are both vegan, and so is the kelewele.'],
  ['caller', "Perfect. It's under Kofi."],
  ['assistant', "Got it, Kofi. And what's a good number for you?"],
  ['caller', 'Four three four, five five five, oh one hundred.'],
  ['tool', 'Books the table · Kofi · 4 guests · Fri 7:00 PM'],
  ['assistant', "You're all set, Kofi. Table for four, Friday at seven. We'll see you then!"],
  ['caller', 'Awesome, thanks.'],
  ['assistant', 'Anytime. Have a good one!'],
  ['tool', 'Texts the owner a summary'],
];
const WHO = { assistant: 'Adelaide (demo assistant)', caller: 'Caller' };

const log = $('va-log'), wave = $('va-wave'), status = $('va-status'), playBtn = $('va-play'), resetBtn = $('va-reset'), voiceOn = $('va-voice');
if (log && wave && playBtn) {
  for (let i = 0; i < 40; i++) wave.appendChild(document.createElement('i'));
  const bars = [...wave.children];
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let waveTimer = null, clock = null, t0 = 0, run = 0;

  const animate = (who) => {
    clearInterval(waveTimer);
    wave.className = `va-wave is-${who}`;
    if (REDUCED) { bars.forEach((b) => (b.style.height = '55%')); return; }
    waveTimer = setInterval(() => bars.forEach((b) => (b.style.height = `${15 + Math.random() * 85}%`)), 110);
  };
  const still = () => { clearInterval(waveTimer); wave.className = 'va-wave'; bars.forEach((b) => (b.style.height = '20%')); };
  const elapsed = () => { const s = Math.floor((Date.now() - t0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const add = (who, text) => {
    const p = document.createElement('p');
    p.className = `is-${who}`;
    if (WHO[who]) { const b = document.createElement('b'); b.textContent = WHO[who]; p.append(b); }
    p.append(text);
    log.append(p);
    log.scrollTop = log.scrollHeight;
  };
  const speak = (who, text, id) => new Promise((done) => {
    if (id !== run) return done();
    animate(who);
    const finish = () => { still(); done(); };
    if (!voiceOn.checked || !synth) { setTimeout(finish, Math.min(4200, 650 + text.length * 38)); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.04; u.pitch = who === 'assistant' ? 1.1 : 0.9;
    u.onend = finish; u.onerror = finish;
    synth.speak(u);
  });

  async function play() {
    const id = ++run;
    log.replaceChildren(); playBtn.disabled = true;
    t0 = Date.now(); status.classList.add('is-on');
    clock = setInterval(() => { status.textContent = `On call ${elapsed()}`; }, 250);
    for (const [who, text] of SCRIPT) {
      if (id !== run) return;
      add(who, text);
      if (who === 'tool') await new Promise((r) => setTimeout(r, 700));
      else await speak(who, text, id);
    }
    if (id !== run) return;
    clearInterval(clock); status.classList.remove('is-on'); status.textContent = `Call ended · ${elapsed()}`;
    playBtn.disabled = false;
  }
  function reset() {
    run++; synth?.cancel(); still(); clearInterval(clock);
    status.classList.remove('is-on'); status.textContent = 'Ready'; playBtn.disabled = false;
    log.replaceChildren(Object.assign(document.createElement('p'), { className: 'is-tool', textContent: 'Press play to hear Adelaide, our demo assistant, book a table.' }));
  }
  playBtn.addEventListener('click', play);
  resetBtn.addEventListener('click', reset);
  reset();
}

/* ---- Missed-call calculator ------------------------------------------------------------------------ */
const missed = $('missed'), ticket = $('ticket'), conv = $('conv');
if (missed && ticket && conv) {
  const calc = () => {
    const m = +missed.value, t = +ticket.value, c = +conv.value / 100;
    $('missed-out').textContent = m;
    $('ticket-out').textContent = money(t);
    $('conv-out').textContent = `${Math.round(c * 100)}%`;
    const r = missedCallCost(m, t, c);
    $('lost').textContent = money(r.lost);
    $('lost-detail').textContent = `per month, from about ${Math.round(r.lostOrders)} lost orders and bookings.`;
    $('break-even').textContent = `The Monthly plan pays for itself after about ${r.breakEven} saved calls a month.`;
  };
  [missed, ticket, conv].forEach((el) => el.addEventListener('input', calc));
  calc();
}
