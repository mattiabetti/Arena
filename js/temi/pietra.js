// TEMA "pietra": pavimento a piastrelle scure, muro grigio, pilastri di pietra.
// Disegna solo le parti fisse dell'arena (viene disegnato una volta sola).

import { cerchio } from "./utilita.js?v=0.5.0";

export function disegna(ctx, arena) {
  const k = arena.campo, col = arena.colori;

  // Fuori dall'arena
  ctx.fillStyle = col.sfondo;
  ctx.fillRect(0, 0, 1920, 1080);

  // Pavimento
  ctx.beginPath();
  ctx.roundRect(k.x, k.y, k.larghezza, k.altezza, k.angoli);
  ctx.fillStyle = col.pavimento;
  ctx.fill();

  // Piastrelle: righe leggere ogni 115 pixel (dentro il pavimento)
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = col.piastrelle;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const passo = 115;
  for (let x = k.x + passo; x < k.x + k.larghezza; x += passo) { ctx.moveTo(x, k.y); ctx.lineTo(x, k.y + k.altezza); }
  for (let y = k.y + passo; y < k.y + k.altezza; y += passo) { ctx.moveTo(k.x, y); ctx.lineTo(k.x + k.larghezza, y); }
  ctx.stroke();
  ctx.restore();

  // Cerchio e linea di metà campo
  const cx = k.x + k.larghezza / 2, cy = k.y + k.altezza / 2;
  ctx.strokeStyle = col.bordo;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.moveTo(cx, k.y);
  ctx.lineTo(cx, k.y + k.altezza);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Muro intorno (disegnato appena fuori dal pavimento)
  ctx.beginPath();
  ctx.roundRect(k.x - 6, k.y - 6, k.larghezza + 12, k.altezza + 12, k.angoli + 6);
  ctx.strokeStyle = col.bordo;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Pilastri: ombra, corpo e riflesso
  for (const p of arena.pilastri) {
    ctx.globalAlpha = 0.45;
    cerchio(ctx, p.x + 8, p.y + 12, p.raggio, "#000");
    ctx.globalAlpha = 1;
    cerchio(ctx, p.x, p.y, p.raggio, col.pilastro);
    cerchio(ctx, p.x - p.raggio * 0.12, p.y - p.raggio * 0.15, p.raggio * 0.72, col.pilastroLuce);
  }
}
