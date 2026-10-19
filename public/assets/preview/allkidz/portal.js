/* =====================================================================
   The Allkidz portal. One page, three kinds of people:

     Director  everything: today, check-in, reports, children, families,
               staff, enrollment, billing, messages, calendar, the
               week's menu and lessons, incidents, insights, settings
     Teacher   today, check-in, daily reports, children, messages,
               the week, calendar, incidents, their own time clock
     Parent    their family's day, reports and photos, messages,
               bills and payments, the calendar and menu, their family

   Every screen reads and writes through Store (store.js).
   ===================================================================== */
(function(){
  var $ = App.$, $$ = App.$$, esc = App.esc, money = App.money, icon = App.icon;
  var me = Store.session();
  if(!me){ location.href = App.BASE + 'login'; return; }
  var T = Store.iso(), S = Store.settings();
  var R = null;
  var DOW = ['sun','mon','tue','wed','thu','fri','sat'], WD = ['mon','tue','wed','thu','fri'], WDN = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  $('#reset').addEventListener('click', function(){
    if(!App.confirm('Put every demo family, bill and message back the way it started? Anything you added is cleared.')) return;
    var id = me.id; Store.reset(); Store.signInAs(Store.get('users', id) ? id : 'u_hannah'); location.reload();
  });

  /* ---------- people helpers ---------- */
  function kids(fn){ return Store.where('children', function(c){ return c.status === 'active' && (!fn || fn(c)); }).sort(function(a, b){ return a.first < b.first ? -1 : 1; }); }
  function fam(id){ return Store.get('families', id) || { id:id, name:'?', pickups:[] }; }
  function parentsOf(fid){ return Store.where('users', function(u){ return u.role === 'parent' && u.familyId === fid; }); }
  function kidsOf(fid, any){ return Store.where('children', function(c){ return c.familyId === fid && (any || c.status !== 'withdrawn'); }); }
  function kname(c){ return c.first + ' ' + c.last; }
  function gk(c){ return Store.group(c.dob); }
  function gBadge(c){ var g = Store.GROUPS[gk(c)]; return '<span class="badge soft g-' + gk(c) + '">' + g.name + '</span>'; }
  function allergy(c){ return c.allergies ? '<span class="allergy" title="' + esc(c.allergies) + '">' + esc(c.allergies.split(/[(,]/)[0].trim()) + '</span>' : ''; }
  function kav(c, cls){ return App.avatar(kname(c), Store.GROUPS[gk(c)].k, cls); }
  function uname(id){ var u = Store.get('users', id); return u ? u.name : 'Someone'; }
  function first(name){ return String(name || '').split(' ')[0]; }
  function nowHM(){ var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function stamp(){ return T + 'T' + nowHM(); }

  /* ---------- the day ---------- */
  function closure(date){ return Store.events().filter(function(e){ return e.type !== 'event' && date >= e.date && date <= (e.end || e.date); })[0] || null; }
  function isOpen(date){ var d = Store.parse(date); return Store.isWeekday(d) && !closure(date); }
  function att(cid, date){ var l = Store.where('attendance', function(a){ return a.childId === cid && a.date === (date || T); }); return l[l.length - 1] || null; }
  function absence(cid, date){ return Store.where('absences', function(a){ return a.childId === cid && a.date === (date || T); })[0] || null; }
  function status(c){
    var a = att(c.id);
    if(a && !a.out) return 'in';
    if(a && a.out) return 'out';
    if(absence(c.id)) return 'absent';
    return 'none';
  }
  function expectedToday(c){ return c.days.indexOf(DOW[new Date().getDay()]) >= 0; }
  function present(){ return kids(function(c){ return status(c) === 'in'; }); }
  function onDuty(){ return Store.where('clock', function(k){ return k.date === T && !k.out; }); }
  function ratioMax(){ return Number(S.ratio || 6); }

  /* ---------- money helpers ---------- */
  function famInvoices(fid){ return Store.where('invoices', function(i){ return i.familyId === fid; }).sort(function(a, b){ return a.weekOf < b.weekOf ? 1 : -1; }); }
  function badgeStatus(s){ return '<span class="badge b-' + s + '">' + s + '</span>'; }
  function pendingPayments(){ var out = []; Store.all('invoices').forEach(function(i){ (i.payments || []).forEach(function(p){ if(p.pending) out.push({ inv:i, p:p }); }); }); return out; }

  /* ---------- counts in the sidebar ---------- */
  function counts(){
    var threads = Store.all('threads');
    if(me.role === 'parent'){
      App.count('messages', threads.filter(function(t){ return t.familyId === me.familyId && t.unread && t.unread.parent; }).length);
      App.count('billing', famInvoices(me.familyId).filter(function(i){ return Store.invStatus(i) === 'overdue'; }).length);
      App.count('incidents', Store.where('incidents', function(x){ var c = Store.get('children', x.childId); return c && c.familyId === me.familyId && !x.signed; }).length);
      return;
    }
    App.count('messages', threads.filter(function(t){ return t.unread && t.unread.admin; }).length);
    App.count('enrollment', Store.where('applications', function(a){ return a.status === 'new'; }).length);
    App.count('billing', pendingPayments().length);
    App.count('families', Store.where('users', function(u){ return u.status === 'pending'; }).length);
  }

  /* ---------- shared bits of markup ---------- */
  function pageH(kick, title, sub, acts){
    return '<div class="page-h"><div><p class="kick">' + esc(kick) + '</p><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>';
  }
  function stat(label, value, k, ic, href, sub){
    return '<' + (href ? 'a href="' + href + '"' : 'div') + ' class="card stat" style="--k:' + k + '">' + (ic ? '<span class="ic">' + icon(ic) + '</span>' : '') + '<b>' + value + '</b><span>' + esc(label) + '</span>' + (sub ? '<small>' + sub + '</small>' : '') + '</' + (href ? 'a' : 'div') + '>';
  }
  function empty(title, text, btn){ return '<div class="card empty">' + '<div class="mark">' + App.MARK + '</div><b>' + esc(title) + '</b><p>' + esc(text) + '</p>' + (btn || '') + '</div>'; }
  var TYPES = {
    meal:{ label:'Meal', e:'🍽️', k:'var(--sun)' }, nap:{ label:'Nap', e:'😴', k:'var(--sky)' },
    diaper:{ label:'Diaper', e:'🧷', k:'var(--pink)' }, potty:{ label:'Potty', e:'🚽', k:'var(--lime)' },
    activity:{ label:'Activity', e:'🎨', k:'var(--orange)' }, mood:{ label:'Mood', e:'😊', k:'var(--violet)' },
    note:{ label:'Note', e:'📝', k:'#d9d3c7' }, photo:{ label:'Photo', e:'📷', k:'var(--sky)' },
    checkin:{ label:'Checked in', e:'👋', k:'var(--lime)' }, checkout:{ label:'Went home', e:'🏠', k:'#d9d3c7' }
  };
  function timeline(cid, date, canDelete){
    var a = att(cid, date), list = Store.where('reports', function(r){ return r.childId === cid && r.date === date; });
    if(a){ list.push({ id:'_in', type:'checkin', time:a.in.slice(11), detail:'Checked in' + (a.inBy ? ' by ' + a.inBy : '') + (a.temp ? ' · ' + a.temp + '°F' : '') }); if(a.out) list.push({ id:'_out', type:'checkout', time:a.out.slice(11), detail:'Picked up' + (a.outBy ? ' by ' + a.outBy : '') }); }
    list.sort(function(x, y){ return x.time < y.time ? -1 : 1; });
    if(!list.length) return '<p class="empty" style="padding:20px">Nothing logged yet for this day.</p>';
    return '<div class="tl">' + list.map(function(r){
      var t = TYPES[r.type] || TYPES.note;
      return '<div class="e" style="--k:' + t.k + '"><time>' + App.time(r.time) + '</time><span class="ic" aria-hidden="true">' + t.e + '</span><div><p>' + esc(r.detail) + '</p>' +
        (r.img ? '<img src="' + r.img + '" alt="Photo from ' + esc(App.day(date)) + '">' : '') +
        '<small>' + t.label + (r.by ? ' · ' + esc(first(uname(r.by))) : '') + (canDelete && r.id[0] !== '_' ? ' · <button class="del" data-del-rep="' + r.id + '">Remove</button>' : '') + '</small></div></div>';
    }).join('') + '</div>';
  }
  function feed(list){
    return '<div class="feed">' + list.map(function(g){
      return '<div class="ev"><span class="ic" style="--k:var(--' + g.k + ')">' + icon(g.icon) + '</span><div><p>' + esc(g.text) + '</p><small>' + App.when(g.at) + '</small></div></div>';
    }).join('') + '</div>';
  }

  /* ======================================================================
     CHECK-IN (staff)
     ====================================================================== */
  function checkinView(main){
    var list = kids(), shut = !isOpen(T);
    var inN = list.filter(function(c){ return status(c) === 'in'; }).length;
    main.innerHTML = pageH('Check-in', 'Who&rsquo;s here?', inN + ' of ' + list.length + ' children in right now. Tap a child to check them in or out.',
      '<div class="pills" id="gf"><button class="on" data-g="">All</button>' + Object.keys(Store.GROUPS).map(function(g){ return '<button data-g="' + g + '">' + Store.GROUPS[g].name + '</button>'; }).join('') + '</div>') +
      (shut ? '<div class="alert" style="--k:var(--sky);margin:0 0 16px"><span class="ic">' + icon('calendar') + '</span><div><b>Allkidz is closed today' + (closure(T) ? ': ' + esc(closure(T).title) : '') + '.</b><small>You can still check children in for a drop-in or make-up day.</small></div></div>' : '') +
      '<div class="kids" id="kids"></div>';
    function draw(g){
      $('#kids').innerHTML = list.filter(function(c){ return !g || gk(c) === g; }).map(function(c){
        var s = status(c), a = att(c.id);
        var lab = s === 'in' ? 'In since ' + App.time(a.in) : s === 'out' ? 'Home at ' + App.time(a.out) : s === 'absent' ? 'Absent: ' + esc(absence(c.id).reason || 'reported') : expectedToday(c) ? 'Expected' : 'Not scheduled today';
        return '<button class="kid' + (s === 'in' ? ' is-in' : s === 'out' || s === 'absent' ? ' is-out' : '') + '" style="--k:' + Store.GROUPS[gk(c)].k + '" data-kid="' + c.id + '">' +
          (c.allergies ? '<span class="warn" title="Allergy: ' + esc(c.allergies) + '">!</span>' : '') +
          '<span class="state">' + (s === 'in' ? '<span class="badge b-in">In</span>' : s === 'absent' ? '<span class="badge b-absent">Off</span>' : '') + '</span>' +
          kav(c) + '<b>' + esc(c.first) + '</b><small>' + lab + '</small></button>';
      }).join('');
    }
    draw('');
    $('#gf').addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; $$('#gf button').forEach(function(x){ x.classList.toggle('on', x === b); }); draw(b.getAttribute('data-g')); });
    $('#kids').addEventListener('click', function(e){ var b = e.target.closest('[data-kid]'); if(!b) return; var c = Store.get('children', b.getAttribute('data-kid')); status(c) === 'in' ? checkOut(c) : checkIn(c); });
  }

  function whoOptions(c){
    var f = fam(c.familyId);
    return parentsOf(c.familyId).map(function(p){ return p.name + ' (parent)'; }).concat((f.pickups || []).map(function(p){ return p.name + ' (' + p.relation.toLowerCase() + ')'; }));
  }
  function checkIn(c){
    var d = App.panel('Check in ' + c.first,
      '<div class="row" style="border:0;padding-top:0">' + kav(c, 'big') + '<div class="grow"><b style="font-size:20px">' + esc(kname(c)) + '</b><small>' + Store.age(c.dob) + ' · ' + Store.GROUPS[gk(c)].name + '</small><div style="margin-top:6px">' + allergy(c) + '</div></div></div>' +
      (c.medical ? '<p class="quote">' + esc(c.medical) + '</p>' : '') +
      '<form class="f" id="ci">' +
        '<label>Dropped off by<select name="by">' + whoOptions(c).map(function(o){ return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label>' +
        '<label>Temperature (&deg;F)<input name="temp" inputmode="decimal" placeholder="98.6" required></label>' +
        '<p class="hint" style="margin:0">Health check from the handbook. Tick each one:</p>' +
        '<label class="check"><input type="checkbox" name="q1"> No fever, and no fever reducer given, in the last 24 hours</label>' +
        '<label class="check"><input type="checkbox" name="q2"> No vomiting, diarrhea, rash or colored runny nose</label>' +
        '<label class="check"><input type="checkbox" name="q3"> Shoes off, hands sanitized</label>' +
        '<label>Note for today (optional)<input name="note" placeholder="Slept badly, teething..."></label>' +
        '<p class="err" id="cerr" style="display:none;color:#b42318;font-weight:600;margin:0"></p>' +
        '<div class="acts"><button class="btn lime" type="submit">Check in at ' + App.time(nowHM()) + '</button></div>' +
      '</form>');
    $('#ci', d).addEventListener('submit', function(e){
      e.preventDefault();
      var o = App.formData(this), err = $('#cerr', d), t = parseFloat(o.temp);
      function no(m){ err.textContent = m; err.style.display = 'block'; }
      if(!t || t < 94 || t > 106) return no('Please enter the temperature you took.');
      if(t >= 100) return no('A temperature of 100°F or higher means ' + c.first + ' can’t stay today (handbook: sickness policy). Please ask the parent to take them home.');
      if(!o.q1 || !o.q2 || !o.q3) return no('Please go through each health question with the parent.');
      Store.save('attendance', { childId:c.id, date:T, in:stamp(), out:null, inBy:o.by.replace(/ \(.*\)$/, ''), temp:String(t), screen:true, note:o.note });
      if(o.note) Store.save('reports', { childId:c.id, date:T, time:nowHM(), type:'note', detail:'From drop-off: ' + o.note, by:me.id });
      Store.log(c.first + ' was checked in by ' + o.by.replace(/ \(.*\)$/, '') + '.', 'lime', 'check');
      App.toast(c.first + ' is checked in');
      d.close(); R.refresh();
    });
  }
  function checkOut(c){
    var a = att(c.id), close = (S.closes || '17:00').split(':'), grace = Number(S.grace || 15);
    var late = (new Date().getHours() * 60 + new Date().getMinutes()) - (+close[0] * 60 + +close[1] + grace);
    var fee = late > 0 ? late * Number(S.latePickupMin || 1) : 0;
    var d = App.panel('Check out ' + c.first,
      '<div class="row" style="border:0;padding-top:0">' + kav(c, 'big') + '<div class="grow"><b style="font-size:20px">' + esc(kname(c)) + '</b><small>In since ' + App.time(a.in) + ' · ' + App.hours(a.in).toFixed(1) + ' hours today</small></div></div>' +
      '<form class="f" id="co">' +
        '<label>Picked up by<select name="by">' + whoOptions(c).map(function(o){ return '<option>' + esc(o) + '</option>'; }).join('') + '<option value="other">Someone else, with written permission</option></select></label>' +
        '<label data-other hidden>Their name, and where the written permission is<input name="other"></label>' +
        '<p class="hint" style="margin:0">Only people on ' + esc(c.first) + '&rsquo;s record can pick up. Ask for photo ID if you don&rsquo;t know them.</p>' +
        (fee ? '<label class="check"><input type="checkbox" name="fee"' + (isOpen(T) ? ' checked' : '') + '> Add the late pickup fee: ' + late + ' min after the grace period = ' + money(fee) + ', on next week&rsquo;s bill</label>' : '') +
        '<div class="acts"><button class="btn" type="submit">Check out at ' + App.time(nowHM()) + '</button></div>' +
      '</form>');
    var sel = $('select', d);
    sel.addEventListener('change', function(){ $('[data-other]', d).hidden = sel.value !== 'other'; });
    $('#co', d).addEventListener('submit', function(e){
      e.preventDefault();
      var o = App.formData(this);
      if(o.by === 'other' && !o.other.trim()) return App.toast('Please note who is picking up and their written permission.', true);
      var who = o.by === 'other' ? o.other.trim() + ' (written permission)' : o.by.replace(/ \(.*\)$/, '');
      a.out = stamp(); a.outBy = who; Store.save('attendance', a);
      if(fee && o.fee){
        var f = fam(c.familyId); f.charges = f.charges || [];
        f.charges.push({ label:'Late pickup ' + App.day(T) + ': ' + late + ' min after the grace period', amount: fee, fee:true });
        Store.save('families', f);
        App.toast('Late pickup: ' + money(fee) + ' added to next week’s bill');
      }
      Store.log(c.first + ' went home with ' + who + '.', 'sky', 'check');
      App.toast(c.first + ' is checked out');
      d.close(); R.refresh();
    });
  }

  /* ======================================================================
     DAILY REPORTS (staff)
     ====================================================================== */
  function reportsView(main, arg){
    var date = /^\d{4}-\d{2}-\d{2}$/.test(arg) ? arg : T, list = kids();
    var here = list.filter(function(c){ return att(c.id, date); });
    var pick = (here.length ? here : list);
    main.innerHTML = pageH('Daily reports', 'What happened today', 'Log meals, naps, diapers, potty, activities, moods and photos. Parents see each entry in their portal straight away.',
      '<div class="week-nav"><a class="btn sm ghost" href="#reports/' + Store.iso(Store.addDays(Store.parse(date), -1)) + '">&larr;</a><b>' + App.day(date, { weekday:'long', month:'short', day:'numeric' }) + '</b><a class="btn sm ghost" href="#reports/' + Store.iso(Store.addDays(Store.parse(date), 1)) + '">&rarr;</a></div>') +
      '<div class="grid g2" style="align-items:start">' +
        '<div class="card"><div class="card-h"><h2>Add an entry</h2></div><form class="f" id="rf">' +
          '<span class="hint">Children (pick one, or several for the whole group)</span>' +
          '<div class="chips">' + pick.map(function(c, i){ return '<label>' + '<input type="checkbox" name="kids" data-list value="' + c.id + '"' + (i === 0 ? ' checked' : '') + '>' + kav(c) + esc(c.first) + '</label>'; }).join('') + '</div>' +
          '<span class="hint">What</span><div class="types" id="types">' + ['meal','nap','diaper','potty','activity','mood','note','photo'].map(function(t, i){ return '<button type="button" data-t="' + t + '" style="--k:' + TYPES[t].k + '"' + (i === 0 ? ' class="on"' : '') + '><i>' + TYPES[t].e + '</i>' + TYPES[t].label + '</button>'; }).join('') + '</div>' +
          '<div id="tf"></div>' +
          '<label>Time<input name="time" type="time" value="' + nowHM() + '"></label>' +
          '<div class="acts"><button class="btn" type="submit">Add to report</button></div>' +
        '</form></div>' +
        '<div class="card"><div class="card-h"><h2>Today&rsquo;s reports</h2><select id="rk" style="margin-left:auto;border:2px solid rgba(0,0,0,.1);border-radius:12px;padding:8px 10px;font:inherit">' + list.map(function(c){ return '<option value="' + c.id + '">' + esc(kname(c)) + '</option>'; }).join('') + '</select></div><div id="tl"></div></div>' +
      '</div>';
    var type = 'meal';
    var FIELDS = {
      meal:'<label>What they ate<input name="what" placeholder="Chicken, rice and green beans"></label><div class="amounts">' + ['All','Most','Some','None'].map(function(x, i){ return '<label><input type="radio" name="amt" value="' + x + '"' + (i === 0 ? ' checked' : '') + '>' + x + '</label>'; }).join('') + '</div>',
      nap:'<div class="two"><label>Fell asleep<input name="from" type="time" value="12:30"></label><label>Woke up<input name="to" type="time" value="' + nowHM() + '"></label></div>',
      diaper:'<div class="amounts">' + ['Wet','Dirty','Wet and dirty','Dry'].map(function(x, i){ return '<label><input type="radio" name="amt" value="' + x + '"' + (i === 0 ? ' checked' : '') + '>' + x + '</label>'; }).join('') + '</div><label>Note<input name="what" placeholder="Cream applied"></label>',
      potty:'<div class="amounts">' + ['Used the potty!','Tried','Accident'].map(function(x, i){ return '<label><input type="radio" name="amt" value="' + x + '"' + (i === 0 ? ' checked' : '') + '>' + x + '</label>'; }).join('') + '</div>',
      activity:'<label>What they did<textarea name="what" placeholder="Bible story: Noah’s ark. Painted rainbows."></textarea></label>',
      mood:'<div class="amounts">' + ['😄 Happy','😌 Calm','🥱 Tired','😢 Sad','😠 Fussy'].map(function(x, i){ return '<label><input type="radio" name="amt" value="' + x + '"' + (i === 0 ? ' checked' : '') + '>' + x + '</label>'; }).join('') + '</div><label>Note<input name="what"></label>',
      note:'<label>Note for the parent<textarea name="what" placeholder="Running low on diapers, please send a pack."></textarea></label>',
      photo:'<label>Photo<input name="file" type="file" accept="image/*" capture="environment"></label><label>Caption<input name="what" placeholder="Leaf rubbings on our nature walk"></label>'
    };
    function setType(t){ type = t; $$('#types button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-t') === t); }); $('#tf').innerHTML = FIELDS[t]; }
    setType('meal');
    $('#types').addEventListener('click', function(e){ var b = e.target.closest('[data-t]'); if(b) setType(b.getAttribute('data-t')); });
    function drawTl(){ $('#tl').innerHTML = timeline($('#rk').value, date, true); }
    if(pick[0]) $('#rk').value = pick[0].id;
    drawTl();
    $('#rk').addEventListener('change', drawTl);
    $('#tl').addEventListener('click', function(e){ var b = e.target.closest('[data-del-rep]'); if(!b) return; Store.del('reports', b.getAttribute('data-del-rep')); drawTl(); App.toast('Removed'); });
    $('#rf').addEventListener('submit', function(e){
      e.preventDefault();
      var o = App.formData(this), ids = o.kids || [];
      if(!ids.length) return App.toast('Pick at least one child.', true);
      var detail = '';
      if(type === 'meal') detail = (o.what ? o.what + '. ' : 'Meal. ') + 'Ate ' + o.amt.toLowerCase() + '.';
      if(type === 'nap') detail = 'Nap ' + App.time(o.from) + ' – ' + App.time(o.to);
      if(type === 'diaper') detail = o.amt + ' diaper' + (o.what ? '. ' + o.what : '');
      if(type === 'potty') detail = o.amt;
      if(type === 'mood') detail = o.amt + (o.what ? '. ' + o.what : '');
      if(type === 'activity' || type === 'note' || type === 'photo') detail = o.what || (type === 'photo' ? 'A photo from today' : '');
      if(!detail) return App.toast('Add a few words for the parent.', true);
      var fileEl = $('input[type=file]', this), file = fileEl && fileEl.files[0];
      var go = function(img){
        ids.forEach(function(id){ Store.save('reports', { childId:id, date:date, time:o.time || nowHM(), type:type, detail:detail, img:img || null, by:me.id }); });
        App.toast('Added for ' + ids.length + (ids.length > 1 ? ' children' : ' child'));
        if(ids.indexOf($('#rk').value) < 0) $('#rk').value = ids[0];
        drawTl();
        $$('input[type=text],input:not([type]),textarea', $('#tf')).forEach(function(x){ x.value = ''; });
      };
      if(type === 'photo'){ if(!file) return App.toast('Choose a photo first.', true); App.shrink(file, 900).then(go).catch(App.fail); }
      else go(null);
    });
  }

  /* ======================================================================
     CHILDREN (staff)
     ====================================================================== */
  function childrenView(main){
    var all = Store.where('children', function(c){ return c.status !== 'withdrawn'; }).sort(function(a, b){ return a.first < b.first ? -1 : 1; });
    main.innerHTML = pageH('Children', 'The roster', all.length + ' children. Age groups update by themselves from each date of birth.',
      (me.role === 'admin' ? '<button class="btn sm" id="addKid">' + '+ Add a child</button>' : '') + '<button class="btn sm ghost" id="csvKids">Export CSV</button>') +
      '<div class="tools"><input type="search" id="q" placeholder="Search by name, allergy, family..."><div class="pills" id="gf"><button class="on" data-g="">All</button>' + Object.keys(Store.GROUPS).map(function(g){ return '<button data-g="' + g + '">' + Store.GROUPS[g].name + '</button>'; }).join('') + '<button data-g="allergy">Allergies</button><button data-g="enrolling">Starting soon</button></div></div>' +
      '<div class="table-wrap"><table class="t"><thead><tr><th>Child</th><th>Group</th><th>Schedule</th><th>Health</th><th>Today</th><th>Family</th></tr></thead><tbody id="rows"></tbody></table></div>';
    var g = '';
    function draw(){
      var q = $('#q').value.trim().toLowerCase();
      var rows = all.filter(function(c){
        if(g === 'allergy' && !c.allergies) return false;
        if(g === 'enrolling' && c.status !== 'enrolling') return false;
        if(g && g !== 'allergy' && g !== 'enrolling' && gk(c) !== g) return false;
        return !q || (kname(c) + ' ' + c.allergies + ' ' + fam(c.familyId).name + ' ' + c.medical).toLowerCase().indexOf(q) >= 0;
      });
      $('#rows').innerHTML = rows.map(function(c){
        var s = c.status === 'enrolling' ? 'Starts ' + App.day(c.start) : { in:'<span class="badge b-in">In</span>', out:'<span class="badge b-out">Gone home</span>', absent:'<span class="badge b-absent">Absent</span>', none: expectedToday(c) ? '<small>Expected</small>' : '<small>Not today</small>' }[status(c)];
        var imm = c.immunizationsDue && c.immunizationsDue < T ? '<span class="badge b-expired">Shots overdue</span>' : '';
        return '<tr data-id="' + c.id + '"><td><div style="display:flex;gap:12px;align-items:center">' + kav(c) + '<div><b>' + esc(kname(c)) + '</b><small>' + Store.age(c.dob) + '</small></div></div></td>' +
          '<td data-l="Group">' + gBadge(c) + '</td><td data-l="Schedule">' + (c.schedule === 'full' ? 'Full-time' : 'Part-time') + '<br><small>' + c.days.map(function(d){ return d[0].toUpperCase() + d.slice(1, 2); }).join(' ') + '</small></td>' +
          '<td data-l="Health">' + (allergy(c) || '') + ' ' + imm + (!c.allergies && !imm ? '<small>&mdash;</small>' : '') + '</td><td data-l="Today">' + s + '</td><td data-l="Family">' + esc(fam(c.familyId).name) + '</td></tr>';
      }).join('') || '<tr><td colspan="6"><p class="empty">No children match.</p></td></tr>';
    }
    draw();
    $('#q').addEventListener('input', draw);
    $('#gf').addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; g = b.getAttribute('data-g'); $$('#gf button').forEach(function(x){ x.classList.toggle('on', x === b); }); draw(); });
    $('#rows').addEventListener('click', function(e){ var tr = e.target.closest('tr[data-id]'); if(tr) childPanel(Store.get('children', tr.getAttribute('data-id'))); });
    $('#csvKids').addEventListener('click', function(){
      App.csv('allkidz-children.csv', [['First','Last','Date of birth','Age','Group','Schedule','Days','Allergies','Medical','Doctor','Family','Start','Status']].concat(all.map(function(c){ return [c.first, c.last, c.dob, Store.age(c.dob), Store.GROUPS[gk(c)].name, c.schedule, c.days.join(' '), c.allergies, c.medical, c.doctor, fam(c.familyId).name, c.start, c.status]; })));
    });
    var ak = $('#addKid'); if(ak) ak.addEventListener('click', function(){ childForm(null); });
  }

  function childPanel(c){
    var f = fam(c.familyId), last = Store.where('attendance', function(a){ return a.childId === c.id; }).sort(function(a, b){ return a.date < b.date ? 1 : -1; }).slice(0, 10);
    var d = App.panel(kname(c),
      '<div class="row" style="border:0;padding-top:0">' + kav(c, 'big') + '<div class="grow"><b style="font-size:20px">' + esc(kname(c)) + '</b><small>' + Store.age(c.dob) + ' · born ' + App.day(c.dob, { month:'long', day:'numeric', year:'numeric' }) + '</small><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' + gBadge(c) + allergy(c) + '</div></div></div>' +
      '<dl class="meta">' +
        '<dt>Schedule</dt><dd>' + (c.schedule === 'full' ? 'Full-time' : 'Part-time') + ': ' + c.days.join(', ') + '</dd>' +
        '<dt>Started</dt><dd>' + App.day(c.start, { month:'long', day:'numeric', year:'numeric' }) + (c.status === 'enrolling' ? ' (upcoming)' : '') + '</dd>' +
        '<dt>Allergies</dt><dd>' + esc(c.allergies || 'None') + '</dd>' +
        '<dt>Medical</dt><dd>' + esc(c.medical || 'None') + '</dd>' +
        '<dt>Doctor</dt><dd>' + esc(c.doctor || '') + '</dd>' +
        '<dt>Potty</dt><dd>' + esc(c.potty || '') + '</dd>' +
        '<dt>Immunizations</dt><dd>' + (c.immunizationsDue ? (c.immunizationsDue < T ? '<b style="color:#b42318">Overdue since ' + App.day(c.immunizationsDue) + '</b>' : 'Next due ' + App.day(c.immunizationsDue)) : 'On file') + '</dd>' +
        '<dt>Photos</dt><dd>' + (c.photo ? 'Allowed' : '<b>Do not photograph</b>') + '</dd>' +
        (c.notes ? '<dt>Notes</dt><dd>' + esc(c.notes) + '</dd>' : '') +
      '</dl>' +
      '<h3 style="font-size:16px;margin:0 0 8px">Family and pickups</h3><div class="rows" style="margin:0 0 18px">' +
        parentsOf(c.familyId).map(function(p){ return '<div class="row"><span class="dot" style="--k:var(--orange)"></span><div class="grow"><b>' + esc(p.name) + '</b><small>Parent · <a href="tel:' + esc(p.phone) + '">' + esc(p.phone) + '</a></small></div></div>'; }).join('') +
        (f.pickups || []).map(function(p){ return '<div class="row"><span class="dot" style="--k:var(--sky)"></span><div class="grow"><b>' + esc(p.name) + '</b><small>' + esc(p.relation) + ' · ' + esc(p.phone) + '</small></div></div>'; }).join('') +
      '</div>' +
      '<h3 style="font-size:16px;margin:0 0 8px">Recent attendance</h3><div class="rows" style="margin:0 0 18px">' + (last.map(function(a){ return '<div class="row"><div class="grow"><b>' + App.day(a.date) + '</b><small>' + App.time(a.in) + ' – ' + (a.out ? App.time(a.out) : 'still here') + (a.temp ? ' · ' + a.temp + '°F' : '') + '</small></div><small>' + App.hours(a.in, a.out).toFixed(1) + ' h</small></div>'; }).join('') || '<p class="hint">No visits yet.</p>') + '</div>' +
      '<div class="acts" style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn sm" href="#reports">Daily report</a>' + (me.role === 'admin' ? '<button class="btn sm ghost" id="ed">Edit</button><a class="btn sm ghost" href="#families/' + c.familyId + '">Family</a>' : '') + '</div>');
    var ed = $('#ed', d); if(ed) ed.addEventListener('click', function(){ d.close(); childForm(c); });
    $$('a[href^="#"]', d).forEach(function(a){ a.addEventListener('click', function(){ d.close(); }); });
  }

  function childForm(c){
    var isNew = !c; c = c || { first:'', last:'', dob:'', familyId:'', schedule:'full', days:WD.slice(), allergies:'', medical:'', doctor:'', start:T, status:'active', photo:true, potty:'diapers', immunizationsDue:'' };
    var fams = Store.all('families').sort(function(a, b){ return a.name < b.name ? -1 : 1; });
    var d = App.panel(isNew ? 'Add a child' : 'Edit ' + c.first,
      '<form class="f" id="cf">' +
        '<div class="two"><label>First name<input name="first" required value="' + esc(c.first) + '"></label><label>Last name<input name="last" required value="' + esc(c.last) + '"></label></div>' +
        '<div class="two"><label>Date of birth<input name="dob" type="date" required value="' + esc(c.dob) + '"></label><label>Family<select name="familyId">' + fams.map(function(f){ return '<option value="' + f.id + '"' + (f.id === c.familyId ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="two"><label>Schedule<select name="schedule"><option value="full"' + (c.schedule === 'full' ? ' selected' : '') + '>Full-time</option><option value="part"' + (c.schedule === 'part' ? ' selected' : '') + '>Part-time</option></select></label><label>Start date<input name="start" type="date" value="' + esc(c.start) + '"></label></div>' +
        '<span class="hint">Days</span><div class="checks-row">' + WD.map(function(x){ return '<label><input type="checkbox" name="days" data-list value="' + x + '"' + (c.days.indexOf(x) >= 0 ? ' checked' : '') + '> ' + x[0].toUpperCase() + x.slice(1) + '</label>'; }).join('') + '</div>' +
        '<label>Allergies<input name="allergies" value="' + esc(c.allergies) + '" placeholder="None"></label>' +
        '<label>Medical notes<input name="medical" value="' + esc(c.medical) + '"></label>' +
        '<div class="two"><label>Doctor<input name="doctor" value="' + esc(c.doctor) + '"></label><label>Immunizations next due<input name="immunizationsDue" type="date" value="' + esc(c.immunizationsDue) + '"></label></div>' +
        '<div class="two"><label>Potty<select name="potty">' + ['diapers','training','trained'].map(function(x){ return '<option' + (c.potty === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label>Status<select name="status">' + [['active','Attending'],['enrolling','Starting soon'],['withdrawn','Left Allkidz']].map(function(x){ return '<option value="' + x[0] + '"' + (c.status === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="check"><input type="checkbox" name="photo"' + (c.photo ? ' checked' : '') + '> Photos allowed</label>' +
        '<div class="acts"><button class="btn" type="submit">Save</button></div>' +
      '</form>');
    $('#cf', d).addEventListener('submit', function(e){
      e.preventDefault();
      var o = App.formData(this);
      for(var k in o) c[k] = o[k];
      Store.save('children', c);
      if(isNew) Store.log(c.first + ' ' + c.last + ' was added to the roster.', 'orange', 'child');
      App.toast('Saved'); d.close(); R.refresh();
    });
  }

  /* ======================================================================
     FAMILIES (director)
     ====================================================================== */
  function familiesView(main, arg){
    var fams = Store.all('families').sort(function(a, b){ return a.name < b.name ? -1 : 1; });
    var waiting = Store.where('users', function(u){ return u.status === 'pending'; });
    main.innerHTML = pageH('Families', 'Families', fams.length + ' families. Balances include every open bill.',
      '<button class="btn sm" id="addFam">+ Add a family</button><button class="btn sm ghost" id="stmts">Year-end statements</button>') +
      (waiting.length ? '<div class="card" style="margin:0 0 18px"><div class="card-h"><h2>Accounts waiting for approval</h2></div><div class="rows">' + waiting.map(function(u){
        return '<div class="row">' + App.avatar(u.name) + '<div class="grow"><b>' + esc(u.name) + '</b><small>' + esc(u.email) + (u.note ? ' · ' + esc(u.note) : '') + '</small></div>' +
          '<select data-fam-for="' + u.id + '" style="border:2px solid rgba(0,0,0,.1);border-radius:12px;padding:8px">' + fams.map(function(f){ return '<option value="' + f.id + '">' + esc(f.name) + ' family</option>'; }).join('') + '</select>' +
          '<button class="btn sm lime" data-approve="' + u.id + '">Approve</button><button class="btn sm ghost" data-deny="' + u.id + '">Decline</button></div>';
      }).join('') + '</div></div>' : '') +
      '<div class="table-wrap"><table class="t"><thead><tr><th>Family</th><th>Parents</th><th>Children</th><th class="r">Balance</th><th>Last payment</th></tr></thead><tbody>' + fams.map(function(f){
        var bal = Store.balance(f.id), pays = [];
        famInvoices(f.id).forEach(function(i){ (i.payments || []).forEach(function(p){ if(!p.pending) pays.push(p); }); });
        pays.sort(function(a, b){ return a.at < b.at ? 1 : -1; });
        return '<tr data-id="' + f.id + '"><td><b>' + esc(f.name) + '</b><small>' + esc(f.address || '') + '</small></td><td data-l="Parents">' + parentsOf(f.id).map(function(p){ return esc(p.name); }).join('<br>') + '</td>' +
          '<td data-l="Children">' + kidsOf(f.id).map(function(c){ return esc(c.first); }).join(', ') + '</td><td data-l="Balance" class="r"><b style="color:' + (bal > 0 ? '#b42318' : 'inherit') + '">' + money(bal) + '</b></td>' +
          '<td data-l="Last payment">' + (pays[0] ? money(pays[0].amount) + ' <small>' + esc(pays[0].method) + ' · ' + App.when(pays[0].at) + '</small>' : '<small>None yet</small>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    $$('tr[data-id]', main).forEach(function(tr){ tr.addEventListener('click', function(){ familyPanel(Store.get('families', tr.getAttribute('data-id'))); }); });
    $$('[data-approve]', main).forEach(function(b){ b.addEventListener('click', function(){
      var u = Store.get('users', b.getAttribute('data-approve')); u.familyId = $('[data-fam-for="' + u.id + '"]').value; u.status = 'active'; Store.save('users', u);
      Store.log(u.name + '’s parent account was approved.', 'lime', 'userplus'); App.toast(u.name + ' can now sign in'); R.refresh(); counts();
    }); });
    $$('[data-deny]', main).forEach(function(b){ b.addEventListener('click', function(){ var u = Store.get('users', b.getAttribute('data-deny')); u.status = 'disabled'; Store.save('users', u); App.toast('Declined'); R.refresh(); counts(); }); });
    $('#addFam').addEventListener('click', function(){ familyForm(null); });
    $('#stmts').addEventListener('click', statements);
    if(arg && Store.get('families', arg)) familyPanel(Store.get('families', arg));
  }
  function familyPanel(f){
    var inv = famInvoices(f.id);
    var d = App.panel(f.name + ' family',
      '<dl class="meta"><dt>Address</dt><dd>' + esc(f.address || '') + '</dd><dt>Emergency</dt><dd>' + esc(f.emergency || '') + '</dd>' + (f.notes ? '<dt>Notes</dt><dd>' + esc(f.notes) + '</dd>' : '') + '<dt>Balance</dt><dd><b>' + money(Store.balance(f.id)) + '</b></dd></dl>' +
      '<h3 style="font-size:16px;margin:0 0 8px">Parents</h3><div class="rows" style="margin:0 0 16px">' + parentsOf(f.id).map(function(p){ return '<div class="row">' + App.avatar(p.name) + '<div class="grow"><b>' + esc(p.name) + '</b><small>' + esc(p.email) + ' · ' + esc(p.phone) + '</small></div></div>'; }).join('') + '</div>' +
      '<h3 style="font-size:16px;margin:0 0 8px">Children</h3><div class="rows" style="margin:0 0 16px">' + kidsOf(f.id).map(function(c){ return '<div class="row">' + kav(c) + '<div class="grow"><b>' + esc(kname(c)) + '</b><small>' + Store.age(c.dob) + ' · ' + Store.GROUPS[gk(c)].name + '</small></div>' + allergy(c) + '</div>'; }).join('') + '</div>' +
      '<h3 style="font-size:16px;margin:0 0 8px">Authorized pickups</h3><div class="rows" style="margin:0 0 16px">' + ((f.pickups || []).map(function(p){ return '<div class="row"><div class="grow"><b>' + esc(p.name) + '</b><small>' + esc(p.relation) + ' · ' + esc(p.phone) + '</small></div></div>'; }).join('') || '<p class="hint">Only parents.</p>') + '</div>' +
      (f.charges && f.charges.length ? '<h3 style="font-size:16px;margin:0 0 8px">Charges for the next bill</h3><div class="rows" style="margin:0 0 16px">' + f.charges.map(function(x){ return '<div class="row"><div class="grow"><b>' + esc(x.label) + '</b></div><b>' + money(x.amount) + '</b></div>'; }).join('') + '</div>' : '') +
      '<h3 style="font-size:16px;margin:0 0 8px">Bills</h3><div class="rows" style="margin:0 0 18px">' + inv.slice(0, 6).map(function(i){ return '<a class="row" href="#billing/' + i.id + '"><div class="grow"><b>Week of ' + App.day(i.weekOf, { month:'short', day:'numeric' }) + '</b><small>' + esc(i.number) + '</small></div><b>' + money(Store.invTotal(i)) + '</b>' + badgeStatus(Store.invStatus(i)) + '</a>'; }).join('') + '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn sm" href="#messages/new/' + f.id + '">Message</a><button class="btn sm ghost" id="ef">Edit family</button><button class="btn sm ghost" id="ap">+ Parent login</button><button class="btn sm ghost" id="st">Statement ' + (new Date().getFullYear()) + '</button></div>');
    $$('a[href^="#"]', d).forEach(function(a){ a.addEventListener('click', function(){ d.close(); }); });
    $('#ef', d).addEventListener('click', function(){ d.close(); familyForm(f); });
    $('#st', d).addEventListener('click', function(){ d.close(); statement(f, new Date().getFullYear()); });
    $('#ap', d).addEventListener('click', function(){ d.close(); inviteForm('parent', f.id); });
  }
  function familyForm(f){
    var isNew = !f; f = f || { name:'', address:'', emergency:'', notes:'', pickups:[] };
    var d = App.panel(isNew ? 'Add a family' : 'Edit the ' + f.name + ' family',
      '<form class="f" id="ff"><label>Family name<input name="name" required value="' + esc(f.name) + '"></label><label>Address<input name="address" value="' + esc(f.address) + '"></label>' +
      '<label>Emergency contact<input name="emergency" value="' + esc(f.emergency) + '"></label>' +
      '<label>Authorized pickups <span class="hint">One per line: name, relation, phone</span><textarea name="pickups">' + esc((f.pickups || []).map(function(p){ return [p.name, p.relation, p.phone].join(', '); }).join('\n')) + '</textarea></label>' +
      '<label>Notes<textarea name="notes">' + esc(f.notes) + '</textarea></label><div class="acts"><button class="btn" type="submit">Save</button></div></form>');
    $('#ff', d).addEventListener('submit', function(e){
      e.preventDefault(); var o = App.formData(this);
      f.name = o.name; f.address = o.address; f.emergency = o.emergency; f.notes = o.notes;
      f.pickups = o.pickups.split('\n').map(function(l){ var p = l.split(',').map(function(s){ return s.trim(); }); return p[0] ? { name:p[0], relation:p[1] || 'Pickup', phone:p[2] || '' } : null; }).filter(Boolean);
      Store.save('families', f); App.toast('Saved'); d.close(); R.refresh();
    });
  }
  function inviteForm(role, familyId){
    var d = App.panel(role === 'parent' ? 'Add a parent login' : 'Invite a teacher',
      '<form class="f" id="if"><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Phone<input name="phone" type="tel"></label>' +
      (role === 'teacher' ? '<label>Title<input name="title" value="Teacher"></label>' : '') +
      '<p class="hint">They get a one-time password to sign in with, and choose their own the first time.</p><div class="acts"><button class="btn" type="submit">Create login</button></div></form>');
    $('#if', d).addEventListener('submit', function(e){
      e.preventDefault(); var o = App.formData(this);
      if(Store.where('users', function(u){ return u.email.toLowerCase() === o.email.toLowerCase(); }).length) return App.toast('Someone already uses that email.', true);
      var pw = Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6);
      var u = Store.save('users', { role:role, name:o.name, email:o.email, phone:o.phone, title:o.title, familyId:familyId || null, password:pw, mustChange:true, color: App.COLORS[Math.floor(Math.random() * 6)] });
      Store.log(u.name + ' was given a ' + role + ' login.', 'violet', 'userplus');
      $('.pb', d).innerHTML = '<p>Send ' + esc(first(u.name)) + ' this one-time password with the sign-in link. It works once; then they choose their own.</p>' + App.copyBox(pw) + '<p class="hint">Sign in at ' + esc(location.origin + App.BASE + 'login') + ' with ' + esc(u.email) + '.</p>';
      R.refresh();
    });
  }

  /* statements for taxes */
  function statements(){
    var y = new Date().getFullYear();
    var d = App.panel('Year-end statements',
      '<p>One statement per family with every payment made in the year, for their taxes (handbook: filing your taxes).</p><form class="f" id="sy"><label>Year<select name="y"><option>' + y + '</option><option>' + (y - 1) + '</option></select></label></form>' +
      '<div class="rows">' + Store.all('families').map(function(f){ return '<div class="row"><div class="grow"><b>' + esc(f.name) + '</b></div><button class="btn sm ghost" data-st="' + f.id + '">Open</button></div>'; }).join('') + '</div>');
    $$('[data-st]', d).forEach(function(b){ b.addEventListener('click', function(){ var yy = +$('select', d).value; d.close(); statement(Store.get('families', b.getAttribute('data-st')), yy); }); });
  }
  function statement(f, y){
    var pays = [];
    famInvoices(f.id).forEach(function(i){ (i.payments || []).forEach(function(p){ if(!p.pending && p.at.slice(0,4) === String(y)) pays.push({ p:p, i:i }); }); });
    pays.sort(function(a, b){ return a.p.at < b.p.at ? -1 : 1; });
    var total = pays.reduce(function(s, x){ return s + Number(x.p.amount); }, 0);
    var main = $('#main');
    main.innerHTML = '<div class="no-print" style="display:flex;gap:10px;margin:0 0 18px"><a class="btn sm ghost" href="#families">&larr; Families</a><button class="btn sm" onclick="window.print()">Print or save as PDF</button></div>' +
      '<div class="card" style="max-width:820px;padding:clamp(22px,4vw,44px)"><div style="display:flex;gap:16px;align-items:center;margin:0 0 22px"><div style="width:56px">' + App.MARK + '</div><div><b style="font-family:var(--display);font-size:20px">' + esc(S.name) + '</b><br><small>' + esc(S.address) + ' · ' + esc(S.phone) + '</small></div></div>' +
      '<h1 style="font-size:30px;margin:0 0 6px">Childcare payment statement, ' + y + '</h1><p style="margin:0 0 18px;color:var(--ink-2)">For the ' + esc(f.name) + ' family: ' + parentsOf(f.id).map(function(p){ return esc(p.name); }).join(' and ') + '. Children: ' + kidsOf(f.id, true).map(function(c){ return esc(kname(c)); }).join(', ') + '.</p>' +
      '<table class="inv-lines"><tbody>' + pays.map(function(x){ return '<tr><td>' + App.day(x.p.at.slice(0,10), { month:'short', day:'numeric', year:'numeric' }) + '</td><td>' + esc(x.i.number) + ' · week of ' + App.day(x.i.weekOf, { month:'short', day:'numeric' }) + '</td><td>' + esc(x.p.method) + '</td><td class="r">' + money(x.p.amount) + '</td></tr>'; }).join('') +
      '<tr class="tot"><td colspan="3">Total paid in ' + y + '</td><td class="r">' + money(total) + '</td></tr></tbody></table>' +
      '<p style="font-size:14px;color:var(--ink-2)">Provider tax ID: ' + esc(S.taxId || 'on file (add it in Settings)') + '. Please claim only payments made to Allkidz under this tax ID.</p><p style="font-size:14px;color:var(--ink-2)">Signed: ____________________ &nbsp; Hannah Anokye-Gyambrah, Director</p></div>';
  }

  /* ======================================================================
     STAFF (director)
     ====================================================================== */
  function staffView(main){
    var staff = Store.where('users', function(u){ return u.role !== 'parent' && u.status !== 'disabled'; });
    var mon = Store.monday();
    main.innerHTML = pageH('Staff', 'The team', 'Time clock, hours this week, and every certificate with its renewal date.',
      '<button class="btn sm" id="inv">+ Invite a teacher</button><button class="btn sm ghost" id="ts">Timesheet CSV</button>') +
      '<div class="grid g3">' + staff.map(function(u){
        var k = Store.where('clock', function(x){ return x.userId === u.id && x.date === T; }).slice(-1)[0];
        var wk = Store.where('clock', function(x){ return x.userId === u.id && x.date >= Store.iso(mon); }).reduce(function(s, x){ return s + App.hours(x.in, x.out); }, 0);
        var certs = Store.where('certs', function(x){ return x.userId === u.id; });
        return '<div class="card"><div class="row" style="border:0;padding-top:0">' + App.avatar(u.name, 'var(--' + (u.color || 'sun') + ')', 'big') + '<div class="grow"><b style="font-size:18px">' + esc(u.name) + '</b><small>' + esc(u.title || u.role) + '</small><div style="margin-top:6px"><span class="badge b-' + u.role + '">' + u.role + '</span> ' + (k && !k.out ? '<span class="badge b-in">On since ' + App.time(k.in) + '</span>' : '<span class="badge b-out">Off</span>') + '</div></div></div>' +
          '<dl class="kv" style="margin:6px 0 14px"><dt>This week</dt><dd>' + wk.toFixed(1) + ' hours</dd><dt>Phone</dt><dd>' + esc(u.phone || '') + '</dd></dl>' +
          '<div class="rows">' + certs.map(function(x){
            var st = !x.expires ? '' : x.expires < T ? '<span class="badge b-expired">Expired</span>' : x.expires < Store.iso(Store.addDays(new Date(), 60)) ? '<span class="badge b-due">Due ' + App.day(x.expires, { month:'short', day:'numeric' }) + '</span>' : '<small>' + App.day(x.expires, { month:'short', year:'numeric' }) + '</small>';
            return '<div class="row"><div class="grow"><b style="font-size:14px">' + esc(x.name) + '</b></div>' + st + '</div>';
          }).join('') + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sm ' + (k && !k.out ? 'ghost' : 'lime') + '" data-clock="' + u.id + '">' + (k && !k.out ? 'Clock out' : 'Clock in') + '</button><button class="btn sm ghost" data-cert="' + u.id + '">+ Certificate</button></div></div>';
      }).join('') + '</div>';
    $('#inv').addEventListener('click', function(){ inviteForm('teacher'); });
    $$('[data-clock]', main).forEach(function(b){ b.addEventListener('click', function(){ clock(b.getAttribute('data-clock')); R.refresh(); }); });
    $$('[data-cert]', main).forEach(function(b){ b.addEventListener('click', function(){
      var d = App.panel('Add a certificate', '<form class="f" id="cf"><label>Name<input name="name" required placeholder="CPR & First Aid"></label><div class="two"><label>Issued<input name="issued" type="date" value="' + T + '"></label><label>Expires<input name="expires" type="date"></label></div><div class="acts"><button class="btn" type="submit">Save</button></div></form>');
      $('#cf', d).addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); o.userId = b.getAttribute('data-cert'); Store.save('certs', o); d.close(); R.refresh(); });
    }); });
    $('#ts').addEventListener('click', function(){
      var rows = [['Name','Date','In','Out','Hours']];
      Store.where('clock', function(x){ return x.date >= Store.iso(Store.addDays(mon, -14)); }).forEach(function(x){ rows.push([uname(x.userId), x.date, x.in.slice(11), x.out ? x.out.slice(11) : '', App.hours(x.in, x.out).toFixed(2)]); });
      App.csv('allkidz-timesheet.csv', rows);
    });
  }
  function clock(uid){
    var k = Store.where('clock', function(x){ return x.userId === uid && x.date === T && !x.out; })[0];
    if(k){ k.out = stamp(); Store.save('clock', k); App.toast(first(uname(uid)) + ' clocked out'); }
    else { Store.save('clock', { userId:uid, date:T, in:stamp(), out:null }); App.toast(first(uname(uid)) + ' clocked in'); }
  }

  /* ======================================================================
     ENROLLMENT PIPELINE (director)
     ====================================================================== */
  var STAGES = [['new','New','var(--pink)'],['tour','Tour booked','var(--sun)'],['waitlist','Waitlist','var(--sky)'],['offered','Place offered','var(--violet)'],['enrolled','Enrolled','var(--lime)']];
  function enrollView(main, arg){
    var apps = Store.all('applications').filter(function(a){ return a.status !== 'declined'; });
    var openSpots = Number(S.capacity || 12) - kids().length;
    main.innerHTML = pageH('Enrollment', 'Enrollment', 'Tour requests and applications from the website land here. Drag a card to move it along.',
      '<button class="btn sm" id="addApp">+ Add an inquiry</button><button class="btn sm ghost" id="csvApps">Export CSV</button>') +
      '<div class="grid g4" style="margin:0 0 18px">' +
        stat('New inquiries', apps.filter(function(a){ return a.status === 'new'; }).length, 'var(--pink)', 'inbox') +
        stat('Tours booked', apps.filter(function(a){ return a.status === 'tour'; }).length, 'var(--sun)', 'calendar') +
        stat('On the waitlist', apps.filter(function(a){ return a.status === 'waitlist'; }).length, 'var(--sky)', 'people') +
        stat('Open places', Math.max(0, openSpots), 'var(--lime)', 'home', null, 'Licensed for ' + (S.capacity || 12)) +
      '</div>' +
      '<div class="board" id="board">' + STAGES.map(function(s){
        var list = apps.filter(function(a){ return a.status === s[0]; });
        return '<div class="col" data-stage="' + s[0] + '" style="--k:' + s[2] + '"><div class="col-h"><i></i>' + s[1] + '<span>' + list.length + '</span></div>' + list.map(function(a){
          var g = a.childDob ? Store.group(a.childDob) : '';
          return '<a class="lead" draggable="true" href="#enrollment/' + a.id + '" data-app="' + a.id + '" style="--k:' + s[2] + '"><b>' + esc(a.childName || 'Child') + '</b><small>' + esc(a.parentName) + (a.childDob ? ' · ' + Store.age(a.childDob) : '') + '</small>' +
            '<div class="tags">' + (g ? '<span class="badge soft g-' + g + '">' + Store.GROUPS[g].name + '</span>' : '') + (a.start ? '<span class="badge soft">Start ' + App.day(a.start, { month:'short', day:'numeric' }) + '</span>' : '') + (a.tourAt && s[0] === 'tour' ? '<span class="badge soft" style="--k:var(--sun)">' + App.day(a.tourAt) + ' ' + App.time(a.tourAt) + '</span>' : '') + '</div>' +
            '<small style="margin-top:8px">' + esc(a.source || '') + ' · ' + App.when(a.at) + '</small></a>';
        }).join('') + '</div>';
      }).join('') + '</div>';
    var dragId = null;
    $$('.lead', main).forEach(function(el){
      el.addEventListener('dragstart', function(e){ dragId = el.getAttribute('data-app'); e.dataTransfer.setData('text/plain', dragId); });
    });
    $$('.col', main).forEach(function(col){
      col.addEventListener('dragover', function(e){ e.preventDefault(); col.classList.add('drop'); });
      col.addEventListener('dragleave', function(){ col.classList.remove('drop'); });
      col.addEventListener('drop', function(e){
        e.preventDefault(); col.classList.remove('drop');
        var a = Store.get('applications', e.dataTransfer.getData('text/plain') || dragId), st = col.getAttribute('data-stage');
        if(!a || a.status === st) return;
        if(st === 'enrolled'){ appPanel(a, true); return; }
        a.status = st; Store.save('applications', a); Store.log(a.childName + ' moved to ' + col.querySelector('.col-h').textContent.replace(/\d+$/, '') + '.', 'pink', 'inbox'); R.refresh(); counts();
      });
    });
    $('#addApp').addEventListener('click', function(){ appForm(); });
    $('#csvApps').addEventListener('click', function(){ App.csv('allkidz-enrollment.csv', [['Status','Parent','Email','Phone','Child','DOB','Schedule','Start','Source','Received','Message']].concat(Store.all('applications').map(function(a){ return [a.status, a.parentName, a.email, a.phone, a.childName, a.childDob, a.schedule, a.start, a.source, a.at, a.message]; }))); });
    if(arg && Store.get('applications', arg)) appPanel(Store.get('applications', arg));
  }
  function appForm(){
    var d = App.panel('Add an inquiry', '<form class="f" id="af"><div class="two"><label>Parent name<input name="parent_name" required></label><label>Phone<input name="phone"></label></div><label>Email<input name="email" type="email"></label><div class="two"><label>Child&rsquo;s name<input name="child_name" required></label><label>Date of birth<input name="child_dob" type="date"></label></div><div class="two"><label>Schedule<select name="schedule"><option value="full">Full-time</option><option value="part">Part-time</option><option value="dropin">Drop-in</option></select></label><label>Start<input name="start" type="date"></label></div><label>Notes<textarea name="message"></textarea></label><div class="acts"><button class="btn" type="submit">Add</button></div></form>');
    $('#af', d).addEventListener('submit', function(e){ e.preventDefault(); var a = Store.addApplication(App.formData(this), 'inquiry'); a.source = 'Phone or in person'; Store.save('applications', a); d.close(); R.refresh(); counts(); });
  }
  function appPanel(a, enrolling){
    var x = a.details || {}, g = a.childDob ? Store.group(a.childDob) : '';
    var d = App.panel(a.childName || 'Application',
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px"><span class="badge b-' + a.status + '">' + a.status + '</span>' + (g ? '<span class="badge soft g-' + g + '">' + Store.GROUPS[g].name + '</span>' : '') + '<span class="badge soft">' + esc(a.kind) + '</span></div>' +
      '<dl class="meta"><dt>Parent</dt><dd>' + esc(a.parentName) + '</dd><dt>Email</dt><dd>' + (a.email ? '<a href="mailto:' + esc(a.email) + '">' + esc(a.email) + '</a>' : '') + '</dd><dt>Phone</dt><dd>' + (a.phone ? '<a href="tel:' + esc(a.phone) + '">' + esc(a.phone) + '</a>' : '') + '</dd>' +
      '<dt>Child</dt><dd>' + esc(a.childName) + (a.childDob ? ' · ' + Store.age(a.childDob) + ' (born ' + App.day(a.childDob, { month:'short', day:'numeric', year:'numeric' }) + ')' : '') + '</dd><dt>Schedule</dt><dd>' + esc({ full:'Full-time', part:'Part-time', dropin:'Breaks / drop-in' }[a.schedule] || a.schedule || '') + (x.days ? ' · ' + esc(x.days) : '') + '</dd><dt>Start</dt><dd>' + (a.start ? App.day(a.start, { month:'long', day:'numeric', year:'numeric' }) : '') + '</dd>' +
      (x.allergies ? '<dt>Allergies</dt><dd>' + esc(x.allergies) + '</dd>' : '') + (x.medical ? '<dt>Medical</dt><dd>' + esc(x.medical) + '</dd>' : '') + (x.doctor ? '<dt>Doctor</dt><dd>' + esc(x.doctor) + '</dd>' : '') + (x.emergency ? '<dt>Emergency</dt><dd>' + esc(x.emergency) + ' ' + esc(x.emergency_phone || '') + '</dd>' : '') + (x.pickups ? '<dt>Pickups</dt><dd>' + esc(x.pickups) + '</dd>' : '') + (x.heard ? '<dt>Heard via</dt><dd>' + esc(x.heard) + '</dd>' : '') +
      '<dt>Source</dt><dd>' + esc(a.source || '') + ' · ' + App.when(a.at) + '</dd></dl>' +
      (a.message || x.about ? '<p class="quote">' + esc(a.message || x.about) + '</p>' : '') +
      '<form class="f" id="tour" style="margin:0 0 16px"><label>Tour date and time<input type="datetime-local" name="tourAt" value="' + esc(a.tourAt || '') + '"></label><div class="acts"><button class="btn sm ghost" type="submit">Save tour time</button></div></form>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px">' + STAGES.slice(0, 4).map(function(s){ return '<button class="btn sm ghost" data-st="' + s[0] + '"' + (a.status === s[0] ? ' disabled' : '') + '>' + s[1] + '</button>'; }).join('') + '<button class="btn sm danger" data-st="declined">Decline</button></div>' +
      (a.status !== 'enrolled' ? '<div class="card tint" style="--k:var(--lime)"><h3 style="margin:0 0 6px;font-size:17px">Enroll ' + esc(first(a.childName)) + '</h3><p style="margin:0 0 12px;color:var(--ink-2);font-size:14.5px">Creates the family, the child&rsquo;s record and a parent login in one step, from this application.</p><button class="btn lime" id="conv">Enroll and create the family account</button></div>' : ''));
    $$('[data-st]', d).forEach(function(b){ b.addEventListener('click', function(){ a.status = b.getAttribute('data-st'); Store.save('applications', a); App.toast('Moved'); d.close(); R.refresh(); counts(); }); });
    $('#tour', d).addEventListener('submit', function(e){ e.preventDefault(); a.tourAt = App.formData(this).tourAt; if(a.tourAt && a.status === 'new') a.status = 'tour'; Store.save('applications', a); App.toast('Tour saved: it shows on the calendar'); d.close(); R.refresh(); counts(); });
    var conv = $('#conv', d);
    if(conv){
      if(enrolling) conv.focus();
      conv.addEventListener('click', function(){
        var last = (a.parentName || 'Family').trim().split(' ').slice(-1)[0];
        var existing = Store.where('users', function(u){ return a.email && u.email.toLowerCase() === a.email.toLowerCase(); })[0];
        var f = existing && existing.familyId ? fam(existing.familyId) : Store.save('families', { name:last, address:x.address || '', emergency:[x.emergency, x.emergency_phone].filter(Boolean).join(' · '), notes:'', pickups:(x.pickups || '').split(/\n|;/).map(function(l){ l = l.trim(); return l ? { name:l, relation:'Pickup', phone:'' } : null; }).filter(Boolean) });
        var cn = (a.childName || 'Child').trim().split(' ');
        var dup = Store.where('children', function(c){ return c.familyId === f.id && c.first === cn[0]; })[0];
        var c = dup || { familyId:f.id, first:cn[0], last:cn.slice(1).join(' ') || last, dob:a.childDob || T, schedule:a.schedule === 'part' ? 'part' : 'full', days:(x.days ? x.days.split(/,\s*/) : WD.slice()), allergies:x.allergies || '', medical:x.medical || '', doctor:x.doctor || '', start:a.start || T, potty:x.potty || 'diapers', photo:x.photo !== undefined ? x.photo === 'yes' : true, immunizationsDue:'' };
        c.status = (c.start || T) > T ? 'enrolling' : 'active';
        Store.save('children', c);
        var pw = '';
        if(!existing){
          pw = Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6);
          Store.save('users', { role:'parent', name:a.parentName, email:a.email || (Store.uid('p') + '@allkidz.demo'), phone:a.phone, familyId:f.id, password:pw, mustChange:true });
        }
        a.status = 'enrolled'; Store.save('applications', a);
        Store.log(c.first + ' ' + c.last + ' is enrolled. Welcome, ' + f.name + ' family!', 'lime', 'star');
        $('.pb', d).innerHTML = '<h3 style="margin:0 0 8px">' + esc(c.first) + ' is enrolled.</h3><p>The ' + esc(f.name) + ' family, ' + esc(c.first) + '&rsquo;s record' + (pw ? ' and a parent login are' : ' is') + ' ready. ' + (c.status === 'enrolling' ? 'They show as starting ' + App.day(c.start) + '.' : '') + '</p>' +
          (pw ? '<p>Send ' + esc(first(a.parentName)) + ' this one-time password for ' + esc(a.email) + ':</p>' + App.copyBox(pw) : '<p>' + esc(first(a.parentName)) + ' already has a login.</p>') +
          '<p class="hint">Next: generate the registration fee on the billing page.</p><a class="btn" href="#billing">Go to billing</a>';
        $('a', d).addEventListener('click', function(){ d.close(); });
        counts();
      });
    }
  }

  /* ======================================================================
     BILLING (director)
     ====================================================================== */
  function billingView(main, arg){
    var inv = Store.all('invoices').sort(function(a, b){ return a.weekOf < b.weekOf ? 1 : a.weekOf > b.weekOf ? -1 : a.number < b.number ? -1 : 1; });
    var outstanding = 0, overdue = 0, month = T.slice(0, 7), collected = 0;
    inv.forEach(function(i){ var b = Store.invTotal(i) - Store.invPaid(i); outstanding += Math.max(0, b); if(Store.invStatus(i) === 'overdue') overdue += b; (i.payments || []).forEach(function(p){ if(!p.pending && p.at.slice(0, 7) === month) collected += Number(p.amount); }); });
    var next = Store.iso(Store.addDays(Store.monday(), 7)), weekly = kids().reduce(function(s, c){ return s + Number(S.rates[c.schedule] || 0); }, 0);
    var pend = pendingPayments();
    main.innerHTML = pageH('Billing', 'Billing', 'Weekly tuition, due the Friday before each week of care. Late fees follow the handbook.',
      '<button class="btn sm" id="gen">Bill next week</button><button class="btn sm ghost" id="late">Apply late fees</button><button class="btn sm ghost" id="csvInv">Export CSV</button>') +
      '<div class="grid g4" style="margin:0 0 18px">' +
        stat('Outstanding', money(outstanding), 'var(--sun)', 'money') +
        stat('Overdue', money(overdue), 'var(--pink)', 'alert') +
        stat('Collected in ' + new Date().toLocaleDateString(undefined, { month:'long' }), money(collected), 'var(--lime)', 'check') +
        stat('Next week’s tuition', money(weekly), 'var(--sky)', 'calendar', null, 'Week of ' + App.day(next, { month:'short', day:'numeric' })) +
      '</div>' +
      (pend.length ? '<div class="card" style="margin:0 0 18px"><div class="card-h"><h2>Payments to confirm</h2></div><div class="rows">' + pend.map(function(x){
        return '<div class="row"><span class="dot" style="--k:var(--sun)"></span><div class="grow"><b>' + esc(fam(x.inv.familyId).name) + ' sent ' + money(x.p.amount) + ' by ' + esc(x.p.method) + '</b><small>' + esc(x.inv.number) + (x.p.ref ? ' · ' + esc(x.p.ref) : '') + ' · ' + App.when(x.p.at) + '</small></div><button class="btn sm lime" data-ok="' + x.inv.id + '|' + x.p.id + '">Received</button><button class="btn sm ghost" data-no="' + x.inv.id + '|' + x.p.id + '">Not received</button></div>';
      }).join('') + '</div></div>' : '') +
      '<div class="tools"><input type="search" id="q" placeholder="Search by family or number..."><div class="pills" id="sf"><button class="on" data-s="">All</button><button data-s="open">Open</button><button data-s="overdue">Overdue</button><button data-s="paid">Paid</button></div></div>' +
      '<div class="table-wrap"><table class="t"><thead><tr><th>Bill</th><th>Family</th><th>Week of</th><th>Due</th><th class="r">Total</th><th class="r">Balance</th><th>Status</th></tr></thead><tbody id="rows"></tbody></table></div>';
    var sf = '';
    function draw(){
      var q = $('#q').value.trim().toLowerCase();
      $('#rows').innerHTML = inv.filter(function(i){ return (!sf || Store.invStatus(i) === sf) && (!q || (i.number + ' ' + fam(i.familyId).name).toLowerCase().indexOf(q) >= 0); }).map(function(i){
        var t = Store.invTotal(i), b = t - Store.invPaid(i);
        return '<tr data-id="' + i.id + '"><td><b>' + esc(i.number) + '</b></td><td data-l="Family">' + esc(fam(i.familyId).name) + '</td><td data-l="Week of">' + App.day(i.weekOf, { month:'short', day:'numeric' }) + '</td><td data-l="Due">' + App.day(i.due, { month:'short', day:'numeric' }) + '</td><td data-l="Total" class="r">' + money(t) + '</td><td data-l="Balance" class="r"><b>' + money(Math.max(0, b)) + '</b></td><td data-l="Status">' + badgeStatus(Store.invStatus(i)) + '</td></tr>';
      }).join('') || '<tr><td colspan="7"><p class="empty">No bills here.</p></td></tr>';
    }
    draw();
    $('#q').addEventListener('input', draw);
    $('#sf').addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; sf = b.getAttribute('data-s'); $$('#sf button').forEach(function(x){ x.classList.toggle('on', x === b); }); draw(); });
    $('#rows').addEventListener('click', function(e){ var tr = e.target.closest('tr[data-id]'); if(tr) invoicePanel(Store.get('invoices', tr.getAttribute('data-id'))); });
    $$('[data-ok],[data-no]', main).forEach(function(b){ b.addEventListener('click', function(){
      var ids = (b.getAttribute('data-ok') || b.getAttribute('data-no')).split('|'), i = Store.get('invoices', ids[0]);
      if(b.hasAttribute('data-ok')){ i.payments.forEach(function(p){ if(p.id === ids[1]) delete p.pending; }); Store.log(fam(i.familyId).name + ' family payment confirmed.', 'lime', 'money'); }
      else i.payments = i.payments.filter(function(p){ return p.id !== ids[1]; });
      Store.save('invoices', i); R.refresh(); counts();
    }); });
    $('#gen').addEventListener('click', function(){
      var due = Store.iso(Store.addDays(Store.parse(next), -3)), made = 0;
      if(due < T) due = T; // billed late in the week: due today, not already overdue
      Store.all('families').forEach(function(f, n){
        if(Store.where('invoices', function(i){ return i.familyId === f.id && i.weekOf === next; }).length) return;
        var items = kids(function(c){ return c.familyId === f.id; }).map(function(c){ return { label:c.first + ' · ' + (c.schedule === 'full' ? 'Full-time' : 'Part-time') + ' week', amount:Number(S.rates[c.schedule] || 0) }; });
        Store.where('children', function(c){ return c.familyId === f.id && c.status === 'enrolling' && !c.regBilled; }).forEach(function(c){ items.push({ label:'Registration fee · ' + c.first + ' (holds the place)', amount:Number(S.regFee || 0) }); c.regBilled = true; Store.save('children', c); });
        (f.charges || []).forEach(function(x){ items.push(x); });
        if(!items.length) return;
        f.charges = []; Store.save('families', f);
        Store.save('invoices', { number:'AK-' + next.replace(/-/g, '').slice(2) + '-' + (n + 1), familyId:f.id, weekOf:next, due:due, items:items, payments:[], created:Store.now() });
        made++;
      });
      if(made) Store.log(made + ' bills created for the week of ' + App.day(next, { month:'short', day:'numeric' }) + '.', 'sun', 'money');
      App.toast(made ? made + ' bills created, due ' + App.day(due) : 'Next week is already billed');
      R.refresh();
    });
    $('#late').addEventListener('click', function(){
      var n = 0;
      Store.all('invoices').forEach(function(i){
        if(Store.invStatus(i) !== 'overdue') return;
        var days = Math.floor((Store.parse(T) - Store.parse(i.due)) / 86400000);
        var fee = Math.min(days, 14) * Number(S.lateFeeDay || 10) + Math.max(0, days - 14) * Number(S.lateFeeDay2 || 20);
        i.items = i.items.filter(function(x){ return !x.lateFee; });
        i.items.push({ label:'Late payment fee: ' + days + ' day' + (days === 1 ? '' : 's') + ' (handbook policy)', amount:fee, fee:true, lateFee:true });
        Store.save('invoices', i); n++;
      });
      App.toast(n ? 'Late fees updated on ' + n + ' bill' + (n === 1 ? '' : 's') : 'Nothing is overdue');
      R.refresh();
    });
    $('#csvInv').addEventListener('click', function(){ App.csv('allkidz-billing.csv', [['Number','Family','Week of','Due','Total','Paid','Balance','Status']].concat(inv.map(function(i){ return [i.number, fam(i.familyId).name, i.weekOf, i.due, Store.invTotal(i), Store.invPaid(i), Store.invTotal(i) - Store.invPaid(i), Store.invStatus(i)]; }))); });
    if(arg && Store.get('invoices', arg)) invoicePanel(Store.get('invoices', arg));
  }
  function invoiceBody(i, editable){
    var t = Store.invTotal(i), p = Store.invPaid(i);
    return '<table class="inv-lines"><tbody>' + i.items.map(function(x, n){ return '<tr><td>' + esc(x.label) + '</td><td class="r">' + money(x.amount) + (editable ? '<button class="x" data-rm="' + n + '" aria-label="Remove line">&times;</button>' : '') + '</td></tr>'; }).join('') +
      '<tr class="tot"><td>Total</td><td class="r">' + money(t) + '</td></tr>' +
      (i.payments || []).map(function(x){ return '<tr><td>' + (x.pending ? 'Sent, waiting for confirmation' : 'Paid') + ' · ' + esc(x.method) + (x.ref ? ' · ' + esc(x.ref) : '') + ' · ' + App.day(x.at.slice(0,10)) + '</td><td class="r">' + (x.pending ? '' : '&minus;' + money(x.amount)) + '</td></tr>'; }).join('') +
      '<tr class="tot"><td>Balance</td><td class="r">' + money(Math.max(0, t - p)) + '</td></tr></tbody></table>';
  }
  function invoicePanel(i){
    var d = App.panel(i.number + ' · ' + fam(i.familyId).name,
      '<p style="margin:0 0 12px">' + badgeStatus(Store.invStatus(i)) + ' &nbsp;Week of ' + App.day(i.weekOf, { month:'long', day:'numeric' }) + ' · due ' + App.day(i.due) + '</p>' +
      '<div id="ib">' + invoiceBody(i, true) + '</div>' +
      '<form class="f" id="pay" style="margin:0 0 18px"><h3 style="margin:0;font-size:16px">Record a payment</h3><div class="two"><label>Amount<input name="amount" inputmode="decimal" value="' + Math.max(0, Store.invTotal(i) - Store.invPaid(i)) + '"></label><label>Method<select name="method">' + S.methods.map(function(m){ return '<option>' + esc(m) + '</option>'; }).join('') + '</select></label></div><label>Reference (check number, Zelle memo)<input name="ref"></label><div class="acts"><button class="btn lime" type="submit">Record payment</button><button class="btn sm danger" type="button" id="bounce">Check bounced</button></div></form>' +
      '<form class="f" id="line"><h3 style="margin:0;font-size:16px">Add a line</h3><div class="two"><label>Description<input name="label" required placeholder="Field trip: Discovery Museum"></label><label>Amount<input name="amount" inputmode="decimal" required placeholder="15"></label></div><div class="acts"><button class="btn sm ghost" type="submit">Add line</button><button class="btn sm ghost" type="button" onclick="window.print()">Print</button></div></form>');
    function redraw(){ $('#ib', d).innerHTML = invoiceBody(i, true); }
    $('#ib', d).addEventListener('click', function(e){ var b = e.target.closest('[data-rm]'); if(!b) return; i.items.splice(+b.getAttribute('data-rm'), 1); Store.save('invoices', i); redraw(); });
    $('#pay', d).addEventListener('submit', function(e){
      e.preventDefault(); var o = App.formData(this), amt = parseFloat(o.amount);
      if(!(amt > 0)) return App.toast('Enter the amount received.', true);
      i.payments = i.payments || []; i.payments.push({ id:Store.uid('p'), amount:amt, method:o.method, ref:o.ref, at:Store.now() });
      Store.save('invoices', i); Store.log(fam(i.familyId).name + ' family paid ' + money(amt) + ' by ' + o.method + '.', 'lime', 'money');
      App.toast('Payment recorded'); d.close(); R.refresh();
    });
    $('#bounce', d).addEventListener('click', function(){
      if(!App.confirm('Add the $' + (S.bouncedCheck || 30) + ' bounced-check fee and remove the last check payment?')) return;
      var idx = -1; (i.payments || []).forEach(function(p, n){ if(p.method === 'Check') idx = n; });
      if(idx >= 0) i.payments.splice(idx, 1);
      i.items.push({ label:'Bounced check fee', amount:Number(S.bouncedCheck || 30), fee:true });
      Store.save('invoices', i); redraw(); App.toast('Fee added');
    });
    $('#line', d).addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); i.items.push({ label:o.label, amount:parseFloat(o.amount) || 0 }); Store.save('invoices', i); redraw(); this.reset(); });
  }

  /* ======================================================================
     MESSAGES (everyone)
     ====================================================================== */
  function messagesView(main, arg){
    var parent = me.role === 'parent';
    var threads = Store.all('threads').filter(function(t){ return !parent || t.familyId === me.familyId; }).sort(function(a, b){ var x = a.msgs[a.msgs.length - 1], y = b.msgs[b.msgs.length - 1]; return (x ? x.at : '') < (y ? y.at : '') ? 1 : -1; });
    var parts = (arg || '').split('/'), openId = parts[0] === 'new' ? null : parts[0] || (threads[0] && threads[0].id), newFor = parts[0] === 'new' ? (parts[1] || (parent ? me.familyId : '')) : null;
    main.innerHTML = pageH('Messages', 'Messages', parent ? 'Talk to Miss Hannah and the teachers. We usually reply within a few hours.' : 'Every conversation with families, in one place.', '<a class="btn sm" href="#messages/new">+ New message</a>') +
      '<div class="inbox"><div class="card list">' + (threads.map(function(t){
        var l = t.msgs[t.msgs.length - 1], un = t.unread && (parent ? t.unread.parent : t.unread.admin);
        return '<a class="thr' + (t.id === openId ? ' on' : '') + '" href="#messages/' + t.id + '">' + App.avatar(fam(t.familyId).name) + '<div><b>' + esc(parent ? t.subject : fam(t.familyId).name + ' · ' + t.subject) + '</b><small>' + esc(l ? l.text : '') + '</small><small>' + (l ? App.when(l.at) : '') + '</small></div>' + (un ? '<span class="unread" aria-label="Unread"></span>' : '') + '</a>';
      }).join('') || '<p class="empty">No messages yet.</p>') + '</div><div class="card" id="thread"></div></div>';
    var box = $('#thread');
    if(newFor !== null){
      var fams = Store.all('families');
      box.innerHTML = '<h2 style="margin:0 0 14px;font-size:19px">New message</h2><form class="f" id="nm">' + (parent ? '' : '<label>To<select name="fid">' + (fams.length > 1 ? '<option value="*">Every family (as an announcement)</option>' : '') + fams.map(function(f){ return '<option value="' + f.id + '"' + (f.id === newFor ? ' selected' : '') + '>' + esc(f.name) + ' family</option>'; }).join('') + '</select></label>') + '<label>Subject<input name="subject" required></label><label>Message<textarea name="text" required></textarea></label><div class="acts"><button class="btn" type="submit">Send</button></div></form>';
      $('#nm').addEventListener('submit', function(e){
        e.preventDefault(); var o = App.formData(this);
        if(o.fid === '*'){ Store.save('announcements', { title:o.subject, body:o.text, at:Store.now().slice(0,16), by:me.id }); App.toast('Posted to every family'); location.hash = 'announcements'; return; }
        var t = Store.save('threads', { familyId: parent ? me.familyId : o.fid, subject:o.subject, msgs:[{ from:me.id, text:o.text, at:Store.now() }], unread:{ admin: parent, parent: !parent } });
        Store.log(first(me.name) + ' wrote to ' + (parent ? 'Allkidz' : 'the ' + fam(t.familyId).name + ' family') + ': ' + o.subject, 'sky', 'chat');
        location.hash = 'messages/' + t.id;
      });
      return;
    }
    var t = openId && Store.get('threads', openId);
    if(!t){ box.innerHTML = '<p class="empty">Pick a conversation.</p>'; return; }
    if(t.unread){ if(parent) t.unread.parent = false; else t.unread.admin = false; Store.save('threads', t); counts(); }
    box.innerHTML = '<div class="card-h"><h2>' + esc(t.subject) + '</h2><small style="margin-left:auto;color:var(--ink-2)">' + esc(fam(t.familyId).name) + ' family</small></div>' +
      '<div class="bubbles">' + t.msgs.map(function(m){ var mine = parent ? m.from === me.id || Store.get('users', m.from) && Store.get('users', m.from).role === 'parent' : Store.get('users', m.from) && Store.get('users', m.from).role !== 'parent'; return '<div class="bub' + (mine ? ' me' : '') + '">' + esc(m.text) + '<small>' + esc(uname(m.from)) + ' · ' + App.when(m.at) + '</small></div>'; }).join('') + '</div>' +
      '<form class="f" id="rp"><label class="sr" for="rpt">Reply</label><textarea id="rpt" name="text" required placeholder="Write a reply..."></textarea><div class="acts"><button class="btn" type="submit">Send</button></div></form>';
    var bb = $('.bubbles', box); bb.scrollTop = bb.scrollHeight;
    $('#rp').addEventListener('submit', function(e){
      e.preventDefault(); var o = App.formData(this); if(!o.text.trim()) return;
      t.msgs.push({ from:me.id, text:o.text.trim(), at:Store.now() }); t.unread = { admin: parent, parent: !parent };
      Store.save('threads', t); R.refresh();
    });
  }

  /* ======================================================================
     ANNOUNCEMENTS (director writes, everyone reads)
     ====================================================================== */
  function announcementsView(main){
    var list = Store.all('announcements').sort(function(a, b){ return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.at < b.at ? 1 : -1); });
    var canWrite = me.role === 'admin';
    main.innerHTML = pageH('Announcements', 'Announcements', canWrite ? 'Posts every family sees on their portal home page.' : 'News from Allkidz.') +
      '<div class="grid ' + (canWrite ? 'g2' : '') + '" style="align-items:start">' +
      (canWrite ? '<div class="card"><h2>New announcement</h2><form class="f" id="an"><label>Title<input name="title" required></label><label>Message<textarea name="body" required></textarea></label><label class="check"><input type="checkbox" name="pinned"> Pin to the top</label><div class="acts"><button class="btn" type="submit">Post to every family</button></div></form></div>' : '') +
      '<div class="grid">' + (list.map(function(a){ return '<div class="card"' + (a.pinned ? ' style="border-top:6px solid var(--orange)"' : '') + '><div class="card-h"><h2>' + esc(a.title) + '</h2>' + (a.pinned ? '<span class="badge" style="--k:var(--orange)">Pinned</span>' : '') + '</div><p style="margin:0 0 10px;white-space:pre-wrap">' + esc(a.body) + '</p><small style="color:var(--ink-2)">' + esc(first(uname(a.by))) + ' · ' + App.when(a.at) + '</small>' + (canWrite ? ' <button class="btn sm ghost" style="float:right" data-del="' + a.id + '">Delete</button>' : '') + '</div>'; }).join('') || empty('No announcements', 'Nothing posted yet.')) + '</div></div>';
    var f = $('#an'); if(f) f.addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); o.at = Store.now().slice(0,16); o.by = me.id; Store.save('announcements', o); Store.log('New announcement: ' + o.title, 'orange', 'news'); App.toast('Posted'); R.refresh(); });
    $$('[data-del]', main).forEach(function(b){ b.addEventListener('click', function(){ if(App.confirm('Delete this announcement?')){ Store.del('announcements', b.getAttribute('data-del')); R.refresh(); } }); });
  }

  /* ======================================================================
     CALENDAR (everyone; director edits)
     ====================================================================== */
  function calendarView(main, arg){
    var base = /^\d{4}-\d{2}$/.test(arg) ? Store.parse(arg + '-01') : new Date(); base = new Date(base.getFullYear(), base.getMonth(), 1);
    var canEdit = me.role === 'admin';
    var prev = Store.iso(new Date(base.getFullYear(), base.getMonth() - 1, 1)).slice(0, 7), nxt = Store.iso(new Date(base.getFullYear(), base.getMonth() + 1, 1)).slice(0, 7);
    var K = { closed:'var(--pink)', break:'var(--sky)', pd:'var(--violet)', event:'var(--sun)', tour:'var(--orange)', bday:'var(--lime)', cert:'#d9d3c7' };
    var items = [];
    Store.events().forEach(function(e){ var d = Store.parse(e.date), end = Store.parse(e.end || e.date); while(d <= end){ items.push({ date:Store.iso(d), title:e.title, type:e.type, id:e.id }); d = Store.addDays(d, 1); } });
    var parentKids = me.role === 'parent' ? kidsOf(me.familyId) : kids();
    parentKids.forEach(function(c){ var b = c.dob.slice(5); items.push({ date:base.getFullYear() + '-' + b, title:'🎂 ' + c.first + '’s birthday', type:'bday' }); });
    if(me.role !== 'parent'){
      Store.all('applications').forEach(function(a){ if(a.tourAt && a.status !== 'declined') items.push({ date:a.tourAt.slice(0,10), title:'Tour ' + App.time(a.tourAt) + ': ' + first(a.parentName), type:'tour', app:a.id }); });
      Store.all('certs').forEach(function(x){ if(x.expires) items.push({ date:x.expires, title:first(uname(x.userId)) + ': ' + x.name + ' renews', type:'cert' }); });
    }
    var start = Store.addDays(base, -((base.getDay() + 6) % 7)), cells = '';
    for(var i = 0; i < 42; i++){
      var d = Store.addDays(start, i), ds = Store.iso(d), here = items.filter(function(x){ return x.date === ds; });
      if(i >= 35 && d.getMonth() !== base.getMonth()) break;
      cells += '<div class="d' + (d.getMonth() !== base.getMonth() ? ' other' : '') + (ds === T ? ' today' : '') + (closure(ds) ? ' closed' : '') + '"><b>' + d.getDate() + '</b>' + here.map(function(x){ return '<button class="ev" style="--k:' + K[x.type] + '" ' + (x.id ? 'data-ev="' + x.id + '"' : x.app ? 'data-app="' + x.app + '"' : '') + ' title="' + esc(x.title) + '">' + esc(x.title) + '</button>'; }).join('') + '</div>';
    }
    main.innerHTML = pageH('Calendar', base.toLocaleDateString(undefined, { month:'long', year:'numeric' }), 'Closings, breaks, family events' + (me.role === 'parent' ? ' and birthdays.' : ', tours, birthdays and certificate renewals.'),
      '<a class="btn sm ghost" href="#calendar/' + prev + '">&larr;</a><a class="btn sm ghost" href="#calendar">Today</a><a class="btn sm ghost" href="#calendar/' + nxt + '">&rarr;</a>' + (canEdit ? '<button class="btn sm" id="addEv">+ Add a date</button>' : '')) +
      '<div class="card"><div class="month">' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(x){ return '<div class="dow">' + x + '</div>'; }).join('') + cells + '</div>' +
      '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;font-size:13px;color:var(--ink-2)">' + [['closed','Closed'],['break','Break'],['pd','Training day'],['event','Event'],['bday','Birthday']].concat(me.role !== 'parent' ? [['tour','Tour'],['cert','Renewal']] : []).map(function(x){ return '<span style="display:inline-flex;gap:6px;align-items:center"><i style="width:10px;height:10px;border-radius:3px;background:' + K[x[0]] + '"></i>' + x[1] + '</span>'; }).join('') + '</div></div>';
    if(canEdit){
      $('#addEv').addEventListener('click', function(){ eventForm(null); });
      $$('[data-ev]', main).forEach(function(b){ b.addEventListener('click', function(){ eventForm(Store.get('events', b.getAttribute('data-ev'))); }); });
    }
    $$('[data-app]', main).forEach(function(b){ b.addEventListener('click', function(){ location.hash = 'enrollment/' + b.getAttribute('data-app'); }); });
  }
  function eventForm(e){
    var isNew = !e; e = e || { date:T, end:'', title:'', type:'closed', note:'' };
    var d = App.panel(isNew ? 'Add a date' : 'Edit ' + e.title,
      '<form class="f" id="ef"><label>Title<input name="title" required value="' + esc(e.title) + '"></label><div class="two"><label>From<input name="date" type="date" required value="' + esc(e.date) + '"></label><label>To (optional)<input name="end" type="date" value="' + esc(e.end || '') + '"></label></div>' +
      '<label>Type<select name="type">' + [['closed','Closed'],['break','Break (closed)'],['pd','Training day (closed)'],['event','Event (open)']].map(function(x){ return '<option value="' + x[0] + '"' + (e.type === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label>' +
      '<label>Note for families<input name="note" value="' + esc(e.note || '') + '"></label><div class="acts"><button class="btn" type="submit">Save</button>' + (isNew ? '' : '<button class="btn danger" type="button" id="del">Delete</button>') + '</div></form>' +
      '<p class="hint">Saved dates show on the website&rsquo;s calendar page straight away.</p>');
    $('#ef', d).addEventListener('submit', function(ev){ ev.preventDefault(); var o = App.formData(this); for(var k in o) e[k] = o[k]; if(!e.end) e.end = null; Store.save('events', e); App.toast('Saved'); d.close(); R.refresh(); });
    var del = $('#del', d); if(del) del.addEventListener('click', function(){ Store.del('events', e.id); d.close(); R.refresh(); });
  }

  /* ======================================================================
     THE WEEK: menu and lesson plan (staff edit, parents read)
     ====================================================================== */
  function weekView(main, arg){
    var wk = /^\d{4}-\d{2}-\d{2}$/.test(arg) ? arg : Store.iso(Store.monday());
    var canEdit = me.role !== 'parent', ro = canEdit ? '' : ' readonly';
    var m = Store.get('menus', 'm_' + wk) || { id:'m_' + wk, weekOf:wk, days:{} };
    var l = Store.get('lessons', 'l_' + wk) || { id:'l_' + wk, weekOf:wk, theme:'', verse:'', days:{} };
    var prevW = Store.iso(Store.addDays(Store.parse(wk), -7)), nextW = Store.iso(Store.addDays(Store.parse(wk), 7));
    var allergic = kids(function(c){ return !!c.allergies; });
    main.innerHTML = pageH('The week', 'Menu &amp; lessons', canEdit ? 'Parents see this week&rsquo;s menu and lesson plan in their portal, and the menu on the website.' : 'What your child is eating and learning this week.',
      '<div class="week-nav"><a class="btn sm ghost" href="#week/' + prevW + '">&larr;</a><b>Week of ' + App.day(wk, { month:'long', day:'numeric' }) + '</b><a class="btn sm ghost" href="#week/' + nextW + '">&rarr;</a></div>') +
      '<div class="grid">' +
      '<div class="card"><div class="card-h"><h2>Lesson plan</h2>' + (canEdit ? '<button class="btn sm" id="saveL" style="margin-left:auto">Save plan</button>' : '') + '</div>' +
        '<div class="f" style="margin:0 0 12px"><div class="two"><label>Theme<input id="theme" value="' + esc(l.theme) + '"' + ro + '></label><label>Memory verse<input id="verse" value="' + esc(l.verse) + '"' + ro + '></label></div></div>' +
        '<div class="wk one">' + WD.map(function(d, i){ return '<div class="day">' + WDN[i].slice(0,3) + '</div><textarea data-l="' + d + '"' + ro + '>' + esc(l.days[d] || '') + '</textarea>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="card-h"><h2>Menu</h2>' + (canEdit ? '<button class="btn sm ghost" id="copyM" style="margin-left:auto">Copy last week</button><button class="btn sm" id="saveM">Save menu</button>' : '') + '</div>' +
        '<div class="wk"><div></div><div class="h">Breakfast</div><div class="h">Lunch</div><div class="h">Snack</div>' + WD.map(function(d, i){ var x = m.days[d] || {}; return '<div class="day">' + WDN[i].slice(0,3) + '</div>' + ['breakfast','lunch','snack'].map(function(meal){ return '<textarea data-m="' + d + '|' + meal + '" aria-label="' + WDN[i] + ' ' + meal + '"' + ro + '>' + esc(x[meal] || '') + '</textarea>'; }).join(''); }).join('') + '</div>' +
        (allergic.length && canEdit ? '<div class="alerts" style="margin-top:14px">' + allergic.map(function(c){ return '<div class="alert" style="--k:var(--pink)"><span class="ic">' + icon('alert') + '</span><div><b>' + esc(kname(c)) + '</b><small>' + esc(c.allergies) + '</small></div></div>'; }).join('') + '</div>' : '') +
      '</div></div>';
    if(!canEdit) return;
    $('#saveL').addEventListener('click', function(){ l.theme = $('#theme').value; l.verse = $('#verse').value; $$('[data-l]').forEach(function(t){ l.days[t.getAttribute('data-l')] = t.value; }); Store.save('lessons', l); App.toast('Lesson plan saved'); });
    $('#saveM').addEventListener('click', function(){ $$('[data-m]').forEach(function(t){ var p = t.getAttribute('data-m').split('|'); m.days[p[0]] = m.days[p[0]] || {}; m.days[p[0]][p[1]] = t.value; }); Store.save('menus', m); App.toast('Menu saved'); });
    $('#copyM').addEventListener('click', function(){ var pm = Store.get('menus', 'm_' + prevW); if(!pm) return App.toast('No menu last week to copy.', true); m.days = JSON.parse(JSON.stringify(pm.days)); Store.save('menus', m); R.refresh(); App.toast('Copied'); });
  }

  /* ======================================================================
     INCIDENTS (staff write, parents acknowledge)
     ====================================================================== */
  function incidentsView(main){
    var parent = me.role === 'parent';
    var list = Store.all('incidents').filter(function(x){ var c = Store.get('children', x.childId); return c && (!parent || c.familyId === me.familyId); }).sort(function(a, b){ return a.at < b.at ? 1 : -1; });
    main.innerHTML = pageH('Incidents', parent ? 'Incident reports' : 'Incidents and injuries', parent ? 'If your child is hurt, even a little, you get a written report here. Please read and acknowledge it.' : 'Write it up the same day. Parents acknowledge it in their portal.', parent ? '' : '<button class="btn sm" id="newInc">+ New report</button>') +
      (list.length ? '<div class="grid g2">' + list.map(function(x){
        var c = Store.get('children', x.childId);
        return '<div class="card"><div class="card-h">' + kav(c) + '<h2>' + esc(kname(c)) + '</h2><span class="badge ' + (x.signed ? 'b-paid' : 'b-open') + '" style="margin-left:auto">' + (x.signed ? 'Acknowledged' : 'Waiting for parent') + '</span></div>' +
          '<dl class="kv"><dt>When</dt><dd>' + App.day(x.at.slice(0,10)) + ' ' + App.time(x.at) + '</dd><dt>What</dt><dd>' + esc(x.type) + (x.where ? ' · ' + esc(x.where) : '') + '</dd><dt>Happened</dt><dd>' + esc(x.description) + '</dd><dt>We did</dt><dd>' + esc(x.action) + '</dd><dt>Written by</dt><dd>' + esc(uname(x.by)) + '</dd></dl>' +
          (parent && !x.signed ? '<button class="btn sm lime" style="margin-top:14px" data-sign="' + x.id + '">I&rsquo;ve read this</button>' : '') + '</div>';
      }).join('') + '</div>' : empty('No incidents', parent ? 'Nothing to report. Wonderful!' : 'No incident reports yet.'));
    $$('[data-sign]', main).forEach(function(b){ b.addEventListener('click', function(){ var x = Store.get('incidents', b.getAttribute('data-sign')); x.signed = true; x.signedBy = me.name; x.signedAt = Store.now(); Store.save('incidents', x); Store.log(me.name + ' acknowledged an incident report.', 'lime', 'check'); R.refresh(); counts(); }); });
    var n = $('#newInc'); if(n) n.addEventListener('click', function(){
      var d = App.panel('New incident report', '<form class="f" id="inf"><label>Child<select name="childId">' + kids().map(function(c){ return '<option value="' + c.id + '">' + esc(kname(c)) + '</option>'; }).join('') + '</select></label>' +
        '<div class="two"><label>Type<select name="type"><option>Minor injury</option><option>Bite</option><option>Fall</option><option>Illness at care</option><option>Behavior</option><option>Other</option></select></label><label>Time<input name="time" type="time" value="' + nowHM() + '"></label></div>' +
        '<label>Where<input name="where" placeholder="Back yard, slide"></label><label>What happened<textarea name="description" required></textarea></label><label>What we did<textarea name="action" required placeholder="Cleaned, bandage, ice pack, comfort..."></textarea></label><label class="check"><input type="checkbox" name="notified" checked> Parent told at pickup or by phone</label><div class="acts"><button class="btn" type="submit">Save and send to parent</button></div></form>');
      $('#inf', d).addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); o.at = T + 'T' + o.time; delete o.time; o.by = me.id; o.signed = false; Store.save('incidents', o); Store.log('Incident report written for ' + Store.get('children', o.childId).first + '.', 'pink', 'alert'); d.close(); R.refresh(); });
    });
  }

  /* ======================================================================
     OVERVIEW (director) and TODAY (teacher)
     ====================================================================== */
  function overviewView(main){
    var all = kids(), here = present(), staff = onDuty(), expected = all.filter(expectedToday).length;
    var ratio = staff.length ? (here.length / staff.length) : here.length, over = staff.length ? ratio > ratioMax() : here.length > 0;
    var infants = here.filter(function(c){ return gk(c) === 'infants'; }).length;
    var newApps = Store.where('applications', function(a){ return a.status === 'new'; });
    var overdue = Store.all('invoices').filter(function(i){ return Store.invStatus(i) === 'overdue'; });
    var unread = Store.all('threads').filter(function(t){ return t.unread && t.unread.admin; });
    var soon = Store.addDays(new Date(), 45), soonS = Store.iso(soon);
    var certs = Store.all('certs').filter(function(x){ return x.expires && x.expires <= soonS; });
    var shots = all.filter(function(c){ return c.immunizationsDue && c.immunizationsDue <= Store.iso(Store.addDays(new Date(), 14)); });
    var absent = Store.where('absences', function(a){ return a.date === T; });
    var nextClose = Store.events().filter(function(e){ return e.type !== 'event' && (e.end || e.date) >= T; })[0];
    var hr = new Date().getHours(), hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    var alerts = [];
    if(over) alerts.push(['var(--pink)','alert','Ratio: ' + here.length + ' children with ' + staff.length + ' staff on the clock','Keep it at ' + ratioMax() + ' or fewer per adult. Clock someone in on the Staff page.','#staff','Fix']);
    if(infants > 4 * Math.max(1, staff.length)) alerts.push(['var(--pink)','alert', infants + ' infants in with ' + staff.length + ' staff','No more than 4 infants per adult.','#staff','Staff']);
    newApps.forEach(function(a){ alerts.push(['var(--pink)','inbox','New ' + (a.kind === 'tour' ? 'tour request' : 'application') + ': ' + a.parentName, (a.childName || '') + (a.childDob ? ', ' + Store.age(a.childDob) : '') + ' · ' + App.when(a.at),'#enrollment/' + a.id,'Open']); });
    Store.where('users', function(u){ return u.status === 'pending'; }).forEach(function(u){ alerts.push(['var(--violet)','userplus', u.name + ' is waiting for portal access', u.note || u.email,'#families','Approve']); });
    pendingPayments().forEach(function(x){ alerts.push(['var(--sun)','money', fam(x.inv.familyId).name + ' sent ' + money(x.p.amount) + ' by ' + x.p.method,'Confirm when it arrives.','#billing','Confirm']); });
    if(overdue.length) alerts.push(['var(--sun)','money', overdue.length + ' overdue bill' + (overdue.length > 1 ? 's' : ''), overdue.map(function(i){ return fam(i.familyId).name; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).join(', '),'#billing','Billing']);
    certs.forEach(function(x){ alerts.push([x.expires < T ? 'var(--pink)' : 'var(--sky)','staff', first(uname(x.userId)) + ': ' + x.name + (x.expires < T ? ' has expired' : ' renews ' + App.day(x.expires)), 'Keep training current for the license.','#staff','Staff']); });
    shots.forEach(function(c){ alerts.push([c.immunizationsDue < T ? 'var(--pink)' : 'var(--sky)','child', c.first + '’s immunizations ' + (c.immunizationsDue < T ? 'are overdue' : 'are due ' + App.day(c.immunizationsDue)), 'Ask the family for the updated record.','#children','Roster']); });
    var week = [];
    for(var i = 13; i >= 0; i--){ var d = Store.addDays(new Date(), -i); if(!Store.isWeekday(d)) continue; var ds = Store.iso(d); week.push({ label: d.toLocaleDateString(undefined, { weekday:'narrow' }), value: Store.where('attendance', function(a){ return a.date === ds; }).length, sub: App.day(ds) }); }
    main.innerHTML =
      '<div class="hello"><div class="hero-card"><p class="kick" style="--k:var(--sun)">' + App.day(T, { weekday:'long', month:'long', day:'numeric' }) + '</p><h1>' + hello + ', <em>' + esc(first(me.name)) + '.</em></h1><p>' + (isOpen(T) ? here.length + ' of ' + expected + ' expected children are in. ' + (absent.length ? absent.length + ' reported absent.' : '') : 'Allkidz is closed today' + (closure(T) ? ' for ' + esc(closure(T).title) : '') + '. Enjoy the rest!') + '</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#checkin">Open check-in</a><a class="btn line" href="#reports">Daily reports</a></div>' +
        '<div class="bars" aria-hidden="true"><i style="height:40%;background:var(--orange)"></i><i style="height:70%;background:var(--pink)"></i><i style="height:52%;background:var(--lime)"></i><i style="height:88%;background:var(--violet)"></i><i style="height:62%;background:var(--sky)"></i><i style="height:76%;background:var(--sun)"></i></div></div>' +
        '<div class="card"><div class="card-h"><h2>Ratio right now</h2><span class="badge ' + (over ? 'b-overdue' : 'b-paid') + '" style="margin-left:auto">' + (over ? 'Over' : 'OK') + '</span></div>' +
          '<p style="margin:0;font-family:var(--display);font-size:40px;font-weight:800;letter-spacing:-.04em;line-height:1">' + here.length + '<span style="font-size:20px;color:var(--ink-2)"> : ' + staff.length + '</span></p><p style="margin:4px 0 0;color:var(--ink-2);font-size:14px">children to staff on the clock</p>' +
          '<div class="meter' + (over ? ' over' : '') + '">' + Array.apply(null, Array(Number(S.capacity || 12))).map(function(_, n){ return '<i class="' + (n < here.length ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
          '<p style="margin:0;font-size:13px;color:var(--ink-2)">' + here.length + ' of ' + (S.capacity || 12) + ' licensed places in use · ' + Object.keys(Store.GROUPS).map(function(g){ return here.filter(function(c){ return gk(c) === g; }).length + ' ' + Store.GROUPS[g].name.toLowerCase(); }).join(', ') + '</p>' +
          '<div class="rows" style="margin-top:10px">' + staff.map(function(k){ return '<div class="row"><span class="dot" style="--k:var(--lime)"></span><div class="grow"><b>' + esc(uname(k.userId)) + '</b><small>On since ' + App.time(k.in) + '</small></div></div>'; }).join('') + '</div></div></div>' +
      '<div class="grid g4" style="margin:0 0 18px">' +
        stat('Children in', here.length + '<span style="font-size:20px;color:var(--ink-2)">/' + expected + '</span>', 'var(--lime)', 'kiosk', '#checkin') +
        stat('New inquiries', newApps.length, 'var(--pink)', 'inbox', '#enrollment') +
        stat('Unread messages', unread.length, 'var(--sky)', 'chat', '#messages') +
        stat('Overdue', money(overdue.reduce(function(s, i){ return s + Store.invTotal(i) - Store.invPaid(i); }, 0)), 'var(--sun)', 'money', '#billing') +
      '</div>' +
      '<div class="grid g2" style="align-items:start">' +
        '<div class="card"><div class="card-h"><h2>Needs your attention</h2><span class="badge soft" style="margin-left:auto">' + alerts.length + '</span></div>' + (alerts.length ? '<div class="alerts">' + alerts.slice(0, 9).map(function(a){ return '<a class="alert" href="' + a[4] + '" style="--k:' + a[0] + '"><span class="ic">' + icon(a[1]) + '</span><div><b>' + esc(a[2]) + '</b><small>' + esc(a[3]) + '</small></div><span class="go">' + a[5] + ' &rsaquo;</span></a>'; }).join('') + '</div>' : '<p class="empty">All clear. Nothing needs you right now.</p>') + '</div>' +
        '<div class="grid">' +
          '<div class="card"><div class="card-h"><h2>Attendance, last two weeks</h2><a class="more" href="#insights">Insights</a></div>' + App.columns(week, { label:'Children per day' }) + '</div>' +
          '<div class="card"><div class="card-h"><h2>Coming up</h2><a class="more" href="#calendar">Calendar</a></div><div class="rows">' +
            (nextClose ? '<div class="row"><span class="dot" style="--k:var(--pink)"></span><div class="grow"><b>' + esc(nextClose.title) + '</b><small>Closed ' + App.day(nextClose.date) + (nextClose.end ? ' – ' + App.day(nextClose.end) : '') + '</small></div></div>' : '') +
            Store.all('applications').filter(function(a){ return a.tourAt && a.tourAt.slice(0,10) >= T && a.status === 'tour'; }).map(function(a){ return '<a class="row" href="#enrollment/' + a.id + '"><span class="dot" style="--k:var(--orange)"></span><div class="grow"><b>Tour: ' + esc(a.parentName) + '</b><small>' + App.day(a.tourAt) + ' at ' + App.time(a.tourAt) + '</small></div></a>'; }).join('') +
            all.filter(function(c){ var b = new Date().getFullYear() + c.dob.slice(4); return b >= T && b <= Store.iso(Store.addDays(new Date(), 30)); }).map(function(c){ return '<div class="row"><span class="dot" style="--k:var(--lime)"></span><div class="grow"><b>🎂 ' + esc(c.first) + ' turns ' + (Math.floor(Store.months(c.dob) / 12) + 1) + '</b><small>' + App.day(new Date().getFullYear() + c.dob.slice(4)) + '</small></div></div>'; }).join('') +
          '</div></div>' +
          '<div class="card"><div class="card-h"><h2>Activity</h2></div>' + feed(Store.all('log').slice(0, 7)) + '</div>' +
        '</div>' +
      '</div>';
  }

  function teacherToday(main){
    var here = present(), staffOn = Store.where('clock', function(k){ return k.userId === me.id && k.date === T && !k.out; })[0];
    var l = Store.get('lessons', 'l_' + Store.iso(Store.monday())), m = Store.get('menus', 'm_' + Store.iso(Store.monday())), dd = DOW[new Date().getDay()];
    var hr = new Date().getHours(), hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    main.innerHTML = '<div class="hello"><div class="hero-card"><p class="kick" style="--k:var(--sun)">' + App.day(T, { weekday:'long', month:'long', day:'numeric' }) + '</p><h1>' + hello + ', <em>' + esc(first(me.name)) + '.</em></h1><p>' + here.length + ' children are in. ' + (staffOn ? 'You clocked in at ' + App.time(staffOn.in) + '.' : 'You are not clocked in yet.') + '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ' + (staffOn ? 'line' : 'lime') + '" id="clk">' + (staffOn ? 'Clock out' : 'Clock in') + '</button><a class="btn line" href="#checkin">Check-in</a></div>' +
      '<div class="bars" aria-hidden="true"><i style="height:40%;background:var(--orange)"></i><i style="height:70%;background:var(--pink)"></i><i style="height:52%;background:var(--lime)"></i><i style="height:88%;background:var(--violet)"></i></div></div>' +
      '<div class="card"><div class="card-h"><h2>Today&rsquo;s plan</h2><a class="more" href="#week">The week</a></div>' + (l ? '<p style="margin:0 0 6px"><b>' + esc(l.theme) + '</b></p><p style="margin:0 0 10px;color:var(--ink-2);font-size:14.5px">' + esc(l.verse) + '</p><p style="margin:0;font-size:15px">' + esc(l.days[dd] || 'No plan for today.') + '</p>' : '<p>No lesson plan yet.</p>') +
      (m && m.days[dd] ? '<p style="margin:12px 0 0;font-size:14px;color:var(--ink-2)">Lunch: ' + esc(m.days[dd].lunch) + ' · Snack: ' + esc(m.days[dd].snack) + '</p>' : '') + '</div></div>' +
      '<div class="card" style="margin:0 0 18px"><div class="card-h"><h2>Here now</h2><a class="more" href="#reports">Log a report</a></div>' +
      (here.length ? '<div class="kids">' + here.map(function(c){ var n = Store.where('reports', function(r){ return r.childId === c.id && r.date === T; }).length; return '<a class="kid is-in" style="--k:' + Store.GROUPS[gk(c)].k + ';text-decoration:none" href="#reports">' + (c.allergies ? '<span class="warn" title="' + esc(c.allergies) + '">!</span>' : '') + kav(c) + '<b>' + esc(c.first) + '</b><small>' + n + ' entr' + (n === 1 ? 'y' : 'ies') + ' today</small></a>'; }).join('') + '</div>' : '<p class="empty">Nobody is checked in yet.</p>') + '</div>' +
      '<div class="grid g2"><div class="card"><h2>Allergies in today</h2>' + (here.filter(function(c){ return c.allergies; }).map(function(c){ return '<div class="alert" style="--k:var(--pink);margin:0 0 8px"><span class="ic">' + icon('alert') + '</span><div><b>' + esc(kname(c)) + '</b><small>' + esc(c.allergies) + '</small></div></div>'; }).join('') || '<p class="hint">None in today.</p>') + '</div>' +
      '<div class="card"><h2>Announcements</h2>' + Store.all('announcements').slice(0, 3).map(function(a){ return '<div class="row"><div class="grow"><b>' + esc(a.title) + '</b><small>' + App.when(a.at) + '</small></div></div>'; }).join('') + '</div></div>';
    $('#clk').addEventListener('click', function(){ clock(me.id); R.refresh(); });
  }

  /* ======================================================================
     INSIGHTS (director)
     ====================================================================== */
  function insightsView(main){
    var days = [], d = new Date(), guard = 0;
    while(days.length < 20 && guard++ < 40){ if(Store.isWeekday(d)) days.unshift(Store.iso(d)); d = Store.addDays(d, -1); }
    var att = days.map(function(ds){ return { label: Store.parse(ds).getDate() + '', value: Store.where('attendance', function(a){ return a.date === ds; }).length, sub: App.day(ds) }; });
    var weeks = [];
    for(var w = 7; w >= 0; w--){ var mon = Store.iso(Store.addDays(Store.monday(), -7 * w)), sun = Store.iso(Store.addDays(Store.parse(mon), 6)), sum = 0; Store.all('invoices').forEach(function(i){ (i.payments || []).forEach(function(p){ if(!p.pending && p.at.slice(0,10) >= mon && p.at.slice(0,10) <= sun) sum += Number(p.amount); }); }); weeks.push({ label: App.day(mon, { month:'numeric', day:'numeric' }), value: sum, sub:'Week of ' + App.day(mon, { month:'short', day:'numeric' }) }); }
    var all = kids(), byG = Object.keys(Store.GROUPS).map(function(g){ return { label:Store.GROUPS[g].name, value: all.filter(function(c){ return gk(c) === g; }).length, k:Store.GROUPS[g].k }; });
    var recs = Store.where('attendance', function(a){ return days.indexOf(a.date) >= 0; });
    var avgIn = recs.length ? recs.reduce(function(s, a){ var t = a.in.slice(11).split(':'); return s + (+t[0]) * 60 + (+t[1]); }, 0) / recs.length : 0;
    var avgHours = recs.filter(function(a){ return a.out; }).reduce(function(s, a, _, arr){ return s + App.hours(a.in, a.out) / arr.length; }, 0);
    var occ = days.length ? Math.round(att.reduce(function(s, x){ return s + x.value; }, 0) / days.length / Number(S.capacity || 12) * 100) : 0;
    var sources = {}; Store.all('applications').forEach(function(a){ var s = (a.source || 'Other').split(' · ')[0]; sources[s] = (sources[s] || 0) + 1; });
    var srcRows = Object.keys(sources).map(function(k, i){ return { label:k, value:sources[k], k:'var(--' + App.COLORS[i % 6] + ')' }; });
    var revenue = weeks.reduce(function(s, x){ return s + x.value; }, 0);
    main.innerHTML = pageH('Insights', 'How Allkidz is doing', 'The last four weeks at a glance. Hover any bar for the detail.', '<button class="btn sm ghost" id="csvAtt">Attendance CSV</button>') +
      '<div class="grid g4" style="margin:0 0 18px">' +
        stat('Average occupancy', occ + '%', 'var(--lime)', 'home', null, 'of ' + (S.capacity || 12) + ' licensed places') +
        stat('Collected, 8 weeks', money(revenue), 'var(--orange)', 'money') +
        stat('Average arrival', avgIn ? App.time(('0' + Math.floor(avgIn / 60)).slice(-2) + ':' + ('0' + Math.floor(avgIn % 60)).slice(-2)) : '—', 'var(--sky)', 'clock') +
        stat('Average day', avgHours.toFixed(1) + ' h', 'var(--violet)', 'calendar') +
      '</div><div class="grid g2">' +
        '<div class="card span2"><div class="card-h"><h2>Children per day</h2></div>' + App.columns(att, { label:'Children per day, last 20 open days', every:2 }) + '</div>' +
        '<div class="card"><div class="card-h"><h2>Payments received per week</h2></div>' + App.columns(weeks, { label:'Payments per week', fmt:money }) + '</div>' +
        '<div class="card"><div class="card-h"><h2>Enrolled by age group</h2></div>' + App.hbars(byG) + '<div class="card-h" style="margin-top:22px"><h2>Where inquiries come from</h2></div>' + App.hbars(srcRows) + '</div>' +
      '</div>';
    $('#csvAtt').addEventListener('click', function(){ App.csv('allkidz-attendance.csv', [['Date','Child','In','Out','Hours','Temp','Dropped off by','Picked up by']].concat(Store.all('attendance').sort(function(a, b){ return a.date < b.date ? -1 : 1; }).map(function(a){ var c = Store.get('children', a.childId); return [a.date, c ? kname(c) : a.childId, a.in.slice(11), a.out ? a.out.slice(11) : '', App.hours(a.in, a.out).toFixed(2), a.temp, a.inBy, a.outBy]; }))); });
  }

  /* ======================================================================
     SETTINGS (director)
     ====================================================================== */
  function settingsView(main){
    main.innerHTML = pageH('Settings', 'Settings', 'Business details, hours, tuition and the fees from the handbook.') +
      '<div class="grid g2" style="align-items:start"><div class="card"><h2>Business</h2><form class="f" id="sb">' +
        '<label>Name<input name="name" value="' + esc(S.name) + '"></label><div class="two"><label>Phone<input name="phone" value="' + esc(S.phone) + '"></label><label>Email<input name="email" value="' + esc(S.email) + '"></label></div>' +
        '<label>Address<input name="address" value="' + esc(S.address) + '"></label><div class="two"><label>Opens<input name="opens" type="time" value="' + esc(S.opens) + '"></label><label>Closes<input name="closes" type="time" value="' + esc(S.closes) + '"></label></div>' +
        '<div class="two"><label>Licensed capacity<input name="capacity" type="number" value="' + esc(S.capacity) + '"></label><label>Children per adult (max)<input name="ratio" type="number" value="' + esc(S.ratio || 6) + '"></label></div>' +
        '<label>Tax ID for year-end statements<input name="taxId" value="' + esc(S.taxId || '') + '"></label><div class="acts"><button class="btn" type="submit">Save</button></div></form></div>' +
      '<div class="grid"><div class="card"><h2>Tuition and fees</h2><form class="f" id="sf">' +
        '<div class="two"><label>Full-time, per week<input name="full" inputmode="decimal" value="' + S.rates.full + '"></label><label>Part-time, per week<input name="part" inputmode="decimal" value="' + S.rates.part + '"></label></div>' +
        '<div class="two"><label>Drop-in, per day<input name="dropin" inputmode="decimal" value="' + S.rates.dropin + '"></label><label>Registration fee<input name="regFee" inputmode="decimal" value="' + S.regFee + '"></label></div>' +
        '<div class="two"><label>Late payment, per day<input name="lateFeeDay" inputmode="decimal" value="' + S.lateFeeDay + '"></label><label>After two weeks, per day<input name="lateFeeDay2" inputmode="decimal" value="' + S.lateFeeDay2 + '"></label></div>' +
        '<div class="two"><label>Late pickup, per minute<input name="latePickupMin" inputmode="decimal" value="' + S.latePickupMin + '"></label><label>Grace period (minutes)<input name="grace" type="number" value="' + S.grace + '"></label></div>' +
        '<label>Bounced check fee<input name="bouncedCheck" inputmode="decimal" value="' + S.bouncedCheck + '"></label>' +
        '<p class="hint">Tuition here is demo data: the real rates are &ldquo;call for tuition&rdquo; on the current site.</p><div class="acts"><button class="btn" type="submit">Save</button></div></form></div>' +
      '<div class="card"><h2>Data</h2><p style="margin:0 0 14px;color:var(--ink-2);font-size:14.5px">Download everything as one backup file, or restore one.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sm" id="bk">Download backup</button><label class="btn sm ghost" style="cursor:pointer">Restore backup<input type="file" accept="application/json" id="rs" hidden></label></div></div></div></div>';
    $('#sb').addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); o.capacity = +o.capacity; o.ratio = +o.ratio; Store.settings(o); S = Store.settings(); App.toast('Saved'); });
    $('#sf').addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); var p = { rates:{ full:+o.full, part:+o.part, dropin:+o.dropin } }; ['regFee','lateFeeDay','lateFeeDay2','latePickupMin','grace','bouncedCheck'].forEach(function(k){ p[k] = +o[k]; }); Store.settings(p); S = Store.settings(); App.toast('Saved'); });
    $('#bk').addEventListener('click', function(){ var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([Store.dump()], { type:'application/json' })); a.download = 'allkidz-backup-' + T + '.json'; document.body.appendChild(a); a.click(); a.remove(); });
    $('#rs').addEventListener('change', function(){ var f = this.files[0]; if(!f) return; f.text().then(function(t){ Store.restore(t); App.toast('Restored'); setTimeout(function(){ location.reload(); }, 600); }).catch(App.fail); });
  }

  /* ======================================================================
     MY TIME (teacher)
     ====================================================================== */
  function meView(main){
    var mine = Store.where('clock', function(k){ return k.userId === me.id; }).sort(function(a, b){ return a.date < b.date ? 1 : -1; }).slice(0, 15);
    var on = mine[0] && mine[0].date === T && !mine[0].out;
    var wk = Store.iso(Store.monday()), hrs = mine.filter(function(k){ return k.date >= wk; }).reduce(function(s, k){ return s + App.hours(k.in, k.out); }, 0);
    main.innerHTML = pageH('My time', 'My time', 'Clock in and out, see your hours and keep your certificates current.', '<button class="btn sm ' + (on ? 'ghost' : 'lime') + '" id="clk">' + (on ? 'Clock out' : 'Clock in') + '</button>') +
      '<div class="grid g2" style="align-items:start"><div class="card"><div class="card-h"><h2>Recent shifts</h2><span class="badge soft" style="margin-left:auto">' + hrs.toFixed(1) + ' h this week</span></div><div class="rows">' + mine.map(function(k){ return '<div class="row"><div class="grow"><b>' + App.day(k.date) + '</b><small>' + App.time(k.in) + ' – ' + (k.out ? App.time(k.out) : 'now') + '</small></div><b>' + App.hours(k.in, k.out).toFixed(1) + ' h</b></div>'; }).join('') + '</div></div>' +
      '<div class="card"><h2>Certificates</h2><div class="rows">' + Store.where('certs', function(x){ return x.userId === me.id; }).map(function(x){ return '<div class="row"><div class="grow"><b>' + esc(x.name) + '</b><small>' + (x.expires ? 'Renews ' + App.day(x.expires, { month:'short', day:'numeric', year:'numeric' }) : 'No expiry') + '</small></div>' + (x.expires && x.expires < T ? '<span class="badge b-expired">Expired</span>' : '') + '</div>'; }).join('') + '</div>' + passwordForm() + '</div></div>';
    $('#clk').addEventListener('click', function(){ clock(me.id); R.refresh(); });
    bindPassword();
  }
  function passwordForm(){ return '<form class="f" id="pw" style="margin-top:18px"><h3 style="margin:0;font-size:16px">Change password</h3><label>New password<input name="p" type="password" minlength="6" required autocomplete="new-password"></label><div class="acts"><button class="btn sm ghost" type="submit">Update password</button></div></form>'; }
  function bindPassword(){ var f = $('#pw'); if(f) f.addEventListener('submit', function(e){ e.preventDefault(); var p = App.formData(this).p; if(p.length < 6) return App.toast('At least 6 characters.', true); me.password = p; delete me.mustChange; Store.save('users', me); App.toast('Password updated'); this.reset(); }); }

  /* ======================================================================
     PARENT SCREENS
     ====================================================================== */
  function parentHome(main){
    var mine = kidsOf(me.familyId), f = fam(me.familyId), bal = Store.balance(me.familyId);
    var ann = Store.all('announcements').sort(function(a, b){ return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.at < b.at ? 1 : -1); });
    var nextClose = Store.events().filter(function(e){ return (e.end || e.date) >= T; }).slice(0, 3);
    var photos = Store.where('reports', function(r){ return r.img && mine.some(function(c){ return c.id === r.childId; }); }).slice(-6).reverse();
    var hr = new Date().getHours(), hello = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    var lastDay = T; if(!Store.where('reports', function(r){ return r.date === T; }).length){ var all = Store.all('reports').map(function(r){ return r.date; }).sort(); lastDay = all[all.length - 1] || T; }
    main.innerHTML =
      '<div class="hello"><div class="hero-card"><p class="kick" style="--k:var(--sun)">' + App.day(T, { weekday:'long', month:'long', day:'numeric' }) + '</p><h1>' + hello + ', <em>' + esc(first(me.name)) + '.</em></h1><p>' + mine.map(function(c){ var s = status(c), a = att(c.id); return esc(c.first) + (s === 'in' ? ' is at Allkidz, checked in at ' + App.time(a.in) : s === 'out' ? ' went home at ' + App.time(a.out) : s === 'absent' ? ' is marked absent today' : c.status === 'enrolling' ? ' starts on ' + App.day(c.start) : ' isn’t checked in yet'); }).join('. ') + '.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#day">See today&rsquo;s report</a><a class="btn line" href="#messages/new">Message Miss Hannah</a></div>' +
        '<div class="bars" aria-hidden="true"><i style="height:40%;background:var(--orange)"></i><i style="height:70%;background:var(--pink)"></i><i style="height:52%;background:var(--lime)"></i><i style="height:88%;background:var(--violet)"></i><i style="height:62%;background:var(--sky)"></i></div></div>' +
        '<div class="card"><div class="card-h"><h2>Your balance</h2><a class="more" href="#billing">Billing</a></div><p style="margin:0;font-family:var(--display);font-size:44px;font-weight:800;letter-spacing:-.04em;line-height:1;color:' + (bal > 0 ? '#b42318' : 'inherit') + '">' + money(bal) + '</p><p style="margin:6px 0 14px;color:var(--ink-2);font-size:14.5px">' + (bal > 0 ? 'Weekly tuition is due the Friday before each week of care.' : 'All paid up. Thank you!') + '</p>' + (bal > 0 ? '<a class="btn sm" href="#billing">Pay or tell us you&rsquo;ve paid</a>' : '') +
        '<div class="rows" style="margin-top:14px"><a class="row" href="#family/absent"><span class="dot" style="--k:var(--sky)"></span><div class="grow"><b>Report an absence</b><small>Please tell us by 8 am</small></div></a><a class="row" href="#family"><span class="dot" style="--k:var(--lime)"></span><div class="grow"><b>Pickup people</b><small>' + (f.pickups || []).length + ' authorized</small></div></a></div></div></div>' +
      '<div class="grid g2" style="align-items:start">' + mine.map(function(c){
        return '<div class="card"><div class="card-h">' + kav(c) + '<h2>' + esc(c.first) + '&rsquo;s day</h2><small style="margin-left:auto;color:var(--ink-2)">' + App.day(lastDay) + '</small></div>' + timeline(c.id, lastDay, false) + '</div>';
      }).join('') + '</div>' +
      '<div class="grid g3" style="margin-top:18px;align-items:start">' +
        '<div class="card"><div class="card-h"><h2>From Allkidz</h2><a class="more" href="#announcements">All</a></div>' + ann.slice(0, 2).map(function(a){ return '<div style="margin:0 0 14px"><b>' + esc(a.title) + '</b><p style="margin:4px 0 0;font-size:14.5px;color:var(--ink-2)">' + esc(a.body) + '</p></div>'; }).join('') + '</div>' +
        '<div class="card"><div class="card-h"><h2>Coming up</h2><a class="more" href="#calendar">Calendar</a></div><div class="rows">' + nextClose.map(function(e){ return '<div class="row"><span class="dot" style="--k:' + (e.type === 'event' ? 'var(--sun)' : 'var(--pink)') + '"></span><div class="grow"><b>' + esc(e.title) + '</b><small>' + (e.type === 'event' ? 'Event · ' : 'Closed · ') + App.day(e.date) + (e.end ? ' – ' + App.day(e.end) : '') + '</small></div></div>'; }).join('') + '</div></div>' +
        '<div class="card"><div class="card-h"><h2>Photos</h2><a class="more" href="#day">Reports</a></div>' + (photos.length ? '<div class="photos">' + photos.map(function(r){ return '<img src="' + r.img + '" alt="' + esc(r.detail) + '">'; }).join('') + '</div>' : '<p class="hint">Photos from the day appear here.</p>') + '</div>' +
      '</div>';
  }
  function parentDay(main, arg){
    var mine = kidsOf(me.familyId), parts = (arg || '').split('/'), cid = parts[0] && Store.get('children', parts[0]) ? parts[0] : mine[0] && mine[0].id, date = /^\d{4}-\d{2}-\d{2}$/.test(parts[1]) ? parts[1] : T;
    var c = Store.get('children', cid);
    if(!c){ main.innerHTML = empty('No children yet', 'Your children appear here once Miss Hannah links them to your account.'); return; }
    if(!parts[1]){ // open on the most recent day with something in it
      var seen = Store.where('reports', function(r){ return r.childId === cid && r.date <= T; }).map(function(r){ return r.date; }).sort();
      if(seen.length && !Store.where('reports', function(r){ return r.childId === cid && r.date === T; }).length) date = seen[seen.length - 1];
    }
    var prev = Store.iso(Store.addDays(Store.parse(date), -1)), nxt = Store.iso(Store.addDays(Store.parse(date), 1));
    main.innerHTML = pageH('Daily report', esc(c.first) + '&rsquo;s day', 'Meals, naps, diapers, activities and photos, as the teachers log them.',
      '<div class="week-nav"><a class="btn sm ghost" href="#day/' + cid + '/' + prev + '">&larr;</a><b>' + App.day(date, { weekday:'long', month:'short', day:'numeric' }) + '</b><a class="btn sm ghost" href="#day/' + cid + '/' + nxt + '">&rarr;</a></div>') +
      (mine.length > 1 ? '<div class="tabs">' + mine.map(function(x){ return '<button style="--k:' + Store.GROUPS[gk(x)].k + '" class="' + (x.id === cid ? 'on' : '') + '" onclick="location.hash=\'day/' + x.id + '/' + date + '\'">' + esc(x.first) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="grid g2" style="align-items:start"><div class="card">' + timeline(cid, date, false) + '</div>' +
      '<div class="card"><h2>At a glance</h2>' + (function(){
        var r = Store.where('reports', function(x){ return x.childId === cid && x.date === date; });
        var n = function(t){ return r.filter(function(x){ return x.type === t; }).length; };
        return '<div class="stats4" style="grid-template-columns:1fr 1fr;margin:0">' + [['meal','Meals'],['nap','Naps'],['diaper','Diapers'],['activity','Activities']].map(function(t){ return '<div class="s" style="--k:' + TYPES[t[0]].k + '"><span class="ic" style="font-size:20px">' + TYPES[t[0]].e + '</span><div><b>' + n(t[0]) + '</b><span>' + t[1] + '</span></div></div>'; }).join('') + '</div>';
      })() + (c.allergies ? '<p style="margin:16px 0 0">' + allergy(c) + ' <small style="color:var(--ink-2)">Staff see this at every check-in and meal.</small></p>' : '') + '</div></div>';
  }
  function parentBilling(main){
    var inv = famInvoices(me.familyId), bal = Store.balance(me.familyId);
    var open = inv.filter(function(i){ return Store.invStatus(i) !== 'paid'; });
    main.innerHTML = pageH('Billing', 'Bills and payments', 'Tuition is weekly, due the Friday before each week of care. We accept ' + S.methods.join(', ') + '.') +
      '<div class="grid g2" style="align-items:start"><div class="grid">' +
        '<div class="card"><div class="card-h"><h2>Balance</h2></div><p style="margin:0;font-family:var(--display);font-size:46px;font-weight:800;letter-spacing:-.04em;line-height:1;color:' + (bal > 0 ? '#b42318' : 'inherit') + '">' + money(bal) + '</p>' +
          (open.length ? '<form class="f" id="paid" style="margin-top:16px"><h3 style="margin:0;font-size:16px">Sent a payment?</h3><p class="hint" style="margin:0">Send by Zelle or Venmo to Allkidz, or hand over cash or a check, then tell us here so we can match it.</p><div class="two"><label>For<select name="inv">' + open.map(function(i){ return '<option value="' + i.id + '">' + esc(i.number) + ' · ' + money(Store.invTotal(i) - Store.invPaid(i)) + '</option>'; }).join('') + '</select></label><label>Amount<input name="amount" inputmode="decimal" value="' + (Store.invTotal(open[0]) - Store.invPaid(open[0])) + '"></label></div><div class="two"><label>How<select name="method">' + S.methods.map(function(m){ return '<option>' + esc(m) + '</option>'; }).join('') + '</select></label><label>Memo or check number<input name="ref"></label></div><div class="acts"><button class="btn" type="submit">Tell Allkidz I&rsquo;ve paid</button></div></form>' : '<p class="hint" style="margin-top:12px">Nothing to pay. Thank you!</p>') + '</div>' +
        '<div class="card"><h2>Tax statement</h2><p style="margin:0 0 12px;color:var(--ink-2);font-size:14.5px">Every payment you made this year, with our tax ID, ready for your return.</p><a class="btn sm ghost" href="#statement">Open my ' + new Date().getFullYear() + ' statement</a></div>' +
      '</div><div class="card"><h2>Bills</h2><div class="rows">' + inv.map(function(i){ return '<a class="row" href="#bill/' + i.id + '"><div class="grow"><b>Week of ' + App.day(i.weekOf, { month:'long', day:'numeric' }) + '</b><small>' + esc(i.number) + ' · due ' + App.day(i.due) + '</small></div><b>' + money(Store.invTotal(i)) + '</b>' + badgeStatus(Store.invStatus(i)) + '</a>'; }).join('') + '</div></div></div>';
    var f = $('#paid'); if(f) f.addEventListener('change', function(e){ if(e.target.name === 'inv'){ var i = Store.get('invoices', e.target.value); f.amount.value = Store.invTotal(i) - Store.invPaid(i); } });
    if(f) f.addEventListener('submit', function(e){
      e.preventDefault(); var o = App.formData(this), i = Store.get('invoices', o.inv), amt = parseFloat(o.amount);
      if(!(amt > 0)) return App.toast('Enter the amount you sent.', true);
      i.payments.push({ id:Store.uid('p'), amount:amt, method:o.method, ref:o.ref, at:Store.now(), pending:true, by:me.id });
      Store.save('invoices', i); Store.log(me.name + ' says they sent ' + money(amt) + ' by ' + o.method + '.', 'sun', 'money');
      App.toast('Thank you! Miss Hannah will confirm when it arrives.'); R.refresh();
    });
  }
  function parentBill(main, id){
    var i = Store.get('invoices', id);
    if(!i || i.familyId !== me.familyId){ location.hash = 'billing'; return; }
    main.innerHTML = '<div class="no-print" style="display:flex;gap:10px;margin:0 0 18px"><a class="btn sm ghost" href="#billing">&larr; Bills</a><button class="btn sm" onclick="window.print()">Print</button></div>' +
      '<div class="card" style="max-width:720px"><div class="card-h"><h2>' + esc(i.number) + '</h2>' + badgeStatus(Store.invStatus(i)) + '</div><p style="margin:0 0 14px;color:var(--ink-2)">Week of ' + App.day(i.weekOf, { month:'long', day:'numeric' }) + ' · due ' + App.day(i.due) + '</p>' + invoiceBody(i, false) + '</div>';
  }
  function parentFamily(main, arg){
    var f = fam(me.familyId), mine = kidsOf(me.familyId);
    main.innerHTML = pageH('My family', 'The ' + esc(f.name) + ' family', 'Your children&rsquo;s details, who can pick them up, and absences.') +
      '<div class="grid g2" style="align-items:start"><div class="grid">' + mine.map(function(c){
        return '<div class="card"><div class="card-h">' + kav(c) + '<h2>' + esc(kname(c)) + '</h2>' + gBadge(c) + '</div><dl class="kv"><dt>Age</dt><dd>' + Store.age(c.dob) + '</dd><dt>Schedule</dt><dd>' + (c.schedule === 'full' ? 'Full-time' : 'Part-time') + ': ' + c.days.join(', ') + '</dd><dt>Allergies</dt><dd>' + esc(c.allergies || 'None') + '</dd><dt>Medical</dt><dd>' + esc(c.medical || 'None') + '</dd><dt>Doctor</dt><dd>' + esc(c.doctor) + '</dd><dt>Immunizations</dt><dd>' + (c.immunizationsDue ? (c.immunizationsDue < T ? '<b style="color:#b42318">Update needed</b>' : 'Next due ' + App.day(c.immunizationsDue)) : 'On file') + '</dd></dl>' +
          '<form class="f" style="margin-top:14px" data-kid-form="' + c.id + '"><label class="check"><input type="checkbox" name="photo"' + (c.photo ? ' checked' : '') + '> Allkidz may photograph ' + esc(c.first) + '</label><label>Upload an updated immunization record<input type="file" name="doc" accept="image/*,application/pdf"></label><div class="acts"><button class="btn sm ghost" type="submit">Save</button></div></form></div>';
      }).join('') + '</div><div class="grid">' +
        '<div class="card" id="absent"><h2>Report an absence</h2><form class="f" id="ab"><div class="two"><label>Child<select name="childId">' + mine.map(function(c){ return '<option value="' + c.id + '">' + esc(c.first) + '</option>'; }).join('') + '</select></label><label>Date<input name="date" type="date" value="' + T + '" required></label></div><label>Reason<select name="reason"><option>Sick</option><option>Family vacation</option><option>Appointment</option><option>Other</option></select></label><label>Note (optional)<input name="note"></label><p class="hint" style="margin:0">Please report by 8 am. Weekly tuition is still due for absences (handbook).</p><div class="acts"><button class="btn" type="submit">Send</button></div></form></div>' +
        '<div class="card"><h2>Who can pick up</h2><p class="hint" style="margin:0 0 10px">Only people listed here, or with your written permission, can pick up. Staff may ask for photo ID.</p><form class="f" id="pk"><textarea name="pickups" aria-label="Pickup people, one per line">' + esc((f.pickups || []).map(function(p){ return [p.name, p.relation, p.phone].join(', '); }).join('\n')) + '</textarea><p class="hint" style="margin:0">One per line: name, relationship, phone.</p><div class="acts"><button class="btn sm" type="submit">Save pickup list</button></div></form></div>' +
        '<div class="card"><h2>Account</h2><dl class="kv"><dt>Name</dt><dd>' + esc(me.name) + '</dd><dt>Email</dt><dd>' + esc(me.email) + '</dd><dt>Phone</dt><dd>' + esc(me.phone || '') + '</dd></dl>' + passwordForm() + '</div>' +
      '</div></div>';
    $$('[data-kid-form]', main).forEach(function(fm){ fm.addEventListener('submit', function(e){
      e.preventDefault(); var c = Store.get('children', fm.getAttribute('data-kid-form')); c.photo = fm.photo.checked;
      var file = fm.doc.files[0]; if(file){ c.docs = c.docs || []; c.docs.push({ name:file.name, at:Store.now() }); Store.log(me.name + ' uploaded ' + file.name + ' for ' + c.first + '.', 'sky', 'report'); }
      Store.save('children', c); App.toast('Saved'); R.refresh();
    }); });
    $('#ab').addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); o.by = me.id; Store.save('absences', o); var c = Store.get('children', o.childId); Store.log(me.name + ': ' + c.first + ' will be out ' + App.day(o.date) + ' (' + o.reason.toLowerCase() + ').', 'sky', 'calendar'); App.toast('Thanks. We’ll see ' + c.first + ' soon!'); this.reset(); });
    $('#pk').addEventListener('submit', function(e){ e.preventDefault(); var o = App.formData(this); f.pickups = o.pickups.split('\n').map(function(l){ var p = l.split(',').map(function(s){ return s.trim(); }); return p[0] ? { name:p[0], relation:p[1] || 'Pickup', phone:p[2] || '' } : null; }).filter(Boolean); Store.save('families', f); Store.log('The ' + f.name + ' family updated their pickup list.', 'violet', 'family'); App.toast('Pickup list saved'); });
    bindPassword();
    if(arg === 'absent') setTimeout(function(){ $('#absent').scrollIntoView({ behavior:'smooth' }); });
  }

  /* ======================================================================
     WIRING
     ====================================================================== */
  if(me.status === 'pending'){
    App.shell(me, [['home','Waiting','home']], 'Parent');
    R = App.router({ home:function(main){ main.innerHTML = empty('Thanks, ' + first(me.name) + '!', 'Your account is waiting for Miss Hannah to link it to your child. You will be able to sign in as soon as she approves it, usually the same day.', '<a class="btn" href="' + App.BASE + '">Back to the website</a>'); } }, 'home');
    return;
  }
  if(me.mustChange){
    setTimeout(function(){
      var d = App.panel('Choose your password', '<p>Welcome to the Allkidz portal! Please choose your own password to replace the one-time one.</p><form class="f" id="mc"><label>New password<input type="password" name="p" minlength="6" required autocomplete="new-password"></label><div class="acts"><button class="btn" type="submit">Save</button></div></form>');
      $('#mc', d).addEventListener('submit', function(e){ e.preventDefault(); var p = App.formData(this).p; if(p.length < 6) return App.toast('At least 6 characters.', true); me.password = p; delete me.mustChange; Store.save('users', me); d.close(); App.toast('Password saved'); });
    }, 300);
  }

  var routes, items, fallback, label;
  if(me.role === 'admin'){
    label = 'Director';
    items = [['-','Today'],['overview','Overview','overview'],['checkin','Check-in','kiosk'],['reports','Daily reports','report'],
      ['-','People'],['children','Children','child'],['families','Families','family'],['staff','Staff','staff'],
      ['-','Grow'],['enrollment','Enrollment','inbox'],['billing','Billing','money'],
      ['-','Talk'],['messages','Messages','chat'],['announcements','Announcements','news'],
      ['-','Plan'],['calendar','Calendar','calendar'],['week','Menu & lessons','menu'],['incidents','Incidents','alert'],
      ['-','Run'],['insights','Insights','chart'],['settings','Settings','settings']];
    routes = { overview:overviewView, checkin:checkinView, reports:reportsView, children:childrenView, families:familiesView, staff:staffView, enrollment:enrollView, billing:billingView,
      messages:messagesView, announcements:announcementsView, calendar:calendarView, week:weekView, incidents:incidentsView, insights:insightsView, settings:settingsView };
    fallback = 'overview';
    App.shell(me, items, label);
    App.actions([['Check-in', '#checkin', 'kiosk', true]]);
  } else if(me.role === 'teacher'){
    label = 'Teacher';
    items = [['-','Today'],['today','Today','home'],['checkin','Check-in','kiosk'],['reports','Daily reports','report'],
      ['-','Children'],['children','Children','child'],['incidents','Incidents','alert'],
      ['-','Talk'],['messages','Messages','chat'],['announcements','Announcements','news'],
      ['-','Plan'],['week','Menu & lessons','menu'],['calendar','Calendar','calendar'],['me','My time','clock']];
    routes = { today:teacherToday, checkin:checkinView, reports:reportsView, children:childrenView, incidents:incidentsView, messages:messagesView, announcements:announcementsView, week:weekView, calendar:calendarView, me:meView };
    fallback = 'today';
    App.shell(me, items, label);
    App.actions([['Log a report', '#reports', 'report', true]]);
  } else {
    label = 'Parent';
    items = [['home','Home','home'],['day','Daily reports','report'],['messages','Messages','chat'],['billing','Billing','money'],['calendar','Calendar','calendar'],['week','Menu & lessons','menu'],['announcements','News','news'],['incidents','Incidents','alert'],['family','My family','family']];
    routes = { home:parentHome, day:parentDay, messages:messagesView, billing:parentBilling, bill:parentBill, statement:function(main){ statement(fam(me.familyId), new Date().getFullYear()); $('.no-print a').setAttribute('href', '#billing'); $('.no-print a').innerHTML = '&larr; Billing'; },
      calendar:calendarView, week:weekView, announcements:announcementsView, incidents:incidentsView, family:parentFamily };
    fallback = 'home';
    App.shell(me, items, label);
    App.actions([['Message us', '#messages/new', 'chat', true]]);
  }
  R = App.router(routes, fallback, counts);

  if(me.role !== 'parent'){
    App.palette(function(){
      var out = [];
      items.forEach(function(it){ if(it[0] !== '-') out.push({ label:it[1], sub:'Page', href:'#' + it[0], k:'var(--charcoal)' }); });
      Store.where('children', function(c){ return c.status !== 'withdrawn'; }).forEach(function(c){ out.push({ label:kname(c), sub:Store.GROUPS[gk(c)].name + ' · ' + Store.age(c.dob), href:'#children', keys:c.allergies + ' ' + fam(c.familyId).name, k:Store.GROUPS[gk(c)].k }); });
      if(me.role === 'admin'){
        Store.all('families').forEach(function(f){ out.push({ label:f.name + ' family', sub:parentsOf(f.id).map(function(p){ return p.name; }).join(', '), href:'#families/' + f.id, keys:parentsOf(f.id).map(function(p){ return p.email + ' ' + p.phone; }).join(' ') }); });
        Store.where('users', function(u){ return u.role !== 'parent'; }).forEach(function(u){ out.push({ label:u.name, sub:u.title || u.role, href:'#staff' }); });
        Store.all('invoices').forEach(function(i){ out.push({ label:i.number, sub:fam(i.familyId).name + ' · ' + money(Store.invTotal(i)) + ' · ' + Store.invStatus(i), href:'#billing/' + i.id, k:'var(--sun)' }); });
        Store.all('applications').forEach(function(a){ out.push({ label:a.parentName, sub:'Enrollment · ' + a.status + ' · ' + (a.childName || ''), href:'#enrollment/' + a.id, k:'var(--pink)' }); });
      }
      return out;
    });
  }
})();
