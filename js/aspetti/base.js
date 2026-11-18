// ASPETTO "base": un cerchio nel colore del giocatore con una punta che indica la mira.
// Usato dai personaggi che non hanno (ancora) un disegno tutto loro.

import { cerchio } from "../core/disegno.js?v=0.8.0";

export function disegna(ctx, c) {
  const r = c.scheda.raggio;
  const s = c.squadra;
  const dx = Math.cos(c.mira), dy = Math.sin(c.mira);

  // Punta che indica dove guarda
  ctx.beginPath();
  ctx.moveTo(c.x + dx * (r + 14), c.y + dy * (r + 14));
  ctx.lineTo(c.x + Math.cos(c.mira + 0.55) * (r - 2), c.y + Math.sin(c.mira + 0.55) * (r - 2));
  ctx.lineTo(c.x + Math.cos(c.mira - 0.55) * (r - 2), c.y + Math.sin(c.mira - 0.55) * (r - 2));
  ctx.closePath();
  ctx.fillStyle = s.colore;
  ctx.fill();

  cerchio(ctx, c.x, c.y, r, s.scuro);
  cerchio(ctx, c.x, c.y, r - 5, s.colore);
  cerchio(ctx, c.x, c.y, r * 0.32, c.scheda.colore);
}
