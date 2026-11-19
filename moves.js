// CHROMATIC RESENHA - Per-character hurtboxes and movesets.
// Keys: F = attack ("attack"), G = strong ("strong"), H = special ("special").
// Array = combo chain (press F again after each hit's active frames). "...Air" = airborne variant.
// Move fields (frames @60fps):
//   dur, win:[WN(start,end,overrides)] active windows (one hit each), pw: pose-only windows
//   dmg (base, x damageMul), rw reach, hy/hh hitbox top/height as fraction of body height
//   knock, stun, inv, launch (sets victim vy), body (box also covers own body), both (hits both sides)
//   lunge:[from,to,vx], vy0:[at,vy], hang (air-hang on start), armor:[from,to], cd (cooldown)
//   spawn:[{at,p:{...projectile}}], endOnLand, recover, landFx (projectiles on landing)
//   ai:[minGap,maxGap,weight] when the CPU may pick it
const WN = (s, e, o) => Object.assign({ s, e }, o || {});

const CHAR_DEF = [
  { // 0 THE FORGE - fast hammering combos
    w: 38, h: 80, pref: [20, 60], moves: {
      attack: [
        { anim: 'jab', dur: 12, win: [WN(3, 7)], dmg: 4, rw: 38, knock: 2, stun: 10, inv: 3, lunge: [1, 5, 2.5], ai: [0, 46, 4] },
        { anim: 'hook', dur: 12, win: [WN(3, 7)], dmg: 4, rw: 40, knock: 2, stun: 10, inv: 3, lunge: [1, 5, 2.5] },
        { anim: 'smash', dur: 17, win: [WN(4, 9)], dmg: 6, rw: 46, knock: 7, stun: 13, inv: 3, lunge: [2, 8, 3.5] }
      ],
      attackAir: { anim: 'smash', dur: 18, win: [WN(4, 10, { hy: 0.3, hh: 0.7 })], dmg: 6, rw: 44, knock: 6, stun: 12, hang: -2, ai: [0, 50, 4] },
      strongAir: { anim: 'overhead', dur: 60, vy0: [6, 12], endOnLand: true, recover: 10, cd: 50, ai: [0, 70, 3], title: 'ANVIL DROP!', win: [WN(6, 60, { hy: 0.2, hh: 0.9, dmg: 12, rw: 28, knock: 9, stun: 18, body: true })] },
      strong: { anim: 'overhead', dur: 28, win: [WN(12, 17, { hy: 0, hh: 0.8 })], dmg: 12, rw: 54, knock: 8, stun: 16, cd: 24, ai: [10, 60, 3] },
      special: {
        anim: 'flurry', dur: 46, title: 'FORGE FURY!', dmg: 3, rw: 44, knock: 1.5, stun: 8, inv: 3, cd: 70, lunge: [6, 44, 1.2], ai: [0, 50, 2],
        win: [WN(8, 12), WN(14, 18), WN(20, 24), WN(26, 30), WN(32, 36), WN(38, 43, { dmg: 5, knock: 12, stun: 14 })]
      }
    }
  },
  { // 1 TOMATO - balanced and versatile
    w: 44, h: 62, pref: [20, 70], moves: {
      attack: [
        { anim: 'slap', dur: 14, win: [WN(4, 8)], dmg: 5, rw: 36, knock: 3, stun: 10, inv: 3, ai: [0, 44, 4] },
        { anim: 'slap2', dur: 16, win: [WN(4, 9)], dmg: 5, rw: 40, knock: 6, stun: 12, inv: 3 }
      ],
      attackAir: { anim: 'slap', dur: 16, win: [WN(4, 9)], dmg: 5, rw: 40, knock: 5, stun: 11, hang: -2.5, ai: [0, 48, 4] },
      specialAir: {
        anim: 'throw', dur: 34, pw: [{ s: 8, e: 20 }], cd: 80, hang: -3, ai: [40, 300, 2], title: 'TOMATO RAIN!',
        spawn: [4.5, 6, 7.5].map((vx, i) => ({ at: 8 + i * 5, p: { oy: 0.3, vx, vy: 1 + i, g: 0.32, r: 9, dmg: 6, knock: 4, stun: 12, life: 70, kind: 'tomato' } }))
      },
      strong: {
        anim: 'throw', dur: 26, pw: [{ s: 10, e: 14 }], cd: 34, ai: [60, 320, 3],
        spawn: [{ at: 10, p: { oy: 0.3, vx: 7.5, vy: -5.5, g: 0.38, r: 11, dmg: 10, knock: 6, stun: 14, life: 90, kind: 'tomato' } }]
      },
      special: {
        anim: 'roll', dur: 42, title: 'TOMATO ROLL!', rw: 32, cd: 80, lunge: [8, 30, 8.5], ai: [40, 170, 2],
        win: [WN(8, 30, { dmg: 11, knock: 10, stun: 14, hy: 0.2, hh: 0.8, body: true }), WN(32, 38, { dmg: 6, rw: 56, knock: 5, both: true, hy: 0.1, hh: 0.9 })]
      }
    }
  },
  { // 2 DOGGIE - extreme speed, bites and rushes
    w: 56, h: 42, pref: [4, 34], aiJump: 0.03, moves: {
      attack: [
        { anim: 'bite', dur: 10, win: [WN(3, 6)], dmg: 4, rw: 26, knock: 2, stun: 8, inv: 3, lunge: [1, 5, 3.5], hy: 0.2, hh: 0.6, ai: [0, 36, 4] },
        { anim: 'bite', dur: 12, win: [WN(3, 7)], dmg: 4, rw: 28, knock: 5, stun: 10, inv: 3, lunge: [1, 5, 3.5], hy: 0.2, hh: 0.6 }
      ],
      attackAir: { anim: 'bite', dur: 12, win: [WN(3, 7)], dmg: 4, rw: 28, knock: 3, stun: 9, hang: -1, lunge: [1, 6, 3.5], hy: 0.2, hh: 0.6, ai: [0, 40, 4] },
      strongAir: { anim: 'dash', dur: 30, vy0: [0, 7], lunge: [0, 30, 9], endOnLand: true, recover: 6, cd: 36, ai: [30, 200, 3], win: [WN(2, 30, { dmg: 9, rw: 24, knock: 8, stun: 14, hy: 0.1, hh: 0.8, body: true })] },
      strong: { anim: 'dash', dur: 24, win: [WN(4, 17)], dmg: 10, rw: 24, knock: 9, stun: 14, lunge: [3, 17, 13], hy: 0.1, hh: 0.8, body: true, cd: 36, ai: [40, 230, 3] },
      special: {
        anim: 'frenzy', dur: 46, title: 'BITE FRENZY!', dmg: 4, rw: 28, knock: 2, stun: 8, inv: 3, lunge: [3, 38, 4.5], hy: 0.1, hh: 0.8, body: true, cd: 70, ai: [0, 80, 2],
        win: [WN(5, 9), WN(13, 17), WN(21, 25), WN(29, 34, { dmg: 6, knock: 12, stun: 14 })]
      }
    }
  },
  { // 3 FOOBAL - football and long-range projectiles
    w: 40, h: 66, pref: [150, 280], moves: {
      attack: { anim: 'kick', dur: 16, win: [WN(5, 9)], dmg: 5, rw: 46, knock: 4, stun: 11, hy: 0.5, hh: 0.45, ai: [0, 54, 4] },
      attackAir: { anim: 'kick', dur: 16, win: [WN(5, 10)], dmg: 5, rw: 46, knock: 4, stun: 11, hy: 0.5, hh: 0.5, hang: -2.5, ai: [0, 54, 4] },
      strongAir: {
        anim: 'shot', dur: 26, pw: [{ s: 9, e: 13 }], cd: 30, hang: -3, ai: [50, 400, 3],
        spawn: [{ at: 9, p: { oy: 0.7, vx: 9, vy: 6, g: 0.1, r: 9, dmg: 9, knock: 7, stun: 14, life: 70, kind: 'ball' } }]
      },
      strong: {
        anim: 'shot', dur: 24, pw: [{ s: 9, e: 13 }], cd: 30, ai: [50, 420, 4],
        spawn: [{ at: 9, p: { oy: 0.8, vx: 11.5, vy: 0, g: 0, r: 9, dmg: 9, knock: 7, stun: 14, life: 75, kind: 'ball' } }]
      },
      special: {
        anim: 'chilena', dur: 38, title: 'CHILENA!', pw: [{ s: 14, e: 20 }], cd: 80, ai: [100, 460, 3],
        spawn: [{ at: 14, p: { oy: 0.45, vx: 8.5, vy: -8.5, g: 0.3, r: 13, dmg: 15, knock: 12, stun: 18, life: 150, kind: 'ball', bounce: 2 } }]
      }
    }
  },
  { // 4 BOX-ER - huge, slow, devastating
    w: 78, h: 82, pref: [0, 40], moves: {
      attack: { anim: 'punch', dur: 26, win: [WN(10, 15)], dmg: 7, rw: 58, knock: 8, stun: 16, lunge: [8, 14, 1.5], hy: 0.25, hh: 0.4, ai: [0, 66, 4] },
      attackAir: { anim: 'punch', dur: 28, win: [WN(10, 16)], dmg: 8, rw: 58, knock: 9, stun: 16, hy: 0.3, hh: 0.5, hang: -1, ai: [0, 66, 3] },
      strongAir: {
        anim: 'slam', dur: 60, vy0: [4, 14], endOnLand: true, recover: 14, cd: 60, ai: [0, 80, 2], title: 'CRATER!',
        win: [WN(4, 60, { hy: 0.2, hh: 0.9, dmg: 12, rw: 30, knock: 10, stun: 20, body: true })],
        landFx: [{ ground: true, oy: 0.9, vx: 6, w: 34, h: 16, dmg: 6, knock: 5, stun: 12, life: 26, kind: 'shock' }]
      },
      strong: {
        anim: 'slam', dur: 42, win: [WN(18, 23, { hy: 0, hh: 1 })], dmg: 13, rw: 62, knock: 11, stun: 20, armor: [6, 24], cd: 70, ai: [0, 70, 3],
        spawn: [{ at: 20, p: { ground: true, oy: 0.9, vx: 6, w: 34, h: 16, dmg: 6, knock: 5, stun: 12, life: 26, kind: 'shock' } }]
      },
      special: {
        anim: 'bodyslam', dur: 60, title: 'BODY SLAM!', vy0: [8, -13], lunge: [8, 50, 6.2], armor: [8, 52], endOnLand: true, recover: 14, cd: 120, ai: [40, 210, 2],
        win: [WN(22, 56, { hy: 0, hh: 1, dmg: 18, rw: 34, knock: 14, stun: 22, body: true })],
        landFx: [{ ground: true, oy: 0.9, vx: 6.5, w: 34, h: 16, dmg: 7, knock: 6, stun: 14, life: 24, kind: 'shock' }]
      }
    }
  },
  { // 5 JUMPER - high jumps and aerial combos
    w: 32, h: 56, pref: [25, 70], aiJump: 0.09, doubleJump: true, moves: {
      attack: { anim: 'kick', dur: 14, win: [WN(4, 8)], dmg: 5, rw: 38, knock: 3, stun: 10, hy: 0.45, hh: 0.4, ai: [0, 46, 4] },
      attackAir: [
        { anim: 'airkick1', dur: 12, win: [WN(3, 8)], dmg: 4, rw: 42, knock: 2, stun: 9, inv: 3, hang: -3.5, hy: 0.3, hh: 0.6, ai: [0, 60, 4] },
        { anim: 'airkick2', dur: 12, win: [WN(3, 8)], dmg: 4, rw: 42, knock: 2, stun: 9, inv: 3, hang: -3.5, hy: 0.3, hh: 0.6 },
        { anim: 'airkick3', dur: 15, win: [WN(4, 9)], dmg: 6, rw: 46, knock: 8, stun: 14, inv: 3, hang: -3, hy: 0.3, hh: 0.6 }
      ],
      strong: { anim: 'rising', dur: 28, vy0: [3, -15], win: [WN(4, 20, { hy: -0.3, hh: 0.9, dmg: 9, knock: 6, stun: 18, launch: -10, rw: 36, body: true })], cd: 40, ai: [0, 50, 3] },
      strongAir: { anim: 'dive', dur: 70, vy0: [0, 13], lunge: [0, 70, 6.5], endOnLand: true, recover: 8, cd: 40, ai: [30, 160, 3], win: [WN(2, 70, { dmg: 12, rw: 26, knock: 9, stun: 16, hy: 0.3, hh: 0.7, body: true })] },
      special: {
        anim: 'spin', dur: 50, title: 'TORNADO!', vy0: [2, -16], dmg: 4, rw: 52, both: true, knock: 2, stun: 9, inv: 5, hy: 0.1, hh: 0.8, cd: 70, ai: [0, 64, 2],
        win: [WN(7, 11), WN(14, 18), WN(21, 26, { dmg: 7, knock: 11, launch: -6 })]
      }
    }
  },
  { // 6 RANCH-MAN - whip and ranged attacks
    w: 40, h: 84, pref: [70, 130], moves: {
      attack: { anim: 'whip', dur: 24, win: [WN(8, 12)], dmg: 5, rw: 112, knock: 3, stun: 11, hy: 0.3, hh: 0.5, ai: [20, 140, 4] },
      attackAir: { anim: 'whip', dur: 24, win: [WN(8, 12, { hy: 0.4, hh: 0.6 })], dmg: 5, rw: 112, knock: 3, stun: 11, hang: -2, ai: [20, 140, 4] },
      strong: {
        anim: 'lasso', dur: 34, pw: [{ s: 11, e: 15 }], cd: 60, ai: [70, 280, 3],
        spawn: [{ at: 11, p: { oy: 0.55, vx: 13, vy: 0, g: 0, w: 22, h: 22, dmg: 4, knock: 0, stun: 22, life: 26, kind: 'lasso', pull: 9 } }]
      },
      special: {
        anim: 'lashes', dur: 46, title: 'LASH STORM!', rw: 104, cd: 80, ai: [20, 130, 3],
        win: [WN(8, 13, { hy: 0.65, hh: 0.3, knock: 4, dmg: 5, launch: -7 }), WN(19, 24, { hy: 0.05, hh: 0.3, dmg: 5, knock: 4 }), WN(32, 38, { hy: -0.2, hh: 0.9, dmg: 8, knock: 9, rw: 100, stun: 16 })]
      }
    }
  },
  { // 7 IRON FIST - boxing combos and powerful punches
    w: 34, h: 90, pref: [10, 40], moves: {
      attack: [
        { anim: 'jab', dur: 11, win: [WN(3, 6)], dmg: 3, rw: 34, knock: 2, stun: 9, inv: 3, lunge: [1, 4, 2], ai: [0, 42, 4] },
        { anim: 'jab', dur: 11, win: [WN(3, 6)], dmg: 3, rw: 34, knock: 2, stun: 9, inv: 3, lunge: [1, 4, 2] },
        { anim: 'cross', dur: 16, win: [WN(4, 9)], dmg: 5, rw: 40, knock: 8, stun: 13, inv: 3, lunge: [1, 8, 3] }
      ],
      attackAir: { anim: 'cross', dur: 16, win: [WN(4, 9)], dmg: 5, rw: 40, knock: 6, stun: 12, hang: -2.5, ai: [0, 46, 4] },
      strong: [
        { anim: 'hook', dur: 26, win: [WN(10, 15)], dmg: 8, rw: 42, knock: 4, stun: 17, lunge: [6, 14, 3], cd: 30, ai: [0, 52, 3] },
        { anim: 'cross', dur: 24, win: [WN(6, 12, { hy: 0, hh: 0.7 })], dmg: 9, rw: 44, knock: 6, stun: 20, launch: -9, lunge: [4, 10, 3] }
      ],
      special: { anim: 'ironfist', dur: 52, title: 'IRON FIST!', armor: [6, 32], win: [WN(28, 34, { hy: 0, hh: 0.9, dmg: 15, launch: -10, knock: 14, rw: 54, stun: 20 })], lunge: [26, 34, 5.5], cd: 100, ai: [0, 80, 2] }
    }
  }
];

// The arena is 960x540 and the engine's fighters are ~150px tall, so the hand-tuned
// movesets above (authored at a smaller scale) are scaled up once at load time.
// Lengths (body, reach, AI ranges, projectile size) scale by SPR_S; horizontal speeds by 1.3.
const SPR_S = 1.6;
(function scaleDefs() {
  const S = SPR_S, V = 1.3;
  const sp = p => { if (p.r) p.r *= S; if (p.w) p.w *= S; if (p.h) p.h *= S; if (p.vx) p.vx *= V; };
  const sm = m => {
    if (m.rw) m.rw *= S;
    if (m.lunge) m.lunge[2] *= V;
    if (m.ai) { m.ai[0] *= S; m.ai[1] *= S; }
    if (m.win) m.win.forEach(w => { if (w.rw) w.rw *= S; });
    if (m.spawn) m.spawn.forEach(s => sp(s.p));
    if (m.landFx) m.landFx.forEach(sp);
  };
  for (const d of CHAR_DEF) {
    d.bw = d.w; d.bh = d.h;            // unscaled sprite-space size
    d.w *= S; d.h *= S; d.pref = d.pref.map(v => v * S);
    for (const k in d.moves) { const m = d.moves[k]; (Array.isArray(m) ? m : [m]).forEach(sm); }
  }
})();
