// ABILITÀ di tipo "proiettile": un colpo che parte nella direzione della mira e va dritto.
// Si ferma contro muri e pilastri; se tocca l'avversario gli toglie vita.
// I numeri arrivano dalla scheda del personaggio, per esempio:
//   RT: { nome: "Colpo", tipo: "proiettile", danno: 10, ricarica: 0.5,
//         velocita: 900, raggio: 12, gittata: 1000 }
//   danno    = vita tolta all'avversario
//   ricarica = secondi di attesa tra un colpo e l'altro
//   velocita = pixel al secondo
//   raggio   = grandezza del colpo (pixel)
//   gittata  = quanti pixel percorre prima di sparire
//   aspetto  = (facoltativo) "palla" (normale), "stellina" (stella che gira con scia
//              luccicante) oppure "bolla" (bolla trasparente che ondeggia)
//   colore   = (facoltativo) colore del colpo; se manca, il colore del giocatore

import { stella, cerchio } from "../core/disegno.js?v=0.6.0";

// Chiamata quando il giocatore preme il tasto dell'abilità (e la ricarica è finita).
export function usa(c, dati, mondo) {
  const dx = Math.cos(c.mira), dy = Math.sin(c.mira);
  const distanzaPartenza = c.scheda.raggio + dati.raggio + 4; // parte dal bordo del personaggio
  mondo.proiettili.push({
    tiratore: c,
    colore: dati.colore ?? c.squadra.colore,
    aspetto: dati.aspetto ?? "palla",
    scia: [],          // ultime posizioni (per la scia della stellina)
    x: c.x + dx * distanzaPartenza,
    y: c.y + dy * distanzaPartenza,
    vx: dx * dati.velocita,
    vy: dy * dati.velocita,
    raggio: dati.raggio,
    danno: dati.danno,
    strada: 0,
    gittata: dati.gittata ?? 1000,
  });
}

// Chiamata ogni fotogramma: muove i colpi e controlla cosa toccano.
export function aggiorna(mondo, dt) {
  const { arena, combattenti } = mondo;
  const k = arena.campo;

  mondo.proiettili = mondo.proiettili.filter((p) => {
    p.scia.unshift({ x: p.x, y: p.y });
    if (p.scia.length > 12) p.scia.pop();
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.strada += Math.hypot(p.vx, p.vy) * dt;

    // Troppo lontano: sparisce con un piccolo sbuffo
    if (p.strada > p.gittata) {
      mondo.effetto(p.x, p.y, p.colore, 0.6);
      return false;
    }

    // Contro il muro
    if (p.x - p.raggio < k.x || p.x + p.raggio > k.x + k.larghezza ||
        p.y - p.raggio < k.y || p.y + p.raggio > k.y + k.altezza) {
      mondo.effetto(p.x, p.y, p.colore, 1);
      return false;
    }

    // Contro un pilastro
    for (const pil of arena.pilastri) {
      if (Math.hypot(p.x - pil.x, p.y - pil.y) < p.raggio + pil.raggio) {
        mondo.effetto(p.x, p.y, p.colore, 1);
        return false;
      }
    }

    // Contro l'avversario (non contro chi ha sparato)
    for (const c of combattenti) {
      if (c === p.tiratore || !c.presente || c.vita <= 0) continue;
      if (Math.hypot(p.x - c.x, p.y - c.y) < p.raggio + c.scheda.raggio) {
        mondo.colpisci(c, p.danno, p);
        return false;
      }
    }

    return true;
  });
}

// Disegno dei colpi, secondo il loro aspetto.
export function disegna(ctx, mondo) {
  for (const p of mondo.proiettili) {
    if (p.aspetto === "stellina") disegnaStellina(ctx, p);
    else if (p.aspetto === "bolla") disegnaBolla(ctx, p, mondo.tempo);
    else disegnaPalla(ctx, p);
  }
  ctx.globalAlpha = 1;
}

// Stellina che gira, con una scia di brillantini
function disegnaStellina(ctx, p) {
  p.scia.forEach((s, i) => {
    const quota = 1 - i / p.scia.length;
    ctx.globalAlpha = 0.7 * quota;
    // brillantini alternati: un po' a destra e a sinistra della traiettoria
    const lato = (i % 2 ? 1 : -1) * 5;
    const v = Math.hypot(p.vx, p.vy) || 1;
    const x = s.x - (p.vy / v) * lato, y = s.y + (p.vx / v) * lato;
    if (i % 3 === 0) stella(ctx, x, y, p.raggio * 0.6 * quota + 2, i, "#fff6c2");
    else cerchio(ctx, x, y, p.raggio * 0.3 * quota + 1.5, i % 2 ? "#ff9ecb" : p.colore);
  });
  ctx.globalAlpha = 0.35;
  cerchio(ctx, p.x, p.y, p.raggio * 1.8, p.colore);
  ctx.globalAlpha = 1;
  stella(ctx, p.x, p.y, p.raggio * 1.25, p.strada / 40, p.colore);
  stella(ctx, p.x, p.y, p.raggio * 0.6, p.strada / 40, "#ffffff");
}

// Bolla trasparente che ondeggia, con riflesso bianco
function disegnaBolla(ctx, p, tempo = 0) {
  const onda = Math.sin(tempo * 14 + p.strada / 30) * 0.08;
  const rx = p.raggio * (1 + onda), ry = p.raggio * (1 - onda);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = p.colore;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
  // riflesso rosa sul bordo in basso a destra (come le bolle di sapone)
  ctx.strokeStyle = "#ff9ecb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, rx * 0.8, ry * 0.8, 0, 0.2, 1.6);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  cerchio(ctx, p.x - rx * 0.35, p.y - ry * 0.35, p.raggio * 0.25, "#ffffff");
  ctx.globalAlpha = 1;
}

// Palla luminosa (aspetto normale): alone colorato, scia e centro bianco
function disegnaPalla(ctx, p) {
  {
    const velocita = Math.hypot(p.vx, p.vy) || 1;
    const sx = (p.vx / velocita) * 34, sy = (p.vy / velocita) * 34;

    // Scia
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = p.colore;
    ctx.lineWidth = p.raggio * 1.3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x - sx, p.y - sy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Alone
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = p.colore;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.raggio * 1.9, 0, Math.PI * 2);
    ctx.fill();

    // Corpo e centro
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.raggio, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.raggio * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
