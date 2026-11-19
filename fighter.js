// CHROMATIC RESENHA - Fighter, projectiles and effects
const projectiles = [];
const fx = [];
let shakeT = 0;
let showHitboxes = false;
window.addEventListener('keydown', e => { if (e.key === 'F2') showHitboxes = !showHitboxes; });

function groundY() { return canvas.height - 80; }

function spawnFx(x, y, color, n, spd) {
  for (let i = 0; i < n; i++) {
    if (fx.length > 120) fx.shift();
    fx.push({ x, y, vx: (Math.random() - 0.5) * spd * 2, vy: -Math.random() * spd - 0.5, life: 16 + Math.random() * 10, max: 26, c: color, s: 2 + Math.random() * 3 });
  }
}
function updateFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const p = fx[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.25 * dt; p.life -= dt;
    if (p.life <= 0) fx.splice(i, 1);
  }
  if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
}
function drawFx() {
  for (const p of fx) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); }
  ctx.globalAlpha = 1;
}

function spawnProj(owner, spec, dirOverride) {
  const f = dirOverride || owner.facing;
  const w = spec.w || spec.r * 2, h = spec.h || spec.r * 2;
  const x0 = f > 0 ? owner.x + owner.w : owner.x;
  let y0 = owner.y + (spec.oy === undefined ? 0.4 : spec.oy) * owner.h;
  if (spec.ground) y0 = groundY() - h / 2;
  if (projectiles.length > 24) projectiles.shift();
  projectiles.push({
    owner, x: x0, y: y0, vx: spec.vx * f, vy: spec.vy || 0, g: spec.g || 0, w, h,
    dmg: spec.dmg, knock: spec.knock, stun: spec.stun || 14, life: spec.life, kind: spec.kind,
    bounce: spec.bounce || 0, pull: spec.pull || 0, dir: f, ground: !!spec.ground, rot: 0, t: 0
  });
}

function updateProjectiles(dt, a, b) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.t += dt; p.life -= dt;
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vx * 0.05 * dt;
    if (!p.ground && p.y + p.h / 2 > groundY()) {
      p.y = groundY() - p.h / 2;
      if (p.bounce > 0) { p.vy = -Math.abs(p.vy) * 0.7; p.bounce--; spawnFx(p.x, groundY(), '#fff', 3, 2); }
      else if (p.g > 0) p.life = Math.min(p.life, 6);
    }
    let dead = p.life <= 0 || p.x < -60 || p.x > canvas.width + 60;
    const opp = p.owner === a ? b : a;
    if (!dead && opp && opp.state !== 'dead' && opp.invuln <= 0 &&
        p.x - p.w / 2 < opp.x + opp.w && p.x + p.w / 2 > opp.x && p.y - p.h / 2 < opp.y + opp.h && p.y + p.h / 2 > opp.y) {
      dealHit(p.owner, opp, p);
      if (p.kind !== 'shock' && !(p.kind === 'ball' && p.bounce > 0)) dead = true;
      else if (p.kind === 'shock') dead = true;
      spawnFx(p.x, p.y, p.kind === 'tomato' ? '#e74c3c' : '#fff', 8, 3);
    }
    if (dead) projectiles.splice(i, 1);
  }
}

function drawProjectiles() {
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
  const dmg = Math.max(1, Math.round(b.dmg * att.damageMul));
  const dir = b.both ? (opp.cx > att.cx ? 1 : -1) : (b.dir || att.facing);
  const hx = Math.max(opp.x, Math.min(opp.x + opp.w, att.cx)) , hy = opp.y + opp.h * 0.4;
  att.hitConnected = true;
  if (opp.state === 'block') {
    opp.hp -= Math.max(1, Math.round(dmg * 0.25));
    opp.vx += dir * 3; opp.state = 'block'; opp.stateTimer = 10;
    spawnFx(opp.cx - dir * opp.w / 2 * -1, hy, '#0ff', 4, 2);
  } else if (opp.hasArmor()) {
    opp.hp -= Math.max(1, Math.round(dmg * 0.8));
    opp.hitFlash = 4;
    spawnFx(opp.cx, hy, '#ffd54a', 5, 3);
  } else {
    opp.hp -= dmg;
    opp.vx += dir * b.knock;
    if (b.pull) opp.vx = -dir * b.pull;
    opp.vy = b.launch !== undefined ? b.launch : -4;
    opp.cancelMove();
    opp.state = 'hit'; opp.stateTimer = b.stun || 15;
    opp.invuln = b.inv !== undefined ? b.inv : 6;
    opp.hitCooldown = 20; opp.hitFlash = 5;
    spawnFx(opp.cx, hy, att.accent, 6, 3 + b.knock * 0.2);
    if (dmg >= 10) shakeT = 6;
  }
  if (opp.hp <= 0) {
    opp.hp = 0; opp.state = 'dead'; opp.deadT = 0; opp.cancelMove(); shakeT = 10;
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
    this.x = (side === 1 ? canvas.width * 0.25 : canvas.width * 0.75) - this.w / 2;
    this.y = 0; this.vx = 0; this.vy = 0;
    this.facing = side === 1 ? 1 : -1;
    this.onGround = false;
    this.state = 'idle'; this.stateTimer = 0;
    this.attackBox = null; this.hitCooldown = 0; this.combo = 0; this.invuln = 0;
    // move system
    this.mv = null; this.mvT = 0; this.mvType = ''; this.mvKey = ''; this.chain = 0; this.chainKey = ''; this.chainT = 0;
    this.winIdx = -1; this.winHit = false; this.spawned = 0; this.vyDone = false; this.landed = false; this.hitConnected = false;
    this.cd = { attack: 0, strong: 0, special: 0 };
    this.prev = { atk: false, jump: false };
    this.air = 1;
    // animation
    this.animT = 0; this.wph = 0; this.hitFlash = 0; this.deadT = 0;
    this._P = { ps: 'idle', t: 0, wph: 0, anim: '', ex: 0, bk: 0, k: 0, el: 0, p: 0, vy: 0, vx: 0, w: this.w, h: this.h, flash: false, atk: false, mv: null, landed: false };
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get bottom() { return this.y + this.h; }

  physics() {
    this.vy += 0.7; this.y += this.vy; this.x += this.vx; this.vx *= 0.85;
    const gy = groundY();
    if (this.bottom > gy) { this.y = gy - this.h; this.vy = 0; this.onGround = true; this.air = 1; }
    else this.onGround = false;
    if (this.x < 20) this.x = 20;
    if (this.x + this.w > canvas.width - 20) this.x = canvas.width - 20 - this.w;
  }

  hasArmor() { const m = this.mv; return !!(m && m.armor && this.mvT >= m.armor[0] && this.mvT <= m.armor[1]); }
  cancelMove() { this.mv = null; this.attackBox = null; this.chainT = 0; }

  update(dt, opponent, input) {
    this.animT += dt;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.state === 'dead') { this.deadT += dt; this.physics(); return; }
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.stateTimer -= dt;
    this.chainT -= dt;
    this.cd.attack -= dt; this.cd.strong -= dt; this.cd.special -= dt;

    this.physics();
    if (this.onGround) this.wph += Math.abs(this.vx) * 0.1 * dt;

    if (opponent && !this.mv && this.state !== 'hit') this.facing = opponent.cx > this.cx ? 1 : -1;

    if (this.state === 'hit' || (this.state === 'block' && !this.isPlayer)) {
      if (this.stateTimer <= 0) this.state = 'idle';
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
    const pr = this.prev;
    const pAtk = inp.atk && !pr.atk, pJump = inp.jump && !pr.jump;
    pr.atk = !!inp.atk; pr.jump = !!inp.jump;

    if (this.mv) {
      if (pAtk && this.mvType === 'attack' && this.canCancel()) this.tryAttack('attack', true);
      return;
    }
    if (inp.block && this.onGround) { this.state = 'block'; this.vx *= 0.3; return; }
    if (inp.left) { this.vx = -this.speed; this.state = 'walk'; }
    else if (inp.right) { this.vx = this.speed; this.state = 'walk'; }
    else if (this.onGround) this.state = 'idle';

    if (inp.jump && this.onGround) { this.vy = -this.jumpForce; this.onGround = false; this.state = 'jump'; }
    else if (pJump && !this.onGround && this.def.doubleJump && this.air > 0) { this.air--; this.vy = -this.jumpForce * 0.85; this.state = 'jump'; spawnFx(this.cx, this.bottom, '#fff', 5, 2); }

    if (inp.atk) this.tryAttack('attack');
    else if (inp.strong) this.tryAttack('strong');
    else if (inp.special) this.tryAttack('special');
  }

  moveFor(type) {
    const mvs = this.def.moves;
    return (!this.onGround && mvs[type + 'Air']) ? type + 'Air' : type;
  }

  canCancel() {
    const m = this.mv; if (!m || !m.win) return false;
    const key = this.moveFor('attack');
    return key === this.mvKey && Array.isArray(this.def.moves[key]) && this.mvT >= m.win[m.win.length - 1].e;
  }

  tryAttack(type, cancel) {
    const key = this.moveFor(type), m = this.def.moves[key];
    if (!m) return false;
    let mv = m, idx = 0;
    if (Array.isArray(m)) {
      if (cancel) { idx = this.chain + 1; if (idx >= m.length) return false; }
      else if (this.chainT > 0 && this.chainKey === key) { idx = this.chain + 1; if (idx >= m.length) idx = 0; }
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
      shakeT = 8;
      if (mv.landFx) for (const s of mv.landFx) { spawnProj(this, s, 1); spawnProj(this, s, -1); }
      spawnFx(this.cx, this.bottom, '#d9b07a', 10, 4);
    }
    if (!this.landed && mv.win) {
      let idx = -1;
      for (let i = 0; i < mv.win.length; i++) if (el >= mv.win[i].s && el < mv.win[i].e) { idx = i; break; }
      if (idx !== this.winIdx) { this.winIdx = idx; this.winHit = false; }
      this.attackBox = (idx >= 0 && !this.winHit) ? this.buildBox(mv, mv.win[idx]) : null;
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
      if (this.mvType === 'attack' && this.canCancel() && Math.random() < 0.3 && this.gapTo(opp) < 80) this.tryAttack('attack', true);
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
    const nearWall = this.x < 50 || this.x + this.w > canvas.width - 50;
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
    const gy = groundY();
    // ground shadow
    const air = Math.max(0, gy - this.bottom);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(this.cx, gy + 2, this.w * 0.6 * (1 - Math.min(0.5, air / 400)), 5, 0, 0, 6.28); ctx.fill();

    ctx.save();
    ctx.translate(this.cx, this.bottom);
    if (this.state === 'dead') {
      const k = Math.min(1, this.deadT / 16);
      ctx.rotate(-this.facing * (Math.PI / 2) * k);
      ctx.translate(0, -this.w * 0.25 * k);
      P.ps = 'dead';
    }
    ctx.scale(this.facing, 1);
    drawSprite(ctx, this.charId, P);
    ctx.restore();

    if (this.state !== 'dead') {
      ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.name, this.cx, this.y - 10);
    }
    if (this.state === 'block') {
      ctx.strokeStyle = 'rgba(0,255,255,0.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(this.cx, this.cy, this.w / 2 + 12, this.h / 2 + 8, 0, 0, 6.28); ctx.stroke();
    }
    if (showHitboxes) {
      ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1; ctx.strokeRect(this.x, this.y, this.w, this.h);
      if (this.attackBox) { ctx.strokeStyle = '#f00'; ctx.strokeRect(this.attackBox.x, this.attackBox.y, this.attackBox.w, this.attackBox.h); }
    }
  }
}

// Mini portrait used by the character-select grid and the victory screen
const _iconCache = {};
function spriteIcon(charId, size) {
  const key = charId + ':' + size;
  if (_iconCache[key]) return _iconCache[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), d = CHAR_DEF[charId];
  const s = (size * 0.9) / Math.max(d.h, d.w * 0.9);
  g.translate(size / 2, size * 0.96); g.scale(s, s);
  drawSprite(g, charId, { ps: 'idle', t: 0, wph: 0, anim: '', ex: 0, bk: 0, k: 0, el: 0, p: 0, vy: 0, vx: 0, w: d.w, h: d.h, flash: false, atk: false, mv: null, landed: false });
  return (_iconCache[key] = cv.toDataURL());
}
