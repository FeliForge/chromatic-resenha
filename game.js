// CHROMATIC RESENHA - Core Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = 16/9;
  if (w/h > ratio) {
    canvas.height = h;
    canvas.width = h * ratio;
  } else {
    canvas.width = w;
    canvas.height = w / ratio;
  }
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
}
window.addEventListener('resize', resize);
resize();

// ========== CHARACTERS ==========
const CHARACTERS = [
  {
    id: 0, name: 'The Forge', color: '#888', accent: '#ff6600',
    speed: 4.2, jump: 14, hp: 100, damageMul: 1.0,
    specialty: 'fast', desc: 'Forger - Quick strikes'
  },
  {
    id: 1, name: 'Tomato', color: '#e74c3c', accent: '#27ae60',
    speed: 3.5, jump: 13, hp: 110, damageMul: 1.05,
    specialty: 'balanced', desc: 'Versatile tomato'
  },
  {
    id: 2, name: 'Doggie', color: '#a0522d', accent: '#f1c40f',
    speed: 5.5, jump: 15, hp: 90, damageMul: 0.9,
    specialty: 'speed', desc: 'Extremely fast dog'
  },
  {
    id: 3, name: 'Foobal', color: '#2ecc71', accent: '#fff',
    speed: 3.8, jump: 12, hp: 100, damageMul: 1.0,
    specialty: 'ranged', desc: 'Long-range soccer'
  },
  {
    id: 4, name: 'Box-er', color: '#8e44ad', accent: '#f39c12',
    speed: 2.2, jump: 10, hp: 140, damageMul: 1.6,
    specialty: 'tank', desc: 'Slow heavy damage'
  },
  {
    id: 5, name: 'Jumper', color: '#3498db', accent: '#e67e22',
    speed: 3.6, jump: 18, hp: 95, damageMul: 1.1,
    specialty: 'air', desc: 'Aerial specialist'
  },
  {
    id: 6, name: 'Ranch-Man', color: '#2980b9', accent: '#d35400',
    speed: 3.4, jump: 12, hp: 105, damageMul: 1.15,
    specialty: 'whip', desc: 'Cowboy whip master'
  },
  {
    id: 7, name: 'Iron Fist', color: '#2c3e50', accent: '#c0392b',
    speed: 3.0, jump: 11, hp: 120, damageMul: 1.35,
    specialty: 'close', desc: 'Iron fists short range'
  }
];

const STAGES = [
  { name: 'Arena', bg: '#1a1a2e', ground: '#16213e', accent: '#0f3460' },
  { name: 'Rooftop', bg: '#2c3e50', ground: '#34495e', accent: '#7f8c8d' },
  { name: 'Dojo', bg: '#3d2b1f', ground: '#5c4033', accent: '#8b5a2b' }
];

// ========== STATE ==========
const State = {
  TITLE: 0, MAIN: 1, CHARSELECT: 2, STAGESELECT: 3, FIGHT: 4,
  VICTORY: 5, DEFEAT: 6, CONFIG: 7
};
let gameState = State.TITLE;
let mode = 'story'; // story | versus
let selectedP1 = 0;
let selectedP2 = 1;
let selectingFor = 1; // 1 or 2 in versus
let currentStage = 0;
let storyProgress = 0;
let storyFighters = [];
let storyPlayerChar = 0;

// ========== INPUT ==========
const keys = {};
const touch = { left:false, right:false, jump:false, atk:false, strong:false, special:false, block:false };

window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function bindTouch(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  const down = (e) => { e.preventDefault(); touch[key] = true; };
  const up = (e) => { e.preventDefault(); touch[key] = false; };
  el.addEventListener('touchstart', down, {passive:false});
  el.addEventListener('touchend', up, {passive:false});
  el.addEventListener('touchcancel', up, {passive:false});
  el.addEventListener('mousedown', down);
  el.addEventListener('mouseup', up);
  el.addEventListener('mouseleave', up);
}
['Left','Right','Jump','Atk','Strong','Special','Block'].forEach(n => {
  bindTouch('btn'+n, n.toLowerCase());
});

// ========== FIGHTER CLASS ==========
class Fighter {
  constructor(charId, side, isPlayer) {
    const c = CHARACTERS[charId];
    this.charId = charId;
    this.name = c.name;
    this.color = c.color;
    this.accent = c.accent;
    this.speed = c.speed;
    this.jumpForce = c.jump;
    this.maxHp = c.hp;
    this.hp = c.hp;
    this.damageMul = c.damageMul;
    this.specialty = c.specialty;
    this.side = side; // 1 or 2
    this.isPlayer = isPlayer;
    this.x = side === 1 ? canvas.width * 0.25 : canvas.width * 0.75;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = side === 1 ? 1 : -1;
    this.onGround = false;
    this.w = 40;
    this.h = 70;
    this.state = 'idle'; // idle, walk, jump, attack, strong, special, block, hit, dead
    this.stateTimer = 0;
    this.attackBox = null;
    this.hitCooldown = 0;
    this.combo = 0;
    this.invuln = 0;
  }

  get cx() { return this.x + this.w/2; }
  get cy() { return this.y + this.h/2; }
  get bottom() { return this.y + this.h; }

  update(dt, opponent, input) {
    if (this.state === 'dead') return;

    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.stateTimer -= dt;

    // Gravity
    this.vy += 0.7;
    this.y += this.vy;
    this.x += this.vx;
    this.vx *= 0.85;

    // Ground
    const groundY = canvas.height - 80;
    if (this.bottom > groundY) {
      this.y = groundY - this.h;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // Walls
    if (this.x < 20) this.x = 20;
    if (this.x + this.w > canvas.width - 20) this.x = canvas.width - 20 - this.w;

    // Face opponent
    if (opponent && this.state !== 'attack' && this.state !== 'strong' && this.state !== 'special') {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    // AI or input
    if (this.state === 'hit' || this.state === 'block') {
      if (this.stateTimer <= 0) this.state = 'idle';
      return;
    }

    if (this.isPlayer) {
      this.handleInput(input);
    } else {
      this.ai(opponent);
    }

    // Attack resolution
    if (this.attackBox && opponent && opponent.invuln <= 0) {
      if (this.checkHit(opponent)) {
        this.applyHit(opponent);
        this.attackBox = null;
      }
    }

    if (this.stateTimer <= 0 && (this.state === 'attack' || this.state === 'strong' || this.state === 'special')) {
      this.state = 'idle';
      this.attackBox = null;
    }
  }

  handleInput(inp) {
    if (this.state === 'attack' || this.state === 'strong' || this.state === 'special') return;

    // Move
    if (inp.left) { this.vx = -this.speed; this.state = 'walk'; }
    else if (inp.right) { this.vx = this.speed; this.state = 'walk'; }
    else if (this.onGround) this.state = 'idle';

    // Jump
    if (inp.jump && this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
      this.state = 'jump';
    }

    // Block
    if (inp.block && this.onGround) {
      this.state = 'block';
      this.vx *= 0.3;
      return;
    }

    // Attacks
    if (inp.atk) this.doAttack('attack');
    else if (inp.strong) this.doAttack('strong');
    else if (inp.special) this.doAttack('special');
  }

  doAttack(type) {
    if (this.state === type) return;
    this.state = type;
    this.stateTimer = type === 'special' ? 40 : type === 'strong' ? 28 : 18;
    const range = this.getAttackRange(type);
    const dmg = this.getAttackDamage(type);
    this.attackBox = {
      x: this.facing > 0 ? this.x + this.w : this.x - range,
      y: this.y + 10,
      w: range,
      h: this.h - 20,
      dmg,
      type,
      knock: type === 'special' ? 12 : type === 'strong' ? 8 : 4
    };
  }

  getAttackRange(type) {
    const base = type === 'special' ? 70 : type === 'strong' ? 50 : 35;
    if (this.specialty === 'ranged' || this.specialty === 'whip') return base + 40;
    if (this.specialty === 'close') return base - 10;
    if (this.specialty === 'air' && !this.onGround) return base + 25;
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
    return a.x < opp.x + opp.w && a.x + a.w > opp.x &&
           a.y < opp.y + opp.h && a.y + a.h > opp.y;
  }

  applyHit(opp) {
    if (opp.state === 'block') {
      opp.hp -= Math.round(this.attackBox.dmg * 0.25);
      opp.vx += this.facing * 3;
      opp.state = 'block';
      opp.stateTimer = 10;
    } else {
      opp.hp -= this.attackBox.dmg;
      opp.vx += this.facing * this.attackBox.knock;
      opp.vy = -4;
      opp.state = 'hit';
      opp.stateTimer = 15;
      opp.invuln = 12;
      opp.hitCooldown = 20;
    }
    if (opp.hp <= 0) {
      opp.hp = 0;
      opp.state = 'dead';
    }
  }

  ai(opp) {
    if (!opp || this.state === 'attack' || this.state === 'strong' || this.state === 'special') return;
    const dist = Math.abs(this.x - opp.x);
    const dir = opp.x > this.x ? 1 : -1;

    // Simple AI
    if (dist > 120) {
      this.vx = dir * this.speed * 0.9;
      this.state = 'walk';
      if (Math.random() < 0.02 && this.onGround) {
        this.vy = -this.jumpForce;
        this.onGround = false;
      }
    } else if (dist > 50) {
      if (Math.random() < 0.04) this.doAttack(Math.random() < 0.3 ? 'special' : 'strong');
      else if (Math.random() < 0.08) this.doAttack('attack');
      else {
        this.vx = dir * this.speed * 0.6;
        this.state = 'walk';
      }
    } else {
      if (Math.random() < 0.1) this.doAttack('attack');
      else if (Math.random() < 0.05) this.doAttack('strong');
      else if (Math.random() < 0.03) {
        this.state = 'block';
        this.stateTimer = 20;
      }
    }
  }

  draw() {
    ctx.save();
    // Body
    ctx.fillStyle = this.state === 'hit' ? '#fff' : this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Accent head/details
    ctx.fillStyle = this.accent;
    ctx.fillRect(this.x + 8, this.y + 5, this.w - 16, 18);

    // Eyes
    ctx.fillStyle = '#fff';
    const eyeX = this.facing > 0 ? this.x + 22 : this.x + 8;
    ctx.fillRect(eyeX, this.y + 10, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(eyeX + 2, this.y + 12, 4, 4);

    // Specialty visual
    if (this.specialty === 'whip' && (this.state === 'attack' || this.state === 'special')) {
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx + this.facing * 60, this.cy - 10);
      ctx.stroke();
    }
    if (this.specialty === 'ranged' && this.state === 'special') {
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(this.cx + this.facing * 50, this.cy, 12, 0, Math.PI*2);
      ctx.fill();
    }

    // Attack flash
    if (this.attackBox) {
      ctx.fillStyle = 'rgba(255,255,0,0.4)';
      ctx.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.w, this.attackBox.h);
    }

    // Name
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.cx, this.y - 8);

    // Block indicator
    if (this.state === 'block') {
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 4, this.y - 4, this.w + 8, this.h + 8);
    }

    ctx.restore();
  }
}

// ========== FIGHT STATE ==========
let p1 = null, p2 = null;
let timer = 99;
let timerAcc = 0;
let fightOver = false;
let winner = null;

function startFight(char1, char2, p1IsHuman = true, p2IsHuman = false) {
  p1 = new Fighter(char1, 1, p1IsHuman);
  p2 = new Fighter(char2, 2, p2IsHuman);
  timer = 99;
  timerAcc = 0;
  fightOver = false;
  winner = null;
  gameState = State.FIGHT;
  document.getElementById('hud').style.display = 'block';
  if (isMobile()) document.getElementById('touchControls').style.display = 'block';
  hideAllMenus();
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 800;
}

function getP1Input() {
  return {
    left: keys['a'] || touch.left,
    right: keys['d'] || touch.right,
    jump: keys['w'] || touch.jump,
    atk: keys['f'] || touch.atk,
    strong: keys['g'] || touch.strong,
    special: keys['h'] || touch.special,
    block: keys['s'] || touch.block
  };
}

function getP2Input() {
  return {
    left: keys['arrowleft'],
    right: keys['arrowright'],
    jump: keys['arrowup'],
    atk: keys['1'],
    strong: keys['2'],
    special: keys['3'],
    block: keys['arrowdown']
  };
}

function updateFight(dt) {
  if (fightOver) return;
  const inp1 = getP1Input();
  const inp2 = p2.isPlayer ? getP2Input() : null;

  p1.update(dt, p2, inp1);
  p2.update(dt, p1, inp2);

  timerAcc += dt;
  if (timerAcc >= 60) {
    timerAcc = 0;
    timer--;
    if (timer <= 0) {
      endFight(p1.hp >= p2.hp ? 1 : 2);
    }
  }

  document.getElementById('p1fill').style.width = (p1.hp / p1.maxHp * 100) + '%';
  document.getElementById('p2fill').style.width = (p2.hp / p2.maxHp * 100) + '%';
  document.getElementById('timer').textContent = Math.max(0, timer);

  if (p1.hp <= 0) endFight(2);
  else if (p2.hp <= 0) endFight(1);
}

function endFight(winSide) {
  fightOver = true;
  winner = winSide;
  document.getElementById('hud').style.display = 'none';
  document.getElementById('touchControls').style.display = 'none';

  setTimeout(() => {
    if (mode === 'story') {
      if (winSide === 1) {
        storyProgress++;
        if (storyProgress >= 6) {
          showVictory(storyPlayerChar);
        } else {
          // next opponent
          const next = storyFighters[storyProgress];
          startFight(storyPlayerChar, next, true, false);
        }
      } else {
        showDefeat();
      }
    } else {
      // versus - show simple result then back to char select
      if (winSide === 1) showVictory(selectedP1);
      else showVictory(selectedP2);
    }
  }, 800);
}

function showVictory(charId) {
  gameState = State.VICTORY;
  const c = CHARACTERS[charId];
  document.getElementById('vicName').textContent = c.name;
  const el = document.getElementById('vicChar');
  el.style.background = c.color;
  el.style.borderColor = c.accent;
  document.getElementById('victoryScreen').classList.remove('hidden');
}

function showDefeat() {
  gameState = State.DEFEAT;
  document.getElementById('defeatScreen').classList.remove('hidden');
}

// ========== RENDER ==========
function drawStage() {
  const s = STAGES[currentStage];
  ctx.fillStyle = s.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = s.ground;
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  // Accent lines
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80 - i * 30);
    ctx.lineTo(canvas.width, canvas.height - 80 - i * 30);
    ctx.stroke();
  }

  // Simple decorations
  ctx.fillStyle = s.accent;
  ctx.fillRect(50, canvas.height - 160, 30, 80);
  ctx.fillRect(canvas.width - 80, canvas.height - 160, 30, 80);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === State.FIGHT || fightOver) {
    drawStage();
    if (p1) p1.draw();
    if (p2) p2.draw();
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ========== MENUS ==========
function hideAllMenus() {
  ['titleScreen','mainMenu','charSelect','stageSelect','configMenu','victoryScreen','defeatScreen'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

function showMain() {
  hideAllMenus();
  gameState = State.MAIN;
  document.getElementById('mainMenu').classList.remove('hidden');
}

function buildCharGrid() {
  const grid = document.getElementById('charGrid');
  grid.innerHTML = '';
  CHARACTERS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'char-btn';
    btn.innerHTML = `<div class="icon" style="background:${c.color};border:2px solid ${c.accent}"></div>${c.name}`;
    btn.onclick = () => {
      document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (mode === 'story' || selectingFor === 1) selectedP1 = i;
      else selectedP2 = i;
      document.getElementById('btnConfirmChar').classList.remove('hidden');
    };
    grid.appendChild(btn);
  });
}

function startStory() {
  mode = 'story';
  storyProgress = 0;
  storyPlayerChar = selectedP1;
  // shuffle 5 opponents + boss (last is strongest-ish)
  const pool = [0,1,2,3,4,5,6,7].filter(i => i !== selectedP1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  storyFighters = pool.slice(0, 5);
  storyFighters.push(pool[5]); // boss
  currentStage = Math.floor(Math.random() * 3);
  startFight(storyPlayerChar, storyFighters[0], true, false);
}

// ========== EVENT BINDINGS ==========
document.getElementById('btnStart').onclick = () => showMain();
document.getElementById('btnStory').onclick = () => {
  mode = 'story';
  selectingFor = 1;
  hideAllMenus();
  document.getElementById('charSelectTitle').textContent = 'SELECT YOUR FIGHTER';
  buildCharGrid();
  document.getElementById('charSelect').classList.remove('hidden');
  document.getElementById('btnConfirmChar').classList.add('hidden');
  gameState = State.CHARSELECT;
};
document.getElementById('btnVersus').onclick = () => {
  mode = 'versus';
  selectingFor = 1;
  hideAllMenus();
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
  } else {
    if (selectingFor === 1) {
      selectingFor = 2;
      document.getElementById('charSelectTitle').textContent = 'P2 SELECT';
      document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('btnConfirmChar').classList.add('hidden');
    } else {
      hideAllMenus();
      document.getElementById('stageSelect').classList.remove('hidden');
      gameState = State.STAGESELECT;
    }
  }
};
document.querySelectorAll('.stage-btn').forEach(btn => {
  btn.onclick = () => {
    currentStage = parseInt(btn.dataset.stage);
    if (mode === 'story') startStory();
    else startFight(selectedP1, selectedP2, true, true);
  };
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
    // versus rematch flow
    selectingFor = 1;
    hideAllMenus();
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

// ========== LOOP ==========
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 16.67, 2); // normalize to ~60fps units
  last = now;
  if (gameState === State.FIGHT) updateFight(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
