// CHROMATIC RESENHA - Sprites (part A): helpers + The Forge, Tomato, Doggie, Foobal
// Sprites are drawn procedurally (vector) with feet at (0,0), facing +x.
// Angles: 0 = pointing down, +PI/2 = forward, PI = up.
const SPR = [];
let G = null;       // target 2D context
let _fl = false;    // hit flash
const C = c => (_fl ? '#fff' : c);
const lerp = (a, b, t) => a + (b - a) * t;
const _B = { bob: 0, lean: 0, la: 0, lb: 0, sq: 0 };
const _H = { x: 0, y: 0 };

function drawSprite(target, id, P) {
  G = target; _fl = !!P.flash;
  SPR[id](P);
}

// base pose shared by locomotion states
function bp(P) {
  const B = _B; B.bob = 0; B.lean = 0; B.la = 0; B.lb = 0; B.sq = 0;
  switch (P.ps) {
    case 'idle': B.bob = Math.sin(P.t * 0.09) * 1.3; break;
    case 'walk': { const s = Math.sin(P.wph); B.la = s * 0.75; B.lb = -s * 0.75; B.bob = -Math.abs(Math.cos(P.wph)) * 2.5; B.lean = 0.07; break; }
    case 'jump': { const r = P.vy < 0; B.la = r ? 0.7 : 0.3; B.lb = r ? -0.4 : -0.8; break; }
    case 'hit': B.lean = -0.3; B.la = 0.2; B.lb = -0.3; break;
    case 'block': B.sq = 5; B.lean = 0.12; B.la = 0.45; B.lb = -0.45; break;
    case 'dead': B.lean = -0.2; B.la = 0.3; B.lb = -0.3; break;
  }
  return B;
}

function fs(c, o, lw) {
  G.fillStyle = C(c); G.fill();
  if (o) { G.strokeStyle = C(o); G.lineWidth = lw || 2; G.lineJoin = 'round'; G.stroke(); }
}
function ln(x1, y1, x2, y2, w, c, o) {
  G.lineCap = 'round'; G.lineJoin = 'round';
  G.beginPath(); G.moveTo(x1, y1); G.lineTo(x2, y2);
  if (o) { G.strokeStyle = C(o); G.lineWidth = w + 3; G.stroke(); }
  G.strokeStyle = C(c); G.lineWidth = w; G.stroke();
}
function disc(x, y, r, c, o) { G.beginPath(); G.arc(x, y, r, 0, 6.2832); fs(c, o); }
function ell(x, y, rx, ry, c, o, rot) { G.beginPath(); G.ellipse(x, y, rx, ry, rot || 0, 0, 6.2832); fs(c, o); }
function poly(p, c, o) {
  G.beginPath(); G.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) G.lineTo(p[i], p[i + 1]);
  G.closePath(); fs(c, o);
}
function rect(x, y, w, h, c, o) { G.beginPath(); G.rect(x, y, w, h); fs(c, o); }
function rrect(x, y, w, h, r, c, o) { G.beginPath(); G.roundRect(x, y, w, h, r); fs(c, o); }
function arm2(sx, sy, a1, a2, l1, l2, w, c, o) {
  const ex = sx + Math.sin(a1) * l1, ey = sy + Math.cos(a1) * l1;
  _H.x = ex + Math.sin(a2) * l2; _H.y = ey + Math.cos(a2) * l2;
  ln(sx, sy, ex, ey, w, c, o); ln(ex, ey, _H.x, _H.y, w, c, o);
  return _H;
}
function sparks(x, y, t, col, n) {
  G.lineCap = 'round'; G.strokeStyle = C(col); G.lineWidth = 2;
  for (let i = 0; i < (n || 5); i++) {
    const a = i * 1.26 + t * 0.7, r1 = 6 + (i % 2) * 3, r2 = r1 + 7;
    G.beginPath(); G.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); G.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); G.stroke();
  }
}

// ======================= 0: THE FORGE =======================
// Spiky-haired fighter, orange headband, grey vest with orange dots, dark boxing fists.
SPR[0] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const hy = -34 + B.bob * 0.5;
  const skin = '#c99a79', out = '#1b1320', fist = '#2a2230';
  const leg = (hx, ang, stripe) => {
    const fx = hx + Math.sin(ang) * 34, fy = hy + Math.cos(ang) * 34;
    ln(hx, hy, fx, fy, 8, '#3a3a42', out); ln(hx, hy, fx, fy, 2, stripe, null);
    rect(fx - 4, fy - 4, 15, 6, '#14121a', null);
  };
  const w = at ? 0.45 : 0;
  leg(-3, B.lb - w * 0.6, '#6c6c76');
  // arms (guard by default)
  let na1 = 0.6 + Math.sin(P.t * 0.09) * 0.05, na2 = 2.5, fa1 = 0.3, fa2 = 2.7;
  if (P.ps === 'hit') { na1 = 1.9; na2 = 1.2; fa1 = 1.5; fa2 = 0.8; }
  else if (P.ps === 'block') { na1 = 1.1; na2 = 3.0; fa1 = 1.0; fa2 = 3.0; }
  else if (P.ps === 'jump') { na1 = 1.2; na2 = 2.2; fa1 = 0.8; fa2 = 2.6; }
  let spk = 0, lean = B.lean;
  if (at) {
    const punchN = () => { na1 = lerp(0.6, 1.5, ex) - 0.5 * bk; na2 = lerp(2.5, 1.57, ex) + 0.4 * bk; };
    const punchF = () => { fa1 = lerp(0.3, 1.5, ex) - 0.5 * bk; fa2 = lerp(2.7, 1.57, ex) + 0.4 * bk; };
    if (a === 'jab') { punchN(); lean += 0.12 * ex; }
    else if (a === 'hook') { punchF(); lean += 0.15 * ex; }
    else if (a === 'smash') { punchN(); punchF(); lean += 0.3 * ex - 0.15 * bk; spk = ex; }
    else if (a === 'overhead') {
      const up = ex > 0 ? 0 : bk;
      const A1 = ex > 0 ? lerp(0.6, 1.1, ex) : lerp(0.6, 2.9, up), A2 = ex > 0 ? lerp(2.5, 0.7, ex) : lerp(2.5, 3.1, up);
      na1 = fa1 = A1; na2 = fa2 = A2; lean += 0.4 * ex - 0.2 * bk; spk = ex;
    } else if (a === 'flurry') {
      if (P.k % 2 === 0) punchN(); else punchF();
      lean += 0.18; spk = ex;
    }
  }
  // far arm
  ctx_save(); G.translate(0, hy); G.rotate(lean);
  let h = arm2(-2, -26, fa1, fa2, 12, 12, 6, skin, out); const fhx = h.x, fhy = h.y;
  disc(fhx, fhy, 6, fist, out);
  // torso: grey vest with orange dots
  poly([-9, 0, 9, 0, 11, -27, -11, -27], '#54545c', out);
  rect(-10, -3, 20, 4, '#111', null);
  disc(3, -8, 1.8, '#ff7a1a'); disc(5, -15, 1.8, '#ff7a1a'); disc(-4, -21, 1.8, '#ff7a1a'); disc(6, -22, 1.5, '#ff7a1a');
  poly([-3, -27, 3, -27, 1, -18, -2, -18], skin, null);
  // head
  G.save(); G.translate(3, -37); G.rotate(P.ps === 'hit' ? -0.3 : 0.05);
  // headband tails (behind head)
  const wv = Math.sin(P.t * 0.3) * 3;
  G.lineCap = 'round'; G.strokeStyle = C('#ff7a1a'); G.lineWidth = 3;
  G.beginPath(); G.moveTo(-8, -3); G.quadraticCurveTo(-18, -2 + wv, -26, -7 + wv * 1.4); G.stroke();
  G.beginPath(); G.moveTo(-8, -1); G.quadraticCurveTo(-17, 3 - wv, -24, 2 - wv); G.stroke();
  // spiky hair
  poly([-10, -2, -12, -14, -6, -9, -5, -20, 0, -12, 5, -21, 7, -11, 12, -15, 10, -3], '#16121d', out);
  ell(0, 0, 10, 11, skin, out);
  rect(-10, -6, 20, 4, '#ff7a1a', null);
  // googly eyes
  disc(3.5, -0.5, 4.3, '#fff', out); disc(10, -0.5, 4.3, '#fff', out);
  disc(5, -0.5, 1.8, '#000'); disc(11.2, -0.5, 1.8, '#000');
  ln(4, 8, 10, 7, 1.5, '#7a4a35', null);
  G.restore();
  // near arm
  h = arm2(4, -26, na1, na2, 12, 12, 6, skin, out);
  disc(h.x, h.y, 6.5, fist, out);
  if (spk) sparks(h.x + 6, h.y, P.t, '#ffa733', 5);
  G.restore();
  leg(5, B.la + w, '#6c6c76');
};
function ctx_save() { G.save(); }

// ======================= 1: TOMATO =======================
// Round red tomato with a green leaf crown and stubby limbs.
SPR[1] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const red = '#e74c3c', dark = '#a82f23', out = '#3a0f0a';
  let sx = 1, sy = 1;
  if (P.ps === 'idle') { sy = 1 + Math.sin(P.t * 0.09) * 0.035; sx = 2 - sy; }
  else if (P.ps === 'jump') { sy = P.vy < 0 ? 1.12 : 0.95; sx = 2 - sy; }
  else if (P.ps === 'block') { sy = 0.85; sx = 1.12; }
  else if (P.ps === 'walk') { sy = 1 + Math.sin(P.wph * 2) * 0.04; sx = 2 - sy; }
  const rolling = a === 'roll' && P.el > 4 && !P.landed;
  G.save(); G.scale(sx, sy);
  const legY = -12;
  if (!rolling) {
    const lg = (x, ang) => { const fx = x + Math.sin(ang) * 11, fy = legY + Math.cos(ang) * 11; ln(x, legY, fx, fy, 7, '#2d8f4e', out); ell(fx + 3, fy - 1, 7, 4, '#1f6b39', out); };
    lg(-8, B.lb * 0.8); lg(8, B.la * 0.8);
  }
  G.save(); G.translate(0, -35 + B.bob * 0.4);
  if (rolling) G.rotate(P.el * 0.55);
  else G.rotate(B.lean * 0.6 + (at ? (a === 'throw' ? 0.15 * ex - 0.2 * bk : 0.1 * ex) : 0));
  // body
  ell(0, 0, 22, 23, red, out);
  ell(-8, -8, 7, 9, 'rgba(255,255,255,0.28)', null, -0.5);
  ell(10, 8, 9, 10, dark, null); ell(0, 0, 22, 23, 'rgba(0,0,0,0)', out);
  // leaf crown
  const lf = [0, -22, -5, -26, -11, -25, -6, -29, -9, -34, -2, -30, 0, -37, 3, -30, 10, -34, 6, -28, 12, -25, 5, -26];
  poly(lf, '#27ae60', '#0f4d26');
  if (rolling) { G.restore(); G.save(); G.translate(0, -35); } else G.rotate(-B.lean * 0.6);
  // face (does not rotate while rolling)
  const fx = 6;
  disc(fx - 3, -4, 5, '#fff', out); disc(fx + 8, -4, 5, '#fff', out);
  disc(fx - 1.5, -4, 2.2, '#000'); disc(fx + 9.5, -4, 2.2, '#000');
  const ang = at || P.ps === 'hit';
  ln(fx - 8, -11, fx + 1, ang ? -7 : -9, 2, out, null); ln(fx + 14, -11, fx + 6, ang ? -7 : -9, 2, out, null);
  if (P.ps === 'hit') ell(fx + 3, 9, 4, 3, '#4a0d0d', null);
  else if (at) { G.beginPath(); G.arc(fx + 3, 6, 5, 0, 3.14); fs('#4a0d0d', out, 1.5); }
  else ln(fx - 3, 8, fx + 9, 8, 2, out, null);
  ell(fx - 8, 4, 3.5, 2.2, 'rgba(255,140,140,0.6)', null);
  // arms
  if (!rolling) {
    let a1 = 0.5 + B.la * 0.3, a2 = 0.5;
    if (P.ps === 'hit') { a1 = 2; a2 = 1.6; }
    else if (P.ps === 'block') { a1 = 1.6; a2 = 1.6; }
    else if (P.ps === 'jump') { a1 = 2.3; a2 = 2; }
    let tom = false;
    if (a === 'slap' || a === 'slap2') { a1 = lerp(0.5, 1.6, ex) - bk * 0.8; a2 = 0.3; if (a === 'slap2') a2 = lerp(0.5, 1.6, ex) - bk * 0.8; }
    else if (a === 'throw') { const up = ex > 0 ? 0 : bk; a1 = ex > 0 ? lerp(2.8, 1.3, ex) : lerp(0.5, 2.8, up); tom = ex === 0 && P.el < 12 && P.el > 1; }
    const nx = 16, ny = 2;
    const e1x = nx + Math.sin(a1) * 12, e1y = ny + Math.cos(a1) * 12;
    ln(-14, 3, -14 + Math.sin(a2) * 11, 3 + Math.cos(a2) * 11, 6, dark, out);
    ln(nx, ny, e1x, e1y, 6.5, red, out); disc(e1x, e1y, 5, '#c0392b', out);
    if (tom) { disc(e1x, e1y - 6, 8, red, out); poly([e1x - 4, e1y - 13, e1x, e1y - 17, e1x + 4, e1y - 13], '#27ae60', null); }
    if (ex > 0 && (a === 'slap' || a === 'slap2')) sparks(e1x + 5, e1y, P.t, '#fff3a0', 4);
  } else {
    sparks(26, -4, P.t, '#fff', 3);
  }
  G.restore(); G.restore();
};

// ======================= 2: DOGGIE =======================
// Jack Russell terrier: white body, brown patches on head/back, neon-yellow harness, black sneakers.
SPR[2] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const white = '#fbf5e6', brown = '#6a3f22', out = '#2a1b12', neon = '#c6e83a';
  const run = P.ps === 'walk' ? 1 : 0;
  let tilt = at ? (a === 'dash' ? 0.08 : a === 'frenzy' ? 0.18 + 0.1 * Math.sin(P.t * 1.2) : 0.1 * ex - 0.08 * bk) : B.lean * 0.5;
  const bob = P.ps === 'idle' ? Math.sin(P.t * 0.1) * 0.8 : run ? -Math.abs(Math.cos(P.wph * 1.4)) * 3 : 0;
  G.save(); G.translate(0, bob); G.rotate(tilt);
  const hipX = -14, shX = 12, by = -16;
  const sp = P.ps === 'jump' ? (P.vy < 0 ? 1 : 0.6) : 0;
  const leg = (x, ph, front) => {
    let ang = run ? Math.sin(P.wph * 1.4 + ph) * 0.9 : 0;
    if (P.ps === 'jump') ang = front ? 0.9 * sp + 0.2 : -0.9 * sp - 0.2;
    if (at && a !== 'dash') ang = front ? 0.3 : -0.3;
    if (a === 'dash') ang = front ? 1.1 : -1.1;
    if (P.ps === 'hit') ang = front ? -0.4 : 0.4;
    const fx = x + Math.sin(ang) * 14, fy = by + Math.cos(ang) * 14;
    ln(x, by, fx, fy, 5, white, out);
    rect(fx - 4, fy - 3, 11, 6, '#1b1b1f', out); rect(fx - 4, fy + 1, 11, 2.5, '#f2f2f2', null);
  };
  leg(hipX - 3, 3.14, false); leg(shX - 3, 0, true);
  // tail
  G.lineCap = 'round'; const wag = Math.sin(P.t * (at ? 0.9 : 0.35)) * 0.4;
  G.strokeStyle = C(out); G.lineWidth = 6.5; G.beginPath(); G.moveTo(-22, -26); G.quadraticCurveTo(-30, -34, -30 + wag * 6, -42); G.stroke();
  G.strokeStyle = C(white); G.lineWidth = 4; G.stroke();
  // body
  ell(-2, -22, 24, 11, white, out);
  ell(-9, -27, 10, 6, brown, null, -0.1);
  poly([5, -32, 11, -32, 12, -12, 6, -12], neon, '#7f9a1d');
  ell(-2, -22, 24, 11, 'rgba(0,0,0,0)', out);
  leg(hipX + 4, 3.14 + 1.2, false); leg(shX + 5, 1.2, true);
  // head (lunges on bites)
  const lunge = (a === 'bite' ? 10 * ex - 5 * bk : a === 'dash' ? 8 : a === 'frenzy' ? (P.k % 2 === 0 ? 1 : 0.4) * 10 * (ex + 0.3) : 0);
  G.save(); G.translate(24 + lunge, -30 + (P.ps === 'hit' ? 4 : 0));
  G.rotate(P.ps === 'hit' ? -0.4 : (at ? 0.1 : -0.05));
  ln(-6, 2, -14, 8, 9, white, null);
  const open = at && (a !== 'dash' || ex > 0) && a !== '' ? Math.max(ex, 0.3) : (run ? 0.35 : 0.2);
  // lower jaw
  poly([2, 2, 18, 3 + open * 6, 16, 8 + open * 7, 0, 7], white, out);
  if (open > 0.28) { poly([6, 3.5, 8, 6.5, 10, 3.6], '#fff', null); poly([12, 3.8, 14, 7, 16, 4], '#fff', null); ell(10, 7 + open * 3, 5, 2.5, '#e8788c', null); }
  ell(0, -1, 11, 9, white, out);
  ell(13, 0, 9, 6, white, out);
  ell(-2, -4, 8, 7, brown, null);
  ell(-9, -3, 4, 9, brown, out, 0.3);   // floppy ear
  ell(3, -8, 3.5, 5, brown, out, -0.5);
  disc(21, -1, 3.4, '#111', null);
  disc(6, -3, 2.3, '#111', null); disc(6.7, -3.7, 0.8, '#fff', null);
  if (run || (!at && P.ps === 'idle' && Math.sin(P.t * 0.12) > 0)) ell(13, 8, 3, 4, '#e8788c', null);
  G.restore();
  if (a === 'dash' || a === 'frenzy') { ln(-34, -34, -50, -34, 2, 'rgba(255,255,255,0.7)', null); ln(-34, -22, -56, -22, 2, 'rgba(255,255,255,0.7)', null); }
  G.restore();
};

// ======================= 3: FOOBAL =======================
// Soccer-ball head/body, green limbs and socks, white gloves, cleats.
SPR[3] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const green = '#2ecc71', gd = '#1e8449', out = '#0f2a1a';
  const hy = -24 + B.bob * 0.5;
  const kicking = a === 'kick' || a === 'shot' || a === 'chilena';
  const kickAng = a === 'chilena' ? lerp(0.3, 3.0, Math.max(ex, bk * 0.7)) : lerp(0.2, 1.65, ex) - 1.0 * bk;
  const leg = (x, ang, near) => {
    const fx = x + Math.sin(ang) * 22, fy = hy + Math.cos(ang) * 22;
    ln(x, hy, fx, fy, 6, green, out); ln(x, hy + 8, fx, fy, 6, 'rgba(0,0,0,0)', null);
    ln(fx - Math.sin(ang) * 6, fy - Math.cos(ang) * 6, fx, fy, 7, '#fff', null);
    rect(fx - 4 + Math.sin(ang) * 2, fy - 3, 13, 6, '#18181c', out);
    rect(fx + 1, fy + 1, 9, 2, green, null);
  };
  leg(-5, (kicking ? -0.5 : B.lb) - (a === 'chilena' ? 0 : 0), false);
  G.save();
  G.translate(0, hy - 18 + B.bob * 0.5);
  let rot = 0;
  if (a === 'chilena') rot = -lerp(0, 2.3, Math.max(ex, bk)) + 0; else rot = B.lean + (kicking ? -0.25 * ex + 0.15 * bk : 0);
  G.rotate(rot);
  // far arm
  let aa1 = 0.5 + B.la * 0.4, ab1 = 0.4;
  if (P.ps === 'hit') { aa1 = 2.1; ab1 = 1.7; } else if (P.ps === 'block') { aa1 = 1.5; ab1 = 1.5; } else if (P.ps === 'jump') { aa1 = 2.4; ab1 = 2.0; }
  if (kicking) { aa1 = 2.2; ab1 = -0.4; }
  ln(-14, 4, -14 + Math.sin(ab1) * 14, 4 + Math.cos(ab1) * 14, 5, green, out);
  // ball body
  G.save(); G.rotate(P.wph * 0.35);
  disc(0, 0, 23, '#f6f6f6', out);
  poly([0, -7, 6, -3, 4, 5, -4, 5, -6, -3], '#1c1c20', null);
  const pts = [0, -23, 11, -14, 19, 4, -1, 22, -18, 5];
  for (let i = 0; i < 5; i++) { const ax = Math.cos(i * 1.2566 - 1.57) , ay = Math.sin(i * 1.2566 - 1.57); poly([ax * 14 - 4, ay * 14 - 3, ax * 14 + 4, ay * 14 - 3, ax * 14 + 5, ay * 14 + 4, ax * 14 - 5, ay * 14 + 4].map((v, j) => v), '#1c1c20', null); }
  G.restore();
  disc(0, 0, 23, 'rgba(0,0,0,0)', out);
  // face
  disc(5, -4, 4.8, '#fff', out); disc(15, -4, 4.8, '#fff', out);
  disc(6.6, -4, 2.2, '#000'); disc(16.4, -4, 2.2, '#000');
  ln(0, -11, 9, -8, 2.2, out, null); ln(21, -11, 12, -8, 2.2, out, null);
  if (P.ps === 'hit') ell(11, 8, 4, 3, '#222', null); else { G.beginPath(); G.arc(11, 4, 5, 0.2, 2.9); G.strokeStyle = C(out); G.lineWidth = 2; G.stroke(); }
  // near arm
  let na = 0.3 - B.la * 0.4;
  if (P.ps === 'hit') na = 1.8; else if (P.ps === 'block') na = 1.7; else if (P.ps === 'jump') na = 2.2;
  if (kicking) na = 1.2 + ex * 0.6;
  const hx = 14 + Math.sin(na) * 14, hyy = 4 + Math.cos(na) * 14;
  ln(14, 4, hx, hyy, 5.5, green, out); disc(hx, hyy, 5, '#fff', out);
  G.restore();
  leg(5, kicking ? (a === 'chilena' ? kickAng : kickAng) : B.la, true);
  if (kicking && ex > 0) { ln(26, hy - 8, 44, hy - 14, 2, 'rgba(255,255,255,0.8)', null); sparks(34, hy + 6, P.t, '#fff', 4); }
};
