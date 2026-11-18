// TEMA "foresta": una radura nel bosco vista dall'alto.
// Prato con macchie d'erba e fiori, terra battuta al centro e alle partenze,
// siepe di cespugli come bordo, alberi (chiome) al posto dei pilastri.
// Disegna solo le parti fisse dell'arena (viene disegnato una volta sola).
// Le decorazioni sono messe "a specchio", così anche la grafica è simmetrica.
// La luce arriva sempre da in alto a sinistra (riflessi in alto a sinistra).

import { casuale, specchiato, cerchio } from "./utilita.js?v=0.8.0";

const COLORI = {
  bosco: "#0c1f10",          // fuori dall'arena
  prato: "#3e7536",
  pratoChiaro: "#4f8a43",
  pratoScuro: "#33652e",
  erba: "#62a352",           // fili d'erba
  terra: "#8a7449",
  cespuglioScuro: "#163a19",
  cespuglio: "#21522a",
  cespuglioLuce: "#2f6e33",
  chiomaScura: "#1d4a20",
  chioma: "#2a6a2c",
  chiomaChiara: "#3d8a38",
  chiomaLuce: "#5aa94a",
  fiori: ["#ffffff", "#ffe066", "#ff9ecb", "#c9a6ff"],
};

export function disegna(ctx, arena) {
  const k = arena.campo;
  const cx = k.x + k.larghezza / 2;
  const caso = casuale(arena.seme ?? 1);

  // ---- Bosco fitto fuori dall'arena ----
  ctx.fillStyle = COLORI.bosco;
  ctx.fillRect(0, 0, 1920, 1080);

  // ---- Prato ----
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(k.x, k.y, k.larghezza, k.altezza, k.angoli);
  ctx.fillStyle = COLORI.prato;
  ctx.fill();
  ctx.clip(); // da qui in poi si disegna solo dentro il prato

  // Macchie d'erba più chiare e più scure
  for (let i = 0; i < 70; i++) {
    const x = caso.tra(k.x - 40, cx), y = caso.tra(k.y - 40, k.y + k.altezza + 40);
    const rx = caso.tra(50, 140), ry = caso.tra(30, 80), giro = caso.tra(0, Math.PI);
    const colore = caso() < 0.5 ? COLORI.pratoChiaro : COLORI.pratoScuro;
    ctx.globalAlpha = 0.45;
    specchiato(arena, x, y, (sx, sy) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx, ry, sx < cx ? giro : -giro, 0, Math.PI * 2);
      ctx.fillStyle = colore;
      ctx.fill();
    });
  }
  ctx.globalAlpha = 1;

  // Terra battuta: al centro e sotto le partenze (tante macchie tonde, aspetto naturale)
  const radure = [{ x: cx, y: k.y + k.altezza / 2, r: 170 }, ...arena.partenze.map((p) => ({ x: p.x, y: p.y, r: 95 }))];
  for (const radura of radure) {
    if (radura.x > cx + 1) continue; // la metà destra arriva dallo specchio
    for (let i = 0; i < 14; i++) {
      const a = caso.tra(0, Math.PI * 2), d = caso.tra(0, radura.r * 0.55);
      const x = radura.x + Math.cos(a) * d, y = radura.y + Math.sin(a) * d;
      const r = caso.tra(radura.r * 0.35, radura.r * 0.6);
      ctx.globalAlpha = 0.28;
      specchiato(arena, x, y, (sx, sy) => cerchio(ctx, sx, sy, r, COLORI.terra));
    }
  }
  ctx.globalAlpha = 1;

  // Fili d'erba: piccoli trattini a "V"
  ctx.strokeStyle = COLORI.erba;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  for (let i = 0; i < 260; i++) {
    const x = caso.tra(k.x, cx), y = caso.tra(k.y, k.y + k.altezza), h = caso.tra(8, 14);
    specchiato(arena, x, y, (sx, sy) => {
      ctx.moveTo(sx - 5, sy - h); ctx.lineTo(sx, sy);
      ctx.lineTo(sx + 5, sy - h);
    });
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";

  // Fiori: petali colorati con il centro giallo
  for (let i = 0; i < 45; i++) {
    const x = caso.tra(k.x + 20, cx - 30), y = caso.tra(k.y + 20, k.y + k.altezza - 20);
    const colore = caso.scegli(COLORI.fiori);
    specchiato(arena, x, y, (sx, sy) => {
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        cerchio(ctx, sx + Math.cos(a) * 5, sy + Math.sin(a) * 5, 4, colore);
      }
      cerchio(ctx, sx, sy, 3, "#f2b600");
    });
  }

  ctx.restore(); // fine del prato

  // ---- Siepe intorno: due file di cespugli lungo il bordo ----
  // (punti presi sulla metà sinistra del bordo; la destra arriva dallo specchio)
  const puntiBordo = [];
  for (let x = k.x; x <= cx; x += 34) {
    puntiBordo.push({ x, y: k.y, nx: 0, ny: -1 });                 // lato in alto
    puntiBordo.push({ x, y: k.y + k.altezza, nx: 0, ny: 1 });      // lato in basso
  }
  for (let y = k.y; y <= k.y + k.altezza; y += 34) {
    puntiBordo.push({ x: k.x, y, nx: -1, ny: 0 });                 // lato a sinistra
  }
  // Prima la fila esterna (più grande e scura), poi quella interna
  for (const fila of [{ fuori: 26, rMin: 30, rMax: 42 }, { fuori: 6, rMin: 20, rMax: 28 }]) {
    for (const p of puntiBordo) {
      const r = caso.tra(fila.rMin, fila.rMax);
      const sposta = fila.fuori + caso.tra(-4, 6);
      const x = p.x + p.nx * sposta + caso.tra(-6, 6), y = p.y + p.ny * sposta + caso.tra(-6, 6);
      specchiato(arena, x, y, (sx, sy) => cespuglio(ctx, sx, sy, r));
    }
  }

  // ---- Alberi ----
  // Prima tutte le ombre, poi tutte le chiome (un'ombra non copre mai una chioma)
  for (const p of arena.pilastri) {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(p.x + p.raggio * 0.25, p.y + p.raggio * 0.35, p.raggio * 1.25, p.raggio * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const p of arena.pilastri) chioma(ctx, p.x, p.y, p.raggio);
}

// Un cespuglio: base scura e riflesso in alto a sinistra
function cespuglio(ctx, x, y, r) {
  cerchio(ctx, x, y, r, COLORI.cespuglioScuro);
  cerchio(ctx, x - r * 0.15, y - r * 0.2, r * 0.75, COLORI.cespuglio);
  cerchio(ctx, x - r * 0.3, y - r * 0.35, r * 0.35, COLORI.cespuglioLuce);
}

// La chioma di un albero vista dall'alto: tanti "ciuffi" di foglie intorno a un centro.
// r = raggio che blocca; la chioma è un po' più grande.
function chioma(ctx, x, y, r) {
  const R = r * 1.2;
  const ciuffi = 7;
  // base scura
  cerchio(ctx, x, y, R, COLORI.chiomaScura);
  for (let i = 0; i < ciuffi; i++) {
    const a = (i / ciuffi) * Math.PI * 2;
    cerchio(ctx, x + Math.cos(a) * R * 0.62, y + Math.sin(a) * R * 0.62, R * 0.42, COLORI.chiomaScura);
  }
  // strato medio, spostato verso la luce
  for (let i = 0; i < ciuffi; i++) {
    const a = (i / ciuffi) * Math.PI * 2 + 0.4;
    cerchio(ctx, x - R * 0.08 + Math.cos(a) * R * 0.5, y - R * 0.1 + Math.sin(a) * R * 0.5, R * 0.36, COLORI.chioma);
  }
  cerchio(ctx, x - R * 0.1, y - R * 0.12, R * 0.55, COLORI.chioma);
  // parte chiara in alto a sinistra
  cerchio(ctx, x - R * 0.25, y - R * 0.28, R * 0.38, COLORI.chiomaChiara);
  cerchio(ctx, x + R * 0.12, y - R * 0.38, R * 0.22, COLORI.chiomaChiara);
  cerchio(ctx, x - R * 0.42, y + R * 0.05, R * 0.2, COLORI.chiomaChiara);
  cerchio(ctx, x - R * 0.33, y - R * 0.38, R * 0.15, COLORI.chiomaLuce);
}
