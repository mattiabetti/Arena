// Pagina di test dei controller.
// Mostra in tempo reale cosa arriva da ogni controller e permette di muovere
// due cerchi in una mini-arena (levetta sinistra = muovi, levetta destra = mira).

import { creaSchermo, collegaPulsanteSchermoIntero, LARGHEZZA, ALTEZZA } from "./core/schermo.js?v=0.1.4";
import { leggiController, vibra, ZONA_MORTA } from "./core/input.js?v=0.1.4";
import { proteggiNavigazione, registro } from "./core/navigazione.js?v=0.1.4";
import { VERSIONE } from "./core/versione.js?v=0.1.4";

const schermo = creaSchermo(document.getElementById("schermo"));
const ctx = schermo.ctx;
collegaPulsanteSchermoIntero(document.getElementById("schermo-intero"));
proteggiNavigazione();

const COLORI = ["#3fa9ff", "#ff5a5a"]; // Giocatore 1 blu, Giocatore 2 rosso
const COLORI_ABXY = { A: "#5bd45b", B: "#ff5a5a", X: "#3fa9ff", Y: "#ffd23f" };

// Mini-arena in basso
const ARENA = { x: 40, y: 670, l: LARGHEZZA - 80, a: 340 };
const pedine = [
  { x: ARENA.x + 300, y: ARENA.y + ARENA.a / 2, mira: 0 },
  { x: ARENA.x + ARENA.l - 300, y: ARENA.y + ARENA.a / 2, mira: Math.PI },
];
const RAGGIO_PEDINA = 28;
const VELOCITA_PEDINA = 600; // pixel al secondo

let ultimoTempo = performance.now();

// Esperimento: quale tasto del controller usare per lo schermo intero?
// Si provano View e "levette premute insieme" (L3+R3).
let esitoSchermoIntero = "prova View oppure L3+R3";
function provaSchermoIntero(tasto) {
  const el = document.documentElement;
  if (document.fullscreenElement) {
    document.exitFullscreen?.().then(() => { esitoSchermoIntero = tasto + ": uscito"; })
      .catch(() => { esitoSchermoIntero = tasto + ": uscita rifiutata"; });
    return;
  }
  if (!el.requestFullscreen) { esitoSchermoIntero = "non disponibile"; return; }
  el.requestFullscreen().then(() => { esitoSchermoIntero = tasto + ": RIUSCITO"; })
    .catch(() => { esitoSchermoIntero = tasto + ": rifiutato"; });
}

// Conta quante volte la pagina perde il "fuoco" (problema noto del tasto View su Xbox)
let fuocoPerso = 0;
window.addEventListener("blur", () => { fuocoPerso++; });

function ciclo(adesso) {
  const dt = Math.min(0.05, (adesso - ultimoTempo) / 1000);
  ultimoTempo = adesso;

  const giocatori = leggiController();

  // Movimento delle pedine e vibrazione con X
  giocatori.forEach((g, i) => {
    if (!g.collegato) return;
    const p = pedine[i];
    p.x += g.sinistra.x * VELOCITA_PEDINA * dt;
    p.y += g.sinistra.y * VELOCITA_PEDINA * dt;
    p.x = Math.max(ARENA.x + RAGGIO_PEDINA, Math.min(ARENA.x + ARENA.l - RAGGIO_PEDINA, p.x));
    p.y = Math.max(ARENA.y + RAGGIO_PEDINA, Math.min(ARENA.y + ARENA.a - RAGGIO_PEDINA, p.y));
    if (g.destra.intensita > 0) p.mira = Math.atan2(g.destra.y, g.destra.x);
    if (g.tasti.X.appenaPremuto) vibra(i, 250, 1, 1);
    // Prove per lo schermo intero: tasto View, oppure le due levette premute insieme (L3+R3)
    if (g.tasti.VIEW.appenaPremuto) provaSchermoIntero("View");
    const levetteInsieme = (g.tasti.L3.appenaPremuto && g.tasti.R3.premuto) ||
                           (g.tasti.R3.appenaPremuto && g.tasti.L3.premuto);
    if (levetteInsieme) provaSchermoIntero("L3+R3");
  });

  disegna(giocatori);
  requestAnimationFrame(ciclo);
}

// ---------- Disegno ----------

function testo(t, x, y, dimensione = 28, colore = "#f2f4f8", allinea = "left") {
  ctx.font = `${dimensione}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = colore;
  ctx.textAlign = allinea;
  ctx.textBaseline = "middle";
  ctx.fillText(t, x, y);
}

function rettangoloArrotondato(x, y, l, a, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, l, a, r);
}

function disegna(giocatori) {
  schermo.inizioFotogramma();

  testo("TEST CONTROLLER", 40, 45, 44, "#ffffff");
  testo("versione " + VERSIONE + "  ·  canvas " + schermo.risoluzioneReale(), 480, 48, 24, "#8a93a6");

  disegnaPannello(giocatori[0], 0, 40, 95);
  disegnaPannello(giocatori[1], 1, 980, 95);
  disegnaArena(giocatori);

  // Riga diagnostica in fondo
  const tastiera = registro.tastiera.length ? registro.tastiera.join(", ") : "nessuno";
  testo("Tasti \"tastiera\" ricevuti da Edge: " + tastiera, 40, 1045, 24, "#8a93a6");
  testo("Schermo intero → " + esitoSchermoIntero + "  ·  fuoco perso: " + fuocoPerso,
        LARGHEZZA / 2 + 100, 1045, 24,
        esitoSchermoIntero.includes("RIUSCITO") ? "#5bd45b" : "#8a93a6", "center");
  testo("\"Indietro\" bloccati: " + registro.indietroBloccati, LARGHEZZA - 40, 1045, 24,
        registro.indietroBloccati ? "#ffd23f" : "#8a93a6", "right");
}

function disegnaPannello(g, i, px, py) {
  const L = 900, A = 555;
  const colore = COLORI[i];

  rettangoloArrotondato(px, py, L, A, 18);
  ctx.fillStyle = "#181d28";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = g.collegato ? colore : "#2e3546";
  ctx.stroke();

  testo("GIOCATORE " + (i + 1), px + 30, py + 38, 36, colore);

  if (!g.collegato) {
    testo("Nessun controller", px + L / 2, py + 170, 40, "#8a93a6", "center");
    testo("Premi un tasto qualsiasi sul controller.", px + L / 2, py + 240, 30, "#c9cfdb", "center");
    testo("Se vedi il cursore di Edge: esci dallo schermo intero", px + L / 2, py + 320, 30, "#ffd23f", "center");
    testo("e clicca l'icona del controller in fondo", px + L / 2, py + 365, 30, "#ffd23f", "center");
    testo("alla barra degli indirizzi (\"controlli di gioco\")", px + L / 2, py + 410, 30, "#ffd23f", "center");
    return;
  }

  testo("collegato", px + L - 30, py + 38, 28, "#5bd45b", "right");
  const id = g.id.length > 70 ? g.id.slice(0, 70) + "…" : g.id;
  testo(id, px + 30, py + 78, 20, "#8a93a6");
  testo(`indice ${g.indice} · mappatura ${g.mappatura} · ${g.numeroTasti} tasti · ${g.numeroAssi} assi · vibrazione ${g.vibrazione ? "sì (premi X)" : "no"}`,
        px + 30, py + 104, 20, "#8a93a6");

  const t = g.tasti;

  // Grilletti (barre che si riempiono)
  disegnaGrilletto("LT", t.LT, px + 60, py + 130, colore);
  disegnaGrilletto("RT", t.RT, px + L - 260, py + 130, colore);

  // Dorsali
  disegnaTastoRettangolare("LB", t.LB.premuto, px + 60, py + 180, 200, 44, colore);
  disegnaTastoRettangolare("RB", t.RB.premuto, px + L - 260, py + 180, 200, 44, colore);

  // View, Xbox, Menu (non usati nel gioco)
  disegnaTastoTondo("View", t.VIEW.premuto, px + 370, py + 285, 30, "#6b7488", 16);
  disegnaTastoTondo("Menu", t.MENU.premuto, px + 530, py + 285, 30, "#6b7488", 16);
  disegnaTastoTondo("Xbox", t.XBOX.premuto, px + 450, py + 225, 30, "#6b7488", 16);
  testo("View e Menu: non usati nel gioco", px + 450, py + 330, 20, "#6b7488", "center");

  // Levetta sinistra (in alto a sinistra) e destra (in basso a destra)
  disegnaLevetta("sinistra", g.grezzo.sinistra, g.sinistra, t.L3.premuto, px + 170, py + 330, colore);
  disegnaLevetta("destra", g.grezzo.destra, g.destra, t.R3.premuto, px + 590, py + 450, colore);

  // Valori numerici delle levette
  testo("L muovi", px + 170, py + 440, 22, "#c9cfdb", "center");
  testo(`X ${g.grezzo.sinistra.x.toFixed(2)}  Y ${g.grezzo.sinistra.y.toFixed(2)}`, px + 170, py + 468, 22, "#c9cfdb", "center");
  testo("R mira", px + 780, py + 435, 22, "#c9cfdb", "center");
  testo(`X ${g.grezzo.destra.x.toFixed(2)}  Y ${g.grezzo.destra.y.toFixed(2)}`, px + 780, py + 463, 22, "#c9cfdb", "center");

  // A B X Y
  const cx = px + 730, cy = py + 330, d = 58;
  disegnaTastoTondo("Y", t.Y.premuto, cx, cy - d, 28, COLORI_ABXY.Y);
  disegnaTastoTondo("A", t.A.premuto, cx, cy + d, 28, COLORI_ABXY.A);
  disegnaTastoTondo("X", t.X.premuto, cx - d, cy, 28, COLORI_ABXY.X);
  disegnaTastoTondo("B", t.B.premuto, cx + d, cy, 28, COLORI_ABXY.B);

  // Croce direzionale
  const dx = px + 330, dy = py + 460, s = 44;
  disegnaTastoRettangolare("▲", t.SU.premuto, dx - s / 2, dy - s * 1.5, s, s, colore);
  disegnaTastoRettangolare("▼", t.GIU.premuto, dx - s / 2, dy + s * 0.5, s, s, colore);
  disegnaTastoRettangolare("◀", t.SINISTRA.premuto, dx - s * 1.5, dy - s / 2, s, s, colore);
  disegnaTastoRettangolare("▶", t.DESTRA.premuto, dx + s * 0.5, dy - s / 2, s, s, colore);
}

function disegnaGrilletto(nome, tasto, x, y, colore) {
  const l = 200, a = 34;
  rettangoloArrotondato(x, y, l, a, 8);
  ctx.fillStyle = "#0e1118";
  ctx.fill();
  if (tasto.valore > 0) {
    rettangoloArrotondato(x, y, Math.max(10, l * tasto.valore), a, 8);
    ctx.fillStyle = tasto.premuto ? colore : colore + "66";
    ctx.fill();
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#4a5670";
  rettangoloArrotondato(x, y, l, a, 8);
  ctx.stroke();
  testo(`${nome} ${Math.round(tasto.valore * 100)}%`, x + l / 2, y + a / 2 + 1, 22, "#ffffff", "center");
}

function disegnaTastoRettangolare(etichetta, premuto, x, y, l, a, colore) {
  rettangoloArrotondato(x, y, l, a, 8);
  ctx.fillStyle = premuto ? colore : "#0e1118";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#4a5670";
  ctx.stroke();
  testo(etichetta, x + l / 2, y + a / 2 + 1, 22, premuto ? "#000000" : "#c9cfdb", "center");
}

function disegnaTastoTondo(etichetta, premuto, x, y, r, colore, dimTesto = 26) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = premuto ? colore : "#0e1118";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = colore;
  ctx.stroke();
  testo(etichetta, x, y + 1, dimTesto, premuto ? "#000000" : colore, "center");
}

function disegnaLevetta(nome, grezzo, filtrato, premuta, x, y, colore) {
  const R = 80;
  // Fondo (si riempie se la levetta è premuta: L3 / R3)
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = premuta ? colore + "55" : "#0e1118";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#4a5670";
  ctx.stroke();

  // Zona morta (cerchio tratteggiato)
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.arc(x, y, R * ZONA_MORTA, 0, Math.PI * 2);
  ctx.strokeStyle = "#6b7488";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Posizione grezza (puntino grigio) e posizione usata dal gioco (pallino colorato)
  ctx.beginPath();
  ctx.arc(x + grezzo.x * R, y + grezzo.y * R, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#8a93a6";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + filtrato.x * R, y + filtrato.y * R, 16, 0, Math.PI * 2);
  ctx.fillStyle = colore;
  ctx.fill();

  if (premuta) testo(nome === "sinistra" ? "L3" : "R3", x, y + R - 22, 20, "#ffffff", "center");
}

function disegnaArena(giocatori) {
  rettangoloArrotondato(ARENA.x, ARENA.y, ARENA.l, ARENA.a, 18);
  ctx.fillStyle = "#141924";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#2e3546";
  ctx.stroke();
  testo("Prova: levetta sinistra per muovere, levetta destra per mirare", ARENA.x + ARENA.l / 2, ARENA.y + 28, 26, "#6b7488", "center");

  pedine.forEach((p, i) => {
    const attiva = giocatori[i].collegato;
    const colore = attiva ? COLORI[i] : "#2e3546";
    // Linea di mira
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.mira) * 90, p.y + Math.sin(p.mira) * 90);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = colore;
    ctx.stroke();
    // Corpo
    ctx.beginPath();
    ctx.arc(p.x, p.y, RAGGIO_PEDINA, 0, Math.PI * 2);
    ctx.fillStyle = colore;
    ctx.fill();
    testo(String(i + 1), p.x, p.y + 1, 28, "#000000", "center");
  });
}

requestAnimationFrame(ciclo);
