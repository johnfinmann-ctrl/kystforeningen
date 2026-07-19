/**
 * NORDIC OPERATIONS CMS v2 – app.js
 * Offentlig hjemmeside – routing, data, UI
 *
 * RETTEDE FEJL (RC2):
 * - Loading-states fjernes altid – ved fejl, ved tom data og ved succes
 * - Hvis Supabase ikke er konfigureret vises pæn besked i hvert element
 * - Ingen "Indlæser..." der bliver stående permanent
 * - SW-registrering bruger relativ sti og gemmer registreringen globalt
 */

'use strict';

/* ══════════════════════════════════════════════════
   HJÆLPEFUNKTIONER
══════════════════════════════════════════════════ */
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
  return new Date(str).toLocaleDateString('da-DK',
    { month:'short', year:'numeric' });
}

function showAlert(id, msg, ok) {
  const el = $(id); if (!el) return;
  el.textContent = msg;
  el.className = 'alert show ' + (ok ? 'alert-ok' : 'alert-err');
  if (ok) setTimeout(() => { el.className = 'alert'; }, 5000);
}

function openModal(id)  { $(id)?.classList.add('open'); }
function closeModal(id) { $(id)?.classList.remove('open'); }

/* ══════════════════════════════════════════════════
   TILSTAND – er Supabase klar?
══════════════════════════════════════════════════ */

/**
 * Forsøger at initialisere Supabase-klienten.
 * Returnerer true hvis klienten er klar, false ellers.
 * Viser config-warn og sætter fejlbesked i elementet hvis ikke klar.
 */
function klarTilData(elementId) {
  if (isConfigured() && sb()) return true;
  // Vis global konfigurationsfejl
  const w = $('config-warn');
  if (w) w.style.display = 'block';
  // Sæt pæn besked i det specifikke element
  if (elementId) {
    const el = $(elementId);
    if (el) el.innerHTML =
      '<p class="text-muted" style="color:#c0392b;">⚠ Hjemmesiden er ikke konfigureret endnu. Kontakt os på <a href="mailto:info@kystforeningendj.dk">info@kystforeningendj.dk</a></p>';
  }
  return false;
}

/* ══════════════════════════════════════════════════
   NAVIGATION – SPA med history API
══════════════════════════════════════════════════ */
const PAGES = ['forside','om','aktiviteter','sager','bestyrelse','gf','medlem','kontakt'];
let _currentPage = 'forside';
let _loaded = new Set(); // sider der allerede har hentet data

const PAGE_LOADERS = {
  forside:    loadForsideData,
  aktiviteter:loadAktiviteter,
  sager:      loadSager,
  bestyrelse: loadBestyrelse,
  gf:         loadDokumenter,
  kontakt:    loadKontakt,
  medlem:     loadMedlemInfo,
};

function showPage(id, pushState = true) {
  if (!PAGES.includes(id)) id = 'forside';
  _currentPage = id;

  $$('.page').forEach(p => p.classList.remove('active'));
  $(`page-${id}`)?.classList.add('active');

  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });

  $('nav-links')?.classList.remove('open');
  $('hamburger')?.setAttribute('aria-expanded','false');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pushState) {
    const hash = id === 'forside' ? '' : '#' + id;
    history.pushState({ page: id }, '', window.location.pathname + hash);
  }

  // Indlæs data – altid (ikke kun første gang), så realtime-opdateringer virker
  if (PAGE_LOADERS[id]) PAGE_LOADERS[id]();
}

// Nav-knapper og data-goto / data-page
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-goto],[data-page]');
  if (!btn) return;
  const target = btn.dataset.goto || btn.dataset.page;
  if (PAGES.includes(target)) { e.preventDefault(); showPage(target); }
});

$('nav-logo')?.addEventListener('click', e => { e.preventDefault(); showPage('forside'); });

window.addEventListener('popstate', e => {
  const id = e.state?.page || 'forside';
  showPage(id, false);
});

/* ══════════════════════════════════════════════════
   NAV SCROLL
══════════════════════════════════════════════════ */
(function() {
  const nav = $('nav');
  const upd = () => nav?.classList.toggle('scrolled', window.pageYOffset > 80);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ══════════════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════════════ */
$('hamburger')?.addEventListener('click', function() {
  const links = $('nav-links');
  const open  = links?.classList.toggle('open');
  this.setAttribute('aria-expanded', String(!!open));
});

/* ══════════════════════════════════════════════════
   HERO SCROLL
══════════════════════════════════════════════════ */
$('hero-scroll')?.addEventListener('click', () => {
  $('intro')?.scrollIntoView({ behavior: 'smooth' });
});

/* ══════════════════════════════════════════════════
   MODALER
══════════════════════════════════════════════════ */
$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
$$('.modal-ov').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});

$('fp-priv')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-priv'); });
$('fp-cook')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-cook'); });
$('ck-laes')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-cook'); });

/* ══════════════════════════════════════════════════
   COOKIE BANNER
══════════════════════════════════════════════════ */
try {
  if (!localStorage.getItem('ck')) {
    const cb = $('cookie-banner');
    if (cb) cb.style.display = 'flex';
  }
} catch(e) {}
$('ck-ok')?.addEventListener('click',  () => {
  try { localStorage.setItem('ck','1'); } catch(e) {}
  const cb = $('cookie-banner'); if (cb) cb.style.display = 'none';
});
$('ck-nej')?.addEventListener('click', () => {
  try { localStorage.setItem('ck','0'); } catch(e) {}
  const cb = $('cookie-banner'); if (cb) cb.style.display = 'none';
});

/* ══════════════════════════════════════════════════
   BESKED-DIALOG (til formularer)
══════════════════════════════════════════════════ */
function visBesked(intro, tekst, emne, body, email) {
  $('bd-intro').textContent = intro;
  $('bd-tekst').textContent = tekst;
  $('bd-til').textContent   = email;
  $('bd-mailto').href = `mailto:${email}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(body)}`;
  openModal('modal-besked');
}

$('bd-kopi')?.addEventListener('click', function() {
  const t   = $('bd-tekst').textContent;
  const btn = this;
  const done = () => { btn.textContent = '✓ Kopieret!'; setTimeout(() => btn.textContent = '📋 Kopiér', 2500); };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(t).then(done);
  } else {
    const ta = Object.assign(document.createElement('textarea'), { value: t, style: 'position:fixed;opacity:0' });
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch(e) {}
    document.body.removeChild(ta);
  }
});

/* ══════════════════════════════════════════════════
   FORSIDE – tre bokse
══════════════════════════════════════════════════ */
async function loadForsideData() {
  if (!isConfigured() || !sb()) {
    // Supabase ikke sat op – vis fallback-tekst i boksene
    const fallback = 'Hjemmesiden henter snart data automatisk.';
    ['tb-ak-p','tb-ny-p','tb-sag-p'].forEach(id => {
      const el = $(id); if (el) el.textContent = fallback;
    });
    $('config-warn') && ($('config-warn').style.display = 'block');
    return;
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const [acts, news, cases, settings] = await Promise.all([
      fetchPublished('activities', 'title,event_date,excerpt',
        { order:'event_date', asc:true, gt:['event_date', today], limit:1 }),
      fetchPublished('news', 'title,excerpt',
        { order:'published_at', asc:false, limit:1 }),
      fetchPublished('cases', 'title,excerpt',
        { order:'priority', asc:true, eq:{ on_frontpage:true }, limit:1 }),
      getAllSettings(),
    ]);

    if (acts[0]) {
      const el = $('tb-ak-h'); if (el) el.textContent = acts[0].title;
      const ep = $('tb-ak-p'); if (ep) ep.textContent =
        (acts[0].excerpt || '') + (acts[0].event_date ? ' – ' + fmtDate(acts[0].event_date) : '');
    }
    if (news[0]) {
      const el = $('tb-ny-h'); if (el) el.textContent = news[0].title;
      const ep = $('tb-ny-p'); if (ep) ep.textContent = news[0].excerpt || '';
    }
    if (cases[0]) {
      const el = $('tb-sag-h'); if (el) el.textContent = cases[0].title;
      const ep = $('tb-sag-p'); if (ep) ep.textContent = cases[0].excerpt || '';
    }

    // Indstillinger
    updateKontaktUI(settings);
    if (settings.membership_single) {
      const mp = $('mb-price'); if (mp) mp.textContent = settings.membership_single;
    }
    if (settings.membership_single && settings.membership_family) {
      const mn = $('mb-note');
      if (mn) mn.textContent = (settings.membership_note || 'per år') +
        ' · familiemedlemskab ' + settings.membership_family;
    }
    if (settings.cvr) { const fc = $('f-cvr'); if (fc) fc.textContent = settings.cvr; }

  } catch(e) { console.error('[app] forside:', e); }
}

/* ══════════════════════════════════════════════════
   AKTIVITETER
══════════════════════════════════════════════════ */
async function loadAktiviteter() {
  const c = $('ak-list');
  if (!c) return;

  // Vis loading kun kort
  c.innerHTML = '<p class="text-muted">Henter aktiviteter...</p>';

  if (!klarTilData('ak-list')) return;

  const data = await fetchPublished('activities',
    'title,event_date,time_start,location,excerpt',
    { order:'event_date', asc:true });

  if (!data.length) {
    c.innerHTML = '<p class="text-muted">Ingen planlagte aktiviteter.</p>';
    return;
  }

  c.innerHTML = data.map(a => `
    <article class="ak-item">
      <div class="ak-date" aria-label="Dato">${escH(fmtMonth(a.event_date))}</div>
      <div class="ak-body">
        <h3>${escH(a.title)}</h3>
        <p>${escH(a.excerpt || '')}${a.location ? ' · <em>' + escH(a.location) + '</em>' : ''}</p>
      </div>
    </article>`).join('');
}

/* ══════════════════════════════════════════════════
   AKTUELLE SAGER
══════════════════════════════════════════════════ */
let _sagerData = [];

async function loadSager() {
  const g = $('sag-grid');
  if (!g) return;

  g.innerHTML = '<p class="text-muted">Henter sager...</p>';

  if (!klarTilData('sag-grid')) return;

  _sagerData = await fetchPublished('cases',
    'id,title,excerpt,body,image_url',
    { order:'priority', asc:true });

  if (!_sagerData.length) {
    g.innerHTML = '<p class="text-muted">Ingen aktuelle sager.</p>';
    return;
  }

  g.innerHTML = _sagerData.map((s, i) => `
    <article class="sag-kort">
      ${s.image_url
        ? `<img class="sag-kort-img" src="${escH(s.image_url)}" alt="${escH(s.title)}" loading="lazy">`
        : `<div class="sag-kort-img" style="display:flex;align-items:center;justify-content:center;color:var(--c-muted);font-size:2rem;">🌊</div>`}
      <div class="sag-kort-body">
        <h3>${escH(s.title)}</h3>
        <p>${escH(s.excerpt || '')}</p>
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

/* ══════════════════════════════════════════════════
   BESTYRELSE
══════════════════════════════════════════════════ */
async function loadBestyrelse() {
  const g = $('bst-grid');
  if (!g) return;

  g.innerHTML = '<p class="text-muted">Henter bestyrelsesmedlemmer...</p>';

  if (!klarTilData('bst-grid')) return;

  const client = sb();
  let data = [];
  try {
    const res = await client.from('board_members')
      .select('name,role_title,email,photo_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (res.error) throw res.error;
    data = res.data ?? [];
  } catch(e) {
    console.error('[app] bestyrelse:', e);
    g.innerHTML = '<p class="text-muted">Bestyrelsesoplysninger er midlertidigt utilgængelige.</p>';
    return;
  }

  if (!data.length) {
    g.innerHTML = '<p class="text-muted">Bestyrelsesoplysninger opdateres snart.</p>';
    return;
  }

  g.innerHTML = data.map(m => `
    <article class="bst-kort">
      <div class="bst-avatar">
        ${m.photo_url
          ? `<img src="${escH(m.photo_url)}" alt="${escH(m.name)}" loading="lazy">`
          : '👤'}
      </div>
      <h3>${escH(m.name)}</h3>
      <div class="bst-role">${escH(m.role_title || '')}</div>
      ${m.email ? `<a href="mailto:${escH(m.email)}">${escH(m.email)}</a>` : ''}
    </article>`).join('');
}

/* ══════════════════════════════════════════════════
   DOKUMENTER
══════════════════════════════════════════════════ */
async function loadDokumenter() {
  const c = $('dok-areas');
  if (!c) return;

  c.innerHTML = '<p class="text-muted">Henter dokumenter...</p>';

  if (!klarTilData('dok-areas')) return;

  const client = sb();
  let data = [];
  try {
    const res = await client.from('documents')
      .select('title,category,file_url,file_type,doc_year,description')
      .order('doc_year', { ascending: false });
    if (res.error) throw res.error;
    data = res.data ?? [];
  } catch(e) {
    console.error('[app] dokumenter:', e);
    c.innerHTML = '<p class="text-muted">Dokumenter er midlertidigt utilgængelige.</p>';
    return;
  }

  if (!data.length) {
    c.innerHTML = '<p class="text-muted">Ingen dokumenter er uploadet endnu.</p>';
    return;
  }

  const cats = ['Vedtægter','Indkaldelser','Dagsordener','Referater',
                'Regnskaber','Årsberetninger','Høringssvar','Pressemeddelelser','Bilag','Andre'];
  let html = '';
  cats.forEach(cat => {
    const liste = data.filter(d => d.category === cat);
    if (!liste.length) return;
    html += `<div class="dok-section"><div class="dok-cat-title">${cat}</div><div class="dok-list">`;
    html += liste.map(d => {
      const hasUrl = d.file_url && d.file_url.length > 4;
      return `<a ${hasUrl
          ? `href="${escH(d.file_url)}" target="_blank" rel="noopener"`
          : 'href="#" onclick="return false"'}
         class="dok-row">
        <span class="icon">📄</span>
        <div class="info">
          <strong>${escH(d.title)}</strong>
          <span>${escH(d.description || '')}${d.doc_year ? ' · ' + d.doc_year : ''}</span>
        </div>
        <span class="dl">${hasUrl ? '⬇' : '📎'}</span>
      </a>`;
    }).join('');
    html += '</div></div>';
  });

  c.innerHTML = html || '<p class="text-muted">Ingen dokumenter er uploadet endnu.</p>';
}

/* ══════════════════════════════════════════════════
   KONTAKT OG KONTINGENT
══════════════════════════════════════════════════ */
async function loadKontakt() {
  if (!isConfigured() || !sb()) return; // kontakt-siden har statisk fallback
  try {
    const settings = await getAllSettings();
    updateKontaktUI(settings);
    if (settings.membership_single) {
      const mp = $('mb-price'); if (mp) mp.textContent = settings.membership_single;
    }
    if (settings.membership_single && settings.membership_family) {
      const mn = $('mb-note');
      if (mn) mn.textContent = (settings.membership_note || 'per år') +
        ' · familiemedlemskab ' + settings.membership_family;
    }
  } catch(e) { console.error('[app] kontakt:', e); }
}

async function loadMedlemInfo() {
  if (!isConfigured() || !sb()) return;
  try {
    const s = await getAllSettings();
    if (s.membership_single) {
      const mp = $('mb-price'); if (mp) mp.textContent = s.membership_single;
    }
    if (s.membership_single && s.membership_family) {
      const mn = $('mb-note');
      if (mn) mn.textContent = (s.membership_note || 'per år') +
        ' · familiemedlemskab ' + s.membership_family;
    }
    updateKontaktUI(s);
  } catch(e) { console.error('[app] medlem:', e); }
}

function updateKontaktUI(s) {
  if (!s) return;
  const kn = $('k-navn');  if (kn && s.contact_name)  kn.textContent  = s.contact_name;
  const km = $('k-email'); if (km && s.contact_email) { km.textContent = s.contact_email; km.href = 'mailto:' + s.contact_email; }
  const kt = $('k-tlf');   if (kt && s.contact_phone) { kt.textContent = s.contact_phone; kt.href = 'tel:' + s.contact_phone.replace(/\s/g,''); }
  const kf = $('k-fb');    if (kf && s.facebook_url)  kf.href = s.facebook_url;
  const fc = $('f-cvr');   if (fc && s.cvr)           fc.textContent  = s.cvr;
}

/* ══════════════════════════════════════════════════
   TILMELDING
══════════════════════════════════════════════════ */
$('btn-tilmeld')?.addEventListener('click', async () => {
  const navn   = $('m-navn')?.value.trim();
  const email  = $('m-email')?.value.trim();
  const tlf    = $('m-tlf')?.value.trim();
  const komm   = $('m-kommentar')?.value.trim();
  $('m-alert').className = 'alert';
  if (!navn)  { showAlert('m-alert', '⚠ Udfyld dit navn.', false); return; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showAlert('m-alert', '⚠ Ugyldig e-mail.', false); return; }
  const kontaktMail = $('k-email')?.textContent || 'info@kystforeningendj.dk';
  const emne  = 'Ny medlemstilmelding – ' + navn;
  const tekst = `Hej Kystforeningen Djursland,\n\nJeg ønsker at melde mig ind i foreningen.\n\nNavn: ${navn}\nE-mail: ${email}${tlf ? '\nTelefon: ' + tlf : ''}${komm ? '\nKommentar: ' + komm : ''}\n\nMed venlig hilsen\n${navn}`;
  visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.', tekst, emne, tekst, kontaktMail);
  ['m-navn','m-email','m-tlf','m-kommentar'].forEach(id => { const e=$(id); if(e) e.value=''; });
});

/* ══════════════════════════════════════════════════
   KONTAKTFORMULAR
══════════════════════════════════════════════════ */
$('btn-kontakt')?.addEventListener('click', () => {
  const navn   = $('k-navn-form')?.value.trim();
  const email  = $('k-email-form')?.value.trim();
  const besked = $('k-besked')?.value.trim();
  $('k-alert').className = 'alert';
  if (!navn)   { showAlert('k-alert', '⚠ Udfyld dit navn.', false); return; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { showAlert('k-alert', '⚠ Ugyldig e-mail.', false); return; }
  if (!besked) { showAlert('k-alert', '⚠ Skriv en besked.', false); return; }
  const kontaktMail = $('k-email')?.textContent || 'info@kystforeningendj.dk';
  const emne  = 'Besked fra ' + navn + ' – Kystforeningen Djursland';
  const tekst = `Fra: ${navn}\nE-mail: ${email}\n\n${besked}`;
  visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.', tekst, emne, tekst, kontaktMail);
  ['k-navn-form','k-email-form','k-besked'].forEach(id => { const e=$(id); if(e) e.value=''; });
});

/* ══════════════════════════════════════════════════
   REALTIME
══════════════════════════════════════════════════ */
function setupRealtime() {
  if (!isConfigured() || !sb()) return;
  ['activities','news','cases','board_members','documents'].forEach(table => {
    subscribeTable(table, () => {
      // Genindlæs aktiv side ved dataændring
      if (PAGE_LOADERS[_currentPage]) PAGE_LOADERS[_currentPage]();
      // Opdatér forsidebokse uanset hvilken side der vises
      loadForsideData();
    });
  });
}

/* ══════════════════════════════════════════════════
   PWA SERVICE WORKER
══════════════════════════════════════════════════ */
let _swReg = null;

if ('serviceWorker' in navigator) {
  // Relativ sti – virker på GitHub Pages i subrepoer
  navigator.serviceWorker.register('./sw.js').then(reg => {
    _swReg = reg;

    // Ny SW fundet – vis opdateringsbanner
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          $('update-banner')?.classList.add('visible');
        }
      });
    });

    // SW venter allerede (bruger genåbnede siden med ny version)
    if (reg.waiting && navigator.serviceWorker.controller) {
      $('update-banner')?.classList.add('visible');
    }

  }).catch(e => console.warn('[SW]', e));

  // SW overtager kontrol → genindlæs siden med ny version
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// "Opdater nu" – aktiver den ventende SW
$('update-now')?.addEventListener('click', () => {
  if (_swReg?.waiting) {
    _swReg.waiting.postMessage('SKIP_WAITING');
  } else {
    window.location.reload(true);
  }
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Bestem startside fra URL-hash
  const hash      = window.location.hash.replace('#','');
  const startPage = PAGES.includes(hash) ? hash : 'forside';
  history.replaceState(
    { page: startPage }, '',
    window.location.pathname + (startPage !== 'forside' ? '#' + startPage : '')
  );

  // Vis siden – dette kalder PAGE_LOADERS[startPage]()
  showPage(startPage, false);

  // Opsæt realtime (kun hvis Supabase er konfigureret)
  setupRealtime();

  // Tjek om der er en nyere version tilgængelig
  if (isConfigured()) {
    checkAppVersion(APP_VERSION, () => {
      $('update-banner')?.classList.add('visible');
    });
    // Gentjek hvert 5. minut
    setInterval(() => checkAppVersion(APP_VERSION, () => {
      $('update-banner')?.classList.add('visible');
    }), 5 * 60 * 1000);
  }
});
