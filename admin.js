// ════════════════════════════════════════
// GONICEON — Admin Panel Logic
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
window.addEventListener('DOMContentLoaded', checkHash);

function checkHash() {
  if (window.location.hash === '#goni') {
    adminOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    checkAuthStatus();
  } else {
    adminOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ── Auth ──
async function checkAuthStatus() {
  if (typeof sb === 'undefined') return;
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }
}

async function tryLogin() {
  const email = lemailInput.value.trim();
  const password = lpassInput.value;
  
  if(!email || !password) return;
  
  loginBtn.disabled = true;
  loginBtn.textContent = 'Giriş yapılıyor...';
  loginErr.style.display = 'none';
  
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  
  loginBtn.disabled = false;
  loginBtn.textContent = 'Giriş Yap';
  
  if (error) {
    loginErr.textContent = '⛔ ' + (error.message.includes('Invalid login') ? 'E-posta veya şifre hatalı.' : error.message);
    loginErr.style.display = 'block';
    lpassInput.style.borderColor = 'var(--red)';
    setTimeout(() => { lpassInput.style.borderColor = ''; }, 1500);
  } else {
    showDashboard(data.user);
  }
}

loginBtn.addEventListener('click', tryLogin);
lpassInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

document.getElementById('logout-btn').addEventListener('click', async () => {
  await sb.auth.signOut();
  showLogin();
  lemailInput.value = '';
  lpassInput.value = '';
});

document.getElementById('close-admin-btn').addEventListener('click', () => {
  window.location.hash = ''; // Exit admin panel
});

function showLogin() {
  loginScreen.classList.remove('hidden');
  dashboard.classList.remove('visible');
}

function showDashboard(user) {
  loginScreen.classList.add('hidden');
  dashboard.classList.add('visible');
  if(user) {
    document.getElementById('admin-user-email').textContent = user.email;
  }
  loadAdminData();
}

// ── Sidebar Navigation ──
const titles = {
  overview: 'Genel Bakış', projects: 'Projeler', services: 'Hizmetler',
  about: 'Hakkımızda', messages: 'Gelen Mesajlar', logs: 'Aktivite Log'
};

document.querySelectorAll('.sb-item').forEach(item => {
  item.addEventListener('click', () => {
    const pg = item.dataset.page;
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const pageEl = document.getElementById('page-' + pg);
    if(pageEl) pageEl.classList.add('active');
    document.getElementById('page-title').textContent = titles[pg] || pg;
  });
});

// ── Data Loading & Rendering ──
async function loadAdminData() {
  logActivity('CMS', 'Panele giriş yapıldı.');
  await Promise.all([
    fetchAndRenderMessages(),
    fetchAndRenderProjects(),
    fetchAndRenderServices()
  ]);
}

// Messages
async function fetchAndRenderMessages() {
  const tbody = document.getElementById('msg-table');
  const countEl = document.getElementById('msg-count');
  try {
    const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    countEl.textContent = `${data.length} mesaj`;
    
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--t3);padding:32px;font-family:'JetBrains Mono',monospace;font-size:.78rem">Henüz mesaj yok.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = data.map(m => `
      <tr>
        <td class="mono" style="font-size:.72rem">${new Date(m.created_at).toLocaleDateString('tr-TR')}</td>
        <td><strong>${m.name}</strong></td>
        <td><a href="mailto:${m.email}" style="color:var(--t2);text-decoration:none">${m.email}</a></td>
        <td>${m.subject}</td>
        <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${m.message}">${m.message}</td>
      </tr>
    `).join('');
  } catch(err) {
    console.error('Mesajlar yüklenemedi:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--red);text-align:center;padding:10px;">Hata: ${err.message}</td></tr>`;
  }
}

// Projects
async function fetchAndRenderProjects() {
  const tbody = document.getElementById('admin-proj-table');
  try {
    const { data, error } = await sb.from('projects').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    
    document.getElementById('kpi-projects').textContent = data.length;
    
    const tagMap = { done: 'tag-done', wip: 'tag-wip', plan: 'tag-plan' };
    const lblMap = { done: 'Tamamlandı', wip: 'Geliştiriliyor', plan: 'Planlanıyor' };
    
    tbody.innerHTML = data.map((p, i) => `
      <tr>
        <td class="mono">${String(i + 1).padStart(2, '0')}</td>
        <td><strong>${p.title.split('—')[0].trim()}</strong></td>
        <td>${p.type}</td>
        <td><span class="tag ${tagMap[p.status] || 'tag-plan'}">${lblMap[p.status] || p.status}</span></td>
        <td class="mono td-stack">${p.tags ? p.tags.join(' · ') : ''}</td>
        <td><button class="act-btn" onclick="editProject('${p.id}')">Düzenle</button></td>
      </tr>
    `).join('');
    
    // Projeleri global değişkene kaydet (düzenleme için)
    window._adminProjects = data;
    
  } catch(err) {
    console.error('Projeler yüklenemedi:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--red);text-align:center;">Projeler yüklenemedi.</td></tr>`;
  }
}

// Services
async function fetchAndRenderServices() {
  const tbody = document.getElementById('admin-svc-table');
  try {
    const { data, error } = await sb.from('services').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    
    document.getElementById('kpi-services').textContent = data.length;
    
    tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td><strong>${s.title}</strong></td>
        <td><span class="tag tag-done">Aktif</span></td>
        <td><span class="tag ${s.is_popular ? 'tag-wip' : 'tag-plan'}">${s.is_popular ? 'Popüler' : 'Standart'}</span></td>
      </tr>
    `).join('');
    
  } catch(err) {
    console.error('Hizmetler yüklenemedi:', err);
    tbody.innerHTML = `<tr><td colspan="3" style="color:var(--red);text-align:center;">Hizmetler yüklenemedi.</td></tr>`;
  }
}

// ── Toast ──
function toast(msg) {
  const t = document.getElementById('admin-toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Activity Log ──
function logActivity(module, msg) {
  const logList = document.getElementById('admin-log-list');
  if(!logList) return;
  const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const html = `
    <div class="log-item">
      <div class="log-dot ld-mint"></div>
      <div class="log-time">${now}</div>
      <div class="log-msg"><strong>${module}</strong> — ${msg}</div>
    </div>
  `;
  logList.insertAdjacentHTML('afterbegin', html);
}

window.editProject = function(id) {
  toast('Proje düzenleme eklenecek.');
  // Buraya form doldurma mantığı eklenebilir.
}
