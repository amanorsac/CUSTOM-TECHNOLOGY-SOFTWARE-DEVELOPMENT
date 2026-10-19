/* =====================================================================
   Allkidz data layer (draft).

   Everything the website forms and the portal read or write goes
   through Store. In this draft it lives in the visitor's browser
   (localStorage), seeded with demo families so every screen has
   something real-looking in it. Going live means re-implementing
   these same calls against the backend (supabase/allkidz.sql); the
   screens do not change.
   ===================================================================== */
var Store = (function(){
  var KEY = 'allkidz.v1', SKEY = 'allkidz.session';
  var mem = {}, db = null;
  function read(k){ try { return localStorage.getItem(k); } catch(e){ return mem[k] || null; } }
  function write(k, v){ try { localStorage.setItem(k, v); } catch(e){ mem[k] = v; } }
  function drop(k){ try { localStorage.removeItem(k); } catch(e){ delete mem[k]; } }

  /* ---------- dates, always local ---------- */
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function iso(d){ d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function parse(s){ return new Date(s + 'T12:00'); }
  function monday(d){ var x = new Date(d || new Date()); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; }
  function isWeekday(d){ var w = d.getDay(); return w > 0 && w < 6; }
  function at(dateStr, hm){ return dateStr + 'T' + hm; }
  function uid(p){ return (p || 'x') + '_' + Math.random().toString(36).slice(2, 9); }
  function now(){ return new Date().toISOString(); }

  /* ---------- the age groups follow the date of birth ---------- */
  function months(dob, on){ var a = parse(dob), b = on ? parse(on) : new Date(); return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0); }
  function group(dob){ var m = months(dob); return m < 16 ? 'infants' : m < 36 ? 'toddlers' : m < 60 ? 'preschool' : 'school'; }
  var GROUPS = {
    infants:  { name:'Infants',    ages:'3 to 16 months', k:'var(--pink)' },
    toddlers: { name:'Toddlers',   ages:'16 months to 3', k:'var(--sun)' },
    preschool:{ name:'Preschool',  ages:'3 to 5',         k:'var(--orange)' },
    school:   { name:'School-age', ages:'5 to 12',        k:'var(--sky)' }
  };
  function age(dob){
    var m = months(dob);
    if(m < 24) return m + ' mo';
    var y = Math.floor(m / 12), r = m % 12;
    return y + (r ? ' y ' + r + ' mo' : ' y');
  }

  /* ---------- the demo world ---------- */
  function seed(){
    var today = new Date(), T = iso(today), y = today.getFullYear();
    var d = {
      settings: {
        name:'Allkidz Christian Childcare', phone:'434-327-7205', email:'allkidzva@gmail.com',
        address:'504 Berwick Court, Charlottesville, VA 22901', opens:'08:00', closes:'17:00', grace:15,
        capacity:12, ratio:6,
        rates:{ full:250, part:175, dropin:55 }, regFee:100,
        lateFeeDay:10, lateFeeDay2:20, latePickupMin:1, bouncedCheck:30,
        methods:['Zelle','Venmo','Check','Cash'],
        demo:true
      },
      users: [
        { id:'u_hannah', role:'admin',   name:'Hannah Anokye-Gyambrah', email:'hannah@allkidz.demo', phone:'434-327-7205', title:'Director & owner', password:'demo', color:'violet' },
        { id:'u_thomas', role:'teacher', name:'Thomas Anokye-Gyambrah', email:'thomas@allkidz.demo', phone:'434-555-0142', title:'Assistant provider', password:'demo', color:'sky' },
        { id:'u_abena',  role:'teacher', name:'Abena Owusu',            email:'abena@allkidz.demo',  phone:'434-555-0188', title:'Preschool teacher', password:'demo', color:'lime' },
        { id:'u_p1', role:'parent', name:'Sarah Mitchell',  email:'sarah@allkidz.demo',  phone:'434-555-0101', familyId:'f_mitchell', password:'demo' },
        { id:'u_p2', role:'parent', name:'David Mitchell',  email:'david@allkidz.demo',  phone:'434-555-0102', familyId:'f_mitchell', password:'demo' },
        { id:'u_p3', role:'parent', name:'Ama Boateng',     email:'ama@allkidz.demo',    phone:'434-555-0103', familyId:'f_boateng', password:'demo' },
        { id:'u_p4', role:'parent', name:'Jessica Reyes',   email:'jessica@allkidz.demo',phone:'434-555-0104', familyId:'f_reyes', password:'demo' },
        { id:'u_p5', role:'parent', name:'Marcus Hall',     email:'marcus@allkidz.demo', phone:'434-555-0105', familyId:'f_hall', password:'demo' },
        { id:'u_p6', role:'parent', name:'Priya Shah',      email:'priya@allkidz.demo',  phone:'434-555-0106', familyId:'f_shah', password:'demo' },
        { id:'u_p7', role:'parent', name:'Emily Carter',    email:'emily@allkidz.demo',  phone:'434-555-0107', familyId:'f_carter', password:'demo' }
      ],
      families: [
        { id:'f_mitchell', name:'Mitchell', address:'118 Rugby Ave, Charlottesville', pickups:[{ name:'Linda Mitchell', relation:'Grandmother', phone:'434-555-0170' }], emergency:'Linda Mitchell · 434-555-0170', notes:'Pays by Zelle on Thursdays.' },
        { id:'f_boateng',  name:'Boateng',  address:'27 Hessian Hills Way, Charlottesville', pickups:[{ name:'Kwame Boateng', relation:'Father', phone:'434-555-0171' }], emergency:'Kwame Boateng · 434-555-0171', notes:'' },
        { id:'f_reyes',    name:'Reyes',    address:'930 Rio Rd E, Charlottesville', pickups:[{ name:'Luis Reyes', relation:'Father', phone:'434-555-0172' },{ name:'Ana Torres', relation:'Aunt', phone:'434-555-0173' }], emergency:'Luis Reyes · 434-555-0172', notes:'Spanish spoken at home.' },
        { id:'f_hall',     name:'Hall',     address:'402 Berwick Ct, Charlottesville', pickups:[{ name:'Tanya Hall', relation:'Mother', phone:'434-555-0174' }], emergency:'Tanya Hall · 434-555-0174', notes:'School-age: picked up from Agnor-Hurt at 3:15 on school days.' },
        { id:'f_shah',     name:'Shah',     address:'1550 Insight Way, Charlottesville', pickups:[{ name:'Rohan Shah', relation:'Father', phone:'434-555-0175' }], emergency:'Rohan Shah · 434-555-0175', notes:'Exclusively breastfed. Mom drops off milk Mondays.' },
        { id:'f_carter',   name:'Carter',   address:'77 Old Ivy Rd, Charlottesville', pickups:[{ name:'James Carter', relation:'Father', phone:'434-555-0176' }], emergency:'James Carter · 434-555-0176', notes:'Part-time: Mon, Wed, Fri.' }
      ],
      children: [
        { id:'c_noah',  familyId:'f_mitchell', first:'Noah',   last:'Mitchell', dob:iso(addDays(today,-365*4-80)),  schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'Peanuts (severe, EpiPen in cubby)', medical:'', doctor:'Dr. Klein, Pediatric Associates', start:iso(addDays(today,-500)), status:'active', photo:true, immunizationsDue:iso(addDays(today,40)), potty:'trained' },
        { id:'c_lily',  familyId:'f_mitchell', first:'Lily',   last:'Mitchell', dob:iso(addDays(today,-365*2-30)),  schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'', doctor:'Dr. Klein, Pediatric Associates', start:iso(addDays(today,-300)), status:'active', photo:true, immunizationsDue:iso(addDays(today,12)), potty:'training' },
        { id:'c_kofi',  familyId:'f_boateng',  first:'Kofi',   last:'Boateng',  dob:iso(addDays(today,-365*3-200)), schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'Mild eczema: parent-supplied cream', doctor:'Dr. Mensah, UVA Children’s', start:iso(addDays(today,-700)), status:'active', photo:true, immunizationsDue:iso(addDays(today,200)), potty:'trained' },
        { id:'c_sofia', familyId:'f_reyes',    first:'Sofía', last:'Reyes', dob:iso(addDays(today,-365-60)),   schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'Dairy', medical:'', doctor:'Dr. Alvarez, Pediatric Associates', start:iso(addDays(today,-150)), status:'active', photo:false, immunizationsDue:iso(addDays(today,-5)), potty:'diapers' },
        { id:'c_jayden',familyId:'f_hall',     first:'Jayden', last:'Hall',     dob:iso(addDays(today,-365*7-100)), schedule:'part', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'Asthma: inhaler in backpack', doctor:'Dr. Price, Albemarle Pediatrics', start:iso(addDays(today,-900)), status:'active', photo:true, immunizationsDue:iso(addDays(today,300)), potty:'trained', notes:'After school only on school days; full day on school breaks.' },
        { id:'c_maya',  familyId:'f_hall',     first:'Maya',   last:'Hall',     dob:iso(addDays(today,-365*5-20)),  schedule:'part', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'', doctor:'Dr. Price, Albemarle Pediatrics', start:iso(addDays(today,-600)), status:'active', photo:true, immunizationsDue:iso(addDays(today,150)), potty:'trained' },
        { id:'c_arjun', familyId:'f_shah',     first:'Arjun',  last:'Shah',     dob:iso(addDays(today,-210)),        schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'Breastfed: bottles of expressed milk labelled in fridge', doctor:'Dr. Klein, Pediatric Associates', start:iso(addDays(today,-60)), status:'active', photo:true, immunizationsDue:iso(addDays(today,25)), potty:'diapers' },
        { id:'c_grace', familyId:'f_carter',   first:'Grace',  last:'Carter',   dob:iso(addDays(today,-365*2-250)), schedule:'part', days:['mon','wed','fri'], allergies:'Strawberries', medical:'', doctor:'Dr. Price, Albemarle Pediatrics', start:iso(addDays(today,-200)), status:'active', photo:true, immunizationsDue:iso(addDays(today,90)), potty:'training' },
        { id:'c_eli',   familyId:'f_carter',   first:'Eli',    last:'Carter',   dob:iso(addDays(today,-110)),        schedule:'full', days:['mon','tue','wed','thu','fri'], allergies:'', medical:'', doctor:'Dr. Price, Albemarle Pediatrics', start:iso(addDays(today,21)), status:'enrolling', photo:true, immunizationsDue:iso(addDays(today,30)), potty:'diapers', notes:'Starts in three weeks, once Mom is back at work.' }
      ],
      attendance: [], reports: [], clock: [], invoices: [], log: [],
      threads: [], announcements: [], applications: [], incidents: [], certs: [], events: [], menus: [], lessons: [], absences: []
    };

    /* four weeks of history, plus today so far if it is a weekday */
    var kids = d.children.filter(function(c){ return c.status === 'active'; });
    for(var i = 28; i >= 0; i--){
      var day = addDays(today, -i), ds = iso(day), dow = ['sun','mon','tue','wed','thu','fri','sat'][day.getDay()];
      if(!isWeekday(day)) continue;
      kids.forEach(function(c, n){
        if(c.days.indexOf(dow) < 0) return;
        if(i > 0 && (n * 7 + i) % 13 === 0) return; // the odd day off
        var school = c.id === 'c_jayden' || c.id === 'c_maya';
        var who = (d.users.filter(function(u){ return u.familyId === c.familyId; })[(n + i) % 2] || d.users.filter(function(u){ return u.familyId === c.familyId; })[0]).name;
        var pick = (d.families.filter(function(f){ return f.id === c.familyId; })[0].pickups[0] || {}).name;
        var inT = school ? '15:20' : ['07:52','08:04','08:11','07:58','08:20','08:02','08:15'][(n + i) % 7];
        var outT = ['16:40','17:05','16:52','17:18','16:30','17:02','16:48'][(n * 3 + i) % 7];
        if(i === 0){
          if(today.getHours() < 8 || n === 3) return;
          d.attendance.push({ id:uid('a'), childId:c.id, date:ds, in:at(ds, inT), out:null, inBy:who, temp:'98.' + (n % 6), screen:true });
        } else {
          d.attendance.push({ id:uid('a'), childId:c.id, date:ds, in:at(ds, inT), out:at(ds, outT), inBy:who, outBy:(i % 4 === 1 && pick) ? pick : who, temp:'98.' + ((n + i) % 7), screen:true });
        }
      });
      ['u_hannah','u_thomas','u_abena'].forEach(function(u, n){
        if(u === 'u_abena' && day.getDay() === 5) return;
        d.clock.push({ id:uid('k'), userId:u, date:ds, in:at(ds, ['07:30','07:45','08:00'][n]), out: i === 0 ? null : at(ds, ['17:30','17:15','16:00'][n]) });
      });
    }

    /* daily report entries for the most recent open day */
    var last = today; while(!isWeekday(last)) last = addDays(last, -1);
    var L = iso(last);
    function rep(c, t, type, detail, by){ d.reports.push({ id:uid('r'), childId:c, date:L, time:t, type:type, detail:detail, by:by || 'u_abena' }); }
    rep('c_noah','08:30','meal','Breakfast: oatmeal with banana. Ate all of it.');
    rep('c_noah','09:15','activity','Bible story: Noah’s ark. Told the class he has the same name!');
    rep('c_noah','10:30','activity','Outdoor time: built a sandcastle and played soccer.');
    rep('c_noah','11:45','meal','Lunch: chicken, rice and green beans. Ate most.');
    rep('c_noah','12:40','nap','Nap 12:40 – 2:05');
    rep('c_noah','14:30','mood','Happy and chatty all day.');
    rep('c_lily','08:30','meal','Breakfast: oatmeal. Ate some.','u_thomas');
    rep('c_lily','10:10','potty','Used the potty! Stayed dry all morning.','u_thomas');
    rep('c_lily','12:30','nap','Nap 12:30 – 2:30','u_thomas');
    rep('c_lily','15:00','diaper','Wet diaper changed.','u_thomas');
    rep('c_kofi','09:40','activity','Memory verse: Psalm 118:24. Said it all by himself.');
    rep('c_kofi','11:00','activity','ABCs: traced the letters K and O.');
    rep('c_kofi','12:35','nap','Quiet time with a book. Did not sleep.');
    rep('c_sofia','09:00','meal','Bottle: 6 oz (dairy-free formula from home).','u_hannah');
    rep('c_sofia','10:20','nap','Nap 10:20 – 11:30','u_hannah');
    rep('c_sofia','13:10','diaper','Dirty diaper changed. Cream applied.','u_hannah');
    rep('c_arjun','08:45','meal','Expressed milk: 4 oz.','u_hannah');
    rep('c_arjun','09:30','nap','Nap 9:30 – 10:45 (on his back, in his crib).','u_hannah');
    rep('c_arjun','11:30','activity','Tummy time and floor play with the soft blocks.','u_hannah');
    rep('c_grace','10:15','activity','Painted a fall tree with fingerprints.','u_abena');
    rep('c_grace','11:50','meal','Lunch: ate rice and chicken, skipped the green beans.','u_abena');

    /* weekly invoices: six weeks back, paid except the last two for one family */
    var families = d.families.map(function(f){ return f.id; });
    for(var w = 5; w >= 0; w--){
      var wk = iso(addDays(monday(today), -7 * w)), due = iso(addDays(parse(wk), -3));
      families.forEach(function(fid, n){
        var items = d.children.filter(function(c){ return c.familyId === fid && c.status === 'active'; }).map(function(c){
          return { label: c.first + ' · ' + (c.schedule === 'full' ? 'Full-time' : 'Part-time') + ' week', amount: d.settings.rates[c.schedule] };
        });
        if(!items.length) return;
        var inv = { id:uid('i'), number: 'AK-' + wk.replace(/-/g,'').slice(2) + '-' + (n + 1), familyId:fid, weekOf:wk, due:due, items:items, payments:[], created:at(due,'09:00') };
        var total = items.reduce(function(s, x){ return s + x.amount; }, 0);
        var unpaid = (fid === 'f_reyes' && w <= 1) || (w === 0 && (fid === 'f_hall' || fid === 'f_carter'));
        if(!unpaid) inv.payments.push({ id:uid('p'), amount: total, method: d.settings.methods[n % 4], at: at(iso(addDays(parse(due), -1 + (n % 2))), '18:20'), ref: n % 4 === 2 ? 'Check #' + (1040 + w) : '' });
        d.invoices.push(inv);
      });
    }
    var lateR = d.invoices.filter(function(i){ return i.familyId === 'f_reyes' && !i.payments.length; })[0];
    if(lateR) lateR.items.push({ label:'Late payment fee: 3 days (handbook policy)', amount: 30, fee:true, lateFee:true });

    d.threads = [
      { id:'t1', familyId:'f_mitchell', subject:'Lily’s potty training', msgs:[
        { from:'u_p1', text:'Hi Miss Hannah! We started the potty at home this weekend. Should we send pull-ups?', at:at(iso(addDays(last,-2)),'19:12') },
        { from:'u_hannah', text:'Wonderful! Please keep sending diapers for now. Once she is staying dry and telling us she needs to go, we will switch to pull-ups together. She used the potty twice today!', at:at(iso(addDays(last,-1)),'15:40') }
      ], unread:{ admin:false, parent:true } },
      { id:'t2', familyId:'f_reyes', subject:'Payment this week', msgs:[
        { from:'u_p4', text:'Sorry we are behind. I will send both weeks by Zelle on Friday.', at:at(L,'07:58') }
      ], unread:{ admin:true, parent:false } },
      { id:'t3', familyId:'f_shah', subject:'Milk supply', msgs:[
        { from:'u_hannah', text:'Arjun has two bottles left in the fridge. Could you bring more tomorrow?', at:at(L,'13:05') }
      ], unread:{ admin:false, parent:true } }
    ];
    d.announcements = [
      { id:'n1', title:'Fall pictures next Friday', body:'Please dress your little ones in their Sunday best! Photos will be shared here and by email. Let us know in writing if you would rather your child not be photographed.', at:at(iso(addDays(last,-1)),'16:00'), by:'u_hannah', pinned:true },
      { id:'n2', title:'Thanksgiving closing', body:'Allkidz is closed Thursday and Friday, November 26 and 27. Weekly payment is still due in full for that week, as in the handbook.', at:at(iso(addDays(last,-6)),'12:00'), by:'u_hannah' }
    ];
    d.applications = [
      { id:'ap1', kind:'tour',   status:'new',      parentName:'Rachel Kim',     email:'rachel.kim@example.com', phone:'434-555-0190', childName:'Leo Kim',     childDob:iso(addDays(today,-365-120)), program:'toddlers', schedule:'full', start:iso(addDays(today,30)), message:'Looking for a faith-based home daycare close to Berwick.', source:'Website', at:at(L,'21:14') },
      { id:'ap2', kind:'tour',   status:'tour',     parentName:'Daniel Osei',    email:'d.osei@example.com',     phone:'434-555-0191', childName:'Abigail Osei',childDob:iso(addDays(today,-365*3-40)), program:'preschool', schedule:'full', start:iso(addDays(today,14)), message:'', tourAt:at(iso(addDays(monday(today),8)),'16:00'), source:'Facebook', at:at(iso(addDays(last,-3)),'10:02') },
      { id:'ap3', kind:'application', status:'waitlist', parentName:'Megan Brooks', email:'megan.b@example.com', phone:'434-555-0192', childName:'Ella Brooks', childDob:iso(addDays(today,-150)), program:'infants', schedule:'full', start:iso(addDays(today,90)), message:'Due back at work in January.', source:'Referral · Mitchell family', at:at(iso(addDays(last,-12)),'08:40') },
      { id:'ap4', kind:'application', status:'offered', parentName:'Emily Carter', email:'emily@allkidz.demo', phone:'434-555-0107', childName:'Eli Carter', childDob:iso(addDays(today,-110)), program:'infants', schedule:'full', start:iso(addDays(today,21)), message:'Sibling of Grace.', source:'Current family', at:at(iso(addDays(last,-20)),'09:15') }
    ];
    d.incidents = [
      { id:'in1', childId:'c_kofi', at:at(iso(addDays(last,-4)),'10:50'), type:'Minor injury', where:'Back yard, slide', description:'Slipped on the bottom step of the slide and scraped his left knee.', action:'Cleaned with water, bandage applied, ice pack for 5 minutes. Back to play straight away.', by:'u_abena', notified:true, signed:true }
    ];
    d.certs = [
      { id:'ce1', userId:'u_hannah', name:'CPR & First Aid',            issued:'2025-03-14', expires:'2027-03-14' },
      { id:'ce2', userId:'u_hannah', name:'Background check',           issued:'2022-06-01', expires:'2027-06-01' },
      { id:'ce3', userId:'u_hannah', name:'Medication Administration (MAT)', issued:'2024-01-20', expires:'2027-01-20' },
      { id:'ce4', userId:'u_hannah', name:'Child Development Associate (CDA)', issued:'2023-11-30', expires:iso(addDays(today,42)) },
      { id:'ce5', userId:'u_thomas', name:'CPR & First Aid',            issued:'2024-11-02', expires:iso(addDays(today,15)) },
      { id:'ce6', userId:'u_thomas', name:'Background check',           issued:'2022-06-01', expires:'2027-06-01' },
      { id:'ce7', userId:'u_abena',  name:'CPR & First Aid',            issued:'2025-08-09', expires:'2027-08-09' },
      { id:'ce8', userId:'u_abena',  name:'Background check',           issued:'2025-07-15', expires:'2030-07-15' },
      { id:'ce9', userId:'u_abena',  name:'Daily Health Observation',   issued:'2025-09-01', expires:'' }
    ];
    /* the year's closings, as published on the current site */
    d.events = [
      ['01-01',null,'New Year’s Day','closed'],
      ['01-02',null,'Parent meetings','event','8:30 am – 4:30 pm. Pick a time slot.'],
      ['01-19',null,'Martin Luther King Jr. Day','closed'],
      ['04-03','04-10','Spring break','break'],
      ['05-25',null,'Memorial Day','closed'],
      ['06-19',null,'Professional development day','pd'],
      ['06-26',null,'Family get-together','event','After care, with water play.'],
      ['07-03',null,'Independence Day (observed)','closed'],
      ['07-20','07-24','Summer break','break'],
      ['09-07',null,'Labor Day','closed'],
      ['10-12',null,'Professional development day','pd'],
      ['11-26','11-27','Thanksgiving break','closed'],
      ['12-18',null,'Christmas party','event','Families welcome from 3:30.'],
      ['12-21','12-25','Christmas break','break']
    ].map(function(e, n){ return { id:'e' + n, date: y + '-' + e[0], end: e[1] ? y + '-' + e[1] : null, title:e[2], type:e[3], note:e[4] || '' }; });

    var wkNow = iso(monday(today));
    d.menus = [{ id:'m_' + wkNow, weekOf:wkNow, days:{
      mon:{ breakfast:'Oatmeal with banana', lunch:'Baked chicken, brown rice, green beans', snack:'Apple slices and cheese' },
      tue:{ breakfast:'Whole-grain toast, scrambled eggs', lunch:'Jollof rice with turkey and carrots', snack:'Yogurt and blueberries' },
      wed:{ breakfast:'Cheerios and milk, pears', lunch:'Turkey and cheese wraps, cucumber', snack:'Graham crackers and milk' },
      thu:{ breakfast:'Pancakes and strawberries', lunch:'Spaghetti with meat sauce, broccoli', snack:'Banana and crackers' },
      fri:{ breakfast:'Grits and scrambled eggs', lunch:'Fish sticks, sweet potato, peas', snack:'Orange wedges and pretzels' }
    }}];
    d.lessons = [{ id:'l_' + wkNow, weekOf:wkNow, theme:'God made the seasons', verse:'To everything there is a season. (Ecclesiastes 3:1)', days:{
      mon:'Bible story: Creation, day 4. Circle: the four seasons song. ABCs: letter F for fall.',
      tue:'Nature walk round Berwick Court to collect leaves. Leaf rubbings. Counting 1–10 with acorns.',
      wed:'Bible story: Noah and the rainbow. Colors: red, orange, yellow. Fingerprint fall trees.',
      thu:'Music and movement: “This is the day.” Shapes: circles in pumpkins. Library story time.',
      fri:'Memory verse review. Cooking: apple cinnamon muffins. Free play and show-and-tell.'
    }}];
    d.log = [
      { id:uid('g'), at:at(L,'21:14'), text:'Rachel Kim asked for a tour for Leo (toddler) through the website.', k:'pink', icon:'inbox' },
      { id:uid('g'), at:at(L,'15:40'), text:'Hannah replied to the Mitchell family.', k:'sky', icon:'chat' },
      { id:uid('g'), at:at(L,'08:40'), text:'Kofi was checked in by Ama Boateng.', k:'lime', icon:'check' },
      { id:uid('g'), at:at(L,'07:58'), text:'Jessica Reyes sent a message about this week’s payment.', k:'sky', icon:'chat' },
      { id:uid('g'), at:at(iso(addDays(last,-1)),'18:20'), text:'Mitchell family paid $500 by Zelle.', k:'lime', icon:'money' }
    ];
    return d;
  }

  function load(){
    if(db) return db;
    var raw = read(KEY);
    try { db = raw ? JSON.parse(raw) : null; } catch(e){ db = null; }
    if(!db){ db = seed(); persist(); }
    return db;
  }
  function persist(){ write(KEY, JSON.stringify(db)); }

  /* ---------- generic records ---------- */
  function all(col){ return (load()[col] || []).slice(); }
  function get(col, id){ return (load()[col] || []).filter(function(x){ return x.id === id; })[0] || null; }
  function where(col, fn){ return all(col).filter(fn); }
  function save(col, obj){
    var list = load()[col] = load()[col] || [];
    if(!obj.id) obj.id = uid(col.slice(0,2));
    var i = list.map(function(x){ return x.id; }).indexOf(obj.id);
    if(i < 0) list.push(obj); else list[i] = obj;
    persist();
    return obj;
  }
  function del(col, id){ var d = load(); d[col] = (d[col] || []).filter(function(x){ return x.id !== id; }); persist(); }
  function settings(patch){ var d = load(); if(patch){ for(var k in patch) d.settings[k] = patch[k]; persist(); } return d.settings; }
  function log(text, k, icon){ var d = load(); d.log.unshift({ id:uid('g'), at:new Date().toISOString().slice(0,16), text:text, k:k || 'orange', icon:icon || 'star' }); d.log = d.log.slice(0, 200); persist(); }

  /* ---------- people ---------- */
  function session(){ var id = read(SKEY); return id ? get('users', id) : null; }
  function signIn(email, pw){
    var u = where('users', function(x){ return x.email.toLowerCase() === String(email).trim().toLowerCase(); })[0];
    if(!u || u.password !== pw) throw new Error('That email and password don’t match an account.');
    if(u.status === 'disabled') throw new Error('This account has been switched off. Please call Allkidz.');
    write(SKEY, u.id);
    return u;
  }
  function signInAs(id){ write(SKEY, id); return get('users', id); }
  function signOut(){ drop(SKEY); }

  /* ---------- the website's forms ---------- */
  function addApplication(o, kind){
    var a = {
      id: uid('ap'), kind: kind, status: 'new',
      parentName: o.parent_name || [o.first, o.last].filter(Boolean).join(' '), email: o.email || '', phone: o.phone || '',
      childName: o.child_name || '', childDob: o.child_dob || '', program: o.child_dob ? group(o.child_dob) : '',
      schedule: o.schedule || (/^(full|part|dropin)$/.test(o.program || '') ? o.program : ''),
      start: o.start || '', message: o.message || '', source: 'Website', at: new Date().toISOString().slice(0,16),
      tourAt: o.tour_day ? o.tour_day + 'T' + (o.tour_time || '16:00') : null,
      details: o
    };
    save('applications', a);
    log(a.parentName + (kind === 'tour' ? ' asked for a tour' : ' sent an enrollment application') + (a.childName ? ' for ' + a.childName.split(' ')[0] : '') + ' through the website.', 'pink', 'inbox');
    return a;
  }
  function events(){ return all('events').sort(function(a, b){ return a.date < b.date ? -1 : 1; }); }

  /* ---------- money ---------- */
  function invTotal(inv){ return inv.items.reduce(function(s, x){ return s + Number(x.amount || 0); }, 0); }
  function invPaid(inv){ return (inv.payments || []).reduce(function(s, x){ return x.pending ? s : s + Number(x.amount || 0); }, 0); }
  function invStatus(inv){
    var due = invTotal(inv) - invPaid(inv);
    if(due <= 0) return 'paid';
    return inv.due < iso() ? 'overdue' : 'open';
  }
  function balance(fid){ return where('invoices', function(i){ return i.familyId === fid; }).reduce(function(s, i){ return s + invTotal(i) - invPaid(i); }, 0); }

  function reset(){ drop(KEY); db = null; load(); }
  function dump(){ return JSON.stringify(load(), null, 2); }
  function restore(json){ var x = JSON.parse(json); if(!x || !x.users || !x.children) throw new Error('That file isn’t an Allkidz backup.'); db = x; persist(); }

  return {
    iso:iso, parse:parse, addDays:addDays, monday:monday, isWeekday:isWeekday, uid:uid, now:now,
    months:months, group:group, age:age, GROUPS:GROUPS,
    all:all, get:get, where:where, save:save, del:del, settings:settings, log:log,
    session:session, signIn:signIn, signInAs:signInAs, signOut:signOut,
    addApplication:addApplication, events:events,
    invTotal:invTotal, invPaid:invPaid, invStatus:invStatus, balance:balance,
    reset:reset, dump:dump, restore:restore
  };
})();
