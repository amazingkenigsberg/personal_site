// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Nav toggle for mobile
(() => {
  const nav = document.querySelector('.nav');
  const btn = document.querySelector('.nav-toggle');
  if (!nav || !btn) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
  });
})();

// Footer year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Lazy placeholders
(() => {
  $$('.placeholder').forEach((el) => {
    const name = el.getAttribute('data-image');
    if (name) el.style.backgroundImage = `url(./assets/images/${name})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  });
})();

// Canvas helpers
function resizeCanvasToDisplaySize(canvas) {
  const { clientWidth, clientHeight } = canvas;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const needResize = canvas.width !== Math.floor(clientWidth * dpr) || canvas.height !== Math.floor(clientHeight * dpr);
  if (needResize) {
    canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
  }
  return needResize;
}

// ==================================
// Particle background
// ==================================
(function initParticleBG() {
  const canvas = $('#bg-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0004,
    vy: (Math.random() - 0.5) * 0.0004,
    r: 0.6 + Math.random() * 1.6
  }));

  function render() {
    // Ensure full-viewport canvas at device pixel ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor(window.innerWidth * dpr));
    const targetH = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const width = canvas.width;
    const height = canvas.height;

    // keep canvas transparent over the CSS background
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // subtle blue dots
    ctx.fillStyle = 'rgba(96,165,250,0.45)';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      const x = p.x * width;
      const y = p.y * height;
      ctx.globalAlpha = 0.25 + 0.75 * Math.random();
      ctx.beginPath(); ctx.arc(x, y, p.r * (window.devicePixelRatio || 1), 0, Math.PI * 2); ctx.fill();
    }

    // connect near particles (faint)
    // faint green lines
    ctx.strokeStyle = 'rgba(52,211,153,0.12)';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = (particles[i].x - particles[j].x) * width;
        const dy = (particles[i].y - particles[j].y) * height;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          ctx.globalAlpha = 0.08 * (1 - d2 / (120 * 120));
          ctx.beginPath();
          ctx.moveTo(particles[i].x * width, particles[i].y * height);
          ctx.lineTo(particles[j].x * width, particles[j].y * height);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
  window.addEventListener('resize', () => { requestAnimationFrame(render); });
})();

// Header shadow on scroll
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

// Scroll reveal
(() => {
  const items = $$('.section, .card, .timeline .item');
  items.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  items.forEach((el) => io.observe(el));
})();

// Card parallax hover
(() => {
  const cards = $$('.card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(700px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ==================================
// Research card: SO(3) vectors on sphere
// ==================================
(function initSO3Card() {
  const canvas = $('#so3-card-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0;
  const points = [];

  function randOnSphere() {
    let x = 0, y = 0, z = 0;
    for (let i = 0; i < 6; i++) { x += Math.random() - 0.5; y += Math.random() - 0.5; z += Math.random() - 0.5; }
    const n = Math.hypot(x, y, z) || 1; return { x: x / n, y: y / n, z: z / n };
  }

  function render() {
    resizeCanvasToDisplaySize(canvas);
    const { width, height } = canvas;
    const cx = width / 2, cy = height / 2;
    const r = Math.min(width, height) * 0.42;

    ctx.clearRect(0, 0, width, height);
    // panel bg
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, 'rgba(15,23,42,0.95)');
    bg.addColorStop(1, 'rgba(11,18,33,0.95)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    // sphere outline
    ctx.strokeStyle = 'rgba(96,165,250,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

    // meridians
    for (let i = -2; i <= 2; i++) {
      const y = (i / 5) * 2 * r * 0.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + y, r * Math.sqrt(1 - (y / r) ** 2), r * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // add random sample points
    for (let i = 0; i < 16; i++) points.push(randOnSphere());
    if (points.length > 800) points.splice(0, points.length - 800);

    // rotate and project + draw vectors
    const c = Math.cos(angle), s = Math.sin(angle);
    const e3 = { x: 0, y: 0, z: 1 };
    for (let i = 0; i < points.length; i += 2) {
      const p = points[i];
      // rotate around Y for simple motion
      const xr = p.x * c + p.z * s;
      const yr = p.y;
      const zr = -p.x * s + p.z * c;
      const px = cx + xr * r;
      const py = cy - yr * r;
      const depth = (zr + 1) * 0.5;

      // tangent vector via cross(e3, p)
      const tx = e3.y * zr - e3.z * yr; // 0*zr - 1*yr = -yr
      const ty = e3.z * xr - e3.x * zr; // 1*xr - 0 = xr
      const tz = e3.x * yr - e3.y * xr; // 0
      // normalize tangent
      const tn = Math.hypot(tx, ty, tz) || 1;
      const ux = tx / tn, uy = ty / tn, uz = tz / tn;
      // rotate same as point
      const uxr = ux * c + uz * s;
      const uyr = uy;
      const uzr = -ux * s + uz * c;

      const vlen = 14 + 14 * depth;
      const vx = cx + (xr + uxr * 0.08) * r;
      const vy = cy - (yr + uyr * 0.08) * r;
      const ex = px + uxr * vlen;
      const ey = py - uyr * vlen;

      // vector line
      ctx.strokeStyle = `rgba(52,211,153,${0.35 + 0.45 * depth})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(ex, ey); ctx.stroke();
      // arrow head
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - uyr * 3, ey - uxr * 3);
      ctx.lineTo(ex + uyr * 3, ey + uxr * 3);
      ctx.closePath();
      ctx.fillStyle = `rgba(52,211,153,${0.35 + 0.45 * depth})`;
      ctx.fill();

      // dot
      ctx.fillStyle = `rgba(96,165,250,${0.4 + 0.6 * depth})`;
      ctx.beginPath(); ctx.arc(px, py, 1.5 + 2.2 * depth, 0, Math.PI * 2); ctx.fill();
    }

    angle += 0.01;
    requestAnimationFrame(render);
  }

  render();
})();

// ==================================
// BGI CVI: simple animated scatter
// ==================================
(function initBGICanvas() {
  const canvas = $('#bgi-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const N = 120;
  const pts = Array.from({ length: N }, (_, i) => {
    const g = i % 3;
    const baseX = g === 0 ? 0.3 : g === 1 ? 0.6 : 0.8;
    const baseY = g === 0 ? 0.7 : g === 1 ? 0.5 : 0.35;
    return { x: baseX + (Math.random() - 0.5) * 0.15, y: baseY + (Math.random() - 0.5) * 0.18, c: g };
  });

  function colorFor(g) { return g === 0 ? '#34d399' : g === 1 ? '#60a5fa' : '#f59e0b'; }

  function render(t) {
    resizeCanvasToDisplaySize(canvas);
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, 'rgba(15,23,42,0.9)');
    bg.addColorStop(1, 'rgba(11,18,33,0.9)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    const m = 16; const x0 = m, y0 = height - m, x1 = width - m, y1 = m;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();

    for (const p of pts) {
      const jitter = 0.004 * Math.sin((t || 0) / 900 + (p.x + p.y) * 20);
      const px = x0 + (p.x + jitter) * (x1 - x0);
      const py = y0 - (p.y + jitter) * (y0 - y1);
      const pulse = 1 + 0.6 * Math.sin((t || 0) / 700 + p.x * 10);
      const r = 2.4 * pulse;
      ctx.fillStyle = colorFor(p.c); ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1; requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();

// ==================================
// UniqLearn: Spinning brain graph (two 3D lobes)
// ==================================
(function initUniqlearnCanvas() {
  const canvas = $('#uniqlearn-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NODE_COUNT = 40;

  function randNorm() {
    let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function sampleEllipsoid(cx, cy, cz, rx, ry, rz) {
    let x = randNorm(), y = randNorm(), z = randNorm();
    const n = Math.hypot(x, y, z) || 1; x /= n; y /= n; z /= n;
    const r = 0.6 + Math.random() * 0.4; // bias toward surface
    return { x: cx + rx * x * r, y: cy + ry * y * r, z: cz + rz * z * r };
  }

  // Base points for left/right lobes
  const base = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const left = i % 2 === 0;
    const c = left ? -0.6 : 0.6;
    const p = sampleEllipsoid(c, 0, 0, 0.5, 0.7, 0.4);
    base.push({ bx: p.x, by: p.y, bz: p.z, phase: Math.random() * Math.PI * 2, amp: 0.08 + Math.random() * 0.06 });
  }

  // Precompute nearest neighbors
  const neighbors = base.map(() => []);
  for (let i = 0; i < NODE_COUNT; i++) {
    const cand = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (j === i) continue;
      const dx = base[i].bx - base[j].bx;
      const dy = base[i].by - base[j].by;
      const dz = base[i].bz - base[j].bz;
      cand.push({ j, d2: dx * dx + dy * dy + dz * dz });
    }
    cand.sort((a, b) => a.d2 - b.d2);
    neighbors[i] = cand.slice(0, 3).map((c) => c.j);
  }

  let t = 0;
  function render() {
    resizeCanvasToDisplaySize(canvas);
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // background panel color
    ctx.fillStyle = 'rgba(13,23,41,1)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2, cy = height / 2;
    const scale = Math.min(width, height) * 0.34;
    t += 0.012; // slow spin
    const yaw = t; // rotate around Y
    const roll = 0.15 * Math.sin(t * 0.6);
    const breath = 1 + 0.03 * Math.sin(t * 1.4);

    const cyw = Math.cos(yaw), syw = Math.sin(yaw);
    const cr = Math.cos(roll), sr = Math.sin(roll);

    const proj = base.map((n) => {
      const radial = 1 + n.amp * Math.sin(t + n.phase) * 0.2;
      let x = n.bx * radial, y = n.by * radial, z = n.bz * radial;
      // yaw
      const x1 = x * cyw + z * syw;
      const z1 = -x * syw + z * cyw;
      // roll
      const x2 = x1 * cr - y * sr;
      const y2 = x1 * sr + y * cr;
      const px = cx + x2 * scale * breath;
      const py = cy + y2 * scale * breath;
      const depth = (z1 * breath + 1.2) / 2.4; // 0..1
      return { px, py, depth };
    });

    // edges
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = proj[i];
      for (const j of neighbors[i]) {
        const b = proj[j];
        const alpha = 0.22 * (a.depth + b.depth) * 0.5;
        const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
        grad.addColorStop(0, 'rgba(52,211,153,' + alpha.toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(96,165,250,' + alpha.toFixed(3) + ')');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
      }
    }

    // nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = proj[i];
      const r = 2 + 2.2 * p.depth;
      const alpha = 0.75 * (0.6 + 0.4 * p.depth);
      const g = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 2);
      g.addColorStop(0, 'rgba(96,165,250,' + alpha.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(96,165,250,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
})();

// ==================================
// Noodle card: QA pass/fail bars
// ==================================
(function initNoodleCanvas() {
  const canvas = $('#noodle-canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); let t = 0;
  function render() {
    resizeCanvasToDisplaySize(canvas); const { width, height } = canvas; ctx.fillStyle = 'rgba(15,23,42,0.95)'; ctx.fillRect(0, 0, width, height);
    const cols = 18; const gap = 4; const barW = (width - gap * (cols + 1)) / cols;
    for (let i = 0; i < cols; i++) { const x = gap + i * (barW + gap); const base = 0.5 + 0.4 * Math.sin((t + i * 7) / 23); const pass = Math.max(0.08, Math.min(0.98, base + (Math.random() - 0.5) * 0.08)); const passH = pass * (height - 10);
      ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.fillRect(x, height - 5 - (height - 10), barW, (height - 10) - passH);
      ctx.fillStyle = 'rgba(52,211,153,0.9)'; ctx.fillRect(x, height - 5 - passH, barW, passH);
    }
    t += 1; requestAnimationFrame(render);
  }
  render();
})();

// ==================================
// Hyperloop card: capsule motion
// ==================================
(function initHyperloopCanvas() {
  const canvas = $('#hyperloop-canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); let x = 0;
  function render() {
    resizeCanvasToDisplaySize(canvas); const { width, height } = canvas; ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, width, height); bg.addColorStop(0, 'rgba(11,18,33,1)'); bg.addColorStop(1, 'rgba(8,12,22,1)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(96,165,250,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, height * 0.7); ctx.lineTo(width, height * 0.7); ctx.moveTo(0, height * 0.75); ctx.lineTo(width, height * 0.75); ctx.stroke();
    const capW = 70; const capH = 22; const y = height * 0.67; x += 2.5; if (x > width + capW) x = -capW;
    ctx.fillStyle = '#34d399'; ctx.beginPath(); const r = capH / 2; ctx.moveTo(x + r, y); ctx.arc(x + r, y + r, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x + capW - r, y + capH); ctx.arc(x + capW - r, y + r, r, Math.PI / 2, -Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#60a5fa'; ctx.fillRect(x - 40, y + 6, 40, capH - 12); ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }
  render();
})();
