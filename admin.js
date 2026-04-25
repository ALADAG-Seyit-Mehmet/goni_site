// ════════════════════════════════════════
// GONICEON — Admin Panel Logic v4.0
// ════════════════════════════════════════

const adminOverlay = document.getElementById('admin-overlay');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const lpassInput = document.getElementById('lpass');
const lemailInput = document.getElementById('lemail');
const loginBtn = document.getElementById('login-btn');
const loginErr = document.getElementById('login-err');

// ── Router ──
window.addEventListener('hashchange', checkHash);
window.addEventListener('DOMContentLoaded', () => { checkHash(); loadAnnouncement(); });

function checkHash() {
  if (window.location.hash === '#goni') {
    adminOverlay.classList.remove('admin-overlay-hidden');
    document.body.style.overflow = 'hidden';
    checkAuthStatus();
  } else {
    adminOverlay.classList.add('admin-overlay-hidden');
    document.body.style.overflow = '';
  }
}

// ── Auth ──
async function checkAuthStatus() {
  if (typeof sb === 'undefined') return;
  const { data: { session } } = await sb.auth.getSession();
  if (session) showDashboard(session.user); else showLogin();
}

async function tryLogin() {
  const email = lemailInput.value.trim();
  const password = lpassInput.value;
  if (!email || !password) return;
  loginBtn.disabled = true; loginBtn.textContent = 'Giriş yapılıyor...'; loginErr.style.display = 'none';
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  loginBtn.disabled = false; loginBtn.textContent = 'Giriş Yap';
  if (error) {
    loginErr.textContent = '⛔ ' + (error.message.includes('Invalid login') ? 'E-posta veya şifre hatalı.' : error.message);
    loginErr.style.display = 'block';
  } else { showDashboard(data.user); }
}

loginBtn.addEventListener('click', tryLogin);
lpassInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
document.getElementById('logout-btn').addEventListener('click', async () => { await sb.auth.signOut(); showLogin(); lemailInput.value = ''; lpassInput.value = ''; });
document.getElementById('close-admin-btn').addEventListener('click', () => { window.location.hash = ''; });

function showLogin() { loginScreen.classList.remove('hidden'); dashboard.classList.remove('visible'); }
function showDashboard(user) {
  loginScreen.classList.add('hidden'); dashboard.classList.add('visible');
  if (user) document.getElementById('admin-user-email').textContent = user.email;
  loadAdminData();
}

// ── Sidebar Navigation ──
const titles = { overview:'Genel Bakış', projects:'Projeler', services:'Hizmetler', about:'Hakkımızda', announcements:'Duyurular', messages:'Gelen Mesajlar', logs:'Aktivite Log' };
document.querySelectorAll('.sb-item').forEach(item => {
  item.addEventListener('click', () => {
    const pg = item.dataset.page;
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const pageEl = document.getElementById('page-' + pg);
    if (pageEl) pageEl.classList.add('active');
    document.getElementById('page-title').textContent = titles[pg] || pg;
  });
});

// ── Data Loading ──
async function loadAdminData() {
  logActivity('CMS', 'Panele giriş yapıldı.');
  await Promise.all([fetchAndRenderMessages(), fetchAndRenderProjects(), fetchAndRenderServices(), fetchAndRenderAbout(), fetchAndRenderAnnouncements()]);
}

// ── MESSAGES ──
async function fetchAndRenderMessages() {
  const tbody = document.getElementById('msg-table');
  const countEl = document.getElementById('msg-count');
  try {
    const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    countEl.textContent = `${data.length} mesaj`;
    const kpi = document.getElementById('kpi-messages'); if (kpi) kpi.textContent = data.length;
    if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--t3);padding:32px;font-family:'JetBrains Mono',monospace;font-size:.78rem">Henüz mesaj yok.</td></tr>`; return; }
    tbody.innerHTML = data.map(m => `<tr>
      <td class="mono" style="font-size:.72rem">${new Date(m.created_at).toLocaleDateString('tr-TR')}</td>
      <td><strong>${esc(m.name)}</strong></td>
      <td><a href="mailto:${esc(m.email)}" style="color:var(--t2);text-decoration:none">${esc(m.email)}</a></td>
      <td>${esc(m.subject)}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(m.message)}">${esc(m.message)}</td>
      <td><button class="act-btn act-del" onclick="deleteMessage('${m.id}')">🗑</button></td>
    </tr>`).join('');
  } catch (err) { console.error('Mesajlar:', err); }
}

window.deleteMessage = async function(id) {
  if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
  const { error } = await sb.from('messages').delete().eq('id', id);
  if (error) { toast('❌ Silinemedi'); return; }
  toast('✅ Mesaj silindi'); logActivity('Mesaj', 'Bir mesaj silindi.'); fetchAndRenderMessages();
};

// ── PROJECTS ──
window._adminProjects = [];
async function fetchAndRenderProjects() {
  const tbody = document.getElementById('admin-proj-table');
  try {
    const { data, error } = await sb.from('projects').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    window._adminProjects = data;
    document.getElementById('kpi-projects').textContent = data.length;
    const tagMap = { done:'tag-done', wip:'tag-wip', plan:'tag-plan' };
    const lblMap = { done:'Tamamlandı', wip:'Geliştiriliyor', plan:'Planlanıyor' };
    tbody.innerHTML = data.map((p, i) => `<tr>
      <td class="mono">${String(i+1).padStart(2,'0')}</td>
      <td><strong>${esc(p.title.split('—')[0].trim())}</strong></td>
      <td>${esc(p.type)}</td>
      <td><span class="tag ${tagMap[p.status]||'tag-plan'}">${lblMap[p.status]||p.status}</span></td>
      <td class="mono" style="font-size:.72rem;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.tags?p.tags.join(' · '):''}</td>
      <td><button class="act-btn" onclick="editProject('${p.id}')">✏️</button> <button class="act-btn act-del" onclick="deleteProject('${p.id}')">🗑</button></td>
    </tr>`).join('');
  } catch (err) { console.error('Projeler:', err); }
}

document.getElementById('new-proj-btn').addEventListener('click', () => openProjectModal(null));

window.editProject = function(id) {
  const p = window._adminProjects.find(x => x.id === id);
  if (p) openProjectModal(p);
};

window.deleteProject = async function(id) {
  if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
  const { error } = await sb.from('projects').delete().eq('id', id);
  if (error) { toast('❌ Silinemedi'); return; }
  toast('✅ Proje silindi'); logActivity('Proje', 'Bir proje silindi.'); fetchAndRenderProjects();
};

function openProjectModal(p) {
  const isNew = !p;
  openModal(isNew ? '➕ Yeni Proje' : '✏️ Proje Düzenle', `
    <div class="admin-form-group"><label class="admin-label">Başlık</label><input class="admin-input" id="m-proj-title" value="${esc(p?.title||'')}" /></div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label class="admin-label">Tür</label><input class="admin-input" id="m-proj-type" value="${esc(p?.type||'')}" /></div>
      <div class="admin-form-group"><label class="admin-label">Durum</label><select class="admin-input" id="m-proj-status"><option value="done" ${p?.status==='done'?'selected':''}>Tamamlandı</option><option value="wip" ${p?.status==='wip'?'selected':''}>Geliştiriliyor</option><option value="plan" ${p?.status==='plan'?'selected':''}>Planlanıyor</option></select></div>
    </div>
    <div class="admin-form-group"><label class="admin-label">Açıklama</label><textarea class="admin-input" id="m-proj-desc" rows="3">${esc(p?.description||'')}</textarea></div>
    <div class="admin-form-group"><label class="admin-label">Etki (HTML)</label><input class="admin-input" id="m-proj-impact" value="${esc(p?.impact_html||'')}" /></div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label class="admin-label">İkon</label><input class="admin-input" id="m-proj-icon" value="${esc(p?.icon||'')}" /></div>
      <div class="admin-form-group"><label class="admin-label">URL Metin</label><input class="admin-input" id="m-proj-url" value="${esc(p?.url_text||'')}" /></div>
      <div class="admin-form-group"><label class="admin-label">Sıra</label><input class="admin-input" type="number" id="m-proj-order" value="${p?.order_index||0}" /></div>
    </div>
    <div class="admin-form-group"><label class="admin-label">Etiketler (virgülle ayırın)</label><input class="admin-input" id="m-proj-tags" value="${p?.tags?p.tags.join(', '):''}" /></div>
    <div class="admin-form-group"><label class="admin-label">Internal ID</label><input class="admin-input" id="m-proj-iid" value="${esc(p?.internal_id||'')}" /></div>
  `, async () => {
    const payload = {
      title: document.getElementById('m-proj-title').value,
      type: document.getElementById('m-proj-type').value,
      description: document.getElementById('m-proj-desc').value,
      impact_html: document.getElementById('m-proj-impact').value,
      icon: document.getElementById('m-proj-icon').value,
      url_text: document.getElementById('m-proj-url').value,
      order_index: parseInt(document.getElementById('m-proj-order').value) || 0,
      status: document.getElementById('m-proj-status').value,
      tags: document.getElementById('m-proj-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      internal_id: document.getElementById('m-proj-iid').value,
      highlights: p?.highlights || []
    };
    let err;
    if (isNew) { ({ error: err } = await sb.from('projects').insert(payload)); }
    else { ({ error: err } = await sb.from('projects').update(payload).eq('id', p.id)); }
    if (err) { toast('❌ Hata: ' + err.message); return; }
    closeModal(); toast(isNew ? '✅ Proje eklendi' : '✅ Proje güncellendi');
    logActivity('Proje', isNew ? 'Yeni proje eklendi.' : 'Proje güncellendi.'); fetchAndRenderProjects();
  });
}

// ── SERVICES ──
window._adminServices = [];
async function fetchAndRenderServices() {
  const tbody = document.getElementById('admin-svc-table');
  try {
    const { data, error } = await sb.from('services').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    window._adminServices = data;
    document.getElementById('kpi-services').textContent = data.length;
    tbody.innerHTML = data.map(s => `<tr>
      <td><strong>${esc(s.title)}</strong></td>
      <td><span class="tag tag-done">Aktif</span></td>
      <td><span class="tag ${s.is_popular?'tag-wip':'tag-plan'}">${s.is_popular?'Popüler':'Standart'}</span></td>
      <td><button class="act-btn" onclick="editService('${s.id}')">✏️</button> <button class="act-btn act-del" onclick="deleteService('${s.id}')">🗑</button></td>
    </tr>`).join('');
  } catch (err) { console.error('Hizmetler:', err); }
}

document.getElementById('new-svc-btn').addEventListener('click', () => openServiceModal(null));

window.editService = function(id) {
  const s = window._adminServices.find(x => x.id === id);
  if (s) openServiceModal(s);
};

window.deleteService = async function(id) {
  if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
  const { error } = await sb.from('services').delete().eq('id', id);
  if (error) { toast('❌ Silinemedi'); return; }
  toast('✅ Hizmet silindi'); logActivity('Hizmet', 'Bir hizmet silindi.'); fetchAndRenderServices();
};

function openServiceModal(s) {
  const isNew = !s;
  openModal(isNew ? '➕ Yeni Hizmet' : '✏️ Hizmet Düzenle', `
    <div class="admin-form-group"><label class="admin-label">Başlık</label><input class="admin-input" id="m-svc-title" value="${esc(s?.title||'')}" /></div>
    <div class="admin-form-group"><label class="admin-label">Açıklama</label><textarea class="admin-input" id="m-svc-desc" rows="3">${esc(s?.description||'')}</textarea></div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label class="admin-label">İkon</label><input class="admin-input" id="m-svc-icon" value="${esc(s?.icon||'')}" /></div>
      <div class="admin-form-group"><label class="admin-label">Sıra</label><input class="admin-input" type="number" id="m-svc-order" value="${s?.order_index||0}" /></div>
      <div class="admin-form-group"><label class="admin-label">Genişlik</label><select class="admin-input" id="m-svc-width"><option value="" ${!s?.width_class?'selected':''}>Normal</option><option value="bc-w2" ${s?.width_class==='bc-w2'?'selected':''}>2x Geniş</option><option value="bc-w3" ${s?.width_class==='bc-w3'?'selected':''}>3x Geniş</option></select></div>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label class="admin-label"><input type="checkbox" id="m-svc-pop" ${s?.is_popular?'checked':''} /> Popüler</label></div>
      <div class="admin-form-group"><label class="admin-label"><input type="checkbox" id="m-svc-wa" ${s?.is_whatsapp?'checked':''} /> WhatsApp</label></div>
    </div>
    <div class="admin-form-group"><label class="admin-label">Özellikler (virgülle)</label><input class="admin-input" id="m-svc-feat" value="${s?.features?s.features.join(', '):''}" /></div>
  `, async () => {
    const payload = {
      title: document.getElementById('m-svc-title').value,
      description: document.getElementById('m-svc-desc').value,
      icon: document.getElementById('m-svc-icon').value,
      order_index: parseInt(document.getElementById('m-svc-order').value) || 0,
      width_class: document.getElementById('m-svc-width').value,
      is_popular: document.getElementById('m-svc-pop').checked,
      is_whatsapp: document.getElementById('m-svc-wa').checked,
      features: document.getElementById('m-svc-feat').value.split(',').map(t => t.trim()).filter(Boolean)
    };
    let err;
    if (isNew) { ({ error: err } = await sb.from('services').insert(payload)); }
    else { ({ error: err } = await sb.from('services').update(payload).eq('id', s.id)); }
    if (err) { toast('❌ Hata: ' + err.message); return; }
    closeModal(); toast(isNew ? '✅ Hizmet eklendi' : '✅ Hizmet güncellendi');
    logActivity('Hizmet', isNew ? 'Yeni hizmet eklendi.' : 'Hizmet güncellendi.'); fetchAndRenderServices();
  });
}

// ── ABOUT ──
async function fetchAndRenderAbout() {
  try {
    const { data, error } = await sb.from('site_content').select('*');
    if (error) throw error;
    const map = {}; data.forEach(r => map[r.content_key] = r.content_value);
    document.getElementById('about-p1').value = map['about_p1'] || '';
    document.getElementById('about-p2').value = map['about_p2'] || '';
    document.getElementById('about-p3').value = map['about_p3'] || '';
    document.getElementById('about-focus').value = map['about_focus_desc'] || '';
    document.getElementById('about-years').value = map['about_years'] || '';
    document.getElementById('about-proj-count').value = map['about_projects_count'] || '';
    document.getElementById('about-lines').value = map['about_lines'] || '';
  } catch (err) { console.error('About:', err); }
}

document.getElementById('save-about-btn').addEventListener('click', async () => {
  const fields = {
    'about_p1': document.getElementById('about-p1').value,
    'about_p2': document.getElementById('about-p2').value,
    'about_p3': document.getElementById('about-p3').value,
    'about_focus_desc': document.getElementById('about-focus').value,
    'about_years': document.getElementById('about-years').value,
    'about_projects_count': document.getElementById('about-proj-count').value,
    'about_lines': document.getElementById('about-lines').value,
  };
  try {
    for (const [key, val] of Object.entries(fields)) {
      await sb.from('site_content').upsert({ content_key: key, content_value: val, updated_at: new Date().toISOString() }, { onConflict: 'content_key' });
    }
    toast('✅ Hakkımızda güncellendi'); logActivity('İçerik', 'Hakkımızda içerikleri güncellendi.');
  } catch (err) { toast('❌ Hata: ' + err.message); }
});

// ── ANNOUNCEMENTS ──
async function fetchAndRenderAnnouncements() {
  const list = document.getElementById('ann-list');
  try {
    const { data, error } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const kpi = document.getElementById('kpi-announcements');
    if (kpi) kpi.textContent = data.filter(a => a.is_active).length;
    if (!data.length) { list.innerHTML = '<div class="form-card"><p class="admin-hint">Henüz duyuru yok.</p></div>'; return; }
    list.innerHTML = data.map(a => `<div class="form-card" style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span class="tag ${a.is_active?'tag-done':'tag-plan'}">${a.is_active?'Aktif':'Pasif'}</span>
          <strong style="font-size:.88rem">${esc(a.title)}</strong>
        </div>
        <p style="font-size:.78rem;color:var(--t3);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.message)}</p>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="act-btn" onclick="toggleAnn('${a.id}',${!a.is_active})">${a.is_active?'⏸':'▶'}</button>
        <button class="act-btn act-del" onclick="deleteAnn('${a.id}')">🗑</button>
      </div>
    </div>`).join('');
  } catch (err) { console.error('Duyurular:', err); }
}

document.getElementById('publish-ann-btn').addEventListener('click', async () => {
  const title = document.getElementById('ann-title').value.trim();
  const message = document.getElementById('ann-message').value.trim();
  if (!title || !message) { toast('❌ Başlık ve mesaj gerekli'); return; }
  const payload = {
    title, message,
    badge_text: document.getElementById('ann-badge').value || '📢 Duyuru',
    btn_text: document.getElementById('ann-btn-text').value || 'Anladım',
    btn_url: document.getElementById('ann-url').value || '',
    is_active: true
  };
  const { error } = await sb.from('announcements').insert(payload);
  if (error) { toast('❌ Hata: ' + error.message); return; }
  toast('✅ Duyuru yayınlandı'); logActivity('Duyuru', 'Yeni duyuru yayınlandı.');
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-message').value = '';
  fetchAndRenderAnnouncements();
});

window.toggleAnn = async function(id, active) {
  await sb.from('announcements').update({ is_active: active }).eq('id', id);
  toast(active ? '✅ Duyuru aktif edildi' : '⏸ Duyuru pasif edildi'); fetchAndRenderAnnouncements();
};

window.deleteAnn = async function(id) {
  if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
  await sb.from('announcements').delete().eq('id', id);
  toast('✅ Duyuru silindi'); fetchAndRenderAnnouncements();
};

// ── VISITOR ANNOUNCEMENT POPUP ──
async function loadAnnouncement() {
  if (typeof sb === 'undefined') return;
  try {
    const { data, error } = await sb.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1);
    if (error || !data || !data.length) return;
    const ann = data[0];
    const dismissed = sessionStorage.getItem('ann_dismissed_' + ann.id);
    if (dismissed) return;
    const overlay = document.getElementById('site-announcement');
    document.getElementById('ann-popup-badge').textContent = ann.badge_text || '📢 Duyuru';
    document.getElementById('ann-popup-title').textContent = ann.title;
    document.getElementById('ann-popup-msg').textContent = ann.message;
    const btn = document.getElementById('ann-popup-btn');
    btn.textContent = ann.btn_text || 'Anladım';
    setTimeout(() => { overlay.classList.add('visible'); }, 1500);
    btn.onclick = () => {
      overlay.classList.remove('visible');
      sessionStorage.setItem('ann_dismissed_' + ann.id, '1');
      if (ann.btn_url) { window.location.hash = ''; window.location.href = ann.btn_url; }
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.classList.remove('visible'); sessionStorage.setItem('ann_dismissed_' + ann.id, '1'); }
    });
  } catch (err) { console.error('Duyuru popup:', err); }
}

// ── MODAL SYSTEM ──
let _modalSaveFn = null;
function openModal(title, bodyHTML, saveFn) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  _modalSaveFn = saveFn;
  document.getElementById('admin-modal').classList.add('visible');
}
function closeModal() { document.getElementById('admin-modal').classList.remove('visible'); _modalSaveFn = null; }
document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
document.getElementById('modal-save-btn').addEventListener('click', () => { if (_modalSaveFn) _modalSaveFn(); });

// ── Toast ──
function toast(msg) {
  const t = document.getElementById('admin-toast');
  if (!t) return; t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Activity Log ──
function logActivity(module, msg) {
  const lists = [document.getElementById('admin-log-list'), document.getElementById('admin-log-list-full')];
  const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const html = `<div class="log-item"><div class="log-dot ld-mint"></div><div class="log-time">${now}</div><div class="log-msg"><strong>${module}</strong> — ${msg}</div></div>`;
  lists.forEach(l => { if (l) l.insertAdjacentHTML('afterbegin', html); });
}

// ── Helpers ──
function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
