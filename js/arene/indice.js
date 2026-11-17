// Elenco delle arene. A ogni nuova partita si passa all'arena successiva.
// Per aggiungerne una: copiare una scheda (es. foresta.js), cambiare id, nome e numeri,
// importarla qui sotto e metterla nell'elenco ARENE.

import foresta from "./foresta.js?v=0.7.0";
import pietra from "./pietra.js?v=0.7.0";

export const ARENE = [foresta, pietra];

// Controllo della SIMMETRIA: i due giocatori devono partire nelle stesse condizioni.
// Un'arena va bene se è uguale a se stessa:
//   - guardata allo specchio (sinistra <-> destra), oppure
//   - girata di mezzo giro intorno al centro.
// Restituisce un elenco di problemi (vuoto = tutto a posto).
export function controllaSimmetria(arena) {
  const k = arena.campo;
  const cx = k.x + k.larghezza / 2, cy = k.y + k.altezza / 2;
  const specchio = (x, y, gradi) => [2 * cx - x, y, 180 - gradi];
  const mezzoGiro = (x, y, gradi) => [2 * cx - x, 2 * cy - y, gradi + 180];

  const problemiSpecchio = problemi(arena, specchio);
  if (problemiSpecchio.length === 0) return [];
  const problemiGiro = problemi(arena, mezzoGiro);
  if (problemiGiro.length === 0) return [];
  return problemiSpecchio;
}

const vicino = (a, b) => Math.abs(a - b) < 1;
function stessoAngolo(a, b) {
  const differenza = (((a - b) % 360) + 360) % 360; // da 0 a 360
  return differenza < 1 || differenza > 359;
}

function problemi(arena, trasforma) {
  const elenco = [];
  for (const p of arena.pilastri) {
    const [x, y] = trasforma(p.x, p.y, 0);
    const gemello = arena.pilastri.find((q) => vicino(q.x, x) && vicino(q.y, y) && vicino(q.raggio, p.raggio));
    if (!gemello) elenco.push(`pilastro in (${p.x}, ${p.y}) senza gemello in (${Math.round(x)}, ${Math.round(y)})`);
  }
  const [a, b] = arena.partenze;
  const [x, y, gradi] = trasforma(a.x, a.y, a.mira);
  if (!vicino(b.x, x) || !vicino(b.y, y)) {
    elenco.push(`partenza del Giocatore 2 dovrebbe essere in (${Math.round(x)}, ${Math.round(y)})`);
  } else if (!stessoAngolo(b.mira, gradi)) {
    elenco.push(`mira iniziale del Giocatore 2 dovrebbe essere ${((gradi % 360) + 360) % 360} gradi`);
  }
  return elenco;
}
