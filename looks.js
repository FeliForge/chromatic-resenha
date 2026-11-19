// CHROMATIC RESENHA - Character designs (costumes, heads, details)
const INK = '#14101a';

function rrect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function fillStroke(c, fill, stroke, lw) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.lineWidth = lw || 3; c.strokeStyle = stroke; c.lineJoin = 'round'; c.stroke(); }
}
function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }

function drawEye(c, x, y, kind, big) {
  c.save();
  if (kind === 'x') {
    c.strokeStyle = INK; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath();
    c.moveTo(x - 3.5, y - 3.5); c.lineTo(x + 3.5, y + 3.5); c.moveTo(x + 3.5, y - 3.5); c.lineTo(x - 3.5, y + 3.5); c.stroke();
  } else if (kind === 'hurt') {
    c.strokeStyle = INK; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath();
    c.moveTo(x - 3.5, y - 3.5); c.lineTo(x + 2, y); c.lineTo(x - 3.5, y + 3.5); c.stroke();
  } else {
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, y, big ? 5.2 : 4.2, big ? 6 : 5.2, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(x + 1.8, y + 0.4, 2.4, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
function drawBrow(c, x, y, kind) {
  if (kind === 'hurt' || kind === 'x') return;
  c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
  if (kind === 'angry') { c.moveTo(x - 5.5, y - 9.5); c.lineTo(x + 5, y - 4.5); }
  else { c.moveTo(x - 5, y - 8.5); c.lineTo(x + 5, y - 7.5); }
  c.stroke();
}
function drawMouth(c, x, y, kind) {
  c.save(); c.lineCap = 'round';
  if (kind === 'open') {
    c.fillStyle = '#3a0d14'; c.beginPath(); c.ellipse(x, y + 2, 6, 6.5, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#e8506a'; c.beginPath(); c.ellipse(x, y + 5, 3.6, 2.4, 0, 0, Math.PI * 2); c.fill();
  } else if (kind === 'grit') {
    rrect(c, x - 7, y - 1, 14, 6, 2); fillStroke(c, '#fff', INK, 2);
    c.beginPath(); c.moveTo(x - 2, y - 1); c.lineTo(x - 2, y + 5); c.moveTo(x + 3, y - 1); c.lineTo(x + 3, y + 5); c.lineWidth = 1.2; c.stroke();
  } else if (kind === 'hurt') {
    c.fillStyle = '#3a0d14'; c.beginPath(); c.ellipse(x - 1, y + 2, 3.5, 5, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
  } else {
    c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 5, y + 2); c.quadraticCurveTo(x, y + 4, x + 6, y + 1); c.stroke();
  }
  c.restore();
}
function drawFace(c, pose, ex1, ex2, ey, mx, my, big) {
  drawEye(c, ex1, ey, pose.eyes, big); drawEye(c, ex2, ey, pose.eyes, big);
  drawBrow(c, ex1, ey, pose.eyes); drawBrow(c, ex2, ey, pose.eyes);
  drawMouth(c, mx, my, pose.mouth);
}
function skull(c, r, fill) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); fillStroke(c, fill, INK, 3); }
function shine(c, r) {
  c.save(); c.globalAlpha = 0.28; c.fillStyle = '#fff'; c.beginPath();
  c.ellipse(-r * 0.35, -r * 0.45, r * 0.3, r * 0.18, -0.5, 0, Math.PI * 2); c.fill(); c.restore();
}

const LOOKS = [
  // 0 THE FORGE - blacksmith, steel + fire
  {
    skin: '#d99a6c', torsoBase: '#d99a6c', upperArm: '#d99a6c', foreArm: '#d99a6c', thigh: '#3d3d44', shin: '#3d3d44',
    shoe: '#222', glove: '#4a3a33', handR: 8.5, bulk: 1.1, shoeKind: 'boot',
    fx: 'fire', fxColor: '#ff7a1a', fxColor2: '#ffe066',
    torso(c, p, t) {
      poly(c, [[-14, 8], [16, 8], [17, -36], [-12, -40]]); fillStroke(c, '#55555c', INK, 2.5);
      c.fillStyle = '#ff8a2a'; [[-8, -28], [10, -28], [-8, -8], [10, -8]].forEach(r => { c.beginPath(); c.arc(r[0], r[1], 1.8, 0, 7); c.fill(); });
      c.strokeStyle = '#2d2d33'; c.lineWidth = 6; c.beginPath(); c.moveTo(-10, -40); c.lineTo(-4, -46); c.moveTo(14, -36); c.lineTo(10, -46); c.stroke();
      rrect(c, -15, -4, 33, 8, 2); fillStroke(c, '#2a2a30', INK, 2);
      rrect(c, 0, -4, 8, 8, 1); fillStroke(c, '#ffb13a', INK, 1.5);
    },
    head(c, p, t) {
      skull(c, 19, '#d99a6c');
      c.fillStyle = INK; for (let i = 0; i < 5; i++) { poly(c, [[-18 + i * 6, -10], [-20 + i * 6, -29 + (i % 2) * 5], [-12 + i * 6, -14]]); c.fill(); }
      c.beginPath(); c.arc(0, -1, 19.3, Math.PI * 0.92, Math.PI * 2.02); c.lineTo(0, -6); c.closePath(); c.fillStyle = INK; c.fill();
      c.save(); c.beginPath(); c.arc(0, 0, 18.6, 0, 7); c.clip(); c.fillStyle = '#ff6a1a'; c.fillRect(-22, -10, 44, 7); c.restore();
      c.strokeStyle = '#ff6a1a'; c.lineWidth = 4; c.lineCap = 'round'; const sw = Math.sin(p.t * 0.2) * 3;
      c.beginPath(); c.moveTo(-17, -7); c.quadraticCurveTo(-28, -8 + sw, -34, -2 + sw * 2); c.moveTo(-17, -6); c.quadraticCurveTo(-27, -2, -32, 6 + sw); c.stroke();
      drawFace(c, p, 2, 11, -1, 9, 9); shine(c, 19);
    }
  },
  // 1 TOMATO - tomato head, green overalls
  {
    skin: '#e74c3c', torsoBase: '#e74c3c', upperArm: '#e74c3c', foreArm: '#e74c3c', thigh: '#27ae60', shin: '#27ae60',
    shoe: '#1e8449', glove: '#fff', handR: 8.5, bulk: 1, shoeKind: 'boot',
    fx: 'splat', fxColor: '#e03a2a', fxColor2: '#7ddc4a',
    torso(c, p, t) {
      poly(c, [[-14, 8], [16, 8], [16, -26], [-14, -26]]); fillStroke(c, '#27ae60', INK, 2.5);
      c.strokeStyle = '#27ae60'; c.lineWidth = 6; c.beginPath(); c.moveTo(-9, -26); c.lineTo(-5, -44); c.moveTo(12, -26); c.lineTo(8, -44); c.stroke();
      c.fillStyle = '#f1c40f'; c.beginPath(); c.arc(-8, -24, 3, 0, 7); c.arc(11, -24, 3, 0, 7); c.fill();
      rrect(c, -6, -20, 14, 10, 2); fillStroke(c, '#1e8449', INK, 1.5);
    },
    head(c, p, t) {
      c.beginPath(); c.ellipse(0, 1, 22, 20, 0, 0, 7); fillStroke(c, '#e74c3c', INK, 3);
      c.save(); c.globalAlpha = 0.25; c.fillStyle = '#7a0e08'; c.beginPath(); c.ellipse(4, 8, 17, 11, 0, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#2ecc71'; const lp = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2 + 0.3, r = i % 2 ? 7 : 17; lp.push([Math.cos(a) * r - 2, -17 + Math.sin(a) * r * 0.55]); }
      poly(c, lp); fillStroke(c, '#2ecc71', INK, 2.5);
      rrect(c, -5, -30, 4, 10, 2); fillStroke(c, '#6b4a2a', INK, 2);
      drawFace(c, p, 3, 13, -1, 10, 9, true); shine(c, 21);
    }
  },
  // 2 DOGGIE - brown dog
  {
    skin: '#a0522d', torsoBase: '#a0522d', upperArm: '#a0522d', foreArm: '#a0522d', thigh: '#f1c40f', shin: '#a0522d',
    shoe: '#d9a87a', glove: '#a0522d', handR: 8, bulk: 1, shoeKind: 'paw',
    fx: 'claw', fxColor: '#f1c40f', fxColor2: '#fff',
    back(c, p, t) {
      c.strokeStyle = INK; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, 0);
      c.quadraticCurveTo(-30, -10 + Math.sin(p.t * 0.3) * 5, -32, -30 + Math.sin(p.t * 0.3) * 8); c.stroke();
      c.strokeStyle = '#a0522d'; c.lineWidth = 6; c.stroke();
    },
    torso(c, p, t) {
      c.beginPath(); c.ellipse(5, -20, 9, 17, 0, 0, 7); c.fillStyle = '#e0b88a'; c.fill();
      rrect(c, -15, -49, 34, 7, 3); fillStroke(c, '#f1c40f', INK, 2);
      c.fillStyle = '#e8e8e8'; c.beginPath(); c.arc(8, -42, 3.5, 0, 7); c.fill();
      rrect(c, -15, -4, 33, 11, 3); fillStroke(c, '#f1c40f', INK, 2);
    },
    head(c, p, t) {
      const flap = Math.sin(p.t * 0.25) * 0.12 + (p.state === 'hit' ? -0.5 : 0);
      c.save(); c.translate(-8, -12); c.rotate(0.5 + flap); c.beginPath(); c.ellipse(0, 8, 8, 15, 0, 0, 7); fillStroke(c, '#6b3a1c', INK, 2.5); c.restore();
      skull(c, 18, '#a0522d');
      rrect(c, 5, -2, 27, 17, 8); fillStroke(c, '#e0b88a', INK, 2.5);
      c.beginPath(); c.ellipse(30, 1, 5.5, 4.2, 0, 0, 7); fillStroke(c, INK, null);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(29, 0, 1.3, 0, 7); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
      if (p.mouth === 'open') { rrect(c, 8, 8, 20, 9, 3); fillStroke(c, '#3a0d14', INK, 2); c.fillStyle = '#fff'; c.fillRect(11, 8, 3, 3); c.fillRect(22, 8, 3, 3); }
      else { c.moveTo(10, 11); c.quadraticCurveTo(20, 15, 28, 10); c.stroke(); }
      drawEye(c, 4, -5, p.eyes, true); drawBrow(c, 4, -5, p.eyes);
      c.fillStyle = '#6b3a1c'; c.beginPath(); c.ellipse(-2, -6, 4.5, 4, 0, 0, 7); c.fill();
      c.save(); c.translate(-2, -14); c.rotate(-0.3); c.beginPath(); c.ellipse(0, 0, 6, 11, 0, 0, 7); fillStroke(c, '#7a421f', INK, 2.5); c.restore();
    }
  },
  // 3 FOOBAL - soccer ball head
  {
    skin: '#f0cfa0', torsoBase: '#2ecc71', upperArm: '#2ecc71', foreArm: '#f0cfa0', thigh: '#fff', shin: '#2ecc71',
    shoe: '#111', glove: '#f0cfa0', handR: 7.5, bulk: 1, shoeKind: 'cleat',
    fx: 'ball', fxColor: '#ffffff', fxColor2: '#2ecc71',
    torso(c, p, t) {
      c.fillStyle = '#fff'; c.fillRect(-1, -46, 7, 52);
      poly(c, [[-8, -46], [12, -46], [2, -36]]); fillStroke(c, '#fff', INK, 2);
      c.save(); c.fillStyle = '#fff'; c.font = '900 17px Impact, "Arial Black", sans-serif'; c.textAlign = 'center';
      c.lineWidth = 3; c.strokeStyle = INK; c.strokeText('10', 11, -14); c.fillText('10', 11, -14); c.restore();
      rrect(c, -15, -4, 33, 11, 3); fillStroke(c, '#fff', INK, 2);
    },
    head(c, p, t) {
      c.beginPath(); c.arc(0, 0, 20, 0, 7); fillStroke(c, '#fff', INK, 3);
      c.fillStyle = INK;
      poly(c, [[-11, -9], [-4, -14], [-1, -7], [-6, -2], [-12, -3]]); c.fill();
      poly(c, [[-8, 9], [-1, 7], [3, 14], [-3, 18], [-10, 15]]); c.fill();
      poly(c, [[10, -17], [16, -13], [14, -7], [8, -8], [6, -14]]); c.fill();
      c.strokeStyle = '#2ecc71'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 17, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      drawFace(c, p, 4, 13, -2, 10, 9); shine(c, 20);
    }
  },
  // 4 BOX-ER - cardboard box head, big orange gloves
  {
    skin: '#caa27a', torsoBase: '#caa27a', upperArm: '#caa27a', foreArm: '#caa27a', thigh: '#8e44ad', shin: '#caa27a',
    shoe: '#f39c12', glove: '#f39c12', handR: 12, bulk: 1.28, shoeKind: 'boot',
    fx: 'shock', fxColor: '#f39c12', fxColor2: '#b36bd6',
    torso(c, p, t) {
      rrect(c, -16, -50, 38, 6, 3); fillStroke(c, '#8e44ad', INK, 2);
      c.strokeStyle = 'rgba(80,40,20,0.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(2, -34); c.lineTo(10, -34); c.moveTo(0, -26); c.lineTo(12, -26); c.stroke();
      rrect(c, -17, -12, 38, 20, 4); fillStroke(c, '#8e44ad', INK, 2.5);
      rrect(c, -17, -14, 38, 6, 2); fillStroke(c, '#f39c12', INK, 2);
    },
    head(c, p, t) {
      rrect(c, -20, -19, 40, 38, 6); fillStroke(c, '#c8964f', INK, 3);
      c.fillStyle = '#e9d09c'; c.fillRect(-9, -19, 9, 38);
      c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-9, -19, 9, 38);
      poly(c, [[-20, -19], [-6, -19], [-12, -27]]); fillStroke(c, '#b5833f', INK, 2);
      poly(c, [[20, -19], [6, -19], [12, -27]]); fillStroke(c, '#b5833f', INK, 2);
      rrect(c, -2, -10, 22, 12, 3); fillStroke(c, '#2a1810', INK, 2);
      drawEye(c, 4, -4, p.eyes === 'normal' ? 'normal' : p.eyes); drawEye(c, 13, -4, p.eyes);
      drawBrow(c, 4, -4, p.eyes); drawBrow(c, 13, -4, p.eyes);
      drawMouth(c, 10, 11, p.mouth);
    }
  },
  // 5 JUMPER - blue acrobat with spring boots
  {
    skin: '#f1c27d', torsoBase: '#3498db', upperArm: '#3498db', foreArm: '#f1c27d', thigh: '#2874a6', shin: '#2874a6',
    shoe: '#e67e22', glove: '#e67e22', handR: 7.5, bulk: 0.92, shoeKind: 'spring',
    fx: 'wind', fxColor: '#5dade2', fxColor2: '#ffffff',
    torso(c, p, t) {
      poly(c, [[-14, 8], [-4, 8], [14, -36], [4, -42]]); fillStroke(c, '#e67e22', null);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(7, -44); c.lineTo(3, 6); c.stroke();
      rrect(c, -14, -3, 31, 8, 2); fillStroke(c, '#e67e22', INK, 2);
    },
    head(c, p, t) {
      const sw = Math.sin(p.t * 0.2) * 4;
      c.strokeStyle = INK; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -8); c.quadraticCurveTo(-28, -10 + sw, -34, 4 + sw); c.stroke();
      c.strokeStyle = '#2e86de'; c.lineWidth = 5; c.stroke();
      skull(c, 19, '#f1c27d');
      c.fillStyle = '#2e86de'; c.beginPath(); c.arc(-1, -2, 19.6, Math.PI * 0.95, Math.PI * 2.0); c.lineTo(8, -10); c.closePath(); c.fill();
      for (let i = 0; i < 4; i++) { poly(c, [[-10 + i * 7, -17], [-8 + i * 7, -30 + (i % 2) * 4], [-3 + i * 7, -18]]); fillStroke(c, '#2e86de', INK, 2); }
      c.save(); c.beginPath(); c.arc(0, 0, 18.6, 0, 7); c.clip(); c.fillStyle = '#e67e22'; c.fillRect(-22, -11, 44, 6); c.restore();
      drawFace(c, p, 3, 12, -1, 9, 9); shine(c, 19);
    }
  },
  // 6 RANCH-MAN - cowboy with whip
  {
    skin: '#e0b080', torsoBase: '#2980b9', upperArm: '#2980b9', foreArm: '#2980b9', thigh: '#2c4a6e', shin: '#2c4a6e',
    shoe: '#6b4423', glove: '#8a5a2b', handR: 8, bulk: 1.02, shoeKind: 'boot',
    fx: 'whip', fxColor: '#ffd166', fxColor2: '#d35400',
    torso(c, p, t) {
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(7, -44); c.lineTo(5, 4); c.stroke();
      c.fillStyle = '#fff'; [-30, -20, -10].forEach(y => { c.beginPath(); c.arc(6, y, 1.8, 0, 7); c.fill(); });
      rrect(c, -15, -4, 33, 8, 2); fillStroke(c, '#5a3a1a', INK, 2);
      rrect(c, 3, -5, 9, 10, 2); fillStroke(c, '#f1c40f', INK, 1.5);
      poly(c, [[-4, -46], [18, -46], [7, -30]]); fillStroke(c, '#d35400', INK, 2);
      c.beginPath(); c.arc(-14, -2, 8, 0, 7); c.lineWidth = 3; c.strokeStyle = '#8a5a2b'; c.stroke();
    },
    head(c, p, t) {
      skull(c, 19, '#e0b080');
      poly(c, [[10, 5], [26, 7], [24, 12], [14, 11]]); fillStroke(c, '#3b2a1a', INK, 1.5);
      drawFace(c, p, 3, 12, -1, 9, 12);
      c.beginPath(); c.ellipse(0, -12, 33, 7, 0, 0, 7); fillStroke(c, '#6b4423', INK, 3);
      rrect(c, -14, -35, 28, 26, 9); fillStroke(c, '#7a5230', INK, 3);
      c.fillStyle = '#d35400'; c.fillRect(-14, -17, 28, 6);
      c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-14, -17, 28, 6);
    }
  },
  // 7 IRON FIST - steel armoured brawler
  {
    skin: '#7f8c9a', torsoBase: '#2c3e50', upperArm: '#34495e', foreArm: '#8a96a3', thigh: '#2c3e50', shin: '#34495e',
    shoe: '#1b2631', glove: '#c0392b', handR: 11, bulk: 1.18, shoeKind: 'boot',
    fx: 'iron', fxColor: '#e74c3c', fxColor2: '#d5dbe0',
    torso(c, p, t) {
      poly(c, [[-14, -4], [17, -4], [19, -38], [-12, -42]]); fillStroke(c, '#8a96a3', INK, 2.5);
      const g = 0.6 + 0.4 * Math.sin(p.t * 0.2);
      c.save(); c.shadowColor = '#ff3b2b'; c.shadowBlur = 12 * g; c.beginPath(); c.arc(4, -24, 6, 0, 7); fillStroke(c, '#e74c3c', INK, 2); c.restore();
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -14); c.lineTo(14, -14); c.moveTo(-10, -32); c.lineTo(14, -32); c.stroke();
      rrect(c, -15, -6, 33, 9, 2); fillStroke(c, '#c0392b', INK, 2);
      c.beginPath(); c.arc(-4, -44, 9, 0, 7); fillStroke(c, '#8a96a3', INK, 2.5);
    },
    head(c, p, t) {
      poly(c, [[-6, -17], [4, -33], [14, -17]]); fillStroke(c, '#c0392b', INK, 2.5);
      skull(c, 20, '#8a96a3');
      c.save(); c.beginPath(); c.arc(0, 0, 18, 0, 7); c.clip(); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-20, -20, 14, 40); c.restore();
      rrect(c, -4, -9, 26, 11, 4); fillStroke(c, '#1a1014', INK, 2);
      const hot = p.eyes === 'angry' ? '#ff5a4a' : '#ff2b1f';
      c.save(); c.shadowColor = '#ff2b1f'; c.shadowBlur = 10; c.fillStyle = hot;
      if (p.eyes === 'x') { c.fillStyle = '#6a2a2a'; }
      c.fillRect(1, -6, 7, 4); c.fillRect(12, -6, 7, 4); c.restore();
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
      for (let i = 0; i < 3; i++) { c.moveTo(5 + i * 4, 6); c.lineTo(5 + i * 4, 15); }
      c.stroke();
    }
  }
];
