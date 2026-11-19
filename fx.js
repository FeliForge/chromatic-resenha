// CHROMATIC RESENHA - Effects: particles, hit sparks, shockwaves, screen shake
const FX = {
  particles: [], rings: [], texts: [],
  shake: 0, flash: 0, flashColor: '#fff', hitstop: 0, slowmo: 0, zoomPunch: 0
};

function clearFX() {
  FX.particles.length = 0; FX.rings.length = 0; FX.texts.length = 0;
  FX.shake = 0; FX.flash = 0; FX.hitstop = 0; FX.slowmo = 0; FX.zoomPunch = 0;
}

function addParticle(o) {
  const p = Object.assign({
    x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0.97, life: 30, size: 4,
    color: '#fff', type: 'dot', rot: 0, vr: 0, grow: 0
  }, o);
  p.max = p.life;
  if (FX.particles.length < 600) FX.particles.push(p);
}

function burst(x, y, color, n, speed, opts) {
  opts = opts || {};
  for (let i = 0; i < n; i++) {
    const a = opts.dir !== undefined
      ? opts.dir + (Math.random() - 0.5) * (opts.spread || 1.2)
      : Math.random() * Math.PI * 2;
    const s = speed * (0.4 + Math.random() * 0.8);
    addParticle({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      g: opts.g !== undefined ? opts.g : 0.25,
      life: (opts.life || 24) * (0.6 + Math.random() * 0.8),
      size: (opts.size || 4) * (0.6 + Math.random() * 0.8),
      color: Array.isArray(color) ? color[(Math.random() * color.length) | 0] : color,
      type: opts.type || 'dot', vr: (Math.random() - 0.5) * 0.4
    });
  }
}

// Street-Fighter style impact flash (starburst + rings + sparks)
function hitSpark(x, y, power, color, facing) {
  const big = power >= 2;
  FX.rings.push({ x, y, r: 6, max: big ? 90 : power === 1 ? 62 : 42, life: big ? 14 : 10, t: 0,
    kind: 'star', color: color || '#ffe14a', spikes: big ? 12 : 9, rot: Math.random() * 6 });
  FX.rings.push({ x, y, r: 4, max: big ? 70 : 46, life: 12, t: 0, kind: 'ring', color: '#fff' });
  burst(x, y, ['#fff', color || '#ffe14a', '#ff9d2e'], 8 + power * 8, 6 + power * 3,
    { type: 'spark', life: 16, size: 3, g: 0.15, dir: facing > 0 ? 0 : Math.PI, spread: 2.6 });
}

function guardSpark(x, y, facing) {
  FX.rings.push({ x, y, r: 6, max: 44, life: 9, t: 0, kind: 'ring', color: '#7fdcff' });
  burst(x, y, ['#bfefff', '#4fc3ff'], 10, 5, { type: 'spark', life: 12, size: 3, g: 0.1,
    dir: facing > 0 ? Math.PI : 0, spread: 2 });
}

function dustPuff(x, y, n, dir) {
  for (let i = 0; i < n; i++) {
    addParticle({
      x: x + (Math.random() - 0.5) * 20, y: y - 2,
      vx: (dir || 0) * (0.5 + Math.random() * 1.2) + (Math.random() - 0.5) * 1.2,
      vy: -0.3 - Math.random() * 0.8, g: -0.01, drag: 0.94, life: 26 + Math.random() * 12,
      size: 5 + Math.random() * 6, grow: 0.35, color: 'rgba(230,220,200,0.55)', type: 'smoke'
    });
  }
}

function floatText(x, y, text, color, size) {
  FX.texts.push({ x, y, text, color: color || '#fff', size: size || 22, life: 40, max: 40 });
}

function shakeScreen(a) { FX.shake = Math.max(FX.shake, a); }
function flashScreen(a, c) { FX.flash = Math.max(FX.flash, a); FX.flashColor = c || '#fff'; }

function updateFX() {
  for (let i = FX.particles.length - 1; i >= 0; i--) {
    const p = FX.particles[i];
    p.life--;
    if (p.life <= 0) { FX.particles.splice(i, 1); continue; }
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.size += p.grow;
    if (p.type !== 'smoke' && p.y > GROUND_Y + 40) { p.y = GROUND_Y + 40; p.vy *= -0.4; }
  }
  for (let i = FX.rings.length - 1; i >= 0; i--) {
    const r = FX.rings[i];
    r.t++;
    if (r.t >= r.life) FX.rings.splice(i, 1);
  }
  for (let i = FX.texts.length - 1; i >= 0; i--) {
    const t = FX.texts[i];
    t.life--; t.y -= 0.8;
    if (t.life <= 0) FX.texts.splice(i, 1);
  }
  FX.shake *= 0.86; if (FX.shake < 0.2) FX.shake = 0;
  FX.flash *= 0.82; if (FX.flash < 0.02) FX.flash = 0;
  FX.zoomPunch *= 0.88; if (FX.zoomPunch < 0.002) FX.zoomPunch = 0;
}

function drawStarburst(c, x, y, r, spikes, rot) {
  c.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = rot + (i / (spikes * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.38;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}

function drawFX(c) {
  // rings / starbursts
  FX.rings.forEach(r => {
    const k = r.t / r.life, rad = r.r + (r.max - r.r) * Math.min(1, k * 1.6);
    c.save();
    c.globalAlpha = 1 - k;
    if (r.kind === 'star') {
      drawStarburst(c, r.x, r.y, rad, r.spikes, r.rot);
      c.fillStyle = '#fff'; c.fill();
      c.lineWidth = 4; c.strokeStyle = r.color; c.stroke();
      drawStarburst(c, r.x, r.y, rad * 0.55, r.spikes, r.rot + 0.2);
      c.fillStyle = r.color; c.fill();
    } else {
      c.lineWidth = 5 * (1 - k) + 1; c.strokeStyle = r.color;
      c.beginPath(); c.arc(r.x, r.y, rad, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  });
  // particles
  FX.particles.forEach(p => {
    const a = Math.max(0, Math.min(1, p.life / p.max));
    c.save();
    c.globalAlpha = p.type === 'smoke' ? a * 0.7 : a;
    if (p.type === 'spark') {
      c.strokeStyle = p.color; c.lineWidth = Math.max(1, p.size * 0.7); c.lineCap = 'round';
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); c.stroke();
    } else if (p.type === 'smoke') {
      c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
    } else if (p.type === 'star') {
      c.translate(p.x, p.y); c.rotate(p.rot);
      drawStarburst(c, 0, 0, p.size * 1.6, 4, 0); c.fillStyle = p.color; c.fill();
    } else if (p.type === 'petal') {
      c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.color;
      c.beginPath(); c.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2); c.fill();
    } else {
      c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.color;
      c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
    c.restore();
  });
  // floating texts
  FX.texts.forEach(t => {
    c.save();
    c.globalAlpha = Math.min(1, t.life / 15);
    c.font = `900 ${t.size}px Impact, "Arial Black", sans-serif`;
    c.textAlign = 'center';
    c.lineWidth = 5; c.strokeStyle = '#000'; c.strokeText(t.text, t.x, t.y);
    c.fillStyle = t.color; c.fillText(t.text, t.x, t.y);
    c.restore();
  });
}
