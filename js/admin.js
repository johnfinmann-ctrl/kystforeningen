/**
 * NORDIC OPERATIONS CMS v2 – admin.js
 * Alle 9 admin-moduler: Dashboard, Nyheder, Aktiviteter,
 * Aktuelle sager, Bestyrelse, Dokumenter, Billeder, Kontakt
 */

'use strict';

/* ══════════════════════════════════════════════
   HJÆLPEFUNKTIONER
══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const val = id => $(`${id}`)?.value?.trim() ?? '';
const set = (id, v) => { const e=$(id); if(e) e.value = v ?? ''; };
const chk = id => $(`${id}`)?.checked ?? false;
const setChk = (id, v) => { const e=$(id); if(e) e.checked=!!v; };

function escH(t) {
  return String(t ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtDate(s) {
  if (!s) return '–';
  return new Date(s).toLocaleDateString('da-DK', { day:'numeric', month:'short', year:'numeric' });
}
function badge(status) {
  const map = { published:'badge-pub', draft:'badge-dft', archived:'badge-arc' };
  const lbl = { published:'Publiceret', draft:'Kladde', archived:'Arkiveret' };
  return `<span class="badge ${map[status]||'badge-dft'}">${lbl[status]||status}</span>`;
}
function showAlert(id, msg, ok) {
  const el=$(id); if(!el) return;
  el.textContent = msg;
  el.className   = 'alert show ' + (ok?'ok':'err');
  if (ok) setTimeout(() => el.className='alert', 4500);
}
function openModal(id)  { $(id)?.classList.add('open'); }
function closeModal(id) { $(id)?.classList.remove('open'); }

/* ══════════════════════════════════════════════
   MODAL-BINDING
══════════════════════════════════════════════ */
$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
$$('.modal-ov').forEach(ov => {
  ov.addEventListener('click', e => { if(e.target===ov) ov.classList.remove('open'); });
});

/* ══════════════════════════════════════════════
   SLET-BEKRÆFTELSE
══════════════════════════════════════════════ */
let _delCb = null;
function confirmDelete(name, cb) {
  $('del-name').textContent = `"${name}"`;
  _delCb = cb;
  openModal('m-del');
}
$('btn-confirm-del')?.addEventListener('click', async () => {
  if (_delCb) { await _delCb(); _delCb = null; }
  closeModal('m-del');
});

/* ══════════════════════════════════════════════
   NAVIGATION – MODULER
══════════════════════════════════════════════ */
const MOD_TITLES = {
  dashboard:'Dashboard', nyheder:'Nyheder', aktiviteter:'Aktiviteter',
  sager:'Aktuelle sager', bestyrelse:'Bestyrelse', dokumenter:'Dokumenter',
  billeder:'Billeder', kontakt:'Kontakt & Kontingent',
};
const MOD_LOADERS = {
  dashboard:   loadDashboard,
  nyheder:     loadNews,
  aktiviteter: loadActivities,
  sager:       loadCases,
  bestyrelse:  loadBoard,
  dokumenter:  loadDocs,
  billeder:    loadImages,
  kontakt:     loadSettings,
};

function showModule(id) {
  $$('.module').forEach(m => m.classList.remove('active'));
  $$('.sb-btn[data-mod]').forEach(b => b.classList.toggle('active', b.dataset.mod===id));
  $(`mod-${id}`)?.classList.add('active');
  if ($('topbar-title')) $('topbar-title').textContent = MOD_TITLES[id] || id;
  // Mobil: luk sidebar
  $('sidebar')?.classList.remove('open');
  $('sb-overlay')?.classList.remove('show');
  // Indlæs data
  MOD_LOADERS[id]?.();
}

$$('.sb-btn[data-mod]').forEach(btn => {
  btn.addEventListener('click', () => showModule(btn.dataset.mod));
});
$$('[data-shortcut]').forEach(btn => {
  btn.addEventListener('click', () => {
    const m = btn.dataset.shortcut;
    showModule(m);
    setTimeout(() => {
      if (m==='nyheder')     openNewsForm();
      if (m==='aktiviteter') openActForm();
      if (m==='sager')       openCaseForm();
      if (m==='dokumenter')  openDocForm();
    }, 150);
  });
});

// Sidebar mobil
$('sb-toggle')?.addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
  $('sb-overlay').classList.toggle('show');
});
$('sb-overlay')?.addEventListener('click', () => {
  $('sidebar').classList.remove('open');
  $('sb-overlay').classList.remove('show');
});

/* ══════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════ */
async function initAuth() {
  const client = sb();
  if (!client) {
    showAlert('l-alert','⚠ Supabase ikke konfigureret – udfyld js/config.js',false);
    $('l-alert').style.display='block';
    return;
  }
  const { data:{ session } } = await client.auth.getSession();
  session ? showApp(session.user) : showLoginScreen();

  client.auth.onAuthStateChange((_,session) => {
    session ? showApp(session.user) : showLoginScreen();
  });
}

function showApp(user) {
  $('login-screen').style.display = 'none';
  $('adm-app').style.display      = 'flex';
  const email = user.email||'';
  if ($('sb-user'))  $('sb-user').textContent  = email;
  if ($('tb-user'))  $('tb-user').textContent  = email;
  loadDashboard();
}
function showLoginScreen() {
  $('login-screen').style.display = 'flex';
  $('adm-app').style.display      = 'none';
}

$('btn-login')?.addEventListener('click', async () => {
  const email=val('l-email'), pw=val('l-pw');
  if (!email||!pw) { showAlert('l-alert','⚠ Udfyld e-mail og adgangskode.',false); $('l-alert').style.display='block'; return; }
  const btn=$('btn-login');
  btn.innerHTML='<span class="spinner"></span> Logger ind...'; btn.disabled=true;
  const { error } = await sb().auth.signInWithPassword({ email, password:pw });
  btn.innerHTML='Log ind'; btn.disabled=false;
  if (error) { showAlert('l-alert','⚠ Forkert e-mail eller adgangskode.',false); $('l-alert').style.display='block'; }
});
$('l-pw')?.addEventListener('keydown', e => { if(e.key==='Enter') $('btn-login')?.click(); });

$('btn-reset')?.addEventListener('click', async () => {
  const email=val('l-email');
  if (!email) { showAlert('l-alert','⚠ Skriv din e-mail øverst.',false); $('l-alert').style.display='block'; return; }
  const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo: window.location.origin+'/admin.html' });
  showAlert('l-alert', error ? '⚠ '+error.message : '✓ Nulstillingsmail sendt til '+email, !error);
  $('l-alert').style.display='block';
});

$('btn-logout')?.addEventListener('click', () => sb()?.auth.signOut());

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
async function loadDashboard() {
  const client = sb(); if(!client) return;
  const tables = [['news','s-news'],['activities','s-act'],['cases','s-cas'],['board_members','s-brd'],['documents','s-doc'],['media','s-med']];
  await Promise.all(tables.map(async ([tbl,elId]) => {
    const { count } = await client.from(tbl).select('*',{count:'exact',head:true});
    const e=$(elId); if(e) e.textContent = count??'–';
  }));
}

/* ══════════════════════════════════════════════
   NYHEDER
══════════════════════════════════════════════ */
let _newsData = [];

async function loadNews() {
  const tbody=$('tbody-news');
  tbody.innerHTML='<tr><td colspan="4" class="empty-row">Indlæser...</td></tr>';
  _newsData = await fetchAll('news','id,title,published_at,status',{order:'published_at',asc:false});
  if(!_newsData.length){tbody.innerHTML='<tr><td colspan="4" class="empty-row">Ingen nyheder endnu.</td></tr>';return;}
  tbody.innerHTML = _newsData.map((n,i)=>`
    <tr>
      <td><strong>${escH(n.title)}</strong></td>
      <td>${fmtDate(n.published_at)}</td>
      <td>${badge(n.status)}</td>
      <td>
        <button class="btn btn-ghost btn-xs" data-edit-news="${i}">Rediger</button>
        <button class="btn btn-danger btn-xs" data-del-news="${n.id}" data-del-name="${escH(n.title)}">Slet</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-edit-news]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const {data}=await sb().from('news').select('*').eq('id',_newsData[parseInt(btn.dataset.editNews)].id).single();
      openNewsForm(data);
    });
  });
  tbody.querySelectorAll('[data-del-news]').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('news').delete().eq('id',btn.dataset.delNews);
      loadNews();
    }));
  });
}

function openNewsForm(n=null) {
  set('n-id',n?.id); set('n-title',n?.title); set('n-excerpt',n?.excerpt); set('n-body',n?.body);
  set('n-date',n?.published_at?n.published_at.split('T')[0]:new Date().toISOString().split('T')[0]);
  set('n-status',n?.status||'draft'); set('n-img',n?.image_url);
  $('m-news-title').textContent = n?'Rediger nyhed':'Opret nyhed';
  $('news-alert').className='alert';
  openModal('m-news');
}
$('btn-new-news')?.addEventListener('click',()=>openNewsForm());
$('btn-save-news')?.addEventListener('click',async()=>{
  const title=val('n-title'); if(!title){showAlert('news-alert','⚠ Titel mangler.',false);return;}
  const id=val('n-id');
  const payload={title,excerpt:val('n-excerpt'),body:val('n-body'),image_url:val('n-img'),
    status:val('n-status'),published_at:$('n-date').value||null};
  const {error}=id?await sb().from('news').update(payload).eq('id',id)
                   :await sb().from('news').insert(payload);
  if(error){showAlert('news-alert','⚠ '+error.message,false);return;}
  showAlert('news-alert','✓ Nyhed gemt!',true);
  setTimeout(()=>{closeModal('m-news');loadNews();},1200);
});

/* ══════════════════════════════════════════════
   AKTIVITETER
══════════════════════════════════════════════ */
let _actData = [];

async function loadActivities() {
  const tbody=$('tbody-act');
  tbody.innerHTML='<tr><td colspan="5" class="empty-row">Indlæser...</td></tr>';
  _actData=await fetchAll('activities','id,title,event_date,location,status',{order:'event_date',asc:true});
  if(!_actData.length){tbody.innerHTML='<tr><td colspan="5" class="empty-row">Ingen aktiviteter endnu.</td></tr>';return;}
  tbody.innerHTML=_actData.map((a,i)=>`
    <tr>
      <td><strong>${escH(a.title)}</strong></td>
      <td>${fmtDate(a.event_date)}</td>
      <td>${escH(a.location||'–')}</td>
      <td>${badge(a.status)}</td>
      <td>
        <button class="btn btn-ghost btn-xs" data-edit-act="${i}">Rediger</button>
        <button class="btn btn-danger btn-xs" data-del-act="${a.id}" data-del-name="${escH(a.title)}">Slet</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-edit-act]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const {data}=await sb().from('activities').select('*').eq('id',_actData[parseInt(btn.dataset.editAct)].id).single();
      openActForm(data);
    });
  });
  tbody.querySelectorAll('[data-del-act]').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('activities').delete().eq('id',btn.dataset.delAct);
      loadActivities();
    }));
  });
}

function openActForm(a=null) {
  set('a-id',a?.id); set('a-title',a?.title); set('a-date',a?.event_date);
  set('a-tstart',a?.time_start); set('a-tend',a?.time_end); set('a-loc',a?.location);
  set('a-exc',a?.excerpt); set('a-body',a?.body); set('a-signup',a?.signup_url);
  set('a-status',a?.status||'draft');
  $('m-act-title').textContent=a?'Rediger aktivitet':'Opret aktivitet';
  $('act-alert').className='alert';
  openModal('m-act');
}
$('btn-new-act')?.addEventListener('click',()=>openActForm());
$('btn-save-act')?.addEventListener('click',async()=>{
  const title=val('a-title'); if(!title){showAlert('act-alert','⚠ Titel mangler.',false);return;}
  const id=val('a-id');
  const payload={title,event_date:$('a-date').value||null,time_start:$('a-tstart').value||null,
    time_end:$('a-tend').value||null,location:val('a-loc'),excerpt:val('a-exc'),body:val('a-body'),
    signup_url:val('a-signup'),status:val('a-status')};
  const {error}=id?await sb().from('activities').update(payload).eq('id',id)
                   :await sb().from('activities').insert(payload);
  if(error){showAlert('act-alert','⚠ '+error.message,false);return;}
  showAlert('act-alert','✓ Aktivitet gemt!',true);
  setTimeout(()=>{closeModal('m-act');loadActivities();},1200);
});

/* ══════════════════════════════════════════════
   AKTUELLE SAGER
══════════════════════════════════════════════ */
let _caseData=[];

async function loadCases() {
  const tbody=$('tbody-cases');
  tbody.innerHTML='<tr><td colspan="5" class="empty-row">Indlæser...</td></tr>';
  _caseData=await fetchAll('cases','id,title,priority,on_frontpage,status',{order:'priority',asc:true});
  if(!_caseData.length){tbody.innerHTML='<tr><td colspan="5" class="empty-row">Ingen sager endnu.</td></tr>';return;}
  tbody.innerHTML=_caseData.map((c,i)=>`
    <tr>
      <td><strong>${escH(c.title)}</strong></td>
      <td>${c.priority}</td>
      <td>${c.on_frontpage?'<span class="badge badge-act">Ja</span>':'–'}</td>
      <td>${badge(c.status)}</td>
      <td>
        <button class="btn btn-ghost btn-xs" data-edit-case="${i}">Rediger</button>
        <button class="btn btn-danger btn-xs" data-del-case="${c.id}" data-del-name="${escH(c.title)}">Slet</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-edit-case]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const {data}=await sb().from('cases').select('*').eq('id',_caseData[parseInt(btn.dataset.editCase)].id).single();
      openCaseForm(data);
    });
  });
  tbody.querySelectorAll('[data-del-case]').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('cases').delete().eq('id',btn.dataset.delCase);
      loadCases();
    }));
  });
}

function openCaseForm(c=null) {
  set('c-id',c?.id); set('c-title',c?.title); set('c-exc',c?.excerpt);
  set('c-body',c?.body); set('c-img',c?.image_url); set('c-prio',c?.priority??1);
  set('c-status',c?.status||'draft'); setChk('c-front',c?.on_frontpage);
  $('m-case-title').textContent=c?'Rediger sag':'Opret sag';
  $('case-alert').className='alert';
  openModal('m-case');
}
$('btn-new-case')?.addEventListener('click',()=>openCaseForm());
$('btn-save-case')?.addEventListener('click',async()=>{
  const title=val('c-title'); if(!title){showAlert('case-alert','⚠ Titel mangler.',false);return;}
  const id=val('c-id');
  const payload={title,excerpt:val('c-exc'),body:val('c-body'),image_url:val('c-img'),
    priority:parseInt($('c-prio').value)||1,status:val('c-status'),on_frontpage:chk('c-front')};
  const {error}=id?await sb().from('cases').update(payload).eq('id',id)
                   :await sb().from('cases').insert(payload);
  if(error){showAlert('case-alert','⚠ '+error.message,false);return;}
  showAlert('case-alert','✓ Sag gemt!',true);
  setTimeout(()=>{closeModal('m-case');loadCases();},1200);
});

/* ══════════════════════════════════════════════
   BESTYRELSE
══════════════════════════════════════════════ */
let _boardData=[];
let _photoFile=null;

async function loadBoard() {
  const tbody=$('tbody-brd');
  tbody.innerHTML='<tr><td colspan="5" class="empty-row">Indlæser...</td></tr>';
  _boardData=await fetchAll('board_members','id,name,role_title,email,is_active,sort_order',{order:'sort_order',asc:true});
  if(!_boardData.length){tbody.innerHTML='<tr><td colspan="5" class="empty-row">Ingen bestyrelsesmedlemmer endnu.</td></tr>';return;}
  tbody.innerHTML=_boardData.map((m,i)=>`
    <tr>
      <td><strong>${escH(m.name)}</strong></td>
      <td>${escH(m.role_title||'–')}</td>
      <td>${escH(m.email||'–')}</td>
      <td>${m.is_active?'<span class="badge badge-act">Aktiv</span>':'<span class="badge badge-arc">Inaktiv</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-xs" data-edit-brd="${i}">Rediger</button>
        <button class="btn btn-danger btn-xs" data-del-brd="${m.id}" data-del-name="${escH(m.name)}">Slet</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-edit-brd]').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const {data}=await sb().from('board_members').select('*').eq('id',_boardData[parseInt(btn.dataset.editBrd)].id).single();
      openBoardForm(data);
    });
  });
  tbody.querySelectorAll('[data-del-brd]').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('board_members').delete().eq('id',btn.dataset.delBrd);
      loadBoard();
    }));
  });
}

function openBoardForm(m=null) {
  _photoFile=null;
  set('b-id',m?.id); set('b-name',m?.name); set('b-role',m?.role_title);
  set('b-email',m?.email); set('b-phone',m?.phone); set('b-sort',m?.sort_order??1);
  set('b-photo-url',m?.photo_url); setChk('b-active',m?.is_active??true);
  $('b-photo-prev').innerHTML=m?.photo_url
    ?`<img src="${escH(m.photo_url)}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">`:'';
  $('m-brd-title').textContent=m?'Rediger bestyrelsesmedlem':'Tilføj bestyrelsesmedlem';
  $('brd-alert').className='alert';
  openModal('m-brd');
}

$('b-photo-zone')?.addEventListener('click',()=>$('b-photo-inp')?.click());
$('b-photo-inp')?.addEventListener('change',function(){
  _photoFile=this.files[0]; if(!_photoFile)return;
  const reader=new FileReader();
  reader.onload=e=>{$('b-photo-prev').innerHTML=`<img src="${e.target.result}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">`};
  reader.readAsDataURL(_photoFile);
});

$('btn-new-brd')?.addEventListener('click',()=>openBoardForm());
$('btn-save-brd')?.addEventListener('click',async()=>{
  const name=val('b-name'); if(!name){showAlert('brd-alert','⚠ Navn mangler.',false);return;}
  const btn=$('btn-save-brd');
  btn.innerHTML='<span class="spinner"></span> Gemmer...'; btn.disabled=true;

  let photoUrl=val('b-photo-url');
  if(_photoFile){
    const ext=_photoFile.name.split('.').pop();
    const fn=`bst-${Date.now()}.${ext}`;
    const url=await uploadFile('images',fn,_photoFile);
    if(url) photoUrl=url;
  }

  const id=val('b-id');
  const payload={name,role_title:val('b-role'),email:val('b-email'),phone:val('b-phone'),
    sort_order:parseInt($('b-sort').value)||1,is_active:chk('b-active'),photo_url:photoUrl};
  const {error}=id?await sb().from('board_members').update(payload).eq('id',id)
                   :await sb().from('board_members').insert(payload);
  btn.innerHTML='💾 Gem'; btn.disabled=false;
  if(error){showAlert('brd-alert','⚠ '+error.message,false);return;}
  showAlert('brd-alert','✓ Gemt!',true);
  setTimeout(()=>{closeModal('m-brd');loadBoard();},1200);
});

/* ══════════════════════════════════════════════
   DOKUMENTER
══════════════════════════════════════════════ */
let _docData=[];
let _docFile=null;

async function loadDocs() {
  const tbody=$('tbody-docs');
  tbody.innerHTML='<tr><td colspan="5" class="empty-row">Indlæser...</td></tr>';
  _docData=await fetchAll('documents','id,title,category,doc_year,file_type',{order:'doc_year',asc:false});
  if(!_docData.length){tbody.innerHTML='<tr><td colspan="5" class="empty-row">Ingen dokumenter endnu.</td></tr>';return;}
  tbody.innerHTML=_docData.map((d,i)=>`
    <tr>
      <td><strong>${escH(d.title)}</strong></td>
      <td>${escH(d.category)}</td>
      <td>${d.doc_year||'–'}</td>
      <td>${escH((d.file_type||'–').toUpperCase())}</td>
      <td>
        <button class="btn btn-danger btn-xs" data-del-doc="${d.id}" data-del-name="${escH(d.title)}">Slet</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('[data-del-doc]').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('documents').delete().eq('id',btn.dataset.delDoc);
      loadDocs();
    }));
  });
}

function openDocForm() {
  _docFile=null;
  ['d-id','d-title','d-desc','d-file-url'].forEach(id=>set(id,''));
  set('d-year',new Date().getFullYear());
  if($('d-fname')) $('d-fname').textContent='';
  $('doc-alert').className='alert';
  openModal('m-doc');
}

$('d-upload-zone')?.addEventListener('click',()=>$('d-file-inp')?.click());
$('d-file-inp')?.addEventListener('change',function(){
  _docFile=this.files[0];
  if($('d-fname')) $('d-fname').textContent=_docFile?'📄 '+_docFile.name:'';
});

$('btn-new-doc')?.addEventListener('click',openDocForm);
$('btn-save-doc')?.addEventListener('click',async()=>{
  const title=val('d-title'); if(!title){showAlert('doc-alert','⚠ Titel mangler.',false);return;}
  const btn=$('btn-save-doc');
  btn.innerHTML='<span class="spinner"></span> Uploader...'; btn.disabled=true;

  let fileUrl='', fileType='', fileSize=0;
  if(_docFile){
    const ext=_docFile.name.split('.').pop().toLowerCase();
    const fn=`dok-${Date.now()}.${ext}`;
    const url=await uploadFile('documents',fn,_docFile);
    if(!url){showAlert('doc-alert','⚠ Upload fejlede.',false);btn.innerHTML='💾 Upload & gem';btn.disabled=false;return;}
    fileUrl=url; fileType=ext; fileSize=_docFile.size;
  }

  const payload={title,category:val('d-cat'),doc_year:parseInt($('d-year').value)||null,
    description:val('d-desc'),file_url:fileUrl,file_type:fileType,file_size:fileSize};
  const {error}=await sb().from('documents').insert(payload);
  btn.innerHTML='💾 Upload & gem'; btn.disabled=false;
  if(error){showAlert('doc-alert','⚠ '+error.message,false);return;}
  showAlert('doc-alert','✓ Dokument gemt!',true);
  setTimeout(()=>{closeModal('m-doc');loadDocs();},1200);
});

/* ══════════════════════════════════════════════
   BILLEDER
══════════════════════════════════════════════ */
let _imgData=[];

async function loadImages() {
  const grid=$('img-grid'); if(!grid) return;
  grid.innerHTML='<p style="color:var(--c-muted);font-size:.83rem;padding:1rem;">Indlæser billeder...</p>';
  _imgData=await fetchAll('media','id,file_name,original_name,url',{order:'created_at',asc:false});
  if(!_imgData.length){grid.innerHTML='<p style="color:var(--c-muted);font-size:.83rem;padding:1rem;">Ingen billeder endnu. Upload med knappen ovenfor.</p>';return;}
  grid.innerHTML=_imgData.map(m=>`
    <div class="img-item">
      <img src="${escH(m.url)}" alt="${escH(m.original_name||m.file_name)}" loading="lazy">
      <div class="img-name" title="${escH(m.original_name||m.file_name)}">${escH(m.original_name||m.file_name)}</div>
      <button class="img-copy" data-url="${escH(m.url)}" title="Kopiér URL">📋</button>
      <button class="img-del" data-del-img="${m.id}" data-del-fname="${escH(m.file_name)}" data-del-name="${escH(m.original_name||m.file_name)}" title="Slet">✕</button>
    </div>`).join('');
  grid.querySelectorAll('.img-copy').forEach(btn=>{
    btn.addEventListener('click',()=>{
      navigator.clipboard?.writeText(btn.dataset.url).then(()=>{btn.textContent='✓';setTimeout(()=>btn.textContent='📋',2000)});
    });
  });
  grid.querySelectorAll('.img-del').forEach(btn=>{
    btn.addEventListener('click',()=>confirmDelete(btn.dataset.delName,async()=>{
      await sb().from('media').delete().eq('id',btn.dataset.delImg);
      // Forsøg slet fra storage
      await sb().storage.from('images').remove([btn.dataset.delFname]);
      loadImages();
    }));
  });
}

// Komprimer billede inden upload
async function komprimerBillede(fil, maxW=1600, q=0.82) {
  return new Promise(resolve=>{
    const img=new Image(); const url=URL.createObjectURL(fil);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,maxW/img.width);
      const c=document.createElement('canvas');
      c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      c.toBlob(b=>resolve(b||fil),'image/jpeg',q);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);resolve(fil);};
    img.src=url;
  });
}

$('img-upload')?.addEventListener('change',async function(){
  const filer=Array.from(this.files); if(!filer.length)return;
  const prog=$('upload-prog'); const progTxt=$('upload-prog-txt');
  prog.style.display='block';
  for(const [i,fil] of filer.entries()){
    progTxt.textContent=`${fil.name} (${i+1}/${filer.length})`;
    try{
      const blob=await komprimerBillede(fil);
      const fn=`img-${Date.now()}-${Math.random().toString(36).slice(2,6)}.jpg`;
      const url=await uploadFile('images',fn,blob,{contentType:'image/jpeg'});
      if(url) await sb().from('media').insert({file_name:fn,original_name:fil.name,url,bucket:'images',file_type:'jpg',file_size:blob.size});
    }catch(e){console.error('[img upload]',e);}
  }
  prog.style.display='none'; this.value='';
  loadImages();
});

/* ══════════════════════════════════════════════
   INDSTILLINGER
══════════════════════════════════════════════ */
async function loadSettings() {
  const client=sb(); if(!client)return;
  const {data}=await client.from('site_settings').select('key,value');
  if(!data) return;
  const s=Object.fromEntries(data.map(r=>[r.key,r.value]));
  const map={'contact_name':'s-kn','contact_email':'s-km','contact_phone':'s-kt',
    'facebook_url':'s-fb','cvr':'s-cvr','membership_single':'s-ms',
    'membership_family':'s-mf','membership_note':'s-mn'};
  Object.entries(map).forEach(([k,id])=>set(id,s[k]||''));
}

$('btn-save-settings')?.addEventListener('click',async()=>{
  const btn=$('btn-save-settings');
  btn.innerHTML='<span class="spinner"></span> Gemmer...'; btn.disabled=true;
  const map={'contact_name':'s-kn','contact_email':'s-km','contact_phone':'s-kt',
    'facebook_url':'s-fb','cvr':'s-cvr','membership_single':'s-ms',
    'membership_family':'s-mf','membership_note':'s-mn'};
  const ops=Object.entries(map).map(([k,id])=>
    sb().from('site_settings').upsert({key:k,value:val(id)},{onConflict:'key'}));
  const res=await Promise.all(ops);
  btn.innerHTML='💾 Gem indstillinger'; btn.disabled=false;
  const err=res.find(r=>r.error);
  if(err){showAlert('settings-alert','⚠ '+err.error.message,false);}
  else   {showAlert('settings-alert','✓ Indstillinger gemt!',true); $('settings-alert').style.display='block';}
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
