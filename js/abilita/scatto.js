// ABILITÀ di tipo "scatto": uno spostamento velocissimo per un breve tratto.
// Direzione: quella della levetta sinistra; se è ferma, quella della mira.
// Durante lo scatto la levetta sinistra non conta, ma si può mirare e sparare.
// Muri, pilastri e avversario fermano lo scatto come al solito.
// Numeri dalla scheda, per esempio:
//   B: { nome: "Scatto", tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 }
//   distanza = pixel percorsi
//   durata   = secondi che dura lo scatto
//   ricarica = secondi prima di poterlo rifare

const DURATA_OMBRA = 0.25; // per quanti secondi restano le "ombre" lasciate dallo scatto

export function usa(c, dati, mondo, controller) {
  let angolo = c.mira;
  if (controller && controller.sinistra.intensita > 0) {
    angolo = Math.atan2(controller.sinistra.y, controller.sinistra.x);
  }
  const velocita = dati.distanza / dati.durata;
  // "forzato" = movimento che sostituisce la levetta (lo applica gioco.js)
  c.forzato = { vx: Math.cos(angolo) * velocita, vy: Math.sin(angolo) * velocita, tempo: dati.durata };
  mondo.effetto(c.x, c.y, "#ffffff", 0.8);
}

export function aggiorna(mondo, dt) {
  for (const c of mondo.combattenti) {
    // Mentre scatta, lascia un'ombra a ogni fotogramma
    if (c.forzato) c.ombre.push({ x: c.x, y: c.y, t: 0 });
    for (const o of c.ombre) o.t += dt;
    c.ombre = c.ombre.filter((o) => o.t < DURATA_OMBRA);
  }
}

// Le ombre vanno disegnate SOTTO i personaggi
export function disegnaSotto(ctx, mondo) {
  for (const c of mondo.combattenti) {
    for (const o of c.ombre) {
      ctx.globalAlpha = 0.35 * (1 - o.t / DURATA_OMBRA);
      ctx.fillStyle = c.squadra.colore;
      ctx.beginPath();
      ctx.arc(o.x, o.y, c.scheda.raggio * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
