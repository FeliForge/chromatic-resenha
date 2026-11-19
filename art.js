// CHROMATIC RESENHA - Fighter rig: skeletal poses, outlined limbs, strike effects
const D2R = Math.PI / 180;
const SEG = { thigh: 36, shin: 36, upper: 26, fore: 26, torso: 46 };

const POSES = {
  guard: { fa: [40, 145], ba: [18, 152], fl: [34, -6], bl: [-30, -8], lean: 6 },
  windP: { fa: [8, 150], ba: [22, 150], fl: [30, -8], bl: [-26, -8], lean: -4 },
  punch: { fa: [90, 92], ba: [24, 152], fl: [46, 2], bl: [-34, -8], lean: 16 },
  windK: { fa: [25, 135], ba: [-25, 125], fl: [62, -36], bl: [-6, -3], lean: -6 },
  kick:  { fa: [20, 130], ba: [-38, 118], fl: [86, 84], bl: [-6, -3], lean: -16 },
  windS: { fa: [-22, 60], ba: [-36, 50], fl: [40, -8], bl: [-36, -8], lean: -12 },
  spec:  { fa: [88, 90], ba: [78, 84], fl: [54, 8], bl: [-42, -6], lean: 22 },
  block: { fa: [58, 162], ba: [44, 168], fl: [64, -4], bl: [-32, -8], lean: 10 },
  hit:   { fa: [-12, 28], ba: [-34, 6], fl: [20, -12], bl: [-34, -16], lean: -22 },
  rise:  { fa: [62, 132], ba: [40, 122], fl: [62, -22], bl: [-10, -52], lean: 4 },
  fall:  { fa: [100, 112], ba: [70, 100], fl: [26, 6], bl: [-22, -6], lean: 0 },
  dead:  { fa: [-70, -40], ba: [-95, -60], fl: [24, -16], bl: [-20, -10], lean: -8 },
  win:   { fa: [150, 172], ba: [132, 160], fl: [22, -4], bl: [-22, -4], lean: -4 }
};

function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
function lerpArr(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
function lerpPose(a, b, k) {
  return { fa: lerpArr(a.fa, b.fa, k), ba: lerpArr(a.ba, b.ba, k), fl: lerpArr(a.fl, b.fl, k),
    bl: lerpArr(a.bl, b.bl, k), lean: a.lean + (b.lean - a.lean) * k };
}
function clonePose(a) { return lerpPose(a, a, 0); }

function computePose(f, look) {
  const st = f.state, t = f.animT;
  let P, s = 0, wind = 0;
  let eyes = 'normal', mouth = 'closed', rot = 0, rotK = 0, bounce = 0;
  const bob = Math.sin(t * 0.12);

  if (st === 'attack' || st === 'strong' || st === 'special') {
    const p = 1 - Math.max(0, f.stateTimer) / (f.atkTotal || 18);
    wind = p < 0.25 ? ease(p / 0.25) : Math.max(0, 1 - (p - 0.25) / 0.15);
    s = p < 0.25 ? 0 : p < 0.4 ? ease((p - 0.25) / 0.15) : p < 0.65 ? 1 : 1 - ease((p - 0.65) / 0.35);
    const w = st === 'attack' ? POSES.windP : st === 'strong' ? POSES.windK : POSES.windS;
    const k = st === 'attack' ? POSES.punch : st === 'strong' ? POSES.kick : POSES.spec;
    P = lerpPose(lerpPose(POSES.guard, w, wind), k, s);
    eyes = 'angry'; mouth = s > 0.2 ? 'open' : 'grit';
  } else if (st === 'dead') {
    const k = ease((f.deadT || 0) / 14);
    P = lerpPose(POSES.hit, POSES.dead, k);
    rotK = k; rot = -Math.PI / 2 * k; eyes = 'x'; mouth = 'hurt';
  } else if (st === 'hit') {
    P = clonePose(POSES.hit); eyes = 'hurt'; mouth = 'hurt';
  } else if (st === 'block') {
    P = clonePose(POSES.block); eyes = 'angry'; mouth = 'grit';
  } else if (st === 'win') {
    P = clonePose(POSES.win); mouth = 'open'; bounce = Math.abs(Math.sin(t * 0.18)) * 12;
  } else if (!f.onGround) {
    P = lerpPose(f.vy < 0 ? POSES.rise : POSES.fall, f.vy < 0 ? POSES.rise : POSES.fall, 0);
    eyes = 'angry';
  } else if (Math.abs(f.vx) > 0.8 && st === 'walk') {
    P = clonePose(POSES.guard);
    const dirRel = Math.sign(f.vx) === f.facing ? 1 : -1;
    const ph = t * 0.3 * dirRel;
    const leg = q => { const th = 30 * Math.sin(q); return [th + 4, th * 0.5 - 4 - 42 * Math.max(0, Math.cos(q)) * 0.6]; };
    P.fl = leg(ph); P.bl = leg(ph + Math.PI);
    P.fa = [40 + 8 * Math.sin(ph), 145]; P.ba = [18 - 8 * Math.sin(ph), 152];
    P.lean = 8; mouth = 'closed';
  } else {
    P = clonePose(POSES.guard);
    P.fl[0] += bob * 2; P.bl[0] -= bob * 2; P.fa[0] += bob * 3; P.ba[0] += bob * 2; P.lean += bob * 0.8;
  }
  if (look.lean) P.lean += look.lean;
  P.s = s; P.wind = wind; P.eyes = eyes; P.mouth = mouth; P.rot = rot; P.rotK = rotK;
  P.t = t; P.state = st; P.bounce = bounce;
  return P;
}

function legExt(l) { return SEG.thigh * Math.cos(l[0] * D2R) + SEG.shin * Math.cos(l[1] * D2R); }

function limb(c, x, y, a, l1, l2, w, col1, col2) {
  const kx = x + Math.sin(a[0] * D2R) * l1, ky = y + Math.cos(a[0] * D2R) * l1;
  const ex = kx + Math.sin(a[1] * D2R) * l2, ey = ky + Math.cos(a[1] * D2R) * l2;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 5; c.beginPath(); c.moveTo(x, y); c.lineTo(kx, ky); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = col1; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(kx, ky); c.stroke();
  c.strokeStyle = col2; c.beginPath(); c.moveTo(kx, ky); c.lineTo(ex, ey); c.stroke();
  c.globalAlpha = 0.22; c.strokeStyle = '#fff'; c.lineWidth = w * 0.28;
  c.beginPath(); c.moveTo(x, y - 2); c.lineTo(kx, ky - 2); c.lineTo(ex, ey - 2); c.stroke(); c.globalAlpha = 1;
  return [ex, ey];
}

function drawShoe(c, x, y, a2, look) {
  c.save(); c.translate(x, y); c.rotate(-a2 * D2R);
  const k = look.shoeKind;
  if (k === 'paw') {
    c.beginPath(); c.ellipse(6, 3, 12, 7, 0, 0, 7); fillStroke(c, look.shoe, INK, 2.5);
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); [-1, 4, 9].forEach(o => { c.moveTo(14 + o * 0.3, o - 1); c.lineTo(18 + o * 0.3, o - 1); }); c.stroke();
  } else if (k === 'spring') {
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-2, 0);
    for (let i = 0; i < 5; i++) c.lineTo(i % 2 ? -7 : 5, 2 + i * 2.4); c.stroke();
    c.strokeStyle = '#d5dbe0'; c.lineWidth = 1.5; c.stroke();
    rrect(c, -9, 10, 28, 9, 4); fillStroke(c, look.shoe, INK, 2.5);
  } else if (k === 'cleat') {
    rrect(c, -7, -3, 27, 11, 5); fillStroke(c, look.shoe, INK, 2.5);
    c.fillStyle = '#fff'; c.fillRect(2, 0, 10, 2);
  } else {
    rrect(c, -8, -4, 28, 13, 5); fillStroke(c, look.shoe, INK, 2.5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-4, 5, 22, 2);
  }
  c.restore();
}

function drawHand(c, x, y, look, a) {
  c.beginPath(); c.arc(x, y, look.handR, 0, 7); fillStroke(c, look.glove, INK, 2.5);
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.arc(x - 2, y - 2.5, look.handR * 0.35, 0, 7); c.fill();
  if (look.handR >= 10) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 4, y - 3); c.lineTo(x + 6, y - 3); c.stroke(); }
}

function drawLimbSet(c, x, y, ang, look, isLeg, bulk) {
  const w = (isLeg ? 15 : 12) * bulk;
  const l1 = isLeg ? SEG.thigh : SEG.upper, l2 = isLeg ? SEG.shin : SEG.fore;
  const e = limb(c, x, y, ang, l1, l2, w, isLeg ? look.thigh : look.upperArm, isLeg ? look.shin : look.foreArm);
  if (isLeg) drawShoe(c, e[0], e[1], ang[1], look); else drawHand(c, e[0], e[1], look);
  return e;
}

function drawFighter(c, f) {
  const look = LOOKS[f.charId], P = computePose(f, look), bulk = look.bulk;
  const ax = f.x + f.w / 2, ay = f.y + f.h;
  const gy = f.groundY !== undefined ? f.groundY : GROUND_Y;
  const hgt = Math.max(0, gy - ay), sc = Math.max(0.45, 1 - hgt / 260);
  // ground shadow
  c.save(); c.globalAlpha = 0.38 * sc; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(ax, gy + 3, (P.rotK ? 70 : 46) * sc, 9 * sc, 0, 0, 7); c.fill(); c.restore();
  // special aura
  if (f.state === 'special') {
    const g = c.createRadialGradient(ax, f.y + f.h * 0.5, 10, ax, f.y + f.h * 0.5, 110);
    g.addColorStop(0, look.fxColor + 'aa'); g.addColorStop(1, look.fxColor + '00');
    c.save(); c.globalAlpha = 0.5 + 0.5 * Math.max(P.wind, P.s); c.fillStyle = g;
    c.fillRect(ax - 120, f.y - 40, 240, f.h + 90); c.restore();
  }
  c.save();
  c.translate(ax, ay - P.bounce);
  if (f.hitFlash > 0) c.filter = 'brightness(2.4) saturate(0.2)';
  c.scale(f.facing, 1);
  if (P.rot) { c.translate(0, -16 * P.rotK); c.rotate(P.rot); }

  const hipY = -Math.max(legExt(P.fl), legExt(P.bl)), hipX = 0;
  const lean = P.lean * D2R;
  const shx = hipX + Math.sin(lean) * SEG.torso, shy = hipY - Math.cos(lean) * SEG.torso;

  if (look.back) { c.save(); c.translate(hipX, hipY); look.back(c, P, f.animT); c.restore(); }
  drawLimbSet(c, hipX - 4, hipY, P.bl, look, true, bulk);
  drawLimbSet(c, shx - 3, shy + 6, P.ba, look, false, bulk);

  c.save(); c.translate(hipX, hipY); c.rotate(lean);
  const b = bulk;
  poly(c, [[-13 * b, 6], [15 * b, 6], [19 * b, -36], [11 * b, -47], [-11 * b, -47], [-18 * b, -34]]);
  fillStroke(c, look.torsoBase, INK, 3);
  look.torso(c, P, f.animT);
  c.save(); c.translate(3 + (P.state === 'hit' ? -5 : 0), -SEG.torso - 14);
  if (P.state === 'hit') c.rotate(-0.25);
  look.head(c, P, f.animT);
  c.restore();
  c.restore();

  drawLimbSet(c, hipX + 4, hipY, P.fl, look, true, bulk);
  drawLimbSet(c, shx + 3, shy + 6, P.fa, look, false, bulk);
  c.restore();

  if (P.s > 0.25) drawStrikeFX(c, f, look, P);
}

function drawStrikeFX(c, f, look, P) {
  const reach = f.atkRange || 100, s = P.s, t = f.animT, type = f.state;
  const bx = f.x + f.w / 2, by = f.y + f.h * 0.42;
  c.save(); c.translate(bx, by); c.scale(f.facing, 1);
  c.globalAlpha = Math.min(1, s * 1.1); c.lineCap = 'round';
  const col = look.fxColor, col2 = look.fxColor2;
  if (type === 'attack') {
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = i === 1 ? col2 : '#fff'; c.lineWidth = 4 - i;
      c.beginPath(); c.moveTo(22, -14 + i * 9); c.lineTo(reach * 0.5 + 44 * s, -14 + i * 9 + (i - 1) * 3); c.stroke();
    }
  } else if (type === 'strong') {
    [[9, '#fff', 0.9], [5, col, 0.8], [2, col2, 1]].forEach((a, i) => {
      c.strokeStyle = a[1]; c.globalAlpha = a[2] * s; c.lineWidth = a[0] * 2;
      c.beginPath(); c.arc(-10, 20, reach * (0.95 - i * 0.04), -1.15, 0.35); c.stroke();
    });
  } else {
    const fx = look.fx, x = reach * 0.7;
    if (fx === 'fire') {
      for (let i = 0; i < 8; i++) {
        const px = 26 + i * (reach / 7.5), r = (7 + i * 3.4) * s, oy = Math.sin(t * 0.5 + i) * 5 - i * 1.5;
        c.fillStyle = i % 2 ? col : '#ff4a1a'; c.beginPath(); c.arc(px, oy, r, 0, 7); c.fill();
        c.fillStyle = col2; c.beginPath(); c.arc(px, oy, r * 0.5, 0, 7); c.fill();
      }
    } else if (fx === 'splat') {
      c.fillStyle = col; c.beginPath(); c.arc(x, -4, 28 * s, 0, 7); c.fill();
      c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * 6.283 + t * 0.1; c.fillStyle = i % 3 ? col : col2;
        c.beginPath(); c.arc(x + Math.cos(a) * 44 * s, -4 + Math.sin(a) * 34 * s, 5 + (i % 3) * 2, 0, 7); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(x - 9, -14, 8, 4, -0.5, 0, 7); c.fill();
    } else if (fx === 'claw') {
      for (let i = 0; i < 3; i++) {
        const ox = x - 26 + i * 18;
        poly(c, [[ox - 4, -40], [ox + 6, -40], [ox + 26, 36], [ox + 20, 36]]);
        c.fillStyle = i === 1 ? '#fff' : col; c.globalAlpha = s * 0.95; c.fill();
      }
    } else if (fx === 'ball') {
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - 70 - i * 10, -14 + i * 14); c.lineTo(x - 22, -14 + i * 14); c.stroke(); }
      c.save(); c.translate(x, 0); c.rotate(t * 0.4);
      c.beginPath(); c.arc(0, 0, 20, 0, 7); fillStroke(c, '#fff', INK, 3);
      c.fillStyle = INK; poly(c, [[0, -8], [8, -2], [5, 8], [-5, 8], [-8, -2]]); c.fill(); c.restore();
    } else if (fx === 'shock') {
      for (let i = 0; i < 4; i++) {
        c.strokeStyle = i % 2 ? col2 : col; c.globalAlpha = s * (1 - i * 0.2); c.lineWidth = 9 - i * 1.6;
        c.beginPath(); c.arc(x - 40 + i * 10, 0, 28 + i * 20, -1.1, 1.1); c.stroke();
      }
    } else if (fx === 'wind') {
      for (let i = 0; i < 9; i++) {
        const yy = 28 - i * 11, rx = 8 + i * 3.5;
        c.strokeStyle = i % 2 ? col2 : col; c.lineWidth = 4;
        c.beginPath(); c.ellipse(x + Math.sin(t * 0.3 + i) * 6, yy, rx, 4.5, 0, 0, 7); c.stroke();
      }
    } else if (fx === 'whip') {
      const wy = Math.sin(t * 0.8) * 6, tip = reach + 12;
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(30, -8); c.bezierCurveTo(60, -50 + wy, tip - 30, 28 - wy, tip, -14); c.stroke();
      c.strokeStyle = col2; c.lineWidth = 4; c.stroke();
      c.fillStyle = col; drawStarburst(c, tip, -14, 16 * s + 4, 8, t * 0.3); c.fill();
    } else {
      for (let i = 0; i < 3; i++) {
        c.strokeStyle = i % 2 ? col2 : col; c.globalAlpha = s * (1 - i * 0.25); c.lineWidth = 8 - i * 2;
        c.beginPath(); c.ellipse(x - 10 + i * 12, 0, 12 + i * 12, 30 + i * 12, 0, -1.3, 1.3); c.stroke();
      }
      c.fillStyle = col; c.beginPath(); c.arc(x + 14, 0, 14 * s, 0, 7); c.fill();
    }
  }
  c.restore();
}
