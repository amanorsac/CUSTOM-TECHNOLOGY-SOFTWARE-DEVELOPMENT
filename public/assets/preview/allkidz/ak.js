/* ===========================================================
   EDIT THIS BLOCK ONLY.
   Every page reads its contact details and links from here.
   =========================================================== */
var AK = {
  name: "Allkidz Christian Childcare",
  phone: "434-327-7205",
  email: "allkidzva@gmail.com",
  street: "504 Berwick Court",
  city: "Charlottesville, VA 22901",
  hours: "Monday to Friday, 8:00 am to 5:00 pm",

  social: {
    facebook:  "https://www.facebook.com/allkidz1015childcare",
    instagram: "https://www.instagram.com/allkidz4christ",
    youtube:   "https://youtube.com/@allkidzchristianchildcare406",
    tiktok:    "https://www.tiktok.com/@allkidz4christ"
  }
};
/* ==================== stop editing here ==================== */

(function(){
  var $  = function(s,r){ return (r||document).querySelector(s); };
  var $$ = function(s,r){ return [].slice.call((r||document).querySelectorAll(s)); };
  var BASE = '/preview/allkidz/';
  var here = location.pathname.replace(/\/$/, '/index').split('/').pop().replace(/\.html$/,'') || 'index';

  /* ---- the mark: a cross built from six play blocks ---- */
  var MARK = window.AK_MARK = '<svg viewBox="0 0 80 80" aria-hidden="true">' +
    [[28,2,'#E8452C'],[2,28,'#5CC25B'],[28,28,'#FFC531'],[54,28,'#2EA7E0'],[28,54,'#9B6BDF']].map(function(b){
      return '<rect x="'+b[0]+'" y="'+b[1]+'" width="24" height="24" rx="5" fill="'+b[2]+'"/>';
    }).join('') + '<circle cx="66" cy="66" r="9" fill="#FF5FA2"/></svg>';

  var NAV = [
    ['programs','Programs','var(--orange)'],
    ['our-day','Our Day','var(--lime)'],
    ['about','About','var(--violet)'],
    ['handbook','Handbook','var(--sky)'],
    ['calendar','Calendar','var(--sun)'],
    ['enroll','Enroll','var(--pink)']
  ];

  var head = $('[data-head]');
  if(head){
    head.outerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<p class="draftbar" role="note"><i aria-hidden="true"></i>Draft for Allkidz Christian Childcare &middot; prepared by CTSD &middot; not yet published</p>' +
      '<header class="gnav" id="gnav">' +
        '<a class="brand" href="'+BASE+'" aria-label="Allkidz Christian Childcare, home">'+MARK+'<b>Allkidz<small>Christian Childcare</small></b></a>' +
        '<nav aria-label="Site" id="site-nav">' + NAV.map(function(n){
          return '<a href="'+BASE+n[0]+'" style="--k:'+n[2]+'"'+(here===n[0]?' aria-current="page"':'')+'>'+n[1]+'</a>';
        }).join('') + '</nav>' +
        '<a class="signin" id="signin" href="'+BASE+'login">Sign in</a>' +
        '<a class="btn sm cta" href="'+BASE+'enroll#tour">Book a tour</a>' +
        '<button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
      '</header><div class="keys-rule" aria-hidden="true"></div>';
    var g = $('#gnav'), mb = $('.menu-btn', g);
    mb.addEventListener('click', function(){
      var open = g.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(open));
    });
    /* signed in? the link becomes the way back to the portal */
    if(window.Store){
      var u = Store.session();
      if(u){ var a = $('#signin'); a.textContent = u.role === 'parent' ? 'My family' : 'Dashboard'; a.href = BASE + 'portal'; }
    }
  }

  var ICONS = {
    facebook:'<path d="M24 12a12 12 0 10-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z"/>',
    instagram:'<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-9.6a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/>',
    youtube:'<path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>',
    tiktok:'<path d="M19.6 6.7a4.8 4.8 0 01-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 11-2-2.7V9.2a6.3 6.3 0 105.4 6.2V8.6a8.2 8.2 0 003.8 1.2V6.7z"/>'
  };

  var foot = $('[data-foot]');
  if(foot){
    var soc = Object.keys(AK.social).filter(function(k){ return AK.social[k]; }).map(function(k){
      return '<a href="'+AK.social[k]+'" target="_blank" rel="noopener" aria-label="'+k+'"><svg viewBox="0 0 24 24">'+ICONS[k]+'</svg></a>';
    }).join('');
    var tel = AK.phone.replace(/[^\d]/g,'');
    foot.outerHTML =
      '<div class="keys-rule" aria-hidden="true"></div><footer class="sfoot"><div class="cols">' +
        '<div class="sf-brand"><a class="brand" href="'+BASE+'" style="margin:0 0 16px">'+MARK.replace('<svg','<svg style="height:56px"')+'<b style="font-size:18px">Allkidz<small>Christian Childcare</small></b></a>' +
          '<p>A Christian home childcare and preschool for children from 3 months to 12 years.</p><p>'+AK.street+', '+AK.city+'.</p><p>'+AK.hours+'.</p>' +
          '<div class="social">'+soc+'</div></div>' +
        '<div><h4>Care</h4><ul><li><a href="'+BASE+'programs#infants">Infants</a></li><li><a href="'+BASE+'programs#toddlers">Toddlers</a></li><li><a href="'+BASE+'programs#preschool">Preschool</a></li><li><a href="'+BASE+'programs#school-age">School-age &amp; breaks</a></li></ul></div>' +
        '<div><h4>Families</h4><ul><li><a href="'+BASE+'our-day">Our day</a></li><li><a href="'+BASE+'handbook">Parent handbook</a></li><li><a href="'+BASE+'handbook#fees">Fees &amp; payments</a></li><li><a href="'+BASE+'calendar">Closings &amp; holidays</a></li></ul></div>' +
        '<div><h4>About</h4><ul><li><a href="'+BASE+'about">Meet Miss Hannah</a></li><li><a href="'+BASE+'about#mission">Mission</a></li><li><a href="'+BASE+'about#faith">Statement of faith</a></li><li><a href="'+BASE+'login">Parent &amp; staff sign in</a></li></ul></div>' +
        '<div><h4>Visit</h4><ul><li><a href="'+BASE+'enroll#tour">Book a tour</a></li><li><a href="'+BASE+'enroll">Enrollment application</a></li><li><a href="tel:'+tel+'">'+AK.phone+'</a></li><li><a href="mailto:'+AK.email+'">'+AK.email+'</a></li></ul></div>' +
      '</div><div class="base"><span>&copy; '+new Date().getFullYear()+' Allkidz Christian Childcare</span><span>Nurturing young minds in God&rsquo;s light</span><span>Draft by <a href="/">CTSD</a></span></div></footer>';
  }

  /* ---- sections rise into place as they arrive ---- */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold:.12, rootMargin:'0px 0px -40px 0px' });
    $$('.rise').forEach(function(el){ io.observe(el); });
  } else { $$('.rise').forEach(function(el){ el.classList.add('in-view'); }); }

  /* ---- the toy cube in the home hero: three.js loads only once the page is idle ---- */
  var toy = $('[data-toy]');
  if(toy){
    var go = function(){ import('/assets/preview/allkidz/toy-cube.js').then(function(m){ return (document.fonts ? document.fonts.load('800 170px Montserrat') : Promise.resolve()).then(function(){ m.mount(toy); }); }).catch(function(){}); };
    if('requestIdleCallback' in window) requestIdleCallback(go, { timeout:2000 }); else setTimeout(go, 600);
  }

  /* ---- the calendar page: the year's closings, from the same list the dashboard edits ---- */
  var cal = $('[data-closings]');
  if(cal && window.Store){
    var today = new Date().toISOString().slice(0,10);
    var K = { closed:'var(--pink)', event:'var(--sun)', pd:'var(--violet)', break:'var(--sky)' };
    var L = { closed:'Closed', event:'Open · event', pd:'Closed · training', break:'Closed · break' };
    cal.innerHTML = Store.events().filter(function(e){ return e.date.slice(0,4) === today.slice(0,4); }).map(function(e){
      var d = new Date(e.date + 'T12:00'), end = e.end && e.end !== e.date ? new Date(e.end + 'T12:00') : null;
      var fmt = function(x){ return x.toLocaleDateString(undefined, { month:'short', day:'numeric' }); };
      return '<div class="slot'+((e.end||e.date) < today ? ' past' : '')+'" style="--k:'+(K[e.type]||'var(--orange)')+'"><span class="day">'+fmt(d)+(end?' – '+fmt(end):'')+'</span>' +
        '<span><b>'+esc(e.title)+'</b><small>'+esc(e.note || d.toLocaleDateString(undefined,{ weekday:'long' }))+'</small></span><span class="time">'+L[e.type]+'</span></div>';
    }).join('');
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return '&#'+c.charCodeAt(0)+';'; }); }

  /* ---- forms: a tour request and the enrollment application land in
     the dashboard's enrollment pipeline. Without the store, email. ---- */
  $$('form.cform').forEach(function(f){
    var sets = $$('fieldset', f), at = 0, steps = $$('.stepper span', f.parentNode);
    function show(i){
      at = i;
      sets.forEach(function(s, j){ s.hidden = j !== i; });
      steps.forEach(function(s, j){ s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });
      var back = $('[data-back]', f), next = $('[data-next]', f), go = $('button[type=submit]', f);
      if(back) back.hidden = i === 0;
      if(next) next.hidden = i === sets.length - 1;
      if(go && sets.length > 1) go.hidden = i !== sets.length - 1;
    }
    function valid(scope){
      var bad = $$('input,select,textarea', scope).filter(function(el){ return !el.checkValidity(); });
      var err = $('.err', f);
      if(bad.length){ bad[0].focus(); if(err){ err.textContent = 'Please fill in the highlighted fields.'; err.classList.add('show'); } return false; }
      if(err) err.classList.remove('show');
      return true;
    }
    if(sets.length > 1){
      show(0);
      $('[data-next]', f).addEventListener('click', function(){ if(valid(sets[at])) show(at + 1); window.scrollTo({ top: f.getBoundingClientRect().top + scrollY - 120 }); });
      $('[data-back]', f).addEventListener('click', function(){ show(at - 1); });
    }
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(!valid(f)) return;
      var data = new FormData(f), obj = {}, lines = [];
      data.forEach(function(v,k){ obj[k] = obj[k] ? obj[k] + ', ' + v : v; if(String(v).trim()) lines.push(k + ': ' + v); });
      if(window.Store){
        Store.addApplication(obj, f.getAttribute('data-kind') || 'tour');
        f.classList.add('sent');
        window.scrollTo({ top: f.getBoundingClientRect().top + scrollY - 140 });
        return;
      }
      location.href = 'mailto:' + AK.email + '?subject=' + encodeURIComponent(f.getAttribute('data-subject') || 'Allkidz') + '&body=' + encodeURIComponent(lines.join('\n'));
      f.classList.add('sent');
    });
  });

  /* ---- a program chosen on another page arrives pre-picked ---- */
  var want = new URLSearchParams(location.search).get('program');
  if(want){ var box = $('select[name="program"]'); if(box) box.value = want; }
})();
