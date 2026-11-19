// CHROMATIC RESENHA - Sprites (part B): Box-er, Jumper, Ranch-Man, Iron Fist

// ======================= 4: BOX-ER =======================
// Cardboard box with packing tape, shipping label and fragile marks; stubby legs, huge red gloves.
SPR[4] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const out = '#3a2616', glove = '#d62d2d';
  let sy = 1, sx = 1, rot = B.lean * 0.5, lift = 0;
  if (P.ps === 'idle') { sy = 1 + Math.sin(P.t * 0.07) * 0.02; }
  if (P.ps === 'block') { sy = 0.88; sx = 1.06; }
  if (a === 'slam') { rot = ex > 0 ? 0.12 : -0.18 * bk; sy = ex > 0 ? 0.92 : 1 + 0.05 * bk; }
  if (a === 'punch') rot = 0.12 * ex - 0.1 * bk;
  if (a === 'bodyslam') {
    if (P.landed) { sy = 0.8; sx = 1.12; }
    else if (P.el > 8) rot = Math.min(1, (P.el - 8) / 34) * 6.28;
    else rot = -0.15 * bk;
  }
  // legs
  const leg = (x, ang) => { const fx = x + Math.sin(ang) * 14, fy = -14 + Math.cos(ang) * 14; ln(x, -14, fx, fy, 9, '#7a5232', out); rrect(fx - 6, fy - 5, 18, 9, 4, '#e8e8e8', out); rect(fx - 6, fy, 18, 3, '#b0b0b0', null); };
  leg(-16, B.lb * 0.8); leg(14, B.la * 0.8);
  G.save(); G.translate(0, -16 + B.bob * 0.4); G.scale(sx, sy); G.translate(0, -30); G.rotate(rot);
  // arms behind box (far)
  const gl = (sx0, sy0, a1, l, wr) => { const hx = sx0 + Math.sin(a1) * l, hy2 = sy0 + Math.cos(a1) * l; ln(sx0, sy0, hx, hy2, 9, '#c89a6a', out); ell(hx + 2, hy2, wr, wr * 0.9, glove, '#6b0f0f'); rect(hx - 7, hy2 - 3, 4, 6, '#fff', null); return hx; };
  let fa = 0.5, na = 0.4, len = 22, wr = 13;
  if (P.ps === 'hit') { fa = 2; na = 1.6; } else if (P.ps === 'block') { fa = 2.6; na = 2.4; } else if (P.ps === 'jump') { fa = 2.2; na = 2; }
  if (a === 'punch') { na = lerp(0.4, 1.57, ex) - 0.9 * bk; len = lerp(22, 38, ex); wr = lerp(13, 17, ex); }
  else if (a === 'slam') { const up = ex > 0 ? 0 : bk; na = fa = ex > 0 ? lerp(0.5, 1.3, ex) : lerp(0.5, 3.0, up); len = 30; wr = 17; }
  else if (a === 'bodyslam') { na = fa = 2.4; len = 26; }
  gl(-30, -4, fa - 0.4, len, wr);
  // box: right (side) face, top face, front face
  poly([14, -46, 34, -54, 34, -8, 14, 0], '#8f673f', out);
  poly([-34, -46, 14, -46, 34, -54, -14, -54], '#d9b07a', out);
  rect(-34, -46, 48, 46, '#b78a5d', out);
  // tape strip over top and front
  poly([-14, -54, -2, -54, 18, -48, 6, -46], '#e8cf9b', null);
  rect(-14, -46, 12, 18, '#e8cf9b', null);
  poly([-14, -46, -2, -46, -2, -44, -14, -44], '#c9ae7a', null);
  // label + fragile marks
  rect(2, -24, 11, 14, '#f3f3f3', '#555'); ln(4, -20, 11, -20, 1, '#444', null); ln(4, -16, 11, -16, 1, '#444', null);
  rect(-28, -22, 6, 10, '#6b4a2a', null); ln(-27, -20, -23, -14, 1.2, '#f0e0c0', null);
  rect(-20, -22, 6, 10, '#6b4a2a', null);
  // creases
  ln(-34, -46, -34, 0, 1, 'rgba(0,0,0,0.25)', null);
  gl(30, -8, na, len, wr);
  if (ex > 0 && (a === 'punch' || a === 'slam')) { sparks(54, -10, P.t, '#ffe27a', 5); }
  G.restore();
};

// ======================= 5: JUMPER =======================
// Pixel-art: lime cap, one black eye, brown moustache, maroon shirt, lime sleeves, orange legs, dark boots.
SPR[5] = function (P) {
  const a = P.anim, ex = P.ex, bk = P.bk, at = P.atk, U = 4;
  const lime = '#91cc27', skin = '#f7bf84', mou = '#6a3a09', shirt = '#731d47', orange = '#c64916', boot = '#3f2003';
  const R = (x, y, w, h, c) => { G.fillStyle = C(c); G.fillRect(Math.round(x * U), Math.round(y * U), Math.round(w * U), Math.round(h * U)); };
  let bob = 0, la = 0, lb = 0, tuck = 0;
  if (P.ps === 'walk') { const s = Math.sin(P.wph); la = s > 0 ? 0.8 : 0; lb = s < 0 ? 0.8 : 0; bob = (Math.cos(P.wph * 2) > 0 ? 0 : -0.5); }
  if (P.ps === 'jump') tuck = P.vy < 0 ? 1.2 : 0.6;
  G.save();
  let rot = 0, cy = -7;
  if (a === 'dive') rot = 0.95; else if (a === 'spin') rot = P.el * 0.9; else if (a === 'rising') rot = -0.1; else if (/airkick/.test(a)) rot = 0.1 + 0.2 * ex;
  if (P.ps === 'hit') rot = -0.3;
  if (rot) { G.translate(0, cy * U); G.rotate(rot); G.translate(0, -cy * U); }
  G.translate(0, bob * U);
  // legs / boots
  const legR = (x, lift, ext) => {
    if (ext > 0) { R(x, -4 + 0.2, ext, 2, orange); R(x + ext - 1, -4.5, 2.5, 2.5, boot); return; }
    R(x, -4 - lift * 0.2, 2, 2, orange); R(x - 0.5, -2 - lift, 2.5, 2, boot);
  };
  const kick = /kick|dive/.test(a) ? ex || (a === 'dive' ? 1 : 0) : 0;
  const fl = P.ps === 'jump' && !kick;
  legR(-2.5, lb * 1 + (fl ? tuck : 0), 0);
  if (kick) legR(0.5, 0, 3 + 3 * kick); else legR(0.5, la + (fl ? tuck * 0.7 : 0), 0);
  // arms (sleeves)
  let a1 = 0.15, a2 = -0.15;
  if (P.ps === 'jump') { a1 = 2.6; a2 = 2.2; }
  if (P.ps === 'hit') { a1 = 2; a2 = 1.5; }
  if (P.ps === 'block') { a1 = 1.6; a2 = 1.6; }
  if (a === 'rising') { a1 = a2 = lerp(0.5, 3.1, Math.max(ex, bk)); }
  else if (a === 'spin') { a1 = 1.57; a2 = -1.57; }
  else if (/airkick/.test(a)) { a1 = 1.6; a2 = 2.4; }
  else if (a === 'dive') { a1 = a2 = 2.6; }
  else if (a === 'kick') { a1 = 1.4; a2 = 2.0; }
  const sl = (ang, x) => { G.save(); G.translate(x * U, -6.8 * U); G.rotate(-ang); G.fillStyle = C(lime); G.fillRect(-0.75 * U, -0.5 * U, 1.5 * U, -3.3 * U * 0 + 3.3 * U); G.restore(); };
  // arms rotate around shoulders; angle 0 = down
  const sleeve = (ang, x) => { G.save(); G.translate(x * U, -6.7 * U); G.rotate(-ang); G.fillStyle = C(lime); G.fillRect(-0.75 * U, 0, 1.5 * U, 3 * U); G.restore(); };
  sleeve(a2, -2.2);
  R(-1.5, -7, 3, 3, shirt);
  R(-2, -7.4, 4, 0.8, shirt);
  sleeve(a1, 2.2);
  // head
  R(-3, -11, 6, 4, skin);
  R(0.4, -9.7, 1.2, 1.4, '#000');
  R(-2.6, -8.3, 5.4, 1.1, mou);
  // cap
  R(-4, -12, 8, 1.3, lime); R(-3.2, -13.5, 6.4, 1.6, lime);
  R(-3, -7.2, 0.01, 0.01, skin);
  G.restore();
  if (a === 'spin' && ex > 0) { G.strokeStyle = 'rgba(255,255,255,0.7)'; G.lineWidth = 3; G.beginPath(); G.arc(0, -28, 34, P.el * 0.9, P.el * 0.9 + 2.2); G.stroke(); }
  if (a === 'dive') { ln(-20, -60, -34, -80, 2, 'rgba(255,255,255,0.7)', null); }
};

// ======================= 6: RANCH-MAN =======================
// Blocky low-poly cowboy: brown hat, round tan head with dot eyes, blue shirt, dark trousers, whip.
SPR[6] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const blue = '#26549e', blueL = '#3a72c8', skin = '#d9a37a', pants = '#171e2c', out = '#10182a', hat = '#7d4421', belt = '#3b2619';
  const hy = -34 + B.bob * 0.5;
  const leg = (x, ang, c) => { const fx = x + Math.sin(ang) * 32, fy = hy + Math.cos(ang) * 32; ln(x, hy, fx, fy, 11, c, null); rect(fx - 6, fy - 5, 16, 8, '#0b0b10', null); };
  leg(-4, B.lb, '#111826');
  let lean = B.lean;
  let a1 = 0.25, a2 = 0.1, whip = 0, ty = -30, curl = 0;
  if (P.ps === 'hit') { a1 = 1.9; a2 = 1.6; } else if (P.ps === 'block') { a1 = 1.7; a2 = 1.7; } else if (P.ps === 'jump') { a1 = 2.2; a2 = 1.9; }
  if (a === 'whip') { whip = ex; a1 = lerp(0.25, 1.5, ex) + (bk > 0 ? 1.4 * bk : 0); curl = bk; lean += 0.1 * ex - 0.1 * bk; ty = -42; }
  else if (a === 'lasso') { a1 = ex > 0 ? 1.4 : lerp(0.25, 3.0, bk); lean += 0.12 * ex; }
  else if (a === 'lashes') {
    const kk = P.k, up = [0.5, 1.3, 2.9][Math.min(2, kk)];
    a1 = lerp(0.25, up, Math.max(ex, bk)); whip = ex; curl = bk; ty = [-6, -52, -105][Math.min(2, kk)];
    lean += 0.12 * ex;
  }
  G.save(); G.translate(0, hy); G.rotate(lean);
  // far arm
  ln(-9, -26, -9 + Math.sin(a2) * 22, -26 + Math.cos(a2) * 22, 9, '#1d4686', out);
  // torso with side face (low-poly look)
  rect(-14, -29, 28, 29, blue, out);
  poly([14, -29, 18, -26, 18, 0, 14, 0], blueL, out);
  rect(-14, -4, 28, 5, belt, null); rect(-3, -5, 7, 7, '#d8b24a', out);
  ln(-6, -27, -6, -6, 1.2, 'rgba(0,0,0,0.25)', null);
  // coiled whip at belt
  if (!whip && curl === 0 && a !== 'lasso') { ell(-10, 0, 6, 5, '#a0693a', '#4a2c14'); ell(-10, 0, 3, 2.5, '#6e4423', null); }
  // head
  rect(-3, -34, 8, 6, skin, null);
  disc(2, -41, 11.5, skin, out);
  disc(5, -42, 1.7, '#000'); disc(11, -42, 1.7, '#000');
  ln(5, -36, 9, -36, 1.4, '#7a4a35', null);
  // hat
  ell(2, -51, 18, 5, '#6a3719', out);
  rrect(-6, -64, 17, 14, 4, hat, out);
  rect(-6, -54, 17, 4, '#3b2619', null);
  // near arm + hand
  const sx = 8, sy = -26, L = 22;
  const hx = sx + Math.sin(a1) * L, hyy = sy + Math.cos(a1) * L;
  ln(sx, sy, hx, hyy, 9.5, blue, out); rect(hx - 4, hyy - 4, 9, 9, skin, out);
  // whip
  if (whip > 0 || curl > 0 || a === 'lashes' && ex > 0) {
    const len = whip > 0 ? 112 : 0;
    G.lineCap = 'round';
    if (len) {
      const tipY = ty - hy + 0;
      const wv = Math.sin(P.t * 1.4) * 5;
      G.beginPath(); G.moveTo(hx + 3, hyy);
      G.quadraticCurveTo(hx + len * 0.5, (hyy + tipY) / 2 + wv - 8, hx + len, tipY);
      G.strokeStyle = C('#8b5a2b'); G.lineWidth = 3; G.stroke();
      ln(hx + len - 6, tipY, hx + len + 4, tipY, 3, '#111', null);
      sparks(hx + len + 6, tipY, P.t, '#fff3a0', 4);
    }
  } else if (curl > 0) {
    G.strokeStyle = C('#8b5a2b'); G.lineWidth = 3; G.beginPath(); G.moveTo(hx, hyy); G.quadraticCurveTo(hx - 30, hyy - 25, hx - 48, hyy + 6); G.stroke();
  }
  if (a === 'lasso' && ex === 0 && P.el < 14) {
    const ang = P.t * 0.5;
    G.strokeStyle = C('#c2985c'); G.lineWidth = 2.5; G.beginPath(); G.ellipse(hx + 4, hyy - 14, 16, 6, ang * 0.3, 0, 6.28); G.stroke();
  }
  G.restore();
  leg(5, B.la, pants);
};

// ======================= 7: IRON FIST =======================
// Salmon-pink robot: hexagonal head with yellow visor, trapezoid torso, thin grey limbs, yellow hands and shoes.
SPR[7] = function (P) {
  const B = bp(P), a = P.anim, ex = P.ex, bk = P.bk, at = P.atk;
  const pink = '#f08d82', pd = '#d8584e', grey = '#c3cacd', gd = '#8c9599', yel = '#f5d86a', yo = '#b79a2c';
  const hy = -36 + B.bob * 0.4;
  const leg = (x, ang) => { const fx = x + Math.sin(ang) * 36, fy = hy + Math.cos(ang) * 36; ln(x, hy, fx, fy, 5.5, grey, gd); rect(fx - 4, fy - 5, 15, 7, yel, yo); };
  const w = at ? 0.25 : 0;
  leg(-4, B.lb - w);
  let na1 = 0.7, na2 = 0.7, fa1 = -0.5, fa2 = -0.5, hs = 1, glow = 0;
  if (P.ps === 'jump') { na1 = 2.3; fa1 = 1.8; } if (P.ps === 'hit') { na1 = 2; fa1 = 1.4; }
  if (P.ps === 'block') { na1 = fa1 = 1.7; }
  let lean = B.lean;
  if (P.ps === 'walk') { na1 = 0.7 + B.la * 0.5; fa1 = -0.5 - B.la * 0.5; }
  if (at) {
    if (a === 'jab') { na1 = lerp(0.7, 1.55, ex) - 0.6 * bk; hs = 1 + 0.5 * ex; lean += 0.1 * ex; }
    else if (a === 'cross') { fa1 = lerp(-0.5, 1.55, ex) - 0.9 * bk; na1 = 1.2; hs = 1 + 0.8 * ex; lean += 0.22 * ex - 0.1 * bk; }
    else if (a === 'hook') { na1 = ex > 0 ? lerp(0.9, 2.0, ex) : lerp(0.7, -0.4, bk); hs = 1 + 0.8 * ex; lean += 0.2 * ex - 0.15 * bk; }
    else if (a === 'ironfist') {
      const ch = Math.min(1, P.el / 26);
      glow = ex > 0 ? 1 : ch;
      na1 = ex > 0 ? lerp(-0.3, 2.9, ex) : -0.5 - 0.5 * ch; hs = 1 + 0.9 * glow + (ex > 0 ? 0.6 : 0); lean += ex > 0 ? 0.3 : -0.2 * ch;
    }
  }
  G.save(); G.translate(0, hy); G.rotate(lean);
  // far arm
  let hx = -6 + Math.sin(fa1) * 30, hyy = -24 + Math.cos(fa1) * 30;
  ln(-6, -24, hx, hyy, 5, gd, null); rect(hx - 4, hyy - 3, 8, 7, yel, yo);
  // torso (wider at the bottom)
  poly([-8, -28, 8, -28, 13, 0, -13, 0], pink, pd);
  rect(-13, -2, 26, 3, '#e8625a', null);
  ln(-5, -24, -7, -4, 1.5, 'rgba(255,255,255,0.35)', null);
  // head
  G.save(); G.translate(1, -38); G.rotate(P.ps === 'hit' ? -0.3 : 0);
  poly([-9, -8, 0, -13, 9, -8, 9, 7, 0, 12, -9, 7], pink, pd);
  rrect(-2, -5, 13, 6, 2, yel, yo);
  rect(2, -4, 4, 1.5, 'rgba(255,255,255,0.7)', null);
  G.restore();
  // near arm
  hx = 6 + Math.sin(na1) * 30; hyy = -24 + Math.cos(na1) * 30;
  ln(6, -24, hx, hyy, 5, grey, gd);
  if (glow) { disc(hx + 3, hyy, 11 * glow + 3, `rgba(255,170,40,${0.35 * glow + 0.1})`, null); }
  G.save(); G.translate(hx, hyy); G.scale(hs, hs); rect(-4, -3.5, 9, 8, yel, yo); G.restore();
  if (ex > 0 && at) { sparks(hx + 8 * hs, hyy, P.t, a === 'ironfist' ? '#ff9f2a' : '#fff6a8', a === 'ironfist' ? 7 : 4); }
  G.restore();
  leg(5, B.la + w);
};
