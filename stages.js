// CHROMATIC RESENHA - Logical resolution + parallax stage backgrounds
const W = 960, H = 540;
const GROUND_Y = 440;   // where fighters' feet stand
const FLOOR_TOP = 382;  // horizon line of the floor

function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

const STAGES = [
  { name: 'Arena', bg: '#1a1a2e', ground: '#16213e', accent: '#0f3460' },
  { name: 'Rooftop', bg: '#2c3e50', ground: '#34495e', accent: '#7f8c8d' },
  { name: 'Dojo', bg: '#3d2b1f', ground: '#5c4033', accent: '#8b5a2b' }
];

function perspFloor(c, top, vy, colTop, colBot, lineCol, ox, spacing, rows) {
  const g = c.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, colTop); g.addColorStop(1, colBot);
  c.fillStyle = g; c.fillRect(0, top, W, H - top);
  c.strokeStyle = lineCol; c.lineWidth = 2;
  const vx = W / 2;
  for (let i = -14; i <= 14; i++) {
    const xb = vx + i * spacing + (ox % spacing);
    const xt = vx + (xb - vx) * (top - vy) / (H - vy);
    c.beginPath(); c.moveTo(xt, top); c.lineTo(xb, H); c.stroke();
  }
  for (let k = 1; k <= rows; k++) {
    const y = top + (H - top) * Math.pow(k / rows, 1.9);
    c.globalAlpha = 0.35 + 0.65 * (k / rows);
    c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
  }
  c.globalAlpha = 1;
}

function drawArena(c, t, camX) {
  const sky = c.createLinearGradient(0, 0, 0, FLOOR_TOP);
  sky.addColorStop(0, '#06061c'); sky.addColorStop(0.6, '#1c0c40'); sky.addColorStop(1, '#3a1060');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  // LED wall
  const ox = -camX * 0.05;
  for (let i = 0; i < 26; i++) for (let j = 0; j < 5; j++) {
    const h = hash(i * 7 + j * 13), on = Math.sin(t * 0.03 + i * 0.7 + j) > -0.2;
    c.fillStyle = on ? `hsl(${(200 + h * 140 + t * 0.4) % 360},90%,${45 + h * 20}%)` : '#120a28';
    c.globalAlpha = on ? 0.55 : 0.8;
    c.fillRect(ox + i * 40 - 20, 40 + j * 22, 36, 18);
  }
  c.globalAlpha = 1;
  // marquee
  c.save(); c.textAlign = 'center';
  c.font = '900 46px Impact, "Arial Black", sans-serif';
  c.shadowColor = '#ff2bd6'; c.shadowBlur = 24; c.fillStyle = '#ffd1f7';
  c.fillText('CHROMATIC RESENHA', W / 2 + ox * 0.6, 188);
  c.shadowBlur = 0; c.restore();
  // spotlight beams
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const bx = 80 + i * 160 + ox, ang = Math.sin(t * 0.015 + i * 1.3) * 0.45;
    const g = c.createLinearGradient(bx, 0, bx + Math.sin(ang) * 400, 400);
    const col = i % 2 ? '255,80,220' : '80,200,255';
    g.addColorStop(0, `rgba(${col},0.35)`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.beginPath();
    c.moveTo(bx - 8, 0); c.lineTo(bx + 8, 0);
    c.lineTo(bx + Math.sin(ang) * 420 + 90, 420); c.lineTo(bx + Math.sin(ang) * 420 - 90, 420);
    c.closePath(); c.fill();
  }
  c.restore();
  // crowd rows
  for (let row = 0; row < 3; row++) {
    const y = 262 + row * 40, par = 0.12 + row * 0.1, shade = 12 + row * 10;
    c.fillStyle = `rgb(${shade},${shade * 0.6},${shade * 2.2})`;
    for (let i = -2; i < 26; i++) {
      const x = i * 42 + (row % 2) * 20 - camX * par;
      const bob = Math.abs(Math.sin(t * 0.08 + i * 1.9 + row)) * (6 + row * 2);
      c.beginPath(); c.arc(x, y - bob, 13, 0, Math.PI * 2); c.fill();
      c.fillRect(x - 17, y + 8 - bob, 34, 50);
      if (hash(i + row * 31) > 0.82) {
        c.fillStyle = `hsl(${hash(i * 3 + row) * 360},100%,65%)`;
        c.fillRect(x + 14, y - 28 - bob, 4, 26);
        c.fillStyle = `rgb(${shade},${shade * 0.6},${shade * 2.2})`;
      }
    }
  }
  // barrier
  const bar = c.createLinearGradient(0, 355, 0, FLOOR_TOP);
  bar.addColorStop(0, '#2b2b4a'); bar.addColorStop(1, '#0d0d20');
  c.fillStyle = bar; c.fillRect(0, 355, W, FLOOR_TOP - 355);
  c.fillStyle = '#ff2bd6'; c.fillRect(0, 355, W, 3);
  // floor
  perspFloor(c, FLOOR_TOP, 150, '#2a1a62', '#0b0620', 'rgba(120,90,255,0.45)', -camX * 0.9, 90, 7);
  const sh = c.createLinearGradient(0, FLOOR_TOP, 0, FLOOR_TOP + 40);
  sh.addColorStop(0, 'rgba(255,60,220,0.55)'); sh.addColorStop(1, 'rgba(255,60,220,0)');
  c.fillStyle = sh; c.fillRect(0, FLOOR_TOP, W, 40);
  c.fillStyle = 'rgba(255,255,255,0.06)';
  c.beginPath(); c.ellipse(W / 2 - camX * 0.9, 480, 300, 38, 0, 0, Math.PI * 2); c.fill();
}

function drawRooftop(c, t, camX) {
  const sky = c.createLinearGradient(0, 0, 0, FLOOR_TOP);
  sky.addColorStop(0, '#1b1650'); sky.addColorStop(0.45, '#8a2f86'); sky.addColorStop(0.8, '#ff7a45'); sky.addColorStop(1, '#ffc15a');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  // sun
  const sx = W * 0.62 - camX * 0.03, sy = 290;
  const glow = c.createRadialGradient(sx, sy, 10, sx, sy, 220);
  glow.addColorStop(0, 'rgba(255,240,170,0.9)'); glow.addColorStop(1, 'rgba(255,160,80,0)');
  c.fillStyle = glow; c.fillRect(sx - 230, sy - 230, 460, 460);
  c.fillStyle = '#fff3b0'; c.beginPath(); c.arc(sx, sy, 62, 0, Math.PI * 2); c.fill();
  // clouds
  c.fillStyle = 'rgba(255,170,190,0.45)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 230 + t * (0.15 + i * 0.03)) % (W + 300)) - 150 - camX * 0.04, cy = 70 + hash(i) * 120;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(cx + k * 34, cy + (k % 2) * 6, 56, 15, 0, 0, Math.PI * 2); c.fill(); }
  }
  // skylines
  const layers = [
    { col: '#6b2a78', par: 0.08, base: 345, min: 50, max: 130, seed: 1 },
    { col: '#3c1a56', par: 0.18, base: 360, min: 70, max: 170, seed: 9 },
    { col: '#1f1038', par: 0.32, base: 372, min: 60, max: 150, seed: 21 }
  ];
  layers.forEach(L => {
    let x = -80 - camX * L.par;
    for (let i = 0; i < 20; i++) {
      const bw = 50 + hash(i + L.seed) * 60, bh = L.min + hash(i * 3 + L.seed) * (L.max - L.min);
      c.fillStyle = L.col; c.fillRect(x, L.base - bh, bw, bh + 40);
      if (L.par > 0.1) {
        for (let wy = L.base - bh + 10; wy < L.base - 6; wy += 14) for (let wx = x + 6; wx < x + bw - 8; wx += 12) {
          if (hash(wx * 0.37 + wy * 1.7 + L.seed) > 0.55) { c.fillStyle = 'rgba(255,214,120,0.85)'; c.fillRect(wx, wy, 6, 8); }
        }
      }
      if (i % 5 === 2) {
        c.fillStyle = L.col; c.fillRect(x + bw / 2 - 1, L.base - bh - 28, 3, 28);
        if (Math.sin(t * 0.07 + i) > 0) { c.fillStyle = '#ff3b3b'; c.fillRect(x + bw / 2 - 2, L.base - bh - 31, 5, 5); }
      }
      x += bw + 6;
    }
  });
  // parapet wall
  const wall = c.createLinearGradient(0, 335, 0, FLOOR_TOP);
  wall.addColorStop(0, '#6a5a6e'); wall.addColorStop(1, '#3a2f44');
  c.fillStyle = wall; c.fillRect(0, 335, W, FLOOR_TOP - 335);
  c.fillStyle = '#8a7a8e'; c.fillRect(0, 331, W, 8);
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
  for (let y = 345; y < FLOOR_TOP; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  // water tower + AC
  const tx = 90 - camX * 0.5;
  c.fillStyle = '#2a2236'; c.fillRect(tx - 6, 230, 6, 105); c.fillRect(tx + 54, 230, 6, 105);
  c.fillStyle = '#5a4a3a'; c.fillRect(tx - 14, 170, 84, 64);
  c.fillStyle = '#463828'; c.fillRect(tx - 14, 170, 84, 8); c.fillRect(tx - 14, 196, 84, 5);
  c.beginPath(); c.moveTo(tx - 20, 170); c.lineTo(tx + 28, 140); c.lineTo(tx + 76, 170); c.closePath(); c.fill();
  const ax = 760 - camX * 0.5;
  c.fillStyle = '#7d7488'; c.fillRect(ax, 292, 90, 43);
  c.fillStyle = '#5b5368'; c.fillRect(ax, 292, 90, 6);
  c.strokeStyle = '#4a4258'; c.lineWidth = 3;
  c.beginPath(); c.arc(ax + 45, 317, 15, 0, Math.PI * 2); c.stroke();
  // railing
  c.strokeStyle = '#2c2434'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 352); c.lineTo(W, 352); c.stroke();
  for (let x = 6 - (camX * 0.6 % 40); x < W; x += 40) { c.beginPath(); c.moveTo(x, 335); c.lineTo(x, FLOOR_TOP); c.stroke(); }
  // concrete floor
  perspFloor(c, FLOOR_TOP, 120, '#5a5062', '#2c2634', 'rgba(255,255,255,0.10)', -camX * 0.9, 140, 6);
  c.fillStyle = '#e8c33a'; c.fillRect(0, 470, W, 5);
  c.fillStyle = 'rgba(255,200,120,0.12)'; c.fillRect(0, FLOOR_TOP, W, 22);
}

function drawDojo(c, t, camX) {
  const wall = c.createLinearGradient(0, 0, 0, FLOOR_TOP);
  wall.addColorStop(0, '#2a1a10'); wall.addColorStop(1, '#6b4426');
  c.fillStyle = wall; c.fillRect(0, 0, W, H);
  // shoji screens
  const ox = -camX * 0.08;
  for (let i = 0; i < 7; i++) {
    const x = 40 + i * 130 + ox, g = c.createLinearGradient(0, 70, 0, 340);
    g.addColorStop(0, '#f6e2b0'); g.addColorStop(1, '#d9b676');
    c.fillStyle = g; c.fillRect(x, 70, 112, 270);
    c.strokeStyle = '#5a361c'; c.lineWidth = 3; c.strokeRect(x, 70, 112, 270);
    c.lineWidth = 2;
    for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 28, 70); c.lineTo(x + k * 28, 340); c.stroke(); }
    for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(x, 70 + k * 45); c.lineTo(x + 112, 70 + k * 45); c.stroke(); }
  }
  c.fillStyle = 'rgba(255,160,60,0.10)'; c.fillRect(0, 0, W, FLOOR_TOP);
  // beams
  c.fillStyle = '#2b180c'; c.fillRect(0, 0, W, 54); c.fillRect(0, 336, W, 16);
  c.fillStyle = '#4a2a14'; c.fillRect(0, 50, W, 6);
  // hanging banners
  [200, 760].forEach((bx0, bi) => {
    const bx = bx0 - camX * 0.25, sway = Math.sin(t * 0.03 + bi) * 3;
    c.fillStyle = '#2b180c'; c.fillRect(bx - 38, 56, 76, 6);
    c.fillStyle = '#b3201f'; c.beginPath();
    c.moveTo(bx - 34, 62); c.lineTo(bx + 34, 62); c.lineTo(bx + 34 + sway, 250); c.lineTo(bx + sway, 232); c.lineTo(bx - 34 + sway, 250); c.closePath(); c.fill();
    c.strokeStyle = '#f0c040'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#f7ecd0'; c.beginPath(); c.arc(bx + sway * 0.5, 130, 20, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#b3201f'; c.beginPath(); c.arc(bx + sway * 0.5, 130, 11, 0, Math.PI * 2); c.fill();
  });
  // lanterns
  [[90, 90], [480, 100], [870, 90]].forEach((l, i) => {
    const lx = l[0] - camX * 0.3 + Math.sin(t * 0.04 + i) * 3, ly = l[1];
    const gl = c.createRadialGradient(lx, ly + 22, 4, lx, ly + 22, 90);
    gl.addColorStop(0, 'rgba(255,170,60,0.5)'); gl.addColorStop(1, 'rgba(255,170,60,0)');
    c.fillStyle = gl; c.fillRect(lx - 90, ly - 70, 180, 180);
    c.strokeStyle = '#1a0e06'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, 54); c.lineTo(lx, ly); c.stroke();
    c.fillStyle = '#e03a1e'; c.beginPath(); c.ellipse(lx, ly + 22, 19, 25, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffd17a'; c.beginPath(); c.ellipse(lx, ly + 22, 9, 16, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1a0e06'; c.fillRect(lx - 11, ly - 2, 22, 5); c.fillRect(lx - 11, ly + 44, 22, 5);
  });
  // pillars
  [0, 480, 960].forEach(px0 => {
    const px = px0 - camX * 0.18;
    const g = c.createLinearGradient(px - 22, 0, px + 22, 0);
    g.addColorStop(0, '#2a160a'); g.addColorStop(0.5, '#6d4222'); g.addColorStop(1, '#2a160a');
    c.fillStyle = g; c.fillRect(px - 22, 0, 44, FLOOR_TOP);
  });
  // seated students
  for (let i = 0; i < 14; i++) {
    const x = 30 + i * 70 - camX * 0.35 + (i % 2) * 14, y = 336 - (i % 2) * 4;
    c.fillStyle = i % 3 === 0 ? '#e8e8e8' : (i % 3 === 1 ? '#c9d6e8' : '#f1e3c4');
    c.fillRect(x - 16, y - 12, 32, 40);
    c.fillStyle = '#d9a066'; c.beginPath(); c.arc(x, y - 22, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1a1208'; c.beginPath(); c.arc(x, y - 26, 12, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = i % 4 === 0 ? '#202020' : '#8a2a2a'; c.fillRect(x - 16, y + 2, 32, 5);
  }
  // wood floor
  perspFloor(c, FLOOR_TOP, 110, '#b27a3e', '#5a3818', 'rgba(60,30,10,0.55)', -camX * 0.9, 110, 7);
  const sh = c.createLinearGradient(0, FLOOR_TOP, 0, FLOOR_TOP + 60);
  sh.addColorStop(0, 'rgba(255,230,170,0.35)'); sh.addColorStop(1, 'rgba(255,230,170,0)');
  c.fillStyle = sh; c.fillRect(0, FLOOR_TOP, W, 60);
  // petals
  for (let i = 0; i < 18; i++) {
    const px = ((hash(i) * W * 1.3 + t * (0.5 + hash(i + 5)) * 0.8) % (W + 80)) - 40;
    const py = ((hash(i + 40) * H + t * (0.7 + hash(i + 9) * 0.6)) % (H + 40)) - 20;
    c.save(); c.translate(px, py); c.rotate(t * 0.03 + i);
    c.fillStyle = 'rgba(255,170,200,0.85)'; c.beginPath(); c.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); c.fill(); c.restore();
  }
}

function drawStage(c, idx, t, camX) {
  if (idx === 0) drawArena(c, t, camX);
  else if (idx === 1) drawRooftop(c, t, camX);
  else drawDojo(c, t, camX);
  // soft vignette
  const v = c.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}
