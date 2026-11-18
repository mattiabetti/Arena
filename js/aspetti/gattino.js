// ASPETTO "gattino": vista dall'alto, micio arancione tigrato, orecchie a punta,
// coda che ondeggia. Durante l'artigliata allunga la zampa in avanti.
// Si disegna "girato verso destra" (x positiva = davanti). Solo forme semplici: è leggero.

import { cerchio } from "../core/disegno.js?v=0.8.0";

const COLORI = {
  pelo: "#f39a3d",
  peloScuro: "#c06a1f",
  strisce: "#a8561a",
  bianco: "#fff1de",
  orecchioDentro: "#ffb3c1",
  occhi: "#2f8f4e",
};

export function disegna(ctx, c, info) {
  const r = c.scheda.raggio;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.mira);

  // Coda (dietro): curva che ondeggia, con la punta bianca
  const ondeggia = Math.sin(info.tempo * 3) * r * 0.6;
  ctx.lineCap = "round";
  ctx.strokeStyle = COLORI.peloScuro;
  ctx.lineWidth = r * 0.26;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, 0);
  ctx.quadraticCurveTo(-r * 1.2, ondeggia, -r * 1.45, ondeggia * 0.4 - r * 0.3);
  ctx.stroke();
  cerchio(ctx, -r * 1.45, ondeggia * 0.4 - r * 0.3, r * 0.15, COLORI.bianco);

  // Zampa che graffia: durante l'artigliata si allunga in avanti
  let allunga = 0;
  if (c.fendente) allunga = Math.sin(Math.PI * Math.min(1, c.fendente.t / c.fendente.durata));
  cerchio(ctx, r * (0.45 + allunga * 0.7), r * 0.45, r * 0.2, COLORI.bianco);

  // Corpo con strisce
  ctx.beginPath();
  ctx.ellipse(-r * 0.1, 0, r * 0.72, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORI.pelo;
  ctx.fill();
  ctx.strokeStyle = COLORI.strisce;
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  for (const x of [-0.5, -0.25, 0]) {
    ctx.moveTo(r * x, -r * 0.4);
    ctx.lineTo(r * (x - 0.08), r * 0.4);
  }
  ctx.stroke();

  // Testa con orecchie a punta (verso avanti e di lato) e occhi verdi
  for (const lato of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(r * 0.45, lato * r * 0.12);
    ctx.lineTo(r * 0.75, lato * r * 0.55);
    ctx.lineTo(r * 0.3, lato * r * 0.45);
    ctx.closePath();
    ctx.fillStyle = COLORI.pelo;
    ctx.fill();
    cerchio(ctx, r * 0.5, lato * r * 0.4, r * 0.07, COLORI.orecchioDentro);
  }
  cerchio(ctx, r * 0.45, 0, r * 0.4, COLORI.pelo);
  cerchio(ctx, r * 0.7, 0, r * 0.17, COLORI.bianco);   // musetto
  cerchio(ctx, r * 0.55, -r * 0.17, r * 0.08, COLORI.occhi);
  cerchio(ctx, r * 0.55, r * 0.17, r * 0.08, COLORI.occhi);

  ctx.restore();
}
