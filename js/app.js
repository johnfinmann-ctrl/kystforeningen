/**
 * NORDIC OPERATIONS CMS v2 – app.js
 * Offentlig hjemmeside – routing, data, UI
 */

'use strict';

/* ══════════════════════════════════════════
   HJÆLPEFUNKTIONER
══════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function escH(t) {
  return String(t ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(str) {
  if (!str) return '–';
  return new Date(str).toLocaleDateString('da-DK',
    { day:'numeric', month:'long', year:'numeric' });
}

function fmtMonth(str) {
  if (!str) return '–';
  const d = new Date(str);
  return d.toLocaleDateString('da-DK', { month:'short', year:'numeric' });
}

function showAlert(id, msg, ok) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'alert show ' + (ok ? 'alert-ok' : 'alert-err');
  if (ok) setTimeout(() => { el.className = 'alert'; }, 5000);
}

function openModal(id)  { $(id)?.classList.add('open'); }
function closeModal(id) { $(id)?.classList.remove('open'); }

/* ══════════════════════════════════════════
   NAVIGATIONSYSTEM  (SPA med history API)
══════════════════════════════════════════ */
const PAGES = ['forside','om','aktiviteter','sager','bestyrelse','gf','medlem','kontakt'];
let _currentPage = 'forside';

const PAGE_LOADERS = {
  aktiviteter: loadAktiviteter,
  sager:       loadSager,
  bestyrelse:  loadBestyrelse,
  gf:          loadDokumenter,
  kontakt:     loadKontakt,
  medlem:      loadMedlemInfo,
};

function showPage(id, pushState = true) {
  if (!PAGES.includes(id)) id = 'forside';
  _currentPage = id;

  // Skjul alle sider
  $$('.page').forEach(p => p.classList.remove('active'));
  // Vis valgt side
  $(`page-${id}`)?.classList.add('active');

  // Nav-knap aktiv
  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });

  // Luk mobilmenu
  $('nav-links')?.classList.remove('open');
  $('hamburger')?.setAttribute('aria-expanded', 'false');

  // Scroll til top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // History
  if (pushState) {
    const hash = id === 'forside' ? '' : '#' + id;
    history.pushState({ page: id }, '', window.location.pathname + hash);
  }

  // Indlæs side-specifik data
  if (PAGE_LOADERS[id]) PAGE_LOADERS[id]();

  // Forside-indhold
  if (id === 'forside') loadForsideData();
}

// Lyt på alle nav-knapper og data-goto / data-page knapper
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-goto],[data-page]');
  if (!btn) return;
  const target = btn.dataset.goto || btn.dataset.page;
  if (PAGES.includes(target)) { e.preventDefault(); showPage(target); }
});

// Logo → forside
$('nav-logo')?.addEventListener('click', e => { e.preventDefault(); showPage('forside'); });

// Browser tilbage/frem
window.addEventListener('popstate', e => {
  const id = e.state?.page || 'forside';
  showPage(id, false);
});

/* ══════════════════════════════════════════
   NAV SCROLL-EFFEKT
══════════════════════════════════════════ */
(function navScroll() {
  const nav = $('nav');
  const upd = () => nav?.classList.toggle('scrolled', window.pageYOffset > 80);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ══════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════ */
$('hamburger')?.addEventListener('click', function() {
  const links = $('nav-links');
  const open  = links?.classList.toggle('open');
  this.setAttribute('aria-expanded', String(!!open));
});

/* ══════════════════════════════════════════
   HERO SCROLL
══════════════════════════════════════════ */
$('hero-scroll')?.addEventListener('click', () => {
  $('intro')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════
   MODALER
══════════════════════════════════════════ */
$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
$$('.modal-ov').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});

$('fp-priv')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-priv'); });
$('fp-cook')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-cook'); });
$('ck-laes')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-cook'); });

/* ══════════════════════════════════════════
   COOKIE BANNER
══════════════════════════════════════════ */
try {
  if (!localStorage.getItem('ck')) $('cookie-banner').style.display = 'flex';
} catch(e) {}
$('ck-ok')?.addEventListener('click',  () => { try{localStorage.setItem('ck','1');}catch(e){} $('cookie-banner').style.display='none'; });
$('ck-nej')?.addEventListener('click', () => { try{localStorage.setItem('ck','0');}catch(e){} $('cookie-banner').style.display='none'; });

/* ══════════════════════════════════════════
   BESKED-DIALOG  (til formularer)
══════════════════════════════════════════ */
function visBesked(intro, tekst, emne, body, email) {
  $('bd-intro').textContent = intro;
  $('bd-tekst').textContent = tekst;
  $('bd-til').textContent   = email;
  $('bd-mailto').href = `mailto:${email}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(body)}`;
  openModal('modal-besked');
}

$('bd-kopi')?.addEventListener('click', function() {
  const t = $('bd-tekst').textContent;
  const btn = this;
  const done = () => { btn.textContent='✓ Kopieret!'; setTimeout(()=>btn.textContent='📋 Kopiér',2500); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(done);
  else {
    const ta = Object.assign(document.createElement('textarea'), { value:t, style:'position:fixed;opacity:0' });
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch(e) {}
    document.body.removeChild(ta);
  }
});

/* ══════════════════════════════════════════
   CONFIG-TJEK
══════════════════════════════════════════ */
function checkConfig() {
  if (!isConfigured()) {
    const w = $('config-warn');
    if (w) w.style.display = 'block';
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════
   FORSIDE – tre bokse + indstillinger
══════════════════════════════════════════ */
async function loadForsideData() {
  if (!checkConfig()) return;
  try {
    const [acts, news, cases, settings] = await Promise.all([
      fetchPublished('activities','title,event_date,excerpt',
        { order:'event_date', asc:true, gt:['event_date', new Date().toISOString().split('T')[0]], limit:1 }),
      fetchPublished('news','title,excerpt',
        { order:'published_at', asc:false, limit:1 }),
      fetchPublished('cases','title,excerpt',
        { order:'priority', asc:true, eq:{on_frontpage:true}, limit:1 }),
      getAllSettings(),
    ]);

    // Kommende aktivitet
    if (acts[0]) {
      $('tb-ak-h').textContent = acts[0].title;
      $('tb-ak-p').textContent = (acts[0].excerpt||'') + (acts[0].event_date ? ' – ' + fmtDate(acts[0].event_date) : '');
    }

    // Seneste nyhed
    if (news[0]) {
      $('tb-ny-h').textContent = news[0].title;
      $('tb-ny-p').textContent = news[0].excerpt || '';
    }

    // Aktuel sag
    if (cases[0]) {
      $('tb-sag-h').textContent = cases[0].title;
      $('tb-sag-p').textContent = cases[0].excerpt || '';
    }

    // Kontingent
    if (settings.membership_single) $('mb-price').textContent = settings.membership_single;
    if (settings.membership_single && settings.membership_family) {
      $('mb-note').textContent = (settings.membership_note||'per år') + ' · familiemedlemskab ' + settings.membership_family;
    }

    // CVR
    if (settings.cvr) $('f-cvr').textContent = settings.cvr;

    // Kontakt-info
    updateKontaktUI(settings);

  } catch(e) { console.error('[app] forside:', e); }
}

/* ══════════════════════════════════════════
   AKTIVITETER
══════════════════════════════════════════ */
async function loadAktiviteter() {
  if (!checkConfig()) return;
  const c = $('ak-list');
  if (!c) return;
  c.innerHTML = '<p class="text-muted">Indlæser aktiviteter...</p>';
  const data = await fetchPublished('activities',
    'title,event_date,time_start,location,excerpt',
    { order:'event_date', asc:true });
  if (!data.length) { c.innerHTML = '<p class="text-muted">Ingen planlagte aktiviteter.</p>'; return; }
  c.innerHTML = data.map(a => `
    <article class="ak-item">
      <div class="ak-date" aria-label="Dato">${escH(fmtMonth(a.event_date))}</div>
      <div class="ak-body">
        <h3>${escH(a.title)}</h3>
        <p>${escH(a.excerpt||'')}${a.location ? ' · <em>' + escH(a.location) + '</em>' : ''}</p>
      </div>
    </article>`).join('');
}

/* ══════════════════════════════════════════
   AKTUELLE SAGER
══════════════════════════════════════════ */
let _sagerData = [];

async function loadSager() {
  if (!checkConfig()) return;
  const g = $('sag-grid');
  if (!g) return;
  g.innerHTML = '<p class="text-muted">Indlæser sager...</p>';
  _sagerData = await fetchPublished('cases',
    'id,title,excerpt,body,image_url',
    { order:'priority', asc:true });
  if (!_sagerData.length) { g.innerHTML = '<p class="text-muted">Ingen aktuelle sager.</p>'; return; }
  g.innerHTML = _sagerData.map((s, i) => `
    <article class="sag-kort">
      ${s.image_url
        ? `<img class="sag-kort-img" src="${escH(s.image_url)}" alt="${escH(s.title)}" loading="lazy">`
        : `<div class="sag-kort-img" style="display:flex;align-items:center;justify-content:center;color:var(--c-muted);font-size:2rem;">🌊</div>`}
      <div class="sag-kort-body">
        <h3>${escH(s.title)}</h3>
        <p>${escH(s.excerpt||'')}</p>
        <button class="btn btn-navy btn-sm" data-sag-idx="${i}">Læs mere</button>
      </div>
    </article>`).join('');

  g.querySelectorAll('[data-sag-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = _sagerData[parseInt(btn.dataset.sagIdx)];
      $('sag-modal-h2').textContent = s.title;
      $('sag-modal-body').innerHTML = `<p>${escH(s.body || s.excerpt || '')}</p>`;
      openModal('modal-sag');
    });
  });
}

/* ══════════════════════════════════════════
   BESTYRELSE
══════════════════════════════════════════ */
async function loadBestyrelse() {
  if (!checkConfig()) return;
  const g = $('bst-grid');
  if (!g) return;
  g.innerHTML = '<p class="text-muted">Indlæser bestyrelse...</p>';
  const data = await (async () => {
    const client = sb();
    if (!client) return [];
    const { data } = await client.from('board_members')
      .select('name,role_title,email,photo_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return data ?? [];
  })();
  if (!data.length) { g.innerHTML = '<p class="text-muted">Ingen bestyrelsesmedlemmer endnu.</p>'; return; }
  g.innerHTML = data.map(m => `
    <article class="bst-kort">
      <div class="bst-avatar">
        ${m.photo_url ? `<img src="${escH(m.photo_url)}" alt="${escH(m.name)}" loading="lazy">` : '👤'}
      </div>
      <h3>${escH(m.name)}</h3>
      <div class="bst-role">${escH(m.role_title||'')}</div>
      ${m.email ? `<a href="mailto:${escH(m.email)}">${escH(m.email)}</a>` : ''}
    </article>`).join('');
}

/* ══════════════════════════════════════════
   DOKUMENTER (Generalforsamling)
══════════════════════════════════════════ */
async function loadDokumenter() {
  if (!checkConfig()) return;
  const c = $('dok-areas');
  if (!c) return;
  c.innerHTML = '<p class="text-muted">Indlæser dokumenter...</p>';
  const client = sb();
  if (!client) return;
  const { data } = await client.from('documents')
    .select('title,category,file_url,file_type,doc_year,description')
    .order('doc_year', { ascending: false });
  if (!data?.length) { c.innerHTML = '<p class="text-muted">Ingen dokumenter endnu.</p>'; return; }

  const cats = ['Vedtægter','Indkaldelser','Dagsordener','Referater',
                'Regnskaber','Årsberetninger','Høringssvar','Pressemeddelelser','Bilag','Andre'];
  let html = '';
  cats.forEach(cat => {
    const liste = data.filter(d => d.category === cat);
    if (!liste.length) return;
    html += `<div class="dok-section"><div class="dok-cat-title">${cat}</div><div class="dok-list">`;
    html += liste.map(d => {
      const hasUrl = d.file_url?.length > 4;
      return `<a ${hasUrl ? `href="${escH(d.file_url)}" target="_blank" rel="noopener"` : 'href="#" onclick="return false"'}
                 class="dok-row">
        <span class="icon">📄</span>
        <div class="info">
          <strong>${escH(d.title)}</strong>
          <span>${escH(d.description||'')}${d.doc_year?' · '+d.doc_year:''}</span>
        </div>
        <span class="dl">${hasUrl?'⬇':'📎'}</span>
      </a>`;
    }).join('');
    html += '</div></div>';
  });
  c.innerHTML = html || '<p class="text-muted">Ingen dokumenter endnu.</p>';
}

/* ══════════════════════════════════════════
   KONTAKT – opdater UI med settings
══════════════════════════════════════════ */
async function loadKontakt() {
  if (!checkConfig()) return;
  const settings = await getAllSettings();
  updateKontaktUI(settings);
  if (settings.membership_single) $('mb-price').textContent = settings.membership_single;
}

function updateKontaktUI(s) {
  if (!s) return;
  const kn = $('k-navn');     if (kn) kn.textContent = s.contact_name || '';
  const km = $('k-email');    if (km) { km.textContent = s.contact_email||''; km.href='mailto:'+(s.contact_email||''); }
  const kt = $('k-tlf');      if (kt) { kt.textContent = s.contact_phone||''; kt.href='tel:'+(s.contact_phone||'').replace(/\s/g,''); }
  const kf = $('k-fb');       if (kf && s.facebook_url) { kf.href = s.facebook_url; }
  const cvr = $('f-cvr');     if (cvr && s.cvr) cvr.textContent = s.cvr;
}

async function loadMedlemInfo() {
  if (!checkConfig()) return;
  const s = await getAllSettings();
  if (s.membership_single) $('mb-price').textContent = s.membership_single;
  if (s.membership_single && s.membership_family) {
    $('mb-note').textContent = (s.membership_note||'per år') + ' · familiemedlemskab ' + s.membership_family;
  }
}

/* ══════════════════════════════════════════
   TILMELDING
══════════════════════════════════════════ */
$('btn-tilmeld')?.addEventListener('click', async () => {
  const navn   = $('m-navn')?.value.trim();
  const email  = $('m-email')?.value.trim();
  const tlf    = $('m-tlf')?.value.trim();
  const komm   = $('m-kommentar')?.value.trim();
  $('m-alert').className = 'alert';
  if (!navn)  { showAlert('m-alert','⚠ Udfyld dit navn.',false); return; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showAlert('m-alert','⚠ Ugyldig e-mail.',false); return; }
  const kontaktMail = $('k-email')?.textContent || 'info@kystforeningendj.dk';
  const emne  = 'Ny medlemstilmelding – ' + navn;
  const tekst = `Hej Kystforeningen Djursland,\n\nJeg ønsker at melde mig ind i foreningen.\n\nNavn: ${navn}\nE-mail: ${email}${tlf?'\nTelefon: '+tlf:''}${komm?'\nKommentar: '+komm:''}\n\nMed venlig hilsen\n${navn}`;
  visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.', tekst, emne, tekst, kontaktMail);
  ['m-navn','m-email','m-tlf','m-kommentar'].forEach(id => { const e=$(id); if(e) e.value=''; });
});

/* ══════════════════════════════════════════
   KONTAKTFORMULAR
══════════════════════════════════════════ */
$('btn-kontakt')?.addEventListener('click', () => {
  const navn   = $('k-navn-form')?.value.trim();
  const email  = $('k-email-form')?.value.trim();
  const besked = $('k-besked')?.value.trim();
  $('k-alert').className = 'alert';
  if (!navn)   { showAlert('k-alert','⚠ Udfyld dit navn.',false); return; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showAlert('k-alert','⚠ Ugyldig e-mail.',false); return; }
  if (!besked) { showAlert('k-alert','⚠ Skriv en besked.',false); return; }
  const kontaktMail = $('k-email')?.textContent || 'info@kystforeningendj.dk';
  const emne  = 'Besked fra ' + navn + ' – Kystforeningen Djursland';
  const tekst = `Fra: ${navn}\nE-mail: ${email}\n\n${besked}`;
  visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.', tekst, emne, tekst, kontaktMail);
  ['k-navn-form','k-email-form','k-besked'].forEach(id => { const e=$(id); if(e) e.value=''; });
});

/* ══════════════════════════════════════════
   REALTID – lyt på content-ændringer
══════════════════════════════════════════ */
function setupRealtime() {
  if (!isConfigured()) return;
  // Reload aktiv side ved content-ændringer
  ['activities','news','cases','board_members','documents'].forEach(table => {
    subscribeTable(table, () => {
      if (PAGE_LOADERS[_currentPage]) PAGE_LOADERS[_currentPage]();
      if (_currentPage === 'forside') loadForsideData();
    });
  });
  // Tjek app-version hvert 5. minut
  setInterval(() => checkAppVersion(APP_VERSION, newVer => {
    const banner = $('update-banner');
    if (banner) banner.classList.add('visible');
  }), 5 * 60 * 1000);
}

$('update-now')?.addEventListener('click', () => window.location.reload(true));

/* ══════════════════════════════════════════
   PWA SERVICE WORKER
══════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          $('update-banner')?.classList.add('visible');
        }
      });
    });
  }).catch(e => console.warn('[SW]', e));
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Læs hash fra URL
  const hash = window.location.hash.replace('#','');
  const startPage = PAGES.includes(hash) ? hash : 'forside';
  history.replaceState({ page: startPage }, '', window.location.pathname + (startPage !== 'forside' ? '#'+startPage : ''));
  showPage(startPage, false);

  // Opsæt realtid
  setupRealtime();

  // Initial version-tjek
  checkAppVersion(APP_VERSION, () => {
    $('update-banner')?.classList.add('visible');
  });
});
