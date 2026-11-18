// ASPETTO "draghetto": vista dall'alto, corpo verde con pancia chiara, alette, cornetti,
// coda con la punta a freccia che scodinzola.
// Durante la scodata (colpo corpo a corpo) fa una giravolta completa: la coda spazza tutto intorno.
// Si disegna "girato verso destra" (x positiva = davanti). Solo forme semplici: è leggero.

import { cerchio } from "../core/disegno.js?v=0.8.0";

const COLORI = {
  corpo: "#4fae3e",
  corpoScuro: "#357a2a",
  pancia: "#c8e6a0",
  ala: "#2e6b25",
  corna: "#ffd36b",
  punta: "#ff8c42",
  occhi: "#1a1a1a",
};

export function disegna(ctx, c, info) {
  const r = c.scheda.raggio;
  ctx.save();
  ctx.translate(c.x, c.y);

  // Scodata: giravolta completa durante il colpo
  let giro = 0;
  if (c.fendente) giro = Math.PI * 2 * Math.min(1, c.fendente.t / c.fendente.durata);
  ctx.rotate(c.mira + giro);

  // Coda (dietro): una linea curva che scodinzola, con la punta a freccia
  const scodinzola = Math.sin(info.tempo * 5) * r * 0.35;
  const fineX = -r * 1.55, fineY = scodinzola;
  ctx.strokeStyle = COLORI.corpoScuro;
  ctx.lineWidth = r * 0.28;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, 0);
  ctx.quadraticCurveTo(-r * 1.1, -scodinzola * 0.6, fineX, fineY);
  ctx.stroke();
  ctx.beginPath(); // punta a freccia
  ctx.moveTo(fineX - r * 0.35, fineY);
  ctx.lineTo(fineX + r * 0.05, fineY - r * 0.22);
  ctx.lineTo(fineX + r * 0.05, fineY + r * 0.22);
  ctx.closePath();
  ctx.fillStyle = COLORI.punta;
  ctx.fill();

  // Alette sulla schiena (triangoli) che si muovono piano
  const apri = 0.85 + 0.15 * Math.sin(info.tempo * 4);
  ctx.fillStyle = COLORI.ala;
  for (const lato of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, lato * r * 0.35);
    ctx.lineTo(-r * 0.55, lato * r * 1.15 * apri);
    ctx.lineTo(-r * 0.75, lato * r * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  // Corpo e pancia
  cerchio(ctx, -r * 0.05, 0, r * 0.75, COLORI.corpoScuro);
  cerchio(ctx, -r * 0.1, -r * 0.05, r * 0.6, COLORI.corpo);
  cerchio(ctx, -r * 0.15, 0, r * 0.3, COLORI.pancia);

  // Testa con cornetti e occhi
  ctx.fillStyle = COLORI.corna;
  for (const lato of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(r * 0.35, lato * r * 0.25);
    ctx.lineTo(r * 0.05, lato * r * 0.62);
    ctx.lineTo(r * 0.5, lato * r * 0.38);
    ctx.closePath();
    ctx.fill();
  }
  cerchio(ctx, r * 0.5, 0, r * 0.42, COLORI.corpo);
  cerchio(ctx, r * 0.78, 0, r * 0.2, COLORI.pancia);   // muso
  cerchio(ctx, r * 0.55, -r * 0.2, r * 0.08, COLORI.occhi);
  cerchio(ctx, r * 0.55, r * 0.2, r * 0.08, COLORI.occhi);

  ctx.restore();
}
