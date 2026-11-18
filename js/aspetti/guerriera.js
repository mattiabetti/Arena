// ASPETTO "guerriera": vista dall'alto, giacca verde acqua con bordi dorati,
// capelli scuri con la coda che ondeggia, spada nella mano destra.
// Si disegna "girata verso destra" (x positiva = davanti): ci pensa la rotazione
// a voltarla nella direzione della mira. y positiva = il suo fianco destro.

import { cerchio } from "../core/disegno.js?v=0.8.0";

const COLORI = {
  giacca: "#2a9da5",
  giaccaScura: "#176a70",
  oro: "#f2c14e",
  pelle: "#e9b994",
  capelli: "#2b2024",
  capelliLuce: "#4a3a3c",
  lama: "#e4ebf3",
  lamaLuce: "#ffffff",
  elsa: "#6b3d2a",
};

export function disegna(ctx, c, info) {
  const r = c.scheda.raggio;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.mira);

  // Coda di capelli dietro la testa, che ondeggia
  const ondeggia = Math.sin(info.tempo * 6) * 0.25;
  ctx.save();
  ctx.translate(-r * 0.3, 0);
  ctx.rotate(Math.PI + ondeggia);
  ctx.beginPath();
  ctx.ellipse(r * 0.55, 0, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORI.capelli;
  ctx.fill();
  cerchio(ctx, r * 0.05, 0, r * 0.14, COLORI.oro); // fermacapelli
  ctx.restore();

  // Mano sinistra (quella che lancia la bolla)
  cerchio(ctx, r * 0.35, -r * 0.62, r * 0.2, COLORI.pelle);

  // Spada nella mano destra. Durante il colpo "spazza" davanti a sé.
  let giroSpada = 0.35;
  if (c.fendente) {
    const avanzamento = Math.min(1, c.fendente.t / c.fendente.durata * 1.4);
    giroSpada = -c.fendente.ampiezza / 2 + c.fendente.ampiezza * avanzamento;
  }
  ctx.save();
  ctx.translate(r * 0.2, r * 0.6);
  ctx.rotate(giroSpada);
  ctx.lineCap = "round";
  ctx.strokeStyle = COLORI.lama;       // lama
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(r * 0.3, 0);
  ctx.lineTo(r * 1.65, 0);
  ctx.stroke();
  ctx.strokeStyle = COLORI.lamaLuce;   // filo luminoso
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(r * 0.35, -1.5);
  ctx.lineTo(r * 1.6, -1.5);
  ctx.stroke();
  ctx.strokeStyle = COLORI.oro;        // guardia
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(r * 0.3, -r * 0.25);
  ctx.lineTo(r * 0.3, r * 0.25);
  ctx.stroke();
  ctx.strokeStyle = COLORI.elsa;       // impugnatura
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.05, 0);
  ctx.lineTo(r * 0.28, 0);
  ctx.stroke();
  cerchio(ctx, 0, 0, r * 0.2, COLORI.pelle); // mano
  ctx.restore();

  // Spalle e giacca (più larghe di lato)
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.6, r * 0.88, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORI.giaccaScura;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-r * 0.04, -r * 0.04, r * 0.5, r * 0.76, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORI.giacca;
  ctx.fill();
  ctx.strokeStyle = COLORI.oro;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Testa: capelli scuri con un riflesso
  cerchio(ctx, r * 0.08, 0, r * 0.42, COLORI.capelli);
  cerchio(ctx, -r * 0.02, -r * 0.12, r * 0.2, COLORI.capelliLuce);

  ctx.restore();
}
