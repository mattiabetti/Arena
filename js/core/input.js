// Input: l'unico file che legge i controller Xbox (Gamepad API).
// Il resto del gioco chiede qui lo stato del Giocatore 1 e del Giocatore 2.

// Zona morta delle levette: sotto questo valore la levetta conta come ferma.
export const ZONA_MORTA = 0.2;

// Soglia oltre la quale un grilletto (LT/RT) conta come "premuto".
export const SOGLIA_GRILLETTO = 0.3;

// Nomi dei tasti -> numero nella mappatura standard.
export const TASTI = {
  A: 0, B: 1, X: 2, Y: 3,
  LB: 4, RB: 5, LT: 6, RT: 7,
  VIEW: 8, MENU: 9, // NON usare nel gioco: li usa Edge
  L3: 10, R3: 11,
  SU: 12, GIU: 13, SINISTRA: 14, DESTRA: 15,
  XBOX: 16, // del sistema: ignorare
};
const NOMI_TASTI = Object.keys(TASTI);

export const NUMERO_GIOCATORI = 2;

// posti[0] = indice del controller del Giocatore 1, posti[1] = Giocatore 2 (null = libero).
const posti = new Array(NUMERO_GIOCATORI).fill(null);
const statoPrecedente = new Array(NUMERO_GIOCATORI).fill(null);

// Vecchio Edge per Xbox: chiede di usare il controller come gamepad e non come mouse.
// Sui browser che non lo conoscono non fa nulla.
try {
  if ("gamepadInputEmulation" in navigator) navigator.gamepadInputEmulation = "gamepad";
} catch (e) { /* ignorare */ }

window.addEventListener("gamepadconnected", (e) => occupaPosto(e.gamepad.index));
window.addEventListener("gamepaddisconnected", (e) => {
  const p = posti.indexOf(e.gamepad.index);
  if (p !== -1) { posti[p] = null; statoPrecedente[p] = null; }
});

function occupaPosto(indiceController) {
  if (posti.includes(indiceController)) return;
  const libero = posti.indexOf(null);
  if (libero !== -1) posti[libero] = indiceController;
}

// Levetta con zona morta "rotonda": direzione conservata, intensità da 0 a 1.
function levetta(x, y) {
  const lunghezza = Math.hypot(x, y);
  if (lunghezza < ZONA_MORTA) return { x: 0, y: 0, intensita: 0 };
  const intensita = Math.min(1, (lunghezza - ZONA_MORTA) / (1 - ZONA_MORTA));
  return { x: (x / lunghezza) * intensita, y: (y / lunghezza) * intensita, intensita };
}

function statoVuoto() {
  const tasti = {};
  for (const nome of NOMI_TASTI) tasti[nome] = { premuto: false, appenaPremuto: false, appenaRilasciato: false, valore: 0 };
  return {
    collegato: false, id: "", indice: null, mappatura: "",
    numeroTasti: 0, numeroAssi: 0,
    tasti,
    sinistra: { x: 0, y: 0, intensita: 0 },
    destra: { x: 0, y: 0, intensita: 0 },
    grezzo: { sinistra: { x: 0, y: 0 }, destra: { x: 0, y: 0 } },
    vibrazione: false,
  };
}

// Da chiamare una volta per fotogramma. Restituisce [statoGiocatore1, statoGiocatore2].
export function leggiController() {
  const lista = navigator.getGamepads ? navigator.getGamepads() : [];

  // Alcuni browser (anche su Xbox) non mandano l'evento "connesso": controlliamo anche qui.
  for (const gp of lista) if (gp && gp.connected) occupaPosto(gp.index);

  const risultato = [];
  for (let p = 0; p < NUMERO_GIOCATORI; p++) {
    const stato = statoVuoto();
    const gp = posti[p] !== null ? lista[posti[p]] : null;

    if (gp && gp.connected) {
      stato.collegato = true;
      stato.id = gp.id;
      stato.indice = gp.index;
      stato.mappatura = gp.mapping || "(nessuna)";
      stato.numeroTasti = gp.buttons.length;
      stato.numeroAssi = gp.axes.length;
      stato.vibrazione = !!gp.vibrationActuator;

      const prec = statoPrecedente[p];
      for (const nome of NOMI_TASTI) {
        const b = gp.buttons[TASTI[nome]];
        if (!b) continue;
        let premuto = b.pressed;
        if (nome === "LT" || nome === "RT") premuto = b.value > SOGLIA_GRILLETTO;
        const eraPremuto = prec ? prec.tasti[nome].premuto : false;
        stato.tasti[nome] = {
          premuto,
          appenaPremuto: premuto && !eraPremuto,
          appenaRilasciato: !premuto && eraPremuto,
          valore: b.value,
        };
      }

      const a = gp.axes;
      stato.grezzo.sinistra = { x: a[0] || 0, y: a[1] || 0 };
      stato.grezzo.destra = { x: a[2] || 0, y: a[3] || 0 };
      stato.sinistra = levetta(stato.grezzo.sinistra.x, stato.grezzo.sinistra.y);
      stato.destra = levetta(stato.grezzo.destra.x, stato.grezzo.destra.y);
    }

    statoPrecedente[p] = stato;
    risultato.push(stato);
  }
  return risultato;
}

// Vibrazione del controller del giocatore (0 = Giocatore 1). Se non è supportata non fa nulla.
// Vibrazioni troppo ravvicinate vengono saltate (non servono e intasano il controller).
const ultimaVibrazione = [0, 0];
export function vibra(giocatore, durataMs = 200, forte = 1, debole = 1) {
  const indice = posti[giocatore];
  if (indice === null) return;
  const adesso = performance.now();
  if (adesso - ultimaVibrazione[giocatore] < 100) return;
  ultimaVibrazione[giocatore] = adesso;
  const gp = navigator.getGamepads()[indice];
  const att = gp && gp.vibrationActuator;
  if (!att || !att.playEffect) return;
  att.playEffect("dual-rumble", {
    startDelay: 0, duration: durataMs, strongMagnitude: forte, weakMagnitude: debole,
  }).catch(() => {});
}
