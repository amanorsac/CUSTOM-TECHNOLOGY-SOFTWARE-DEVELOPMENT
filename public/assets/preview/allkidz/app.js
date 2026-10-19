/* =====================================================================
   Shared by every portal screen: the sidebar, a tiny hash router,
   side panels, toasts, tooltips, the search palette and formatting.
   Plain JavaScript, no build step, same as the Modern Music Hub.
   ===================================================================== */
var App = (function(){
  var $  = function(s,r){ return (r||document).querySelector(s); };
  var $$ = function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); };
  var BASE = '/preview/allkidz/';

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function toast(msg, isErr){
    var box = $('.toasts');
    if(!box){ box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role','status'); document.body.appendChild(box); }
    var t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function(){ t.remove(); }, isErr ? 6000 : 3200);
  }
  function fail(e){ toast(e && e.message ? e.message : String(e), true); }

  /* ---------- formatting ---------- */
  function money(n){ n = Number(n || 0); return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function day(s, opt){ if(!s) return ''; return Store.parse(s.slice(0,10)).toLocaleDateString(undefined, opt || { weekday:'short', month:'short', day:'numeric' }); }
  function time(s){ if(!s) return ''; var hm = s.length > 5 ? s.slice(11,16) : s; var h = +hm.slice(0,2), m = hm.slice(3,5); return (h % 12 || 12) + ':' + m + (h < 12 ? ' am' : ' pm'); }
  function when(s){
    if(!s) return 'never';
    var d = new Date(s.length <= 10 ? s + 'T12:00' : s), diff = (Date.now() - d) / 1000;
    if(diff < 0) return day(s);
    if(diff < 60) return 'just now';
    if(diff < 3600) return Math.floor(diff/60) + ' min ago';
    if(diff < 86400) return Math.floor(diff/3600) + ' h ago';
    if(diff < 86400*7) return Math.floor(diff/86400) + ' d ago';
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
  }
  function hours(a, b){ if(!a) return 0; var x = new Date(a), y = b ? new Date(b) : new Date(); return Math.max(0, (y - x) / 3600000); }

  var COLORS = ['orange','pink','lime','violet','sky','sun'];
  function initials(name){ return String(name || '?').trim().split(/\s+/).slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase(); }
  function colorFor(s){ var h = 0; String(s).split('').forEach(function(c){ h = (h*31 + c.charCodeAt(0)) >>> 0; }); return 'var(--' + COLORS[h % COLORS.length] + ')'; }
  function avatar(name, k, cls){ return '<span class="avatar' + (cls ? ' ' + cls : '') + '" style="--k:' + (k || colorFor(name)) + '">' + esc(initials(name)) + '</span>'; }

  var MARK = '<svg viewBox="0 0 80 80" aria-hidden="true">' +
    [[28,2,'#E8452C'],[2,28,'#5CC25B'],[28,28,'#FFC531'],[54,28,'#2EA7E0'],[28,54,'#9B6BDF']].map(function(b){
      return '<rect x="'+b[0]+'" y="'+b[1]+'" width="24" height="24" rx="5" fill="'+b[2]+'"/>';
    }).join('') + '<circle cx="66" cy="66" r="9" fill="#FF5FA2"/></svg>';

  var ICON = {
    home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    overview:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    check:'<path d="M5 12l5 5 9-11"/>',
    kiosk:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6M9 8l2 2 4-4"/>',
    report:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    child:'<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>',
    people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 6 4.8"/>',
    staff:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    inbox:'<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    money:'<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M6 10v5M18 10v5"/>',
    chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    news:'<path d="M3 11l15-6v14L3 13z"/><path d="M7 13v5a2 2 0 0 0 4 0v-4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    menu:'<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 3-3 7h3v11"/>',
    lesson:'<path d="M2 6l10-4 10 4-10 4z"/><path d="M6 8v6c3 2.5 9 2.5 12 0V8"/>',
    alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 18h0"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 15v3M11 10v8M15 12v6M19 6v12"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    family:'<path d="M3 11l9-8 9 8"/><circle cx="9" cy="14" r="2.2"/><circle cx="15.5" cy="15" r="1.7"/><path d="M5 21a4 4 0 0 1 8 0M12.5 21a3 3 0 0 1 6 0"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    userplus:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>',
    download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    star:'<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>',
    camera:'<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>'
  };
  function icon(name){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICON[name]||'') + '</svg>'; }

  /* the sidebar: items are [hash, label, icon], or ['-', group label] */
  function shell(user, items, roleLabel){
    var side = $('#side');
    side.innerHTML =
      '<div class="keys-rule" aria-hidden="true"></div>' +
      '<a class="brand" href="' + BASE + '" aria-label="Allkidz website">' + MARK + '<b>Allkidz<small>' + esc(roleLabel) + '</small></b></a>' +
      '<p class="role">' + esc(Store.settings().name) + '</p>' +
      '<nav aria-label="Sections">' + items.map(function(it){
        if(it[0] === '-') return '<p class="grp">' + esc(it[1]) + '</p>';
        return '<a href="#' + it[0] + '" data-r="' + it[0] + '">' + icon(it[2]) + '<span>' + esc(it[1]) + '</span><span class="count" data-count="' + it[0] + '" hidden></span></a>';
      }).join('') + '</nav>' +
      '<a class="site-link" href="' + BASE + '">&larr; Back to the website</a>' +
      '<div class="me">' + avatar(user.name, user.color ? 'var(--' + user.color + ')' : colorFor(user.email)) +
        '<div><b>' + esc(user.name) + '</b><small>' + esc(user.title || (user.role === 'parent' ? 'Parent' : user.role)) + '</small></div>' +
        '<button class="out" type="button" title="Sign out" aria-label="Sign out">' + icon('out') + '</button></div>';
    var top = $('#topbar');
    if(top){
      top.innerHTML = '<span class="crumb">' + esc(roleLabel) + ' / <b id="crumb"></b></span>' +
        (user.role !== 'parent' ? '<button class="find" type="button" id="find">' + icon('search') + '<span>Search children, families...</span><kbd>Ctrl K</kbd></button>' : '') +
        '<span class="date"><i></i>' + new Date().toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' }) + '</span>' +
        '<span class="qa" id="qa"></span>';
    }
    $('.out', side).addEventListener('click', function(){ Store.signOut(); location.href = BASE + 'login'; });
  }
  /* buttons in the top bar: [label, href, icon, primary?] */
  function actions(list){
    var qa = $('#qa'); if(!qa) return;
    qa.innerHTML = list.map(function(a){
      return '<a class="btn sm' + (a[3] ? '' : ' ghost') + '" href="' + a[1] + '">' + (a[2] ? '<span style="display:inline-flex;width:16px;height:16px">' + icon(a[2]) + '</span>' : '') + esc(a[0]) + '</a>';
    }).join('');
  }
  function count(key, n){
    var el = $('[data-count="' + key + '"]');
    if(!el) return;
    el.hidden = !n; el.textContent = n > 99 ? '99+' : n;
  }

  /* #name/arg -> routes[name](main, arg) */
  var current = null;
  function router(routes, fallback, after){
    function go(){
      var h = decodeURIComponent(location.hash.replace(/^#/, '')) || fallback;
      var parts = h.split('/'), name = parts[0], arg = parts.slice(1).join('/');
      if(!routes[name]){ name = fallback; arg = ''; }
      current = { name:name, arg:arg };
      $$('#side nav a').forEach(function(a){ a.classList.toggle('on', a.getAttribute('data-r') === name); });
      var onA = $('#side nav a.on');
      if(onA && matchMedia('(max-width:900px)').matches){ var nv = onA.parentNode; nv.scrollLeft = onA.offsetLeft - (nv.clientWidth - onA.offsetWidth) / 2; }
      var cur = $('#side nav a.on span'), cr = $('#crumb');
      if(cr) cr.textContent = cur ? cur.textContent : '';
      var main = $('#main');
      window.scrollTo(0, 0);
      try { routes[name](main, arg); }
      catch(e){ console.error(e); main.innerHTML = '<div class="card empty"><b>That did not load.</b><p>' + esc(e.message) + '</p><button class="btn" onclick="location.reload()">Try again</button></div>'; }
      if(after) after();
    }
    window.addEventListener('hashchange', go);
    go();
    return { refresh: go };
  }

  /* a side panel; returns the dialog. onClose runs once. */
  function panel(title, html, onClose){
    var d = document.createElement('dialog');
    d.className = 'panel-d';
    d.innerHTML = '<div class="ph"><h2>' + esc(title) + '</h2><button type="button" aria-label="Close">&times;</button></div><div class="pb">' + html + '</div>';
    document.body.appendChild(d);
    $('.ph button', d).addEventListener('click', function(){ d.close(); });
    d.addEventListener('click', function(e){ if(e.target === d) d.close(); });
    d.addEventListener('close', function(){ d.remove(); if(onClose) onClose(); });
    d.showModal();
    return d;
  }

  function formData(form){
    var o = {};
    $$('input,select,textarea', form).forEach(function(el){
      if(!el.name) return;
      if(el.type === 'checkbox' && el.dataset.list !== undefined){
        o[el.name] = o[el.name] || [];
        if(el.checked) o[el.name].push(el.value);
      } else if(el.type === 'checkbox'){ o[el.name] = el.checked; }
      else if(el.type === 'radio'){ if(el.checked) o[el.name] = el.value; }
      else { o[el.name] = el.value; }
    });
    return o;
  }

  function copyBox(value){
    return '<div class="secret"><span>' + esc(value) + '</span><button class="btn sm lime" type="button" data-copy="' + esc(value) + '">Copy</button></div>';
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-copy]');
    if(!b) return;
    navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function(){ toast('Copied'); }, function(){ toast('Select it and copy it by hand', true); });
  });

  /* hover / focus tooltips: data-tip="main line" data-tip-sub="second line" */
  var tipEl = null;
  function showTip(el){
    if(!tipEl){ tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(tipEl); }
    tipEl.innerHTML = esc(el.getAttribute('data-tip')) + (el.getAttribute('data-tip-sub') ? '<small>' + esc(el.getAttribute('data-tip-sub')) + '</small>' : '');
    var r = el.getBoundingClientRect();
    tipEl.style.left = (r.left + r.width / 2) + 'px';
    tipEl.style.top = r.top + 'px';
    tipEl.hidden = false;
  }
  function hideTip(){ if(tipEl) tipEl.hidden = true; }
  ['mouseover','focusin'].forEach(function(ev){ document.addEventListener(ev, function(e){ var t = e.target.closest && e.target.closest('[data-tip]'); if(t) showTip(t); }); });
  ['mouseout','focusout'].forEach(function(ev){ document.addEventListener(ev, function(e){ if(e.target.closest && e.target.closest('[data-tip]')) hideTip(); }); });
  window.addEventListener('scroll', hideTip, true);

  /* a column chart: rows [{label, value, sub}] */
  function columns(rows, opt){
    opt = opt || {};
    var W = 640, H = 220, P = 26, max = Math.max.apply(null, rows.map(function(r){ return r.value; }).concat([opt.min || 1]));
    var bw = (W - P) / rows.length, fmt = opt.fmt || function(v){ return v; };
    var g = rows.map(function(r, i){
      var h = Math.round((H - 40) * r.value / max), x = P + i * bw + bw * .16, y = H - 20 - h;
      return '<g class="cg"><rect class="col' + (r.value ? '' : ' zero') + '" x="' + x.toFixed(1) + '" y="' + (r.value ? y : H - 22) + '" width="' + (bw * .68).toFixed(1) + '" height="' + (r.value ? h : 2) + '" rx="4"/>' +
        '<rect class="hit" x="' + (P + i * bw).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '" tabindex="0" data-tip="' + esc(fmt(r.value)) + '" data-tip-sub="' + esc(r.sub || r.label) + '"/>' +
        (i % (opt.every || 1) === 0 ? '<text class="tick" x="' + (P + i * bw + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle">' + esc(r.label) + '</text>' : '') + '</g>';
    }).join('');
    var lines = [0, .5, 1].map(function(f){ var y = H - 20 - (H - 40) * f; return '<line class="grid-l" x1="' + P + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="tick" x="0" y="' + (y + 4) + '">' + esc(fmt(Math.round(max * f))) + '</text>'; }).join('');
    return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Chart') + '">' + lines + g + '</svg></div>';
  }
  function hbars(rows, fmt){
    var max = Math.max.apply(null, rows.map(function(r){ return r.value; }).concat([1]));
    fmt = fmt || function(v){ return v; };
    return '<div class="hbars">' + rows.map(function(r){
      return '<div class="hbar"><span class="lab"><i style="--k:' + r.k + '"></i>' + esc(r.label) + '</span><span class="track"><span class="fill' + (r.value ? '' : ' zero') + '" style="width:' + (r.value / max * 100) + '%;background:' + (r.k || '#E8452C') + '"></span><span class="num">' + esc(fmt(r.value)) + '</span></span></div>';
    }).join('') + '</div>';
  }

  /* CSV download: rows is an array of arrays, first row the header */
  function csv(name, rows){
    var text = rows.map(function(r){ return r.map(function(v){ v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type:'text/csv' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* shrink a photo to fit comfortably in storage */
  function shrink(file, max){
    return new Promise(function(res, rej){
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function(){
        var s = Math.min(1, (max || 900) / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', .78));
      };
      img.onerror = function(){ rej(new Error('That file is not a photo we can read.')); };
      img.src = url;
    });
  }

  /* the search palette: sources() returns [{label, sub, href, k}] */
  function palette(sources){
    function open(){
      var d = document.createElement('dialog'); d.className = 'palette';
      d.innerHTML = '<input type="search" placeholder="Search children, families, staff, invoices, pages..." aria-label="Search"><ul role="listbox"></ul>';
      document.body.appendChild(d);
      var input = $('input', d), ul = $('ul', d), all = sources(), sel = 0, shown = [];
      function draw(){
        var q = input.value.trim().toLowerCase();
        shown = all.filter(function(x){ return !q || (x.label + ' ' + (x.sub||'') + ' ' + (x.keys||'')).toLowerCase().indexOf(q) >= 0; }).slice(0, 12);
        sel = Math.min(sel, Math.max(0, shown.length - 1));
        ul.innerHTML = shown.length ? shown.map(function(x, i){
          return '<li><a href="' + x.href + '" class="' + (i === sel ? 'on' : '') + '">' + avatar(x.label, x.k) + '<span>' + esc(x.label) + '</span><small>' + esc(x.sub || '') + '</small></a></li>';
        }).join('') : '<li class="none">Nothing matches &ldquo;' + esc(input.value) + '&rdquo;.</li>';
      }
      input.addEventListener('input', function(){ sel = 0; draw(); });
      input.addEventListener('keydown', function(e){
        if(e.key === 'ArrowDown'){ sel = Math.min(sel + 1, shown.length - 1); draw(); e.preventDefault(); }
        if(e.key === 'ArrowUp'){ sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
        if(e.key === 'Enter' && shown[sel]){ location.hash = shown[sel].href.replace(/^#/, ''); d.close(); }
      });
      ul.addEventListener('click', function(e){ if(e.target.closest('a')) setTimeout(function(){ d.close(); }); });
      d.addEventListener('close', function(){ d.remove(); });
      d.addEventListener('click', function(e){ if(e.target === d) d.close(); });
      d.showModal(); draw(); input.focus();
    }
    document.addEventListener('keydown', function(e){ if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); open(); } });
    var f = $('#find'); if(f) f.addEventListener('click', open);
  }

  function confirmIt(msg){ return window.confirm(msg); }
  function print(){ window.print(); }

  return { $:$, $$:$$, esc:esc, toast:toast, fail:fail, money:money, day:day, time:time, when:when, hours:hours,
    COLORS:COLORS, initials:initials, colorFor:colorFor, avatar:avatar, MARK:MARK, icon:icon,
    shell:shell, actions:actions, count:count, router:router, panel:panel, formData:formData, copyBox:copyBox,
    columns:columns, hbars:hbars, csv:csv, shrink:shrink, palette:palette, confirm:confirmIt, print:print, BASE:BASE };
})();
