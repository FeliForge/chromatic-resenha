// CHROMATIC RESENHA - Street Fighter style canvas HUD and banners
function hpColor(r) { return r > 0.5 ? ['#a6ff3a', '#38c716'] : r > 0.25 ? ['#ffe84a', '#e0a800'] : ['#ff7a5a', '#e0281a']; }

function drawBar(c, x, y, w, h, hp, trail, flip) {
  c.save();
  if (flip) { c.translate(x + w, y); c.scale(-1, 1); } else c.translate(x, y);
  c.fillStyle = '#000'; c.fillRect(-4, -4, w + 8, h + 8);
  const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#3a0a12'); bg.addColorStop(1, '#120306');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.fillStyle = '#ff2a2a'; c.fillRect(0, 0, w * Math.max(0, trail), h);
  const col = hpColor(hp), g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
  c.fillStyle = g; c.fillRect(0, 0, w * Math.max(0, hp), h);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 2, w * Math.max(0, hp), h * 0.28);
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2;
  for (let i = 1; i < 10; i++) { c.beginPath(); c.moveTo(w * i / 10, 0); c.lineTo(w * i / 10, h); c.stroke(); }
  c.lineWidth = 4; c.strokeStyle = '#f2d36b'; c.strokeRect(-2, -2, w + 4, h + 4);
  c.lineWidth = 2; c.strokeStyle = '#7a5a10'; c.strokeRect(-5, -5, w + 10, h + 10);
  c.restore();
}

function drawPortrait(c, charId, x, y, size, flip, accent) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#000'; c.fillRect(-3, -3, size + 6, size + 6);
  const g = c.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, '#6a46a8'); g.addColorStop(1, '#1b1038');
  c.fillStyle = g; c.fillRect(0, 0, size, size);
  c.save(); c.beginPath(); c.rect(0, 0, size, size); c.clip();
  c.translate(size * 0.5, size * 0.6); c.scale((flip ? -1 : 1) * size / 56, size / 56);
  LOOKS[charId].head(c, { state: 'idle', eyes: 'angry', mouth: 'closed', t: 0 }, 0);
  c.restore();
  c.lineWidth = 3; c.strokeStyle = accent || '#f2d36b'; c.strokeRect(0, 0, size, size);
  c.restore();
}

function drawFightHUD(c, p1, p2, timer, vis) {
  const bw = 340, bh = 26, by = 26;
  drawBar(c, 96, by, bw, bh, p1.hp / p1.maxHp, p1.hpTrail / p1.maxHp, false);
  drawBar(c, W - 96 - bw, by, bw, bh, p2.hp / p2.maxHp, p2.hpTrail / p2.maxHp, true);
  drawPortrait(c, p1.charId, 20, 16, 56, false, p1.accent);
  drawPortrait(c, p2.charId, W - 76, 16, 56, true, p2.accent);
  c.save(); c.font = '900 17px Impact, "Arial Black", sans-serif'; c.lineWidth = 4; c.strokeStyle = '#000';
  c.textAlign = 'left'; c.strokeText(p1.name.toUpperCase(), 98, by + bh + 22); c.fillStyle = '#fff'; c.fillText(p1.name.toUpperCase(), 98, by + bh + 22);
  c.textAlign = 'right'; c.strokeText(p2.name.toUpperCase(), W - 98, by + bh + 22); c.fillStyle = '#fff'; c.fillText(p2.name.toUpperCase(), W - 98, by + bh + 22);
  c.font = '900 13px Impact, sans-serif'; c.fillStyle = '#ffd34a';
  c.textAlign = 'left'; c.fillText(vis.tag1, 98, by - 9); c.textAlign = 'right'; c.fillText(vis.tag2, W - 98, by - 9);
  c.restore();
  // timer
  c.save(); c.translate(W / 2, 40);
  const tg = c.createLinearGradient(0, -24, 0, 26); tg.addColorStop(0, '#3a2a70'); tg.addColorStop(1, '#0f0a28');
  rrect(c, -34, -26, 68, 56, 8); fillStroke(c, tg, '#f2d36b', 4);
  c.font = '900 40px Impact, "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const low = timer <= 10;
  c.lineWidth = 5; c.strokeStyle = '#000'; c.strokeText(Math.max(0, timer), 0, 3);
  c.fillStyle = low && (Math.floor(vis.t / 15) % 2) ? '#ff4a3a' : '#ffe14a'; c.fillText(Math.max(0, timer), 0, 3);
  c.restore();
  // KO emblem under timer
  c.save(); c.translate(W / 2, 84); c.font = '900 16px Impact, sans-serif'; c.textAlign = 'center';
  c.fillStyle = '#ff3a3a'; c.strokeStyle = '#000'; c.lineWidth = 3; c.strokeText('K.O.', 0, 0); c.fillText('K.O.', 0, 0); c.restore();
}

// Big center-screen banner (ROUND 1 / FIGHT! / K.O. / YOU WIN)
function drawBanner(c, text, k, color, sub, size) {
  // k: 0..1 life progress
  const inK = ease(k / 0.18), outK = ease((k - 0.82) / 0.18);
  const sc = 0.4 + 0.6 * inK + (k < 0.18 ? (1 - inK) * 1.2 : 0) + outK * 0.35;
  c.save(); c.translate(W / 2, H * 0.38); c.scale(sc, sc);
  c.globalAlpha = Math.max(0, Math.min(1, inK * (1 - outK)));
  c.font = `900 ${size || 118}px Impact, "Arial Black", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round';
  c.lineWidth = 22; c.strokeStyle = '#000'; c.strokeText(text, 5, 7);
  c.lineWidth = 16; c.strokeStyle = '#7a1208'; c.strokeText(text, 0, 0);
  const g = c.createLinearGradient(0, -55, 0, 55);
  g.addColorStop(0, '#fff6a8'); g.addColorStop(0.5, color || '#ffd21f'); g.addColorStop(1, '#e8650a');
  c.fillStyle = g; c.fillText(text, 0, 0);
  c.lineWidth = 3; c.strokeStyle = '#fff'; c.globalAlpha *= 0.7; c.strokeText(text, 0, 0);
  if (sub) {
    c.globalAlpha = 1; c.font = '900 30px Impact, sans-serif'; c.lineWidth = 6; c.strokeStyle = '#000';
    c.strokeText(sub, 0, 78); c.fillStyle = '#fff'; c.fillText(sub, 0, 78);
  }
  c.restore();
}

// speed-line burst behind KO text
function drawSpeedLines(c, t, a) {
  c.save(); c.globalAlpha = a; c.translate(W / 2, H * 0.4);
  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2 + hash(i) * 0.2, r1 = 140 + hash(i + 3) * 60, r2 = r1 + 260;
    c.strokeStyle = i % 2 ? '#fff' : '#ffd21f'; c.lineWidth = 2 + hash(i) * 5;
    c.beginPath(); c.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1); c.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2); c.stroke();
  }
  c.restore();
}
