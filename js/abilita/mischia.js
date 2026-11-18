// ABILITÀ di tipo "mischia": attacco corpo a corpo (spada, bacchetta...).
// Colpisce subito chi è vicino e davanti, dentro uno "spicchio" nella direzione della mira,
// e lo spinge indietro. Numeri dalla scheda, per esempio:
//   LT: { nome: "Spada", tipo: "mischia", aspetto: "spada", danno: 18, portata: 70,
//         ampiezza: 140, spinta: 700, ricarica: 1 }
//   portata  = quanti pixel arriva oltre il bordo del personaggio
//   ampiezza = larghezza dello spicchio, in gradi (180 = mezzo cerchio davanti)
//   spinta   = quanto forte spinge indietro chi viene colpito
//   aspetto  = "spada" (fendente argentato), "bacchetta" (arco di stelline),
//              "coda" (scodata: arco verde a giro completo) oppure "artigli" (tre graffi)

import { stella } from "../core/disegno.js?v=0.8.0";

const DURATA_FENDENTE = 0.18; // secondi dell'animazione del colpo

export function usa(c, dati, mondo) {
  const ampiezza = (dati.ampiezza ?? 120) * Math.PI / 180;
  // Il personaggio ricorda il colpo in corso (serve anche per muovere spada/bacchetta)
  c.fendente = { t: 0, durata: DURATA_FENDENTE, mira: c.mira, ampiezza, dati };

  for (const b of mondo.combattenti) {
    if (b === c || !b.presente || b.vita <= 0) continue;
    const dx = b.x - c.x, dy = b.y - c.y;
    const distanza = Math.hypot(dx, dy) || 1;
    // Abbastanza vicino?
    if (distanza > c.scheda.raggio + dati.portata + b.scheda.raggio) continue;
    // Abbastanza davanti? (un po' di tolleranza per la grandezza dell'avversario)
    const differenza = Math.abs(angoloTra(Math.atan2(dy, dx), c.mira));
    const tolleranza = ampiezza / 2 + Math.atan(b.scheda.raggio / distanza);
    if (differenza > tolleranza) continue;

    const nx = dx / distanza, ny = dy / distanza;
    const colpo = { x: b.x - nx * b.scheda.raggio, y: b.y - ny * b.scheda.raggio,
                    colore: dati.colore ?? c.squadra.colore, tiratore: c };
    if (mondo.colpisci(b, dati.danno, colpo)) {
      b.spinta = { vx: nx * (dati.spinta ?? 0), vy: ny * (dati.spinta ?? 0) };
    }
  }
}

export function aggiorna(mondo, dt) {
  for (const c of mondo.combattenti) {
    if (!c.fendente) continue;
    c.fendente.t += dt;
    if (c.fendente.t >= c.fendente.durata) c.fendente = null;
  }
}

export function disegna(ctx, mondo) {
  for (const c of mondo.combattenti) {
    const f = c.fendente;
    if (!f) continue;
    const avanzamento = f.t / f.durata; // da 0 a 1
    const inizio = f.mira - f.ampiezza / 2;
    const fine = inizio + f.ampiezza * Math.min(1, avanzamento * 1.4);
    const raggio = c.scheda.raggio + f.dati.portata * 0.75;
    ctx.save();
    ctx.globalAlpha = 1 - avanzamento * 0.8;
    if (f.dati.aspetto === "coda") {
      // Scodata: il draghetto fa una giravolta (vedi aspetti/draghetto.js); la coda, che parte
      // da dietro, passa davanti a metà giro: la scia verde compare solo lì, dove colpisce.
      const giro = Math.PI * 2 * Math.min(1, avanzamento);
      const arrivaDavanti = Math.PI - f.ampiezza / 2;
      if (giro > arrivaDavanti) {
        const da = f.mira - f.ampiezza / 2;
        const a = da + Math.min(giro - arrivaDavanti, f.ampiezza);
        ctx.lineCap = "round";
        ctx.strokeStyle = "#4fae3e";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(c.x, c.y, raggio, da, a);
        ctx.stroke();
        ctx.strokeStyle = "#ff8c42";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(c.x, c.y, raggio, da, a);
        ctx.stroke();
      }
    } else if (f.dati.aspetto === "artigli") {
      // Artigliata: tre graffi bianchi paralleli davanti al gattino, che si allungano
      const dx = Math.cos(f.mira), dy = Math.sin(f.mira);
      const cx = c.x + dx * raggio, cy = c.y + dy * raggio;
      const ga = f.mira + Math.PI / 2 + 0.6;          // direzione del graffio (di traverso)
      const gx = Math.cos(ga), gy = Math.sin(ga);
      const lungo = 30 * Math.min(1, avanzamento * 2);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (const spostamento of [-14, 0, 14]) {
        const sx = cx + dx * spostamento, sy = cy + dy * spostamento;
        ctx.moveTo(sx - gx * lungo, sy - gy * lungo);
        ctx.lineTo(sx + gx * lungo, sy + gy * lungo);
      }
      ctx.stroke();
    } else if (f.dati.aspetto === "bacchetta") {
      // Arco di stelline dorate
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 5;
      ctx.setLineDash([4, 10]);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(c.x, c.y, raggio, inizio, fine);
      ctx.stroke();
      for (let i = 0; i <= 4; i++) {
        const a = inizio + (fine - inizio) * (i / 4);
        stella(ctx, c.x + Math.cos(a) * raggio, c.y + Math.sin(a) * raggio, 9, a * 3, i % 2 ? "#ff9ecb" : "#fff6c2");
      }
    } else {
      // Fendente di spada: una "mezzaluna" argentata
      ctx.fillStyle = "rgba(230, 240, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, raggio + 10, inizio, fine);
      ctx.arc(c.x, c.y, raggio - 14, fine, inizio, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, raggio + 10, inizio, fine);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Differenza tra due angoli, ridotta tra -mezzo giro e +mezzo giro
function angoloTra(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
