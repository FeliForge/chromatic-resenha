// CHROMATIC RESENHA - Core Game (fixed 960x540 logical canvas, scaled with CSS)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  const s = Math.min(w / W, h / H);
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

// ========== CHARACTERS ==========
const CHARACTERS = [
  { id: 0, name: 'The Forge', color: '#888', accent: '#ff6600', speed: 4.2, jump: 14, hp: 100, damageMul: 1.0, specialty: 'fast', desc: 'Forger - Quick strikes' },
  { id: 1, name: 'Tomato', color: '#e74c3c', accent: '#27ae60', speed: 3.5, jump: 13, hp: 110, damageMul: 1.05, specialty: 'balanced', desc: 'Versatile tomato' },
  { id: 2, name: 'Doggie', color: '#a0522d', accent: '#f1c40f', speed: 5.5, jump: 15, hp: 90, damageMul: 0.9, specialty: 'speed', desc: 'Extremely fast dog' },
  { id: 3, name: 'Foobal', color: '#2ecc71', accent: '#fff', speed: 3.8, jump: 12, hp: 100, damageMul: 1.0, specialty: 'ranged', desc: 'Long-range soccer' },
  { id: 4, name: 'Box-er', color: '#8e44ad', accent: '#f39c12', speed: 2.2, jump: 10, hp: 140, damageMul: 1.6, specialty: 'tank', desc: 'Slow heavy damage' },
  { id: 5, name: 'Jumper', color: '#3498db', accent: '#e67e22', speed: 3.6, jump: 18, hp: 95, damageMul: 1.1, specialty: 'air', desc: 'Aerial specialist' },
  { id: 6, name: 'Ranch-Man', color: '#2980b9', accent: '#d35400', speed: 3.4, jump: 12, hp: 105, damageMul: 1.15, specialty: 'whip', desc: 'Cowboy whip master' },
  { id: 7, name: 'Iron Fist', color: '#2c3e50', accent: '#c0392b', speed: 3.0, jump: 11, hp: 120, damageMul: 1.35, specialty: 'close', desc: 'Iron fists short range' }
];

// ========== STATE ==========
const State = { TITLE: 0, MAIN: 1, CHARSELECT: 2, STAGESELECT: 3, FIGHT: 4, VICTORY: 5, DEFEAT: 6, CONFIG: 7 };
let gameState = State.TITLE;
let mode = 'story';
let selectedP1 = 0, selectedP2 = 1, selectingFor = 1;
let currentStage = 0;
let storyProgress = 0, storyFighters = [], storyPlayerChar = 0;
let gameT = 0;

// ========== INPUT ==========
const keys = {};
const touch = { left: false, right: false, jump: false, atk: false, strong: false, special: false, block: false };
const GAME_KEYS = ['a', 'd', 'w', 's', 'f', 'g', 'h', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', '1', '2', '3', ' '];
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (gameState === State.FIGHT && GAME_KEYS.includes(k)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function bindTouch(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const down = e => { e.preventDefault(); touch[key] = true; };
  const up = e => { e.preventDefault(); touch[key] = false; };
  el.addEventListener('touchstart', down, { passive: false });
  el.addEventListener('touchend', up, { passive: false });
  el.addEventListener('touchcancel', up, { passive: false });
  el.addEventListener('mousedown', down);
  el.addEventListener('mouseup', up);
  el.addEventListener('mouseleave', up);
}
['Left', 'Right', 'Jump', 'Atk', 'Strong', 'Special', 'Block'].forEach(n => bindTouch('btn' + n, n.toLowerCase()));

// ========== FIGHTER ==========
const BODY_W = 60, BODY_H = 150;
const ATK_FRAMES = { attack: 18, strong: 28, special: 40 };
const ATK_POWER = { attack: 0, strong: 1, special: 2 };

class Fighter {
  constructor(charId, side, isPlayer) {
    const c = CHARACTERS[charId];
    this.charId = charId; this.name = c.name; this.color = c.color; this.accent = c.accent;
    this.speed = c.speed; this.jumpForce = c.jump; this.maxHp = c.hp; this.hp = c.hp; this.hpTrail = c.hp; this.trailDelay = 0;
    this.damageMul = c.damageMul; this.specialty = c.specialty;
    this.side = side; this.isPlayer = isPlayer;
    this.w = BODY_W; this.h = BODY_H;
    this.x = side === 1 ? W * 0.28 - this.w / 2 : W * 0.72 - this.w / 2;
    this.y = GROUND_Y - this.h; this.vx = 0; this.vy = 0;
    this.facing = side === 1 ? 1 : -1;
    this.onGround = true; this.wasOnGround = true;
    this.state = 'idle'; this.stateTimer = 0;
    this.attackBox = null; this.atkTotal = 18; this.atkRange = 60; this.atkHit = false; this.atkDmg = 0; this.atkType = 'attack';
    this.hitCooldown = 0; this.invuln = 0; this.hitFlash = 0;
    this.combo = 0; this.comboTimer = 0;
    this.animT = Math.random() * 60; this.deadT = 0; this.groundY = GROUND_Y;
    this.aiCool = 0;
  }
  get cx() { return this.x + this.w / 2; }
  get bottom() { return this.y + this.h; }
  get attacking() { return this.state === 'attack' || this.state === 'strong' || this.state === 'special'; }

  update(dt, opponent, input, canAct) {
    this.animT += dt;
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.stateTimer -= dt;
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0; }
    if (this.trailDelay > 0) this.trailDelay -= dt;
    else if (this.hpTrail > this.hp) this.hpTrail = Math.max(this.hp, this.hpTrail - 0.7);
    if (this.state === 'dead') this.deadT += dt;

    // physics
    this.wasOnGround = this.onGround;
    this.vy += 0.7; this.y += this.vy; this.x += this.vx; this.vx *= 0.85;
    if (this.bottom >= GROUND_Y) {
      this.y = GROUND_Y - this.h;
      if (this.vy > 4) { dustPuff(this.cx, GROUND_Y, this.vy > 9 ? 9 : 5, 0); if (this.state === 'dead') shakeScreen(4); }
      this.vy = 0; this.onGround = true;
    } else this.onGround = false;
    if (this.x < 14) this.x = 14;
    if (this.x + this.w > W - 14) this.x = W - 14 - this.w;

    if (this.state === 'dead' || this.state === 'win') { if (this.onGround) this.vx *= 0.8; return; }
    if (opponent && !this.attacking && this.state !== 'hit') this.facing = opponent.cx > this.cx ? 1 : -1;

    if (this.state === 'hit') { if (this.stateTimer <= 0) this.state = 'idle'; return; }
    if (!canAct) { if (this.onGround && this.state !== 'idle') this.state = 'idle'; return; }
    if (this.state === 'block' && !this.isPlayer) { if (this.stateTimer <= 0) this.state = 'idle'; else return; }

    if (this.isPlayer) this.handleInput(input); else this.ai(opponent, dt);

    // active frames -> hitbox
    if (this.attacking) {
      const p = 1 - Math.max(0, this.stateTimer) / this.atkTotal;
      if (p >= 0.25 && p <= 0.65 && !this.atkHit) {
        const r = this.atkRange;
        this.attackBox = { x: this.facing > 0 ? this.x + this.w - 6 : this.x - r + 6, y: this.y + 22, w: r, h: this.h - 60,
          dmg: this.atkDmg, type: this.atkType, knock: this.atkType === 'special' ? 12 : this.atkType === 'strong' ? 8 : 4 };
      } else this.attackBox = null;
      if (this.attackBox && opponent && opponent.invuln <= 0 && opponent.state !== 'dead' && this.checkHit(opponent)) {
        this.applyHit(opponent); this.attackBox = null; this.atkHit = true;
      }
      if (this.stateTimer <= 0) { this.state = 'idle'; this.attackBox = null; }
    }
  }

  handleInput(inp) {
    if (this.attacking) return;
    if (inp.block && this.onGround) { this.state = 'block'; this.vx *= 0.3; return; }
    if (inp.left) { this.vx = -this.speed; if (this.onGround) this.state = 'walk'; }
    else if (inp.right) { this.vx = this.speed; if (this.onGround) this.state = 'walk'; }
    else if (this.onGround) this.state = 'idle';
    if (inp.jump && this.onGround) {
      this.vy = -this.jumpForce; this.onGround = false; this.state = 'jump';
      dustPuff(this.cx, GROUND_Y, 6, 0);
    }
    if (inp.atk) this.doAttack('attack');
    else if (inp.strong) this.doAttack('strong');
    else if (inp.special) this.doAttack('special');
  }

  doAttack(type) {
    if (this.attacking) return;
    this.state = type;
    this.atkTotal = ATK_FRAMES[type];
    this.stateTimer = this.atkTotal;
    this.atkType = type;
    this.atkRange = this.getAttackRange(type);
    this.atkDmg = this.getAttackDamage(type);
    this.atkHit = false;
    this.attackBox = null;
  }

  getAttackRange(type) {
    const base = type === 'special' ? 105 : type === 'strong' ? 80 : 58;
    if (this.specialty === 'ranged' || this.specialty === 'whip') return base + 55;
    if (this.specialty === 'close') return base - 14;
    if (this.specialty === 'air' && !this.onGround) return base + 30;
    return base;
  }

  getAttackDamage(type) {
    let d = type === 'special' ? 18 : type === 'strong' ? 12 : 6;
    d *= this.damageMul;
    if (this.specialty === 'air' && !this.onGround) d *= 1.4;
    if (this.specialty === 'tank') d *= 1.2;
    return Math.round(d);
  }

  checkHit(opp) {
    const a = this.attackBox;
    return a.x < opp.x + opp.w && a.x + a.w > opp.x && a.y < opp.y + opp.h && a.y + a.h > opp.y;
  }

  applyHit(opp) {
    const a = this.attackBox, pw = ATK_POWER[a.type];
    const look = LOOKS[this.charId];
    const hx = Math.max(opp.x, Math.min(opp.x + opp.w, this.facing > 0 ? a.x + a.w - 10 : a.x + 10)) - this.facing * 8;
    const hy = a.y + a.h * 0.45;
    const blocked = opp.state === 'block' && opp.facing === -this.facing;
    if (blocked) {
      opp.hp -= Math.round(a.dmg * 0.25);
      opp.vx += this.facing * 3.5;
      opp.stateTimer = 10;
      opp.trailDelay = 20;
      guardSpark(hx, hy, this.facing);
      FX.hitstop = 2 + pw; shakeScreen(2 + pw);
    } else {
      opp.hp -= a.dmg;
      opp.vx += this.facing * a.knock;
      opp.vy = pw === 2 ? -9 : -4;
      opp.onGround = false;
      opp.state = 'hit';
      opp.stateTimer = 15 + pw * 5;
      opp.invuln = 12; opp.hitCooldown = 20; opp.hitFlash = 5; opp.trailDelay = 28;
      opp.attackBox = null;
      hitSpark(hx, hy, pw, look.fxColor, this.facing);
      FX.hitstop = 3 + pw * 3; shakeScreen(4 + pw * 5);
      FX.zoomPunch = Math.max(FX.zoomPunch, 0.02 + pw * 0.015);
      if (pw === 2) flashScreen(0.35, look.fxColor);
      this.combo++; this.comboTimer = 70;
      if (this.combo >= 2) floatText(hx, hy - 50, this.combo + ' HITS!', '#ffe14a', 24);
    }
    if (opp.hp <= 0) {
      opp.hp = 0; opp.state = 'dead'; opp.deadT = 0; opp.vy = -9; opp.vx = this.facing * 7; opp.onGround = false;
      flashScreen(0.8, '#fff'); shakeScreen(16);
    }
  }

  ai(opp, dt) {
    if (!opp || this.attacking) return;
    const dist = Math.abs(this.cx - opp.cx);
    const dir = opp.cx > this.cx ? 1 : -1;
    const reach = this.atkRange || 80;
    if (dist > 200) {
      this.vx = dir * this.speed * 0.9; if (this.onGround) this.state = 'walk';
      if (Math.random() < 0.02 && this.onGround) { this.vy = -this.jumpForce; this.onGround = false; this.state = 'jump'; }
    } else if (dist > 105) {
      if (Math.random() < 0.04) this.doAttack(Math.random() < 0.3 ? 'special' : 'strong');
      else if (Math.random() < 0.08) this.doAttack('attack');
      else { this.vx = dir * this.speed * 0.6; if (this.onGround) this.state = 'walk'; }
    } else {
      if (Math.random() < 0.1) this.doAttack('attack');
      else if (Math.random() < 0.05) this.doAttack('strong');
      else if (Math.random() < 0.03) { this.state = 'block'; this.stateTimer = 20; }
      else if (this.onGround && this.state !== 'block') this.state = 'idle';
    }
  }

  draw() {
    drawFighter(ctx, this);
  }
}

// ========== FIGHT STATE ==========
let p1 = null, p2 = null;
let timer = 99, timerAcc = 0;
let fightOver = false, winner = null;
let phase = 'intro', phaseT = 0, koText = 'K.O.';
let camera = { z: 1, left: 0, top: 0 };

function startFight(char1, char2, p1IsHuman = true, p2IsHuman = false) {
  p1 = new Fighter(char1, 1, p1IsHuman);
  p2 = new Fighter(char2, 2, p2IsHuman);
  timer = 99; timerAcc = 0; fightOver = false; winner = null;
  phase = 'intro'; phaseT = 0; koText = 'K.O.';
  clearFX();
  camera = { z: 1, left: 0, top: 0 };
  gameState = State.FIGHT;
  if (isMobile()) document.getElementById('touchControls').style.display = 'block';
  hideAllMenus();
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 800;
}

function getP1Input() {
  return { left: keys['a'] || touch.left, right: keys['d'] || touch.right, jump: keys['w'] || touch.jump,
    atk: keys['f'] || touch.atk, strong: keys['g'] || touch.strong, special: keys['h'] || touch.special, block: keys['s'] || touch.block };
}
function getP2Input() {
  return { left: keys['arrowleft'], right: keys['arrowright'], jump: keys['arrowup'],
    atk: keys['1'], strong: keys['2'], special: keys['3'], block: keys['arrowdown'] };
}

function separateFighters() {
  if (!p1 || !p2 || p1.state === 'dead' || p2.state === 'dead') return;
  if (p1.y + p1.h - 20 < p2.y || p2.y + p2.h - 20 < p1.y) return;
  const overlap = (p1.w * 0.8) - Math.abs(p1.cx - p2.cx);
  if (overlap > 0) {
    const push = overlap / 2, d = p1.cx <= p2.cx ? 1 : -1;
    p1.x -= push * d; p2.x += push * d;
    p1.x = Math.max(14, Math.min(W - 14 - p1.w, p1.x));
    p2.x = Math.max(14, Math.min(W - 14 - p2.w, p2.x));
  }
}

function step() {
  phaseT++;
  const canAct = phase === 'fight';
  const inp1 = getP1Input();
  const inp2 = p2.isPlayer ? getP2Input() : null;

  if (phase === 'intro' && phaseT >= 125) { phase = 'fight'; phaseT = 0; }

  p1.update(1, p2, inp1, canAct);
  p2.update(1, p1, inp2, canAct);
  separateFighters();

  if (phase === 'fight') {
    timerAcc++;
    if (timerAcc >= 60) {
      timerAcc = 0; timer--;
      if (timer <= 0) { timer = 0; endFight(p1.hp / p1.maxHp >= p2.hp / p2.maxHp ? 1 : 2, true); }
    }
    if (p1.hp <= 0) endFight(2, false);
    else if (p2.hp <= 0) endFight(1, false);
  } else if (phase === 'ko') {
    if (phaseT === 70 && winner) { const w = winner === 1 ? p1 : p2; if (w.state !== 'dead') { w.state = 'win'; w.vx = 0; } }
    if (phaseT >= 230) { phase = 'done'; afterFight(); }
  }
}

function endFight(winSide, timeUp) {
  if (fightOver) return;
  fightOver = true; winner = winSide; phase = 'ko'; phaseT = 0;
  koText = timeUp ? 'TIME UP' : 'K.O.';
  FX.slowmo = timeUp ? 0 : 70;
  const loser = winSide === 1 ? p2 : p1;
  if (timeUp && loser.state !== 'dead') { loser.state = 'idle'; }
  document.getElementById('touchControls').style.display = 'none';
}

function afterFight() {
  const winSide = winner;
  if (mode === 'story') {
    if (winSide === 1) {
      storyProgress++;
      if (storyProgress >= 6) showVictory(storyPlayerChar);
      else startFight(storyPlayerChar, storyFighters[storyProgress], true, false);
    } else showDefeat();
  } else {
    showVictory(winSide === 1 ? selectedP1 : selectedP2);
  }
}

function showVictory(charId) {
  gameState = State.VICTORY;
  const c = CHARACTERS[charId];
  document.getElementById('vicName').textContent = c.name.toUpperCase() + ' WINS!';
  const el = document.getElementById('vicChar');
  el.innerHTML = '';
  const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
  drawPortrait(cv.getContext('2d'), charId, 0, 0, 200, false, '#ffd700');
  el.appendChild(cv);
  document.getElementById('victoryScreen').classList.remove('hidden');
}

function showDefeat() {
  gameState = State.DEFEAT;
  document.getElementById('defeatScreen').classList.remove('hidden');
}

// ========== CAMERA ==========
function updateCamera() {
  if (!p1 || !p2) return;
  const mid = (p1.cx + p2.cx) / 2, dist = Math.abs(p1.cx - p2.cx);
  const tz = Math.max(1, Math.min(1.14, 1.14 - (dist - 260) / 520 * 0.14)) + FX.zoomPunch;
  const z = camera.z + (tz - camera.z) * 0.1;
  const vw = W / z, vh = H / z;
  let left = mid - vw / 2; left = Math.max(0, Math.min(W - vw, left));
  // follow the highest fighter so jumps never leave the frame
  const highest = Math.min(p1.y, p2.y);
  const topTarget = Math.max(0, Math.min(H - vh, highest - 70));
  camera.left += (left - camera.left) * 0.15; camera.z = z;
  camera.top += (topTarget - camera.top) * 0.2;
}

// ========== RENDER ==========
function render() {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  const inFight = gameState === State.FIGHT || (fightOver && p1 && (gameState === State.VICTORY || gameState === State.DEFEAT));
  if (inFight && p1 && p2) {
    updateCamera();
    const sx = (Math.random() - 0.5) * FX.shake * 2, sy = (Math.random() - 0.5) * FX.shake * 2;
    c.save();
    c.translate(sx, sy);
    c.scale(camera.z, camera.z);
    c.translate(-camera.left, -camera.top);
    drawStage(c, currentStage, gameT, camera.left);
    const order = (p1.attacking && !p2.attacking) || p2.state === 'dead' ? [p2, p1] : [p1, p2];
    order.forEach(f => f.draw());
    drawFX(c);
    c.restore();
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (FX.flash > 0) { c.globalAlpha = Math.min(0.9, FX.flash); c.fillStyle = FX.flashColor; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    drawFightHUD(c, p1, p2, timer, { tag1: 'P1', tag2: p2.isPlayer ? 'P2' : 'CPU', t: gameT });
    // combo counters
    [[p1, 24, 'left'], [p2, W - 24, 'right']].forEach(a => {
      const f = a[0];
      if (f.combo >= 2 && f.comboTimer > 0) {
        c.save(); c.textAlign = a[2]; c.font = '900 30px Impact, sans-serif'; c.lineWidth = 6; c.strokeStyle = '#000';
        c.globalAlpha = Math.min(1, f.comboTimer / 20);
        const txt = f.combo + ' HIT COMBO';
        c.strokeText(txt, a[1], 160); c.fillStyle = '#ffe14a'; c.fillText(txt, a[1], 160); c.restore();
      }
    });
    // banners
    if (phase === 'intro') {
      if (phaseT < 75) drawBanner(c, 'ROUND 1', phaseT / 75, '#ffd21f', (mode === 'story' ? 'STAGE ' + (storyProgress + 1) + ' / 6' : 'VERSUS'));
      else drawBanner(c, 'FIGHT!', (phaseT - 75) / 50, '#ff8a1f', null, 130);
    } else if (phase === 'fight' && phaseT < 24) {
      drawBanner(c, 'FIGHT!', 0.18 + phaseT / 24 * 0.8, '#ff8a1f', null, 130);
    } else if (phase === 'ko' || phase === 'done') {
      if (phaseT < 70) { drawSpeedLines(c, phaseT, 0.55 * (1 - phaseT / 70)); drawBanner(c, koText, Math.min(0.5, phaseT / 40), '#ff4a2a', null, 150); }
      else if (phaseT > 70) {
        const w = winner === 1 ? p1 : p2;
        drawBanner(c, 'YOU WIN', Math.min(0.6, (phaseT - 70) / 50), '#ffd21f', w.name.toUpperCase(), 100);
        if (mode === 'versus' || winner === 2) { /* label stays generic */ }
      }
    }
  } else {
    // menu backdrop: animated arena
    const t = gameT;
    drawStage(c, gameState === State.TITLE || gameState === State.MAIN ? 0 : currentStage, t, Math.sin(t * 0.004) * 60 + 60);
    c.fillStyle = 'rgba(8,4,20,0.55)'; c.fillRect(0, 0, W, H);
  }
}

// ========== MENUS ==========
function hideAllMenus() {
  ['titleScreen', 'mainMenu', 'charSelect', 'stageSelect', 'configMenu', 'victoryScreen', 'defeatScreen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

function showMain() {
  hideAllMenus();
  gameState = State.MAIN;
  document.getElementById('touchControls').style.display = 'none';
  document.getElementById('mainMenu').classList.remove('hidden');
}

function buildCharGrid() {
  const grid = document.getElementById('charGrid');
  grid.innerHTML = '';
  CHARACTERS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'char-btn';
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; cv.className = 'icon';
    drawPortrait(cv.getContext('2d'), i, 0, 0, 128, false, c.accent);
    btn.appendChild(cv);
    const nm = document.createElement('span'); nm.textContent = c.name; btn.appendChild(nm);
    const ds = document.createElement('small'); ds.textContent = c.desc; btn.appendChild(ds);
    btn.onclick = () => {
      document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (mode === 'story' || selectingFor === 1) selectedP1 = i; else selectedP2 = i;
      document.getElementById('btnConfirmChar').classList.remove('hidden');
    };
    grid.appendChild(btn);
  });
}

function startStory() {
  mode = 'story';
  storyProgress = 0;
  storyPlayerChar = selectedP1;
  const pool = [0, 1, 2, 3, 4, 5, 6, 7].filter(i => i !== selectedP1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  storyFighters = pool.slice(0, 5);
  storyFighters.push(pool[5]);
  startFight(storyPlayerChar, storyFighters[0], true, false);
}

// ========== EVENT BINDINGS ==========
document.getElementById('btnStart').onclick = () => showMain();
document.getElementById('btnStory').onclick = () => {
  mode = 'story'; selectingFor = 1; hideAllMenus();
  document.getElementById('charSelectTitle').textContent = 'SELECT YOUR FIGHTER';
  buildCharGrid();
  document.getElementById('charSelect').classList.remove('hidden');
  document.getElementById('btnConfirmChar').classList.add('hidden');
  gameState = State.CHARSELECT;
};
document.getElementById('btnVersus').onclick = () => {
  mode = 'versus'; selectingFor = 1; hideAllMenus();
  document.getElementById('charSelectTitle').textContent = 'P1 SELECT';
  buildCharGrid();
  document.getElementById('charSelect').classList.remove('hidden');
  document.getElementById('btnConfirmChar').classList.add('hidden');
  gameState = State.CHARSELECT;
};
document.getElementById('btnConfirmChar').onclick = () => {
  if (mode === 'story') {
    hideAllMenus();
    document.getElementById('stageSelect').classList.remove('hidden');
    gameState = State.STAGESELECT;
  } else if (selectingFor === 1) {
    selectingFor = 2;
    document.getElementById('charSelectTitle').textContent = 'P2 SELECT';
    document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btnConfirmChar').classList.add('hidden');
  } else {
    hideAllMenus();
    document.getElementById('stageSelect').classList.remove('hidden');
    gameState = State.STAGESELECT;
  }
};
document.querySelectorAll('.stage-btn').forEach(btn => {
  btn.onclick = () => {
    currentStage = parseInt(btn.dataset.stage);
    if (mode === 'story') startStory(); else startFight(selectedP1, selectedP2, true, true);
  };
  btn.onmouseenter = () => { currentStage = parseInt(btn.dataset.stage); };
});
document.getElementById('btnBackStage').onclick = () => {
  hideAllMenus();
  document.getElementById('charSelect').classList.remove('hidden');
  gameState = State.CHARSELECT;
};
document.getElementById('btnConfig').onclick = () => {
  hideAllMenus();
  document.getElementById('configMenu').classList.remove('hidden');
  gameState = State.CONFIG;
};
document.getElementById('btnBackConfig').onclick = () => showMain();
document.getElementById('btnVicContinue').onclick = () => {
  if (mode === 'story') showMain();
  else {
    selectingFor = 1; hideAllMenus();
    document.getElementById('charSelectTitle').textContent = 'P1 SELECT';
    buildCharGrid();
    document.getElementById('charSelect').classList.remove('hidden');
    document.getElementById('btnConfirmChar').classList.add('hidden');
    gameState = State.CHARSELECT;
  }
};
document.getElementById('btnDefRetry').onclick = () => {
  storyProgress = 0;
  startFight(storyPlayerChar, storyFighters[0], true, false);
};
document.getElementById('btnDefMenu').onclick = () => showMain();

// ========== LOOP (fixed 60Hz simulation) ==========
let last = performance.now(), acc = 0, slowTick = 0;
function loop(now) {
  requestAnimationFrame(loop);
  acc += Math.min(now - last, 100);
  last = now;
  try {
    let guard = 0;
    while (acc >= 1000 / 60 && guard++ < 4) {
      acc -= 1000 / 60;
      gameT++;
      if (gameState === State.FIGHT && p1 && p2 && phase !== 'done') {
        if (FX.hitstop > 0) FX.hitstop--;
        else if (FX.slowmo > 0) { FX.slowmo--; if ((slowTick++ % 3) === 0) step(); }
        else step();
      }
      updateFX();
    }
    render();
  } catch (err) {
    console.error(err);
  }
}
requestAnimationFrame(loop);
