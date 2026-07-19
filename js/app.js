/**
 * NORDIC OPERATIONS CMS v2 – app.js
 * Offentlig hjemmeside – routing, data, UI
 *
 * RC3 rettelser:
 * - Navigation initialiseres ét sted (DOMContentLoaded) og virker på alle sider
 * - config-warn vises KUN i DEBUG_MODE – aldrig for offentlige brugere
 * - Alle loading-states fjernes ved fejl, tom data og succes
 * - Vindmølle-billede bruges på Aktuelle sager (Vindmøller ved Vosnæs)
 */

'use strict';

/* ════════════════════════════════════════════════
   HJÆLPEFUNKTIONER
════════════════════════════════════════════════ */
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
  el.className   = 'alert show ' + (ok ? 'alert-ok' : 'alert-err');
  if (ok) setTimeout(() => { el.className = 'alert'; }, 5000);
}

function openModal(id)  { $(id)?.classList.add('open'); }
function closeModal(id) { $(id)?.classList.remove('open'); }

/* ════════════════════════════════════════════════
   SUPABASE-STATUS – diskret håndtering
════════════════════════════════════════════════ */

/**
 * Viser kun Supabase-status i DEBUG_MODE.
 * I produktion (DEBUG_MODE = false) ser offentlige brugere
 * aldrig tekniske beskeder.
 */
function visDebugInfo(besked) {
  if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE) {
    const w = $('config-warn');
    if (w) { w.textContent = '🛠 Dev: ' + besked; w.style.display = 'block'; }
  }
}

/**
 * Er Supabase klar til dataforespørgsler?
 * Sætter en brugervenlig (ikke-teknisk) besked i elementet hvis ikke.
 */
function klarTilData(elementId) {
  if (isConfigured() && sb()) return true;

  visDebugInfo('Supabase ikke konfigureret – udfyld js/config.js');

  if (elementId) {
    const el = $(elementId);
    if (el) el.innerHTML = '<p class="text-muted">Indholdet opdateres snart.</p>';
  }
  return false;
}

/* ════════════════════════════════════════════════
   NAVIGATION
   Registreres ÉT sted ved DOMContentLoaded.
   Virker på alle sider og efter alle sideskift.
════════════════════════════════════════════════ */
const PAGES = [
  'forside','om','aktiviteter','sager',
  'bestyrelse','gf','medlem','kontakt'
];
let _currentPage = 'forside';

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

  // Vis korrekt side-div
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`page-${id}`)?.classList.add('active');

  // Fremhæv aktivt menupunkt
  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === id);
  });

  // Luk mobilmenu
  const navLinks = $('nav-links');
  const hamburger = $('hamburger');
  navLinks?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');

  // Scroll til toppen
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Browser history
  if (pushState) {
    const hash = id === 'forside' ? '' : '#' + id;
    history.pushState({ page: id }, '',
      window.location.pathname + hash);
  }

  // Indlæs side-data
  if (PAGE_LOADERS[id]) PAGE_LOADERS[id]();
}

/* ════════════════════════════════════════════════
   NAV SCROLL-EFFEKT
════════════════════════════════════════════════ */
function initNavScroll() {
  const nav = $('nav');
  if (!nav) return;
  const upd = () => nav.classList.toggle('scrolled', window.pageYOffset > 80);
  window.addEventListener('scroll', upd, { passive: true });
  upd();
}

/* ════════════════════════════════════════════════
   MODALER
════════════════════════════════════════════════ */
function initModaler() {
  // Luk ved klik på [data-close]
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  // Luk ved klik udenfor modal
  $$('.modal-ov').forEach(ov => {
    ov.addEventListener('click', e => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });
}

/* ════════════════════════════════════════════════
   BESKED-DIALOG (til formularer)
════════════════════════════════════════════════ */
function visBesked(intro, tekst, emne, body, email) {
  const bdIntro = $('bd-intro');
  const bdTekst = $('bd-tekst');
  const bdTil   = $('bd-til');
  const bdMailto= $('bd-mailto');
  if (bdIntro)  bdIntro.textContent  = intro;
  if (bdTekst)  bdTekst.textContent  = tekst;
  if (bdTil)    bdTil.textContent    = email;
  if (bdMailto) bdMailto.href =
    `mailto:${email}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(body)}`;
  openModal('modal-besked');
}

function initBeskedDialog() {
  $('bd-kopi')?.addEventListener('click', function() {
    const t   = $('bd-tekst')?.textContent || '';
    const btn = this;
    const done = () => {
      btn.textContent = '✓ Kopieret!';
      setTimeout(() => { btn.textContent = '📋 Kopiér'; }, 2500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(t).then(done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch(e) {}
      document.body.removeChild(ta);
    }
  });
}

/* ════════════════════════════════════════════════
   COOKIE BANNER
════════════════════════════════════════════════ */
function initCookieBanner() {
  try {
    if (!localStorage.getItem('ck')) {
      const cb = $('cookie-banner');
      if (cb) cb.style.display = 'flex';
    }
  } catch(e) {}

  const hideBanner = () => {
    const cb = $('cookie-banner');
    if (cb) cb.style.display = 'none';
  };

  $('ck-ok')?.addEventListener('click', () => {
    try { localStorage.setItem('ck','1'); } catch(e) {}
    hideBanner();
  });
  $('ck-nej')?.addEventListener('click', () => {
    try { localStorage.setItem('ck','0'); } catch(e) {}
    hideBanner();
  });
  $('ck-laes')?.addEventListener('click', e => {
    e.preventDefault(); openModal('modal-cook');
  });
}

/* ════════════════════════════════════════════════
   FORSIDE – tre bokse
════════════════════════════════════════════════ */
async function loadForsideData() {
  if (!isConfigured() || !sb()) {
    // Behold statisk fallback-tekst i boksene – intet teknisk at vise
    return;
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const [acts, nyhed, cases, settings] = await Promise.all([
      fetchPublished('activities','title,event_date,excerpt',
        { order:'event_date', asc:true, gt:['event_date', today], limit:1 }),
      fetchPublished('news','title,excerpt',
        { order:'published_at', asc:false, limit:1 }),
      fetchPublished('cases','title,excerpt',
        { order:'priority', asc:true, eq:{ on_frontpage:true }, limit:1 }),
      getAllSettings(),
    ]);

    if (acts[0]) {
      const h = $('tb-ak-h'); const p = $('tb-ak-p');
      if (h) h.textContent = acts[0].title;
      if (p) p.textContent = (acts[0].excerpt||'') +
        (acts[0].event_date ? ' – ' + fmtDate(acts[0].event_date) : '');
    }
    if (nyhed[0]) {
      const h = $('tb-ny-h'); const p = $('tb-ny-p');
      if (h) h.textContent = nyhed[0].title;
      if (p) p.textContent = nyhed[0].excerpt || '';
    }
    if (cases[0]) {
      const h = $('tb-sag-h'); const p = $('tb-sag-p');
      if (h) h.textContent = cases[0].title;
      if (p) p.textContent = cases[0].excerpt || '';
    }

    // Kontingent + CVR fra indstillinger
    applySettings(settings);

  } catch(e) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
      console.error('[app] forside:', e);
  }
}

function applySettings(s) {
  if (!s) return;
  const kn = $('k-navn');  if (kn && s.contact_name)  kn.textContent  = s.contact_name;
  const km = $('k-email'); if (km && s.contact_email) {
    km.textContent = s.contact_email;
    km.href = 'mailto:' + s.contact_email;
  }
  const kt = $('k-tlf');   if (kt && s.contact_phone) {
    kt.textContent = s.contact_phone;
    kt.href = 'tel:' + s.contact_phone.replace(/\s/g,'');
  }
  const kf = $('k-fb');    if (kf && s.facebook_url)  kf.href = s.facebook_url;
  const fc = $('f-cvr');   if (fc && s.cvr)            fc.textContent = s.cvr;
  const mp = $('mb-price'); if (mp && s.membership_single) mp.textContent = s.membership_single;
  const mn = $('mb-note');
  if (mn && s.membership_single && s.membership_family)
    mn.textContent = (s.membership_note || 'per år') +
      ' · familiemedlemskab ' + s.membership_family;
}

/* ════════════════════════════════════════════════
   AKTIVITETER
════════════════════════════════════════════════ */
async function loadAktiviteter() {
  const c = $('ak-list');
  if (!c) return;
  c.innerHTML = '<p class="text-muted">Henter aktiviteter…</p>';
  if (!klarTilData('ak-list')) return;
  const data = await fetchPublished('activities',
    'title,event_date,time_start,location,excerpt',
    { order:'event_date', asc:true });
  if (!data.length) {
    c.innerHTML = '<p class="text-muted">Ingen planlagte aktiviteter endnu.</p>';
    return;
  }
  c.innerHTML = data.map(a => `
    <article class="ak-item">
      <div class="ak-date">${escH(fmtMonth(a.event_date))}</div>
      <div class="ak-body">
        <h3>${escH(a.title)}</h3>
        <p>${escH(a.excerpt||'')}${a.location
          ? ' · <em>' + escH(a.location) + '</em>' : ''}</p>
      </div>
    </article>`).join('');
}

/* ════════════════════════════════════════════════
   AKTUELLE SAGER
   Vindmølle-billedet bruges på "Vindmøller ved Vosnæs"
════════════════════════════════════════════════ */
let _sagerData = [];

// Lokale billedstier til specifikke sager (matchet på titel-nøgleord)
const SAGER_BILLEDER = [
  { noegle: 'vindmøller',  src: 'assets/vindmoeller.jpg',
    alt: 'Gyldne marker med halmballer og vindmøller i landskabet på Djursland.' },
  { noegle: 'vosnæs',      src: 'assets/vindmoeller.jpg',
    alt: 'Gyldne marker med halmballer og vindmøller i landskabet på Djursland.' },
  { noegle: 'landskab',    src: 'assets/vindmoeller.jpg',
    alt: 'Gyldne marker med halmballer og vindmøller i landskabet på Djursland.' },
  { noegle: 'planlægning', src: 'assets/vindmoeller.jpg',
    alt: 'Gyldne marker med halmballer og vindmøller i landskabet på Djursland.' },
];

function getSagBillede(titel) {
  if (!titel) return null;
  const t = titel.toLowerCase();
  return SAGER_BILLEDER.find(b => t.includes(b.noegle)) || null;
}

async function loadSager() {
  const g = $('sag-grid');
  if (!g) return;
  g.innerHTML = '<p class="text-muted">Henter sager…</p>';
  if (!klarTilData('sag-grid')) return;

  _sagerData = await fetchPublished('cases',
    'id,title,excerpt,body,image_url',
    { order:'priority', asc:true });

  if (!_sagerData.length) {
    g.innerHTML = '<p class="text-muted">Ingen aktuelle sager.</p>';
    return;
  }

  g.innerHTML = _sagerData.map((s, i) => {
    // Brug lokal billedoverride hvis relevant, ellers image_url fra database
    const override = getSagBillede(s.title);
    const imgSrc   = override ? override.src  : (s.image_url || '');
    const imgAlt   = override ? override.alt  : escH(s.title);

    return `
    <article class="sag-kort">
      ${imgSrc
        ? `<img class="sag-kort-img" src="${escH(imgSrc)}" alt="${imgAlt}" loading="lazy">`
        : `<div class="sag-kort-img sag-kort-placeholder">🌊</div>`}
      <div class="sag-kort-body">
        <h3>${escH(s.title)}</h3>
        <p>${escH(s.excerpt||'')}</p>
        <button class="btn btn-navy btn-sm" data-sag-idx="${i}">Læs mere</button>
      </div>
    </article>`;
  }).join('');

  g.querySelectorAll('[data-sag-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = _sagerData[parseInt(btn.dataset.sagIdx)];
      const h = $('sag-modal-h2');
      const b = $('sag-modal-body');
      if (h) h.textContent = s.title;
      if (b) b.innerHTML   = `<p>${escH(s.body || s.excerpt || '')}</p>`;
      openModal('modal-sag');
    });
  });
}

/* ════════════════════════════════════════════════
   BESTYRELSE
════════════════════════════════════════════════ */
async function loadBestyrelse() {
  const g = $('bst-grid');
  if (!g) return;
  g.innerHTML = '<p class="text-muted">Henter bestyrelsesoplysninger…</p>';
  if (!klarTilData('bst-grid')) return;

  let data = [];
  try {
    const res = await sb().from('board_members')
      .select('name,role_title,email,photo_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (res.error) throw res.error;
    data = res.data ?? [];
  } catch(e) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
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
      <div class="bst-role">${escH(m.role_title||'')}</div>
      ${m.email ? `<a href="mailto:${escH(m.email)}">${escH(m.email)}</a>` : ''}
    </article>`).join('');
}

/* ════════════════════════════════════════════════
   DOKUMENTER
════════════════════════════════════════════════ */
async function loadDokumenter() {
  const c = $('dok-areas');
  if (!c) return;
  c.innerHTML = '<p class="text-muted">Henter dokumenter…</p>';
  if (!klarTilData('dok-areas')) return;

  let data = [];
  try {
    const res = await sb().from('documents')
      .select('title,category,file_url,file_type,doc_year,description')
      .order('doc_year', { ascending: false });
    if (res.error) throw res.error;
    data = res.data ?? [];
  } catch(e) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
      console.error('[app] dokumenter:', e);
    c.innerHTML = '<p class="text-muted">Dokumenter er midlertidigt utilgængelige.</p>';
    return;
  }

  if (!data.length) {
    c.innerHTML = '<p class="text-muted">Ingen dokumenter er uploadet endnu.</p>';
    return;
  }

  const cats = ['Vedtægter','Indkaldelser','Dagsordener','Referater',
                'Regnskaber','Årsberetninger','Høringssvar',
                'Pressemeddelelser','Bilag','Andre'];
  let html = '';
  cats.forEach(cat => {
    const liste = data.filter(d => d.category === cat);
    if (!liste.length) return;
    html += `<div class="dok-section">
      <div class="dok-cat-title">${cat}</div>
      <div class="dok-list">`;
    html += liste.map(d => {
      const hasUrl = d.file_url && d.file_url.length > 4;
      return `<a ${hasUrl
          ? `href="${escH(d.file_url)}" target="_blank" rel="noopener"`
          : 'href="#" onclick="return false"'}
         class="dok-row">
        <span class="icon">📄</span>
        <div class="info">
          <strong>${escH(d.title)}</strong>
          <span>${escH(d.description||'')}${d.doc_year ? ' · '+d.doc_year : ''}</span>
        </div>
        <span class="dl">${hasUrl ? '⬇' : '📎'}</span>
      </a>`;
    }).join('');
    html += '</div></div>';
  });
  c.innerHTML = html || '<p class="text-muted">Ingen dokumenter er uploadet endnu.</p>';
}

/* ════════════════════════════════════════════════
   KONTAKT OG INDSTILLINGER
════════════════════════════════════════════════ */
async function loadKontakt() {
  if (!isConfigured() || !sb()) return; // statisk fallback i HTML er tilstrækkelig
  try {
    const s = await getAllSettings();
    applySettings(s);
  } catch(e) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
      console.error('[app] kontakt:', e);
  }
}

async function loadMedlemInfo() {
  if (!isConfigured() || !sb()) return;
  try {
    const s = await getAllSettings();
    applySettings(s);
  } catch(e) {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
      console.error('[app] medlem:', e);
  }
}

/* ════════════════════════════════════════════════
   TILMELDING
════════════════════════════════════════════════ */
function initTilmelding() {
  $('btn-tilmeld')?.addEventListener('click', () => {
    const navn   = $('m-navn')?.value.trim()       || '';
    const email  = $('m-email')?.value.trim()      || '';
    const tlf    = $('m-tlf')?.value.trim()        || '';
    const komm   = $('m-kommentar')?.value.trim()  || '';
    const alert  = $('m-alert');
    if (alert) alert.className = 'alert';

    if (!navn)  { showAlert('m-alert','⚠ Udfyld dit navn.',false);   return; }
    if (!email || !/\S+@\S+\.\S+/.test(email))
                { showAlert('m-alert','⚠ Ugyldig e-mail.',false);     return; }

    const kontaktMail = $('k-email')?.textContent || SITE.email;
    const emne  = 'Ny medlemstilmelding – ' + navn;
    const tekst = `Hej Kystforeningen Djursland,\n\nJeg ønsker at melde mig ind.\n\nNavn: ${navn}\nE-mail: ${email}${tlf?'\nTelefon: '+tlf:''}${komm?'\nKommentar: '+komm:''}\n\nMed venlig hilsen\n${navn}`;
    visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.',
      tekst, emne, tekst, kontaktMail);
    ['m-navn','m-email','m-tlf','m-kommentar'].forEach(id => {
      const e = $(id); if (e) e.value = '';
    });
  });
}

/* ════════════════════════════════════════════════
   KONTAKTFORMULAR
════════════════════════════════════════════════ */
function initKontaktFormular() {
  $('btn-kontakt')?.addEventListener('click', () => {
    const navn   = $('k-navn-form')?.value.trim()  || '';
    const email  = $('k-email-form')?.value.trim() || '';
    const besked = $('k-besked')?.value.trim()     || '';
    const alert  = $('k-alert');
    if (alert) alert.className = 'alert';

    if (!navn)   { showAlert('k-alert','⚠ Udfyld dit navn.',false);  return; }
    if (!email || !/\S+@\S+\.\S+/.test(email))
                 { showAlert('k-alert','⚠ Ugyldig e-mail.',false);    return; }
    if (!besked) { showAlert('k-alert','⚠ Skriv en besked.',false);   return; }

    const kontaktMail = $('k-email')?.textContent || SITE.email;
    const emne  = 'Besked fra ' + navn + ' – Kystforeningen Djursland';
    const tekst = `Fra: ${navn}\nE-mail: ${email}\n\n${besked}`;
    visBesked('Klik "Åbn e-mailprogram" eller kopiér og send manuelt.',
      tekst, emne, tekst, kontaktMail);
    ['k-navn-form','k-email-form','k-besked'].forEach(id => {
      const e = $(id); if (e) e.value = '';
    });
  });
}

/* ════════════════════════════════════════════════
   REALTIME
════════════════════════════════════════════════ */
function setupRealtime() {
  if (!isConfigured() || !sb()) return;
  ['activities','news','cases','board_members','documents'].forEach(table => {
    subscribeTable(table, () => {
      if (PAGE_LOADERS[_currentPage]) PAGE_LOADERS[_currentPage]();
      loadForsideData();
    });
  });
}

/* ════════════════════════════════════════════════
   PWA SERVICE WORKER
════════════════════════════════════════════════ */
let _swReg = null;

function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js').then(reg => {
    _swReg = reg;

    // Ny SW installeres – vis opdateringsbanner
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          $('update-banner')?.classList.add('visible');
        }
      });
    });

    // SW venter allerede (f.eks. genåbnet fane med ny version)
    if (reg.waiting && navigator.serviceWorker.controller) {
      $('update-banner')?.classList.add('visible');
    }

  }).catch(e => {
    if (typeof DEBUG_MODE !== 'undefined' && DEBUG_MODE)
      console.warn('[SW] Registrering fejlede:', e);
  });

  // SW overtager – genindlæs siden
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// "Opdater nu"-knap
function initUpdateBanner() {
  $('update-now')?.addEventListener('click', () => {
    if (_swReg?.waiting) {
      _swReg.waiting.postMessage('SKIP_WAITING');
    } else {
      window.location.reload(true);
    }
  });
}

/* ════════════════════════════════════════════════
   INIT – ét centralt sted, køres ved DOMContentLoaded
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation ──────────────────────────────
  // Alle nav-knapper (inkl. dem der er tilføjet via innerHTML)
  // bruger event delegation på document – virker altid
  document.addEventListener('click', e => {
    // Nav-knapper og interne links
    const btn = e.target.closest('[data-goto],[data-page]');
    if (btn) {
      const target = btn.dataset.goto || btn.dataset.page;
      if (PAGES.includes(target)) {
        e.preventDefault();
        showPage(target);
        return;
      }
    }
    // Logo → forside
    if (e.target.closest('#nav-logo')) {
      e.preventDefault();
      showPage('forside');
    }
  });

  // Hamburger-menu
  $('hamburger')?.addEventListener('click', function() {
    const links = $('nav-links');
    const isOpen = links?.classList.toggle('open');
    this.setAttribute('aria-expanded', String(!!isOpen));
  });

  // Luk menu ved klik udenfor på mobil
  document.addEventListener('click', e => {
    const nav     = $('nav');
    const navLinks= $('nav-links');
    if (nav && navLinks && !nav.contains(e.target)) {
      navLinks.classList.remove('open');
      $('hamburger')?.setAttribute('aria-expanded','false');
    }
  });

  // Browser tilbage/frem
  window.addEventListener('popstate', e => {
    const id = e.state?.page || 'forside';
    showPage(id, false);
  });

  // Hero scroll-knap
  $('hero-scroll')?.addEventListener('click', () => {
    $('intro')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Footer-links
  $('fp-priv')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-priv'); });
  $('fp-cook')?.addEventListener('click', e => { e.preventDefault(); openModal('modal-cook'); });

  // ── Initialiser alle komponenter ────────────
  initNavScroll();
  initModaler();
  initBeskedDialog();
  initCookieBanner();
  initTilmelding();
  initKontaktFormular();
  initServiceWorker();
  initUpdateBanner();

  // ── Start-side baseret på URL-hash ──────────
  const hash      = window.location.hash.replace('#','');
  const startPage = PAGES.includes(hash) ? hash : 'forside';
  history.replaceState(
    { page: startPage }, '',
    window.location.pathname + (startPage !== 'forside' ? '#'+startPage : '')
  );
  showPage(startPage, false);

  // ── Realtime og version-tjek ────────────────
  setupRealtime();

  if (isConfigured()) {
    checkAppVersion(APP_VERSION, () => {
      $('update-banner')?.classList.add('visible');
    });
    setInterval(() => checkAppVersion(APP_VERSION, () => {
      $('update-banner')?.classList.add('visible');
    }), 5 * 60 * 1000);
  }

  // ── sag-kortets placeholder CSS-klasse ──────
  // Tilføj CSS inline hvis ikke allerede i stylesheet
  if (!document.querySelector('style[data-cmsutil]')) {
    const st = document.createElement('style');
    st.setAttribute('data-cmsutil','');
    st.textContent = `.sag-kort-placeholder{display:flex;align-items:center;justify-content:center;color:var(--c-muted);font-size:2rem;}`;
    document.head.appendChild(st);
  }

});
