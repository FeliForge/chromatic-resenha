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
    id: 0, name: 'The Forge', color: '#54545c', accent: '#ff7a1a',
    speed: 4.2, jump: 14, hp: 100, damageMul: 1.0,
    specialty: 'fast', desc: 'Forger - Quick strikes'
  },
  {
    id: 1, name: 'Tomato', color: '#e74c3c', accent: '#27ae60',
    speed: 3.5, jump: 13, hp: 110, damageMul: 1.05,
    specialty: 'balanced', desc: 'Versatile tomato'
  },
  {
    id: 2, name: 'Doggie', color: '#fbf5e6', accent: '#6a3f22',
    speed: 5.5, jump: 15, hp: 90, damageMul: 0.9,
    specialty: 'speed', desc: 'Extremely fast dog'
  },
  {
    id: 3, name: 'Foobal', color: '#2ecc71', accent: '#fff',
    speed: 3.8, jump: 12, hp: 100, damageMul: 1.0,
    specialty: 'ranged', desc: 'Long-range soccer'
  },
  {
    id: 4, name: 'Box-er', color: '#b78a5d', accent: '#d62d2d',
    speed: 2.2, jump: 10, hp: 130, damageMul: 1.45,
    specialty: 'tank', desc: 'Slow heavy damage'
  },
  {
    id: 5, name: 'Jumper', color: '#91cc27', accent: '#c64916',
    speed: 3.8, jump: 18, hp: 112, damageMul: 1.3,
    specialty: 'air', desc: 'Aerial specialist'
  },
  {
    id: 6, name: 'Ranch-Man', color: '#26549e', accent: '#7d4421',
    speed: 3.4, jump: 12, hp: 105, damageMul: 1.15,
    specialty: 'whip', desc: 'Cowboy whip master'
  },
  {
    id: 7, name: 'Iron Fist', color: '#f08d82', accent: '#f5d86a',
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

// Fighter class, projectiles, effects: see fighter.js / moves.js / sprites_*.js

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
  projectiles.length = 0; fx.length = 0; shakeT = 0;
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
  updateFx(dt);
  if (fightOver) return;
  const inp1 = getP1Input();
  const inp2 = p2.isPlayer ? getP2Input() : null;

  p1.update(dt, p2, inp1);
  p2.update(dt, p1, inp2);
  updateProjectiles(dt, p1, p2);

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
  el.style.background = `#222 url(${spriteIcon(charId, 120)}) center/contain no-repeat`;
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
    ctx.save();
    if (shakeT > 0) ctx.translate((Math.random() - 0.5) * shakeT, (Math.random() - 0.5) * shakeT);
    drawStage();
    if (p1) p1.draw();
    if (p2) p2.draw();
    drawProjectiles();
    drawFx();
    ctx.restore();
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
    btn.innerHTML = `<img class="icon" src="${spriteIcon(i, 64)}" alt="" style="width:64px;height:64px;border-radius:0;margin-bottom:2px">${c.name}`;
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
