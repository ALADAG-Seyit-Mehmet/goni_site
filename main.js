// ════════════════════════════════════════
// PROTECTION (AGGRESSIVE)
// ════════════════════════════════════════
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  // F12
  if(e.key === 'F12') { e.preventDefault(); return; }
  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+U
  if(e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return; }
  if(e.ctrlKey && ['U','u','S','s','P','p','C','c','X','x'].includes(e.key)) { e.preventDefault(); return; }
});
// Prevent copy, cut, paste, drag
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('paste', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

// DevTools Debugger Trap (Freezes console if opened)
setInterval(function() {
  (function() { return false; }['constructor']('debugger')['call']());
}, 1000);

// ════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════
const navbar = document.getElementById('navbar');
const hbtn   = document.getElementById('hbtn');
const navlinks = document.getElementById('navlinks');
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-link:not(.nav-cta)');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  let cur = '';
  sections.forEach(s => { if(window.scrollY >= s.offsetTop - 130) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+cur));
}, {passive:true});

hbtn.addEventListener('click', () => {
  const open = navlinks.classList.toggle('open');
  const sp = hbtn.querySelectorAll('span');
  sp[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
  sp[1].style.opacity   = open ? '0' : '1';
  sp[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navlinks.classList.remove('open');
  hbtn.querySelectorAll('span').forEach(s => s.style='');
}));

// ════════════════════════════════════════
// HERO PARTICLES
// ════════════════════════════════════════
// (no particle div in v4 — using CSS orbs instead)

// ════════════════════════════════════════
// MARQUEE
// ════════════════════════════════════════
const techs = ['Python','JavaScript','Supabase','PostgreSQL','Discord.py','WhatsApp API','YOLO','TensorRT','FastAPI','HTML/CSS','Bot Geliştirme','Web Scraping','AI/ML','QR Sistemleri','REST API'];
const mtrack = document.getElementById('marquee');
if(mtrack){
  const all = [...techs,...techs];
  mtrack.innerHTML = all.map(t => `<span class="marquee-item mono">${t}<span class="msep">◆</span></span>`).join('');
}

// ════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════
// Tag bento cards
document.querySelectorAll('.bcard').forEach((c,i) => {
  c.classList.add('reveal');
  c.style.transitionDelay = (i * 0.055)+'s';
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => obs.observe(el));

// ════════════════════════════════════════
// SKILL BARS
// ════════════════════════════════════════
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-bar').forEach(bar => {
      if(bar.dataset.done) return;
      bar.dataset.done = '1';
      requestAnimationFrame(() => { bar.style.width = bar.dataset.w + '%'; });
    });
  });
}, {threshold: 0.3});
const skillEl = document.getElementById('skill-bars');
if(skillEl) skillObs.observe(skillEl);

// ════════════════════════════════════════
// STAT COUNTERS
// ════════════════════════════════════════
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('[data-to]').forEach(el => {
      if(el.dataset.done) return; el.dataset.done='1';
      const end = +el.dataset.to;
      let cur = 0;
      const step = Math.max(1, Math.ceil(end/50));
      const t = setInterval(() => { cur = Math.min(cur+step,end); el.textContent=cur; if(cur>=end) clearInterval(t); }, 24);
    });
  });
}, {threshold: 0.6});
const ssEl = document.querySelector('.stats-strip');
if(ssEl) cntObs.observe(ssEl);



// ════════════════════════════════════════
// HORIZONTAL SCROLL — PROJECTS
// ════════════════════════════════════════
const scroll  = document.getElementById('proj-scroll');
const dots    = document.querySelectorAll('.proj-dot');
const btnPrev = document.getElementById('proj-prev');
const btnNext = document.getElementById('proj-next');

function getCardW() {
  const c = scroll?.querySelector('.proj-card');
  return c ? c.offsetWidth + 24 : 800; // card + gap
}

function updateDots() {
  if(!scroll) return;
  const idx = Math.round(scroll.scrollLeft / getCardW());
  dots.forEach((d,i) => d.classList.toggle('active', i === idx));
}

btnPrev?.addEventListener('click', () => { scroll?.scrollBy({ left: -getCardW(), behavior:'smooth' }); });
btnNext?.addEventListener('click', () => { scroll?.scrollBy({ left:  getCardW(), behavior:'smooth' }); });
scroll?.addEventListener('scroll', updateDots, { passive:true });
dots.forEach((d,i) => d.addEventListener('click', () => {
  scroll?.scrollTo({ left: i * getCardW(), behavior:'smooth' });
}));

// Drag-to-scroll
let isDown=false, startX=0, scrollL=0;
scroll?.addEventListener('mousedown', e => { isDown=true; startX=e.pageX; scrollL=scroll.scrollLeft; scroll.style.cursor='grabbing'; });
scroll?.addEventListener('mouseup',   () => { isDown=false; scroll.style.cursor=''; });
scroll?.addEventListener('mouseleave',() => { isDown=false; scroll.style.cursor=''; });
scroll?.addEventListener('mousemove', e => { if(!isDown) return; e.preventDefault(); scroll.scrollLeft = scrollL - (e.pageX - startX); });



// ════════════════════════════════════════
// CONTACT FORM
// ════════════════════════════════════════
async function handleSubmit(e) {
  e.preventDefault();
  const f   = e.target;
  const btn = f.querySelector('button[type="submit"]');
  const ok  = document.getElementById('fsuccess');
  const payload = {
    name:    f.name.value,
    email:   f.email.value,
    subject: f.subject.value || 'Genel',
    message: f.message.value
  };

  // Supabase varsa kaydet, yoksa mailto fallback
  if (typeof sb !== 'undefined' && typeof saveMessage === 'function') {
    try {
      btn.disabled = true;
      await saveMessage(payload);
      ok.style.display = 'block';
      f.reset();
      setTimeout(() => { ok.style.display = 'none'; }, 5000);
    } catch (err) {
      console.warn('Supabase kayıt hatası, mailto fallback:', err);
      _mailtoFallback(payload);
    } finally {
      btn.disabled = false;
    }
  } else {
    _mailtoFallback(payload);
    ok.style.display = 'block';
    f.reset();
    setTimeout(() => { ok.style.display = 'none'; }, 5000);
  }
}

function _mailtoFallback({ name, email, subject, message }) {
  const s = encodeURIComponent(`[GONICEON] ${subject} — ${name}`);
  const b = encodeURIComponent(`Merhaba Seyit Mehmet,\n\nAd: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\n${message}`);
  window.open(`mailto:seyit.mehmet.aladag.work@gmail.com?subject=${s}&body=${b}`, '_blank');
}


// ════════════════════════════════════════
// EASTER EGG
// ════════════════════════════════════════
console.log('%cGONICEON.','color:#1B4FD8;font-size:2.2rem;font-weight:900;font-family:monospace');
console.log('%c$ goniceon.dev — yazılım ekibi · dijital çözümler','color:#0EA5E9;font-size:.8rem;font-family:monospace');

// ════════════════════════════════════════
// DYNAMIC CONTENT (SUPABASE)
// ════════════════════════════════════════

async function loadDynamicContent() {
  if (typeof sb === 'undefined') return;

  try {
    // Hizmetleri Çek
    const { data: services, error: sErr } = await sb.from('services').select('*').order('order_index', { ascending: true });
    if (!sErr && services && services.length > 0) {
      const bentoContainer = document.getElementById('bento-container');
      if (bentoContainer) {
        bentoContainer.innerHTML = services.map(s => {
          let classes = 'bcard';
          if (s.width_class) classes += ` ${s.width_class}`;
          if (s.is_popular && !s.is_whatsapp) classes += ' bcard-feat';
          if (s.is_whatsapp) classes += ' bcard-wa';

          let badgeHtml = '';
          if (s.is_whatsapp) badgeHtml = `<span class="bc-badge bc-badge-wa">WhatsApp</span>`;
          else if (s.is_popular) badgeHtml = `<span class="bc-badge bc-badge-mint">Popüler</span>`;

          const featuresHtml = s.features ? s.features.map(f => `<li>${f}</li>`).join('') : '';

          return `
            <div class="${classes}">
              ${badgeHtml}
              <div class="bc-icon">${s.icon}</div>
              <h3>${s.title}</h3>
              <p>${s.description}</p>
              ${featuresHtml ? `<ul class="bc-list">${featuresHtml}</ul>` : ''}
            </div>
          `;
        }).join('');

        // Re-apply scroll reveal classes for new elements
        document.querySelectorAll('.bcard').forEach((c,i) => {
          c.classList.add('reveal');
          c.style.transitionDelay = (i * 0.055)+'s';
          obs.observe(c);
        });
      }
    }

    // Projeleri Çek
    const { data: projects, error: pErr } = await sb.from('projects').select('*').order('order_index', { ascending: true });
    if (!pErr && projects && projects.length > 0) {
      const projScroll = document.getElementById('proj-scroll');
      if (projScroll) {
        projScroll.innerHTML = projects.map((p, index) => {
          const bgClass = p.internal_id ? `pv-bg-${p.internal_id.split('-')[1] || 'default'}` : 'pv-bg-medek';
          const wipBadge = p.status === 'wip' ? `<div class="wip-badge">🚧 Aktif Geliştirme</div>` : '';
          const devNote = p.status === 'wip' ? `<div class="dev-note"><span class="dev-dot"></span><span>Aktif geliştirme aşamasındadır — yeni özellikler ekleniyor</span></div>` : '';
          const tagsHtml = p.tags ? p.tags.map(t => `<span>${t}</span>`).join('') : '';
          const highlightsHtml = p.highlights ? p.highlights.map(h => `<div class="ph ${h.wip ? 'ph-wip' : ''}"><span>${h.wip ? '⟳' : '✓'}</span> <span>${h.text}</span></div>`).join('') : '';

          return `
            <article class="proj-card" id="${p.internal_id || 'proj-' + index}">
              <div class="pv">
                <div class="pv-bar">
                  <div class="pv-dots2"><span class="pv-dot2 pv-r"></span><span class="pv-dot2 pv-y"></span><span class="pv-dot2 pv-g"></span></div>
                  <div class="pv-url mono">${p.url_text || ''}</div>
                </div>
                <div class="pv-body ${bgClass}">
                  <div class="pv-icon">${p.icon}</div>
                  <div class="pv-title mono">${p.title.split('—')[0].trim()}</div>
                  <div class="pv-sub">${p.title.split('—')[1] ? p.title.split('—')[1].trim() : ''}</div>
                </div>
              </div>
              <div class="proj-info">
                <div class="proj-num">— ${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</div>
                <div class="proj-hrow">
                  <div class="proj-type">${p.type}</div>
                  ${wipBadge}
                </div>
                <h3>${p.title}</h3>
                ${devNote}
                ${p.impact_html ? `<div class="proj-impact">${p.impact_html}</div>` : ''}
                <p>${p.description}</p>
                ${tagsHtml ? `<div class="proj-tags">${tagsHtml}</div>` : ''}
                ${highlightsHtml ? `<div class="proj-hl">${highlightsHtml}</div>` : ''}
              </div>
            </article>
          `;
        }).join('');
        
        // Dots Update
        const dotsContainer = document.getElementById('proj-dots');
        if (dotsContainer) {
          dotsContainer.innerHTML = projects.map((_, i) => `<div class="proj-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
          // Rebind dots
          const newDots = dotsContainer.querySelectorAll('.proj-dot');
          newDots.forEach((d,i) => d.addEventListener('click', () => {
            projScroll.scrollTo({ left: i * getCardW(), behavior:'smooth' });
          }));
        }
      }
    }
  } catch (err) {
    console.error("Dinamik içerik yüklenirken hata oluştu:", err);
  }
}

document.addEventListener('DOMContentLoaded', loadDynamicContent);
