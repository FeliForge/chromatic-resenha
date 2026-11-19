// CHROMATIC RESENHA - Fighter (per-character hurtboxes + movesets), projectiles
// Runs on the engine's FX API (fx.js), fixed 60Hz step() and camera from game.js.
const projectiles = [];
let showHitboxes = false;
window.addEventListener('keydown', e => { if (e.key === 'F2') showHitboxes = !showHitboxes; });

// ---- ground cracks (Box-er slams etc.) ----
const decals = [];
function addCrack(x, size) {
  const lines = [];
  for (let i = 0; i < 7; i++) {
    const dir = i < 4 ? 1 : -1, len = size * (0.4 + Math.random() * 0.7);
    const pts = [[0, 0]]; let px = 0, py = 0;
    for (let j = 0; j < 4; j++) { px += dir * len / 4; py += (Math.random() - 0.3) * 7; pts.push([px, Math.max(-2, py)]); }
    lines.push(pts);
  }
  if (decals.length > 5) decals.shift();
  decals.push({ x, life: 110, max: 110, lines });
}
function resetFighterFX() { projectiles.length = 0; decals.length = 0; }

// ---- per-character impact particles ----
function themeBurst(id, x, y, pw, dir) {
  const a = dir > 0 ? 0 : Math.PI, n = 6 + pw * 5;
  switch (id) {
    case 0: burst(x, y, ['#ff6a00', '#ffd54a', '#fff'], n + 4, 9, { type: 'spark', dir: a, spread: 2.4, g: 0.3, life: 22 }); break;
    case 1: burst(x, y, ['#e74c3c', '#c0392b', '#ff7961'], n + 4, 6, { type: 'dot', g: 0.35, size: 5, life: 30 }); break;
    case 2: burst(x, y, ['#fff', '#f3d9b1', '#c68642'], n, 4.5, { type: 'petal', g: 0.1, size: 4, life: 28 }); break;
    case 3: burst(x, y, ['#2ecc71', '#27ae60', '#fff'], n, 5.5, { type: 'petal', g: 0.25, size: 4, life: 30 }); break;
    case 4: burst(x, y, ['#c9a06a', '#a67c4a', '#e8c898'], n + 6, 7, { type: 'dot', g: 0.4, size: 7, life: 32 }); dustPuff(x, y + 30, 3 + pw * 2, 0); break;
    case 5: burst(x, y, ['#4fc3ff', '#ffe14a', '#fff'], n, 6, { type: 'star', g: 0.1, size: 4, life: 26 }); break;
    case 6: burst(x, y, ['#e8c36a', '#d2a35f', '#fff'], n, 6, { type: 'spark', dir: a, spread: 2.2, g: 0.2 }); dustPuff(x, y + 20, 2, dir); break;
    case 7: burst(x, y, ['#e0e0e0', '#ff4d4d', '#ffd54a'], n + 4, 9, { type: 'spark', dir: a, spread: 3, g: 0.2 });
      if (pw >= 1) FX.rings.push({ x, y, r: 6, max: 60 + pw * 25, life: 12, t: 0, kind: 'ring', color: '#ffd54a' }); break;
  }
}

function spawnProj(owner, spec, dirOverride) {
  const f = dirOverride || owner.facing;
  const w = spec.w || spec.r * 2, h = spec.h || spec.r * 2;
  const x0 = f > 0 ? owner.x + owner.w : owner.x;
  let y0 = owner.y + (spec.oy === undefined ? 0.4 : spec.oy) * owner.h;
  if (spec.ground) y0 = GROUND_Y - h / 2;
  if (projectiles.length > 24) projectiles.shift();
  if (spec.kind === 'shock' && !dirOverride) addCrack(owner.cx + f * owner.w * 0.5, 70);
  projectiles.push({
    owner, x: x0, y: y0, vx: spec.vx * f, vy: spec.vy || 0, g: spec.g || 0, w, h,
    dmg: spec.dmg, knock: spec.knock, stun: spec.stun || 14, life: spec.life, kind: spec.kind,
    bounce: spec.bounce || 0, pull: spec.pull || 0, dir: f, ground: !!spec.ground, rot: 0, t: 0
  });
}

function updateProjectiles(a, b) {
  const dt = 1;
  for (let i = decals.length - 1; i >= 0; i--) if (--decals[i].life <= 0) decals.splice(i, 1);
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.t += dt; p.life -= dt;
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vx * 0.05 * dt;
    if (!p.ground && p.y + p.h / 2 > GROUND_Y) {
      p.y = GROUND_Y - p.h / 2;
      if (p.bounce > 0) { p.vy = -Math.abs(p.vy) * 0.7; p.bounce--; dustPuff(p.x, GROUND_Y, 3, 0); }
      else if (p.g > 0) p.life = Math.min(p.life, 6);
    }
    let dead = p.life <= 0 || p.x < -60 || p.x > W + 60;
    const opp = p.owner === a ? b : a;
    if (!dead && opp && opp.state !== 'dead' && opp.invuln <= 0 &&
        p.x - p.w / 2 < opp.x + opp.w && p.x + p.w / 2 > opp.x && p.y - p.h / 2 < opp.y + opp.h && p.y + p.h / 2 > opp.y) {
      dealHit(p.owner, opp, p);
      if (p.kind !== 'shock' && !(p.kind === 'ball' && p.bounce > 0)) dead = true;
      else if (p.kind === 'shock') dead = true;
    }
    if (dead) projectiles.splice(i, 1);
  }
}

function drawProjectiles() {
  for (const d of decals) {
    ctx.save(); ctx.translate(d.x, GROUND_Y + 8); ctx.globalAlpha = Math.min(1, d.life / 40) * 0.85;
    ctx.strokeStyle = '#120a22'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const l of d.lines) { ctx.beginPath(); l.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
    ctx.restore();
  }
  for (const p of projectiles) {
    ctx.save(); ctx.translate(p.x, p.y);
    if (p.kind === 'tomato') {
      ctx.rotate(p.rot * 3);
      ctx.fillStyle = '#e74c3c'; ctx.strokeStyle = '#3a0f0a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.28); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#27ae60'; ctx.fillRect(-4, -p.w / 2 - 2, 8, 4);
    } else if (p.kind === 'ball') {
      ctx.rotate(p.rot * 2);
      const r = p.w / 2;
      ctx.fillStyle = '#f6f6f6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1c1c20'; ctx.beginPath();
      for (let i = 0; i < 5; i++) { const a = i * 1.2566; ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); }
      ctx.closePath(); ctx.fill();
    } else if (p.kind === 'shock') {
      const k = Math.max(0, p.life / 26);
      ctx.scale(Math.sign(p.vx) || 1, 1);
      ctx.fillStyle = `rgba(255,220,140,${0.4 + 0.5 * k})`; ctx.strokeStyle = '#7a4a1f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-p.w / 2, p.h / 2); ctx.lineTo(-p.w / 4, -p.h / 2 + 4); ctx.lineTo(p.w / 2, p.h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (p.kind === 'lasso') {
      const o = p.owner, ox = o.cx + o.facing * 14 - p.x, oy = o.y + o.h * 0.4 - p.y;
      ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ox, oy); ctx.stroke();
      ctx.strokeStyle = '#d2a35f'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, p.rot, 0, 6.28); ctx.stroke();
    }
    ctx.restore();
  }
}

// Generic hit resolution (melee boxes and projectiles share it)
function dealHit(att, opp, b) {
  let dmg = Math.max(1, Math.round(b.dmg * att.damageMul));
  const dir = b.both ? (opp.cx > att.cx ? 1 : -1) : (b.dir || att.facing);
  const hx = (dir > 0 ? opp.x : opp.x + opp.w) - dir * 6, hy = opp.y + opp.h * 0.4;
  const melee = !b.owner;
  att.hitConnected = true;

  if (opp.state === 'block') {
    if (opp.blockT <= 7) {                                   // PARRY: block just before impact
      opp.invuln = 14; opp.hitFlash = 0;
      if (melee) { att.cancelMove(); att.state = 'hit'; att.stateTimer = 24; att.vx = -dir * 5; att.invuln = 0; }
      hitSpark(hx, hy, 2, '#7fdcff', -dir); FX.hitstop = 9; flashScreen(0.4, '#7fdcff'); shakeScreen(5);
      floatText(opp.cx, opp.y - 30, 'PARRY!', '#7fdcff', 28);
      opp.state = 'idle'; opp.blockT = 99;
      return;
    }
    const pw = dmg >= 12 ? 2 : dmg >= 6 ? 1 : 0;
    opp.hp -= Math.max(1, Math.round(dmg * 0.25));
    opp.vx += dir * 3.5; opp.state = 'block'; opp.stateTimer = 10; opp.trailDelay = 20;
    guardSpark(hx, hy, dir); FX.hitstop = 2 + pw; shakeScreen(2 + pw);
  } else if (opp.hasArmor()) {
    opp.hp -= Math.max(1, Math.round(dmg * 0.8));
    opp.hitFlash = 4; opp.trailDelay = 20;
    hitSpark(hx, hy, 0, '#ffd54a', dir); FX.hitstop = 2; shakeScreen(3);
  } else {
    // counter hit: caught mid-attack; combo scaling keeps long strings fair
    const counter = !!opp.mv;
    if (att.comboTimer > 0 && att.combo >= 2) dmg = Math.max(1, Math.round(dmg * Math.max(0.5, 1 - 0.1 * (att.combo - 1))));
    if (counter) dmg = Math.round(dmg * 1.25);
    const pw = dmg >= 12 ? 2 : dmg >= 6 ? 1 : 0;
    const stunScale = att.comboTimer > 0 ? Math.max(0.65, 1 - 0.07 * att.combo) : 1;
    opp.hp -= dmg;
    opp.vx += dir * b.knock;
    if (b.pull) opp.vx = -dir * b.pull;
    opp.vy = b.launch !== undefined ? b.launch : -4;
    opp.onGround = false;
    const wasHit = opp.state === 'hit';
    opp.cancelMove();
    opp.state = 'hit'; opp.stateTimer = Math.round((b.stun || 15) * stunScale);
    opp.kdPending = (wasHit && opp.kdPending) || (b.launch !== undefined && b.launch <= -8) || b.knock >= 11;
    opp.invuln = b.inv !== undefined ? b.inv : 6;
    opp.hitCooldown = 20; opp.hitFlash = 5; opp.trailDelay = 28; opp.dashT = 0;
    hitSpark(hx, hy, pw, LOOKS[att.charId].fxColor || att.accent, dir);
    themeBurst(att.charId, hx, hy, pw, dir);
    FX.hitstop = 3 + pw * 3 + (counter ? 3 : 0); shakeScreen(4 + pw * 5);
    FX.zoomPunch = Math.max(FX.zoomPunch, 0.02 + pw * 0.015);
    if (pw === 2) flashScreen(0.35, att.accent);
    if (counter) { flashScreen(0.22, '#ff5a3c'); floatText(hx, hy - 80, 'COUNTER!', '#ff5a3c', 26); }
    att.combo++; att.comboTimer = 70;
    // cornered victims push the attacker back instead of sliding away
    if (melee && (opp.x <= 18 || opp.x + opp.w >= W - 18)) att.vx -= dir * Math.max(3, b.knock * 0.7);
  }
  if (opp.hp <= 0) {
    opp.hp = 0; opp.state = 'dead'; opp.deadT = 0; opp.cancelMove(); opp.kdPending = false;
    opp.vy = -9; opp.vx = dir * 7; opp.onGround = false;
    flashScreen(0.8, '#fff'); shakeScreen(16);
  }
}

// ---- Victory choreography: body transform + one-shot FX per character ----
const WIN_LINES = ['FORGED!', 'TOMATASTIC!', 'WOOF!', 'GOOOL!', 'CRUSHED!', 'SKY HIGH!', 'YEEHAW!', 'CHAMPION!'];
function winXform(f, t) {
  const o = f._wx, fc = f.facing, PI = Math.PI;
  o.dy = 0; o.rot = 0; o.sx = 1; o.sy = 1;
  switch (f.charId) {
    case 0: o.dy = -Math.abs(Math.sin(t * 0.11)) * 12; o.rot = Math.sin(t * 0.22) * 0.05; break;
    case 1: { const c = t % 150; if (c < 40) o.sx = Math.cos(c / 40 * PI * 2);            // pirouette
      o.dy = -Math.abs(Math.sin(t * 0.13)) * 22; const q = Math.cos(t * 0.26); o.sy = 1 + 0.07 * q; o.sx *= 1 - 0.07 * q; break; }
    case 2: { const c = t % 170; if (c < 36) { o.dy = -Math.sin(c / 36 * PI) * 80; o.rot = -fc * (c / 36) * PI * 2; }   // backflip
      else o.dy = -Math.abs(Math.sin(t * 0.2)) * 12; break; }
    case 3: o.dy = -Math.abs(Math.sin(t * 0.14)) * 10; o.rot = Math.sin(t * 0.14) * 0.06; break;
    case 4: { const c = t % 72; o.dy = c < 22 ? -Math.sin(c / 22 * PI) * 24 : 0; if (c >= 22 && c < 30) { o.sy = 0.9; o.sx = 1.1; } break; }   // stomp
    case 5: { const c = t % 96; if (c < 64) { o.dy = -Math.sin(c / 64 * PI) * 120; o.rot = -fc * (c / 64) * PI * 4; }   // double flip
      else if (c < 74) { o.sy = 0.9; o.sx = 1.08; } break; }
    case 6: o.rot = Math.sin(t * 0.06) * 0.04 - 0.03; o.dy = -Math.abs(Math.sin(t * 0.1)) * 4; break;
    case 7: o.dy = -Math.abs(Math.sin(t * 0.17)) * 9; o.rot = Math.sin(t * 0.17) * 0.03; break;
  }
  return o;
}
function winFx(f, t) {
  const top = f.y - 20;
  if (t === 1) {   // confetti burst + shout
    burst(f.cx, f.y + f.h * 0.3, [f.accent, '#fff', '#ffe14a', '#4fc3ff'], 34, 9, { type: 'star', dir: -Math.PI / 2, spread: 2.8, g: 0.25, life: 55, size: 4 });
    flashScreen(0.25, f.accent); floatText(f.cx, top - 20, WIN_LINES[f.charId], f.accent, 30);
    FX.rings.push({ x: f.cx, y: f.y + f.h * 0.5, r: 10, max: 120, life: 18, t: 0, kind: 'ring', color: f.accent });
  }
  switch (f.charId) {
    case 0: if (t % 6 === 0) burst(f.cx + f.facing * 14, f.y + f.h * 0.05, ['#ff6a00', '#ffd54a', '#fff'], 3, 6, { type: 'spark', dir: -Math.PI / 2, spread: 1.6, g: 0.2, life: 20, size: 3 }); break;
    case 1: if (t % 150 === 40) { burst(f.cx, f.y + f.h * 0.5, ['#e74c3c', '#ff7961'], 12, 6, { type: 'dot', g: 0.3, size: 5, life: 26 }); floatText(f.cx, top, 'SPLAT!', '#ff7961', 24); } break;
    case 2: if (t % 170 === 36) { dustPuff(f.cx, GROUND_Y, 8, 0); floatText(f.cx, top, 'WOOF!', '#f1c40f', 28); } break;
    case 3: if (t % 140 === 70) floatText(f.cx, top, 'GOOOL!', '#fff', 26); break;
    case 4: if (t % 72 === 22) { shakeScreen(6); dustPuff(f.cx, GROUND_Y, 10, 0); addCrack(f.cx, 80); FX.rings.push({ x: f.cx, y: GROUND_Y - 4, r: 10, max: 90, life: 12, t: 0, kind: 'ring', color: '#f39c12' }); } break;
    case 5: if (t % 96 === 64) { dustPuff(f.cx, GROUND_Y, 8, 0); shakeScreen(2); burst(f.cx, GROUND_Y - 6, ['#4fc3ff', '#ffe14a'], 8, 5, { type: 'star', dir: -Math.PI / 2, spread: 2, life: 24 }); } break;
    case 6: if (t % 120 === 60) floatText(f.cx, top, 'YEEHAW!', '#d35400', 26); break;
    case 7: if (t % 130 === 90) { flashScreen(0.18, '#ffd54a'); FX.rings.push({ x: f.cx, y: f.y + f.h * 0.3, r: 8, max: 100, life: 14, t: 0, kind: 'ring', color: '#ffd54a' }); floatText(f.cx, top, 'K.O.!', '#ff4d4d', 28); } break;
  }
}
// props that belong to the celebration (drawn in world space, over the sprite)
function drawWinProps(f, t) {
  const fc = f.facing;
  if (f.charId === 3) {           // juggling the ball
    const k = (t % 44) / 44, bx = f.cx + fc * Math.sin(t * 0.07) * 30, by = f.y - 16 - Math.sin(k * Math.PI) * 70, r = 11;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(t * 0.2);
    ctx.fillStyle = '#f6f6f6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1c1c20'; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566; ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); } ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (f.charId === 6) {    // twirling lasso
    const hx = f.cx + fc * 12, hy = f.y - 10;
    ctx.save(); ctx.translate(hx, hy - 12); ctx.rotate(Math.sin(t * 0.12) * 0.15);
    ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, 0); ctx.stroke();
    ctx.strokeStyle = '#d2a35f'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(0, -6, 38, 7 + 4 * Math.abs(Math.sin(t * 0.3)), 0, 0, 6.28); ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, -6, 42, 9, 0, t * 0.3, t * 0.3 + 2); ctx.stroke();
    ctx.restore();
  }
}

class Fighter {
  constructor(charId, side, isPlayer) {
    const c = CHARACTERS[charId], d = CHAR_DEF[charId];
    this.def = d; this.charId = charId;
    this.name = c.name; this.color = c.color; this.accent = c.accent;
    this.speed = c.speed; this.jumpForce = c.jump;
    this.maxHp = c.hp; this.hp = c.hp; this.damageMul = c.damageMul; this.specialty = c.specialty;
    this.side = side; this.isPlayer = isPlayer;
    this.w = d.w; this.h = d.h;
    this.x = (side === 1 ? W * 0.28 : W * 0.72) - this.w / 2;
    this.y = GROUND_Y - this.h; this.vx = 0; this.vy = 0;
    this.hpTrail = c.hp; this.trailDelay = 0; this.combo = 0; this.comboTimer = 0;
    this.facing = side === 1 ? 1 : -1;
    this.onGround = true;
    this.state = 'idle'; this.stateTimer = 0;
    this.attackBox = null; this.hitCooldown = 0; this.invuln = 0;
    // move system
    this.mv = null; this.mvT = 0; this.mvType = ''; this.mvKey = ''; this.chain = 0; this.chainKey = ''; this.chainT = 0;
    this.winIdx = -1; this.winHit = false; this.spawned = 0; this.vyDone = false; this.landed = false; this.hitConnected = false;
    this.cd = { attack: 0, strong: 0, special: 0 };
    this.prev = {};
    this.buf = null; this.lastTap = { d: 0, t: 99 }; this.dashT = 0; this.dashDir = 0; this.dashCd = 0;
    this.blockT = 0; this.kdPending = false; this.downT = 0; this.trail = []; this.ghosts = []; this.fc = 0; this.winT = 0; this._wx = { dy: 0, rot: 0, sx: 1, sy: 1 };
    this.air = 1;
    // animation
    this.animT = 0; this.wph = 0; this.hitFlash = 0; this.deadT = 0;
    this._P = { ps: 'idle', t: 0, wph: 0, anim: '', ex: 0, bk: 0, k: 0, el: 0, p: 0, vy: 0, vx: 0, w: d.bw, h: d.bh, flash: false, atk: false, mv: null, landed: false };
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }
  get attacking() { return !!this.mv; }

  physics() {
    this.vy += 0.7; this.y += this.vy; this.x += this.vx; this.vx *= 0.85;
    if (this.bottom >= GROUND_Y) {
      this.y = GROUND_Y - this.h;
      if (this.vy > 4) { dustPuff(this.cx, GROUND_Y, this.vy > 9 ? 9 : 5, 0); if (this.state === 'dead') shakeScreen(4); }
      this.vy = 0; this.onGround = true; this.air = 1;
    } else this.onGround = false;
    let wall = 0;
    if (this.x < 14) { this.x = 14; if (this.vx < -3.5) wall = -1; }
    if (this.x + this.w > W - 14) { this.x = W - 14 - this.w; if (this.vx > 3.5) wall = 1; }
    if (wall && (this.state === 'hit' || this.state === 'down' || this.state === 'dead')) {
      this.vx = 0; shakeScreen(5); dustPuff(this.cx, this.y + this.h * 0.7, 5, -wall);
      hitSpark(wall < 0 ? 14 : W - 14, this.y + this.h * 0.4, 0, '#fff', -wall);
    }
  }

  hasArmor() { const m = this.mv; return !!(m && m.armor && this.mvT >= m.armor[0] && this.mvT <= m.armor[1]); }
  cancelMove() { this.mv = null; this.attackBox = null; this.chainT = 0; }

  update(dt, opponent, input, canAct) {
    this.animT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0; }
    if (this.trailDelay > 0) this.trailDelay -= dt;
    else if (this.hpTrail > this.hp) this.hpTrail = Math.max(this.hp, this.hpTrail - 0.7);
    if (this.state === 'dead') { this.deadT += dt; this.physics(); return; }
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.stateTimer -= dt;
    this.chainT -= dt;
    this.cd.attack -= dt; this.cd.strong -= dt; this.cd.special -= dt;
    this.dashCd -= dt; this.lastTap.t++; this.fc++;

    this.physics();
    this.blockT = this.state === 'block' ? this.blockT + 1 : 0;
    // swing trails / afterimages
    for (let i = this.trail.length - 1; i >= 0; i--) if (--this.trail[i].life <= 0) this.trail.splice(i, 1);
    for (let i = this.ghosts.length - 1; i >= 0; i--) if (--this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
    if ((Math.abs(this.vx) > 7 || this.dashT > 0) && this.state !== 'hit' && this.state !== 'down' && (this.fc & 1) === 0) {
      this.ghosts.push({ x: this.x, y: this.y, facing: this.facing, life: 12, P: Object.assign({}, this.pose()) });
      if (this.ghosts.length > 6) this.ghosts.shift();
      if (this.onGround) burst(this.cx - this.facing * this.w * 0.5, this.y + this.h * 0.5, '#fff', 1, 5, { type: 'spark', dir: this.facing > 0 ? Math.PI : 0, spread: 0.3, life: 10, size: 2, g: 0 });
    }
    if (this.onGround) this.wph += Math.abs(this.vx) * 0.1 * dt;
    if (this.state === 'win') { if (this.onGround) this.vx *= 0.8; this.winT += dt; winFx(this, Math.round(this.winT)); return; }

    if (opponent && !this.mv && this.state !== 'hit' && this.state !== 'down') this.facing = opponent.cx > this.cx ? 1 : -1;

    if (this.state === 'down') {                 // knockdown: lie, then rise invulnerable
      this.downT -= dt; this.invuln = Math.max(this.invuln, 1); this.vx *= 0.8;
      if (this.downT <= 0) { this.state = 'idle'; this.invuln = 8; dustPuff(this.cx, GROUND_Y, 4, 0); }
      return;
    }
    if (this.state === 'hit' || (this.state === 'block' && !this.isPlayer)) {
      if (this.state === 'hit' && this.kdPending && this.stateTimer <= 0 && this.onGround) {
        this.kdPending = false; this.state = 'down'; this.downT = 38; this.invuln = 38;
        shakeScreen(5); dustPuff(this.cx, GROUND_Y, 8, 0);
        return;
      }
      if (this.stateTimer <= 0 && !(this.kdPending && !this.onGround)) { this.state = 'idle'; this.kdPending = false; }
      return;
    }
    if (!canAct) {
      if (this.mv) this.cancelMove();
      if (this.onGround && this.state !== 'idle') this.state = 'idle';
      return;
    }

    if (this.isPlayer) this.handleInput(input || {});
    else this.ai(opponent);

    if (this.mv) {
      this.updateMove(dt);
      if (this.attackBox && opponent && opponent.state !== 'dead' && opponent.invuln <= 0 && this.checkHit(opponent)) {
        dealHit(this, opponent, this.attackBox);
        this.winHit = true; this.attackBox = null;
      }
      if (this.mv && this.stateTimer <= 0) this.endMove();
    }
  }

  handleInput(inp) {
    const pr = this.prev, edge = k => !!inp[k] && !pr[k];
    const pAtk = edge('atk'), pStr = edge('strong'), pSp = edge('special'), pJump = edge('jump'), pL = edge('left'), pR = edge('right');
    for (const k of ['atk', 'strong', 'special', 'jump', 'left', 'right']) pr[k] = !!inp[k];
    // input buffer: a press is remembered for 10 frames so tight combos/cancels never drop
    if (this.buf && --this.buf[1] <= 0) this.buf = null;
    if (pAtk) this.buf = ['attack', 10]; else if (pStr) this.buf = ['strong', 10]; else if (pSp) this.buf = ['special', 10];

    if (this.mv) {
      if (this.buf) {
        const t = this.buf[0], rank = { attack: 0, strong: 1, special: 2 };
        if (t === this.mvType && this.canCancel()) { if (this.tryAttack(t, true)) this.buf = null; }
        else if (this.hitConnected && rank[t] > rank[this.mvType] && this.mvT >= ((this.mv.win && this.mv.win[0].s) || 0)) {
          const key = this.moveFor(t), m = this.def.moves[key];
          if (m && (Array.isArray(m) || this.cd[t] <= 0)) {           // on-hit cancel: normal -> strong -> special
            this.cancelMove(); this.tryAttack(t); this.buf = null;
            FX.rings.push({ x: this.cx, y: this.y + this.h * 0.45, r: 8, max: 54, life: 10, t: 0, kind: 'ring', color: this.accent });
          }
        }
      }
      return;
    }
    if (inp.block && this.onGround) { this.state = 'block'; this.vx *= 0.3; this.dashT = 0; return; }

    // double-tap left/right = dash (back-dash is briefly invulnerable)
    const tap = d => {
      if (this.lastTap.d === d && this.lastTap.t < 15 && this.onGround && this.dashCd <= 0) {
        this.dashT = 11; this.dashDir = d; this.dashCd = 26; this.lastTap = { d: 0, t: 99 };
        if (d !== this.facing) this.invuln = Math.max(this.invuln, 9);
        dustPuff(this.cx, GROUND_Y, 5, -d);
      } else this.lastTap = { d, t: 0 };
    };
    if (pL) tap(-1); if (pR) tap(1);
    if (this.dashT > 0) {
      this.dashT--; this.vx = this.dashDir * this.speed * 2.6; this.state = 'walk';
      if (!this.buf) return;
      this.dashT = 0;
    }

    if (inp.left) { this.vx = -this.speed; this.state = 'walk'; }
    else if (inp.right) { this.vx = this.speed; this.state = 'walk'; }
    else if (this.onGround) this.state = 'idle';

    if (inp.jump && this.onGround) { this.vy = -this.jumpForce; this.onGround = false; this.state = 'jump'; dustPuff(this.cx, GROUND_Y, 6, 0); }
    else if (pJump && !this.onGround && this.def.doubleJump && this.air > 0) { this.air--; this.vy = -this.jumpForce * 0.85; this.state = 'jump'; dustPuff(this.cx, this.bottom, 5, 0); }

    if (this.buf) { if (this.tryAttack(this.buf[0])) this.buf = null; }
    else if (inp.atk) this.tryAttack('attack');
  }

  moveFor(type) {
    const mvs = this.def.moves;
    return (!this.onGround && mvs[type + 'Air']) ? type + 'Air' : type;
  }

  canCancel() {
    const m = this.mv; if (!m || !m.win) return false;
    const key = this.moveFor(this.mvType);
    return key === this.mvKey && Array.isArray(this.def.moves[key]) && this.mvT >= m.win[m.win.length - 1].e;
  }

  tryAttack(type, cancel) {
    const key = this.moveFor(type), m = this.def.moves[key];
    if (!m) return false;
    let mv = m, idx = 0;
    if (Array.isArray(m)) {
      if (cancel) { idx = this.chain + 1; if (idx >= m.length) return false; }
      else if (this.chainT > 0 && this.chainKey === key) { idx = this.chain + 1; if (idx >= m.length) idx = 0; }
      if (idx === 0 && !cancel && this.cd[type] > 0) return false;
      mv = m[idx];
    } else if (this.cd[type] > 0) return false;
    this.startMove(type, key, mv, idx);
    return true;
  }

  startMove(type, key, mv, idx) {
    this.state = type; this.mv = mv; this.mvType = type; this.mvKey = key; this.chain = idx; this.chainKey = key;
    this.mvT = 0; this.stateTimer = mv.dur; this.winIdx = -1; this.winHit = false; this.spawned = 0;
    this.vyDone = false; this.landed = false; this.attackBox = null; this.chainT = 0; this.hitConnected = false;
    if (mv.cd) this.cd[type] = mv.cd;
    if (mv.hang !== undefined && !this.onGround) this.vy = mv.hang;
    if (mv.title) {
      floatText(this.cx, this.y - 24, mv.title, this.accent, 26);
      flashScreen(0.16, this.accent); FX.zoomPunch = Math.max(FX.zoomPunch, 0.03);
      FX.rings.push({ x: this.cx, y: this.y + this.h * 0.55, r: 10, max: 90, life: 14, t: 0, kind: 'ring', color: this.accent });
    }
  }

  endMove() {
    this.chainT = Array.isArray(this.def.moves[this.mvKey]) ? 16 : 0;
    this.mv = null; this.attackBox = null;
    this.state = this.onGround ? 'idle' : 'jump';
  }

  updateMove(dt) {
    const mv = this.mv;
    this.mvT += dt;
    const el = this.mvT;
    if (mv.vy0 && !this.vyDone && el >= mv.vy0[0]) { this.vy = mv.vy0[1]; this.vyDone = true; this.onGround = false; this.y -= 2; }
    if (mv.lunge && !this.landed && el >= mv.lunge[0] && el <= mv.lunge[1]) this.vx = this.facing * mv.lunge[2];
    if (mv.spawn) {
      for (let i = 0; i < mv.spawn.length; i++) {
        if (!(this.spawned & (1 << i)) && el >= mv.spawn[i].at) { this.spawned |= (1 << i); spawnProj(this, mv.spawn[i].p); }
      }
    }
    if (mv.endOnLand && !this.landed && this.onGround && el > (mv.vy0 ? mv.vy0[0] + 3 : 2)) {
      this.landed = true; this.attackBox = null; this.vx = 0;
      this.stateTimer = Math.min(this.stateTimer, mv.recover || 8);
      shakeScreen(9); FX.hitstop = Math.max(FX.hitstop, 3);
      if (mv.landFx) for (const s of mv.landFx) { spawnProj(this, s, 1); spawnProj(this, s, -1); }
      dustPuff(this.cx, GROUND_Y, 10, 0);
      if (mv.landFx) addCrack(this.cx, 90);
    }
    if (!this.landed && mv.win) {
      let idx = -1;
      for (let i = 0; i < mv.win.length; i++) if (el >= mv.win[i].s && el < mv.win[i].e) { idx = i; break; }
      if (idx !== this.winIdx) { this.winIdx = idx; this.winHit = false; }
      this.attackBox = (idx >= 0 && !this.winHit) ? this.buildBox(mv, mv.win[idx]) : null;
      if (idx >= 0) {
        const w = mv.win[idx], body = w.body !== undefined ? w.body : mv.body, both = w.both !== undefined ? w.both : mv.both;
        if (!body && !both) { const sw = this.buildBox(mv, w); this.trail.push({ x: sw.x, y: sw.y, w: sw.w, h: sw.h, life: 7, max: 7 }); }
      }
    }
  }

  buildBox(mv, w) {
    const g = (k, d) => (w[k] !== undefined ? w[k] : mv[k] !== undefined ? mv[k] : d);
    const rw = g('rw', 36), hy = g('hy', 0.12), hh = g('hh', 0.6);
    let x, bw;
    if (g('both', false)) { x = this.x - rw; bw = this.w + rw * 2; }
    else if (g('body', false)) { bw = this.w + rw; x = this.facing > 0 ? this.x : this.x - rw; }
    else { bw = rw; x = this.facing > 0 ? this.x + this.w : this.x - rw; }
    return {
      x, y: this.y + hy * this.h, w: bw, h: hh * this.h, dmg: g('dmg', 5), knock: g('knock', 3), stun: g('stun', 12),
      inv: g('inv', 6), launch: g('launch', undefined), dir: this.facing, both: g('both', false), type: this.mvType
    };
  }

  checkHit(opp) {
    const a = this.attackBox;
    return a.x < opp.x + opp.w && a.x + a.w > opp.x && a.y < opp.y + opp.h && a.y + a.h > opp.y;
  }

  gapTo(o) { return Math.max(0, Math.abs(this.cx - o.cx) - (this.w + o.w) / 2); }

  ai(opp) {
    if (!opp) return;
    if (this.mv) {
      const g = this.gapTo(opp);
      if (this.canCancel() && Math.random() < 0.3 && g < 90) this.tryAttack(this.mvType, true);
      else if (this.hitConnected && this.mvType !== 'special' && Math.random() < 0.12) {
        const t = this.mvType === 'attack' ? (Math.random() < 0.5 ? 'strong' : 'special') : 'special';
        const key = this.moveFor(t), m = this.def.moves[key];
        if (m && !Array.isArray(m) && this.cd[t] <= 0 && m.ai && g >= m.ai[0] && g <= m.ai[1]) { this.cancelMove(); this.tryAttack(t); }
      }
      return;
    }
    const gap = this.gapTo(opp), dir = opp.cx > this.cx ? 1 : -1, pref = this.def.pref;
    // choose an attack
    if (opp.state !== 'dead' && Math.random() < 0.07) {
      let total = 0; const cand = [];
      for (const t of ['attack', 'strong', 'special']) {
        const key = this.moveFor(t), m = this.def.moves[key]; if (!m) continue;
        const first = Array.isArray(m) ? m[0] : m;
        if (!first.ai || gap < first.ai[0] || gap > first.ai[1]) continue;
        if (!Array.isArray(m) && this.cd[t] > 0) continue;
        cand.push([t, first.ai[2]]); total += first.ai[2];
      }
      if (total > 0) {
        let r = Math.random() * total;
        for (const c of cand) { r -= c[1]; if (r <= 0) { this.tryAttack(c[0]); return; } }
      }
    }
    if (opp.mv && gap < 70 && Math.random() < 0.035) { this.state = 'block'; this.stateTimer = 18; this.vx *= 0.3; return; }
    const nearWall = this.x < 50 || this.x + this.w > W - 50;
    if (gap > pref[1]) {
      this.vx = dir * this.speed * 0.9; this.state = 'walk';
      if (Math.random() < (this.def.aiJump || 0.02) && this.onGround) { this.vy = -this.jumpForce; this.onGround = false; this.state = 'jump'; }
    } else if (gap < pref[0] && pref[0] > 40 && !nearWall) {
      this.vx = -dir * this.speed * 0.8; this.state = 'walk';
    } else if (this.onGround) this.state = 'idle';
  }

  pose() {
    const P = this._P;
    P.t = this.animT; P.wph = this.wph; P.vy = this.vy; P.vx = this.vx * this.facing; P.w = this.w; P.h = this.h;
    P.flash = this.hitFlash > 0; P.landed = this.landed; P.deadT = this.deadT;
    let ps = this.state;
    if (ps === 'idle' || ps === 'walk' || ps === 'jump') ps = !this.onGround ? 'jump' : (Math.abs(this.vx) > 0.7 ? 'walk' : 'idle');
    P.ps = ps; P.atk = false; P.anim = ''; P.ex = 0; P.bk = 0; P.k = 0; P.el = 0; P.p = 0; P.mv = null;
    const mv = this.mv;
    if (mv) {
      const el = this.mvT;
      P.atk = true; P.anim = mv.anim; P.el = el; P.p = Math.min(1, el / mv.dur); P.mv = mv;
      const ws = mv.win || mv.pw;
      if (ws) {
        let pe = 0, i = 0, rec = 0;
        for (; i < ws.length; i++) {
          const w = ws[i];
          if (el < w.s) { P.bk = (el - pe) / Math.max(1, w.s - pe); break; }
          if (el < w.e) { P.ex = 1; break; }
          pe = w.e;
        }
        if (i === ws.length) { rec = Math.min(1, (el - pe) / Math.max(1, mv.dur - pe)); P.ex = 1 - rec; }
        P.k = Math.min(i, ws.length - 1);
      }
      if (this.landed) P.ex = 0.3;
    }
    return P;
  }

  draw() {
    const P = this.pose();
    const wx = this.state === 'win' ? winXform(this, this.winT) : null;
    // swing trails
    for (const t of this.trail) {
      const k = t.life / t.max;
      ctx.save(); ctx.globalAlpha = k * 0.5; ctx.fillStyle = this.accent;
      ctx.beginPath(); ctx.ellipse(t.x + t.w / 2, t.y + t.h / 2, t.w / 2, Math.max(4, t.h / 2.6), 0, 0, 6.28); ctx.fill();
      ctx.globalAlpha = k * 0.7; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    // afterimages
    for (const g of this.ghosts) {
      ctx.save(); ctx.globalAlpha = (g.life / 12) * 0.35;
      ctx.translate(g.x + this.w / 2, g.y + this.h); ctx.scale(g.facing * SPR_S, SPR_S);
      drawSprite(ctx, this.charId, g.P); ctx.restore();
    }
    // ground shadow
    const air = Math.max(0, GROUND_Y - this.bottom) - (wx ? wx.dy : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(this.cx, GROUND_Y + 3, this.w * 0.6 * (1 - Math.min(0.5, air / 400)), 6, 0, 0, 6.28); ctx.fill();

    ctx.save();
    ctx.translate(this.cx, this.bottom);
    if (wx) { ctx.translate(0, wx.dy - this.h / 2); ctx.rotate(wx.rot); ctx.translate(0, this.h / 2); }
    if (this.state === 'dead' || this.state === 'down') {
      let k;
      if (this.state === 'dead') k = Math.min(1, this.deadT / 16);
      else { const t = this.downT; k = Math.max(0, Math.min(1, t > 30 ? (38 - t) / 8 : t < 12 ? t / 12 : 1)); }
      ctx.rotate(-this.facing * (Math.PI / 2) * k);
      ctx.translate(0, -this.w * 0.25 * k);
      P.ps = 'dead';
    }
    ctx.scale(this.facing * SPR_S * (wx ? wx.sx : 1), SPR_S * (wx ? wx.sy : 1));
    if (this.invuln > 2 && this.state === 'idle' && (this.fc & 2)) ctx.globalAlpha = 0.6;   // wake-up / dodge flicker
    drawSprite(ctx, this.charId, P);
    ctx.restore();

    if (wx) drawWinProps(this, this.winT);
    if (this.state === 'block') {
      const parry = this.blockT <= 7;
      ctx.strokeStyle = parry ? 'rgba(255,255,255,0.95)' : 'rgba(0,255,255,0.8)'; ctx.lineWidth = parry ? 5 : 3;
      ctx.beginPath(); ctx.ellipse(this.cx, this.y + this.h / 2, this.w / 2 + 12, this.h / 2 + 8, 0, 0, 6.28); ctx.stroke();
    }
    if (showHitboxes) {
      ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1; ctx.strokeRect(this.x, this.y, this.w, this.h);
      if (this.attackBox) { ctx.strokeStyle = '#f00'; ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.w, this.attackBox.h); }
    }
  }
}
