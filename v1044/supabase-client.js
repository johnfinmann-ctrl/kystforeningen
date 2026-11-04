/**
 * NORDIC OPERATIONS CMS v2 – supabase-client.js
 * Delt Supabase-klient med realtidsstøtte og version-tjek
 */

'use strict';

// ── Singleton ──────────────────────────────────────────────────
let _sb = null;

function sb() {
  if (_sb) return _sb;
  if (typeof window.supabase === 'undefined') {
    console.error('[CMS] Supabase CDN ikke indlæst.');
    return null;
  }
  if (!SUPABASE_URL || SUPABASE_URL === 'DIN_SUPABASE_URL_HER') {
    console.warn('[CMS] Supabase ikke konfigureret – udfyld js/config.js');
    return null;
  }
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
  return _sb;
}

// ── Er konfigureret? ──────────────────────────────────────────
function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_URL !== 'DIN_SUPABASE_URL_HER');
}

// ── Hent publiceret indhold ───────────────────────────────────
async function fetchPublished(table, cols = '*', opts = {}) {
  const client = sb();
  if (!client) return [];
  try {
    let q = client.from(table).select(cols).eq('status', 'published');
    if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? true });
    if (opts.limit) q = q.limit(opts.limit);
    if (opts.gt)    q = q.gte(opts.gt[0], opts.gt[1]);
    if (opts.eq)    Object.entries(opts.eq).forEach(([k,v]) => { q = q.eq(k,v); });
    const { data, error } = await q;
    if (error) { console.error(`[CMS] ${table}:`, error.message); return []; }
    return data ?? [];
  } catch(e) { console.error(`[CMS] ${table}:`, e); return []; }
}

// ── Hent alt (admin) ─────────────────────────────────────────
async function fetchAll(table, cols = '*', opts = {}) {
  const client = sb();
  if (!client) return [];
  try {
    let q = client.from(table).select(cols);
    if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? true });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) { console.error(`[CMS] ${table}:`, error.message); return []; }
    return data ?? [];
  } catch(e) { console.error(`[CMS] ${table}:`, e); return []; }
}

// ── Hent enkelt indstilling ──────────────────────────────────
async function getSetting(key) {
  const client = sb();
  if (!client) return '';
  const { data } = await client.from('site_settings').select('value').eq('key', key).single();
  return data?.value ?? '';
}

// ── Hent alle indstillinger som objekt ───────────────────────
async function getAllSettings() {
  const client = sb();
  if (!client) return {};
  const { data } = await client.from('site_settings').select('key,value');
  if (!data) return {};
  return Object.fromEntries(data.map(r => [r.key, r.value]));
}

// ── Upload fil til storage ────────────────────────────────────
async function uploadFile(bucket, path, file, opts = {}) {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, { upsert: true, ...opts });
  if (error) { console.error('[CMS] Upload:', error.message); return null; }
  const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

// ── Slet fil fra storage ─────────────────────────────────────
async function deleteFile(bucket, path) {
  const client = sb();
  if (!client) return false;
  const { error } = await client.storage.from(bucket).remove([path]);
  return !error;
}

// ── Realtid: lyt på tabelændringer ───────────────────────────
function subscribeTable(table, callback) {
  const client = sb();
  if (!client) return null;
  return client.channel(`public:${table}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table },
      payload => callback(payload))
    .subscribe();
}

// ── PWA: tjek om ny version er klar ──────────────────────────
async function checkAppVersion(currentVersion, onNewVersion) {
  const client = sb();
  if (!client) return;
  const { data } = await client
    .from('app_versions')
    .select('version')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (data && data.version !== currentVersion) {
    onNewVersion(data.version);
  }
}
