// ASPETTO "fatina": vista dall'alto, con ali che sbattono, vestito lilla,
// capelli biondi e bacchetta con la stellina.
// Si disegna "girati verso destra" (x positiva = davanti): ci pensa la rotazione
// a voltarla nella direzione della mira. y positiva = il suo fianco destro.

import { cerchio, stella } from "../core/disegno.js?v=0.8.0";

const COLORI = {
  ala: "rgba(190, 240, 255, 0.55)",
  bordoAla: "rgba(255, 255, 255, 0.85)",
  vestito: "#c79bff",
  vestitoScuro: "#9466d6",
  pelle: "#f6d2b6",
  capelli: "#ffd36b",
  capelliLuce: "#ffe9a8",
  fiore: "#ff8fc8",
  bacchetta: "#fff6e0",
  stella: "#ffe066",
};

export function disegna(ctx, c, info) {
  const r = c.scheda.raggio;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.mira);

  // Ali (dietro la schiena): sbattono velocissime
  const battito = 0.55 + 0.45 * Math.abs(Math.sin(info.tempo * 16));
  for (const lato of [-1, 1]) {
    ala(ctx, -r * 0.45, lato * r * 0.8, r * 0.5, r * 0.95 * battito, lato * 0.45);  // ala grande
    ala(ctx, -r * 0.95, lato * r * 0.45, r * 0.32, r * 0.6 * battito, lato * 1.0);  // ala piccola
  }

  // Braccio e bacchetta (mano destra). Durante il colpo la bacchetta "spazza" davanti.
  let giroBacchetta = 0.25;
  if (c.fendente) {
    const avanzamento = Math.min(1, c.fendente.t / c.fendente.durata * 1.4);
    giroBacchetta = -c.fendente.ampiezza / 2 + c.fendente.ampiezza * avanzamento;
  }
  ctx.save();
  ctx.translate(r * 0.1, r * 0.55);
  ctx.rotate(giroBacchetta);
  ctx.strokeStyle = COLORI.bacchetta;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(r * 1.15, 0);
  ctx.stroke();
  cerchio(ctx, 0, 0, r * 0.2, COLORI.pelle); // mano
  const luccichio = 1 + 0.2 * Math.sin(info.tempo * 9);
  stella(ctx, r * 1.2, 0, r * 0.32 * luccichio, info.tempo * 2, COLORI.stella);
  ctx.restore();

  // Vestito (visto dall'alto: un cerchio a "campana")
  cerchio(ctx, 0, 0, r * 0.8, COLORI.vestitoScuro);
  cerchio(ctx, -r * 0.05, -r * 0.05, r * 0.66, COLORI.vestito);

  // Testa: capelli biondi con un fiorellino
  cerchio(ctx, r * 0.12, 0, r * 0.46, COLORI.capelli);
  cerchio(ctx, r * 0.02, -r * 0.12, r * 0.22, COLORI.capelliLuce);
  cerchio(ctx, -r * 0.22, r * 0.25, r * 0.13, COLORI.fiore);

  ctx.restore();
}

function ala(ctx, x, y, rx, ry, giro) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, giro, 0, Math.PI * 2);
  ctx.fillStyle = COLORI.ala;
  ctx.fill();
  ctx.strokeStyle = COLORI.bordoAla;
  ctx.lineWidth = 2;
  ctx.stroke();
}
