// Piccoli aiuti per disegnare i temi delle arene.

// Numeri "a caso" ma sempre uguali partendo dallo stesso seme:
// così erba e fiori sono sempre nello stesso posto (e non cambiano ridisegnando).
export function casuale(seme = 1) {
  let s = seme >>> 0;
  const prossimo = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // da 0 a 1
  };
  prossimo.tra = (min, max) => min + prossimo() * (max - min);
  prossimo.scegli = (elenco) => elenco[Math.floor(prossimo() * elenco.length)];
  return prossimo;
}

// Disegna qualcosa due volte: dove si trova e nella posizione "allo specchio"
// (sinistra <-> destra), così anche le decorazioni sono simmetriche.
export function specchiato(arena, x, y, disegna) {
  const k = arena.campo;
  const cx = k.x + k.larghezza / 2;
  disegna(x, y);
  disegna(2 * cx - x, y);
}

export function cerchio(ctx, x, y, r, colore) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colore;
  ctx.fill();
}
