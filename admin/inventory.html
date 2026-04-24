// ============================================================
//  ADMIN SHARED UTILITIES
// ============================================================

// Auth guard — call on every admin page
function adminGuard() {
  const ok   = sessionStorage.getItem('hka_admin') === 'true';
  const time = parseInt(sessionStorage.getItem('hka_admin_time') || '0');
  const aged = Date.now() - time > 8 * 60 * 60 * 1000;
  if (!ok || aged) { sessionStorage.clear(); window.location.href = 'login.html'; return false; }
  return true;
}

function adminLogout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Toast
function toast(msg, type) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast show' + (type ? ' t' + type : '');
  t.innerHTML = (type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : '') + msg;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// Parse JSON safely
function pj(v, fb) { try { return typeof v === 'string' ? JSON.parse(v) : (v || fb); } catch { return fb; } }

// Format currency
function fmt(ngn) { return '₦' + (ngn || 0).toLocaleString(); }
function fmtUSD(ngn) { return '$' + ((ngn || 0) / 1600).toFixed(2); }

// Format date
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Slug initials for avatar
function initials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Random pastel color from name
const AVATAR_COLORS = ['#dbeafe', '#ede9fe', '#fce7f3', '#dcfce7', '#fef3c7', '#ffedd5'];
function avatarColor(str) { let h = 0; for (let c of (str||'')) h += c.charCodeAt(0); return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
function avatarTextColor(bg) { return bg === '#fef3c7' || bg === '#ffedd5' ? '#92400e' : bg === '#dcfce7' ? '#14532d' : '#3b0764'; }

// Slide panel open/close
function openPanel() {
  document.getElementById('slide-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('show');
}
function closePanel() {
  document.getElementById('slide-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('show');
}

// Upload image to Supabase Storage — uses service key to bypass RLS
async function adminUploadImage(file, bucket, folder) {
  const ext  = file.name.split('.').pop();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const sb   = getAdminSB();
  const { error } = await sb.storage.from(bucket).upload(name, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}

// Bind drag-over effect to upload zones
function bindUploadZone(zoneId, inputId, onFile) {
  const zone  = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) { input.files = e.dataTransfer.files; onFile(e.dataTransfer.files[0]); }
  });
  input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); });
}

function showPreview(file, imgId, wrapId) {
  const r = new FileReader();
  r.onload = e => {
    document.getElementById(imgId).src = e.target.result;
    document.getElementById(wrapId).style.display = 'block';
  };
  r.readAsDataURL(file);
}
