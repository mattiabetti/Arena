// Pagina della partita.
// Due giocatori si muovono (levetta sinistra), mirano (levetta destra) e usano le abilità
// della loro scheda (per ora il colpo su RT). Chi porta a zero la vita dell'altro vince il round.

import { creaSchermo, collegaPulsanteSchermoIntero, controllaSchermoIntero } from "./core/schermo.js?v=0.3.0";
import { leggiController, vibra } from "./core/input.js?v=0.3.0";
import { proteggiNavigazione } from "./core/navigazione.js?v=0.3.0";
import { VERSIONE } from "./core/versione.js?v=0.3.0";
import { PERSONAGGI } from "./personaggi/indice.js?v=0.3.0";
import ARENA from "./arene/prima-arena.js?v=0.3.0";
import { TIPI_ABILITA } from "./abilita/indice.js?v=0.3.0";

// ---------- Impostazioni facili da cambiare ----------

// Se la levetta destra è ferma, il personaggio guarda dove cammina.
// (Mettere false se si preferisce che resti girato verso l'ultima mira.)
const MIRA_SEGUE_MOVIMENTO = true;

// Lunghezza della linea di mira davanti al personaggio (pixel).
const LUNGHEZZA_MIRINO = 260;

// Secondi di pausa dopo un K.O., prima di ricominciare.
const PAUSA_DOPO_KO = 3;

// Colori dei due giocatori: Giocatore 1 blu, Giocatore 2 rosso.
const SQUADRE = [
  { nome: "GIOCATORE 1", sigla: "G1", colore: "#3fa9ff", scuro: "#1b4f80" },
  { nome: "GIOCATORE 2", sigla: "G2", colore: "#ff5a5a", scuro: "#80262a" },
];

// ---------- Preparazione ----------

const schermo = creaSchermo(document.getElementById("schermo"));
const ctx = schermo.ctx;
collegaPulsanteSchermoIntero(document.getElementById("schermo-intero"));
proteggiNavigazione();

// I pulsanti e l'avviso in basso servono solo fuori dallo schermo intero.
const barra = document.getElementById("barra");
document.addEventListener("fullscreenchange", () => {
  barra.style.display = document.fullscreenElement ? "none" : "";
});

const GRADI = Math.PI / 180;

function creaCombattente(numero) {
  const scheda = PERSONAGGI[numero % PERSONAGGI.length];
  const partenza = ARENA.partenze[numero];
  return {
    numero,
    scheda,
    squadra: SQUADRE[numero],
    x: partenza.x,
    y: partenza.y,
    mira: partenza.mira * GRADI, // direzione in cui guarda (in radianti)
    vita: scheda.vita,
    vitaMostrata: scheda.vita, // la barra scende piano fino alla vita vera
    ricariche: {},     // secondi che mancano prima di poter riusare ogni abilità
    lampo: 0,          // secondi di "lampo bianco" dopo essere stato colpito
    presente: false,   // c'è un controller collegato per questo giocatore?
    mirando: false,    // la levetta destra è mossa?
  };
}

// Rimette un giocatore al punto di partenza, con la vita piena (il controller resta collegato).
function rimettiInPartenza(c) {
  const nuovo = creaCombattente(c.numero);
  nuovo.presente = c.presente;
  Object.assign(c, nuovo);
}

const combattenti = [creaCombattente(0), creaCombattente(1)];

// Stato della partita: "gioco" mentre si combatte, "ko" durante la pausa dopo un K.O.
const partita = { fase: "gioco", timer: 0, vincitore: null };

// "Mondo": tutto ciò che le abilità possono vedere e toccare.
const mondo = {
  arena: ARENA,
  combattenti,
  proiettili: [],
  effetti: [],      // piccoli cerchi che si allargano (impatti)
  effetto(x, y, colore, forza = 1) {
    mondo.effetti.push({ x, y, colore, forza, t: 0, durata: 0.3 });
  },
  colpisci(bersaglio, danno, colpo) {
    if (partita.fase !== "gioco") return;
    bersaglio.vita = Math.max(0, bersaglio.vita - danno);
    bersaglio.lampo = 0.15;
    mondo.effetto(colpo.x, colpo.y, colpo.colore, 1.8);
    vibra(bersaglio.numero, 140, 0.6, 0.9);
    if (bersaglio.vita === 0) koDi(bersaglio, colpo.tiratore);
  },
};

function koDi(sconfitto, vincitore) {
  partita.fase = "ko";
  partita.timer = PAUSA_DOPO_KO;
  partita.vincitore = vincitore;
  mondo.proiettili = [];
  mondo.effetto(sconfitto.x, sconfitto.y, "#ffffff", 4);
  vibra(sconfitto.numero, 500, 1, 1);
}

function nuovoRound() {
  for (const c of combattenti) rimettiInPartenza(c);
  mondo.proiettili = [];
  mondo.effetti = [];
  partita.fase = "gioco";
  partita.vincitore = null;
}

// ---------- Ciclo del gioco (una volta per fotogramma) ----------

let ultimoTempo = performance.now();
const fps = { conteggio: 0, tempo: 0, valore: 0 };

function ciclo(adesso) {
  // dt = secondi passati dal fotogramma precedente (massimo 0,05 per evitare salti)
  const dt = Math.min(0.05, (adesso - ultimoTempo) / 1000);
  ultimoTempo = adesso;

  fps.conteggio++;
  fps.tempo += dt;
  if (fps.tempo >= 0.5) { fps.valore = Math.round(fps.conteggio / fps.tempo); fps.conteggio = 0; fps.tempo = 0; }

  const giocatori = leggiController();
  controllaSchermoIntero(giocatori); // L3+R3

  aggiorna(giocatori, dt);
  disegna();
  requestAnimationFrame(ciclo);
}

function aggiorna(giocatori, dt) {
  // Pausa dopo un K.O.: si aspetta e poi si ricomincia
  if (partita.fase === "ko") {
    partita.timer -= dt;
    if (partita.timer <= 0) nuovoRound();
  }

  giocatori.forEach((g, i) => {
    const c = combattenti[i];
    c.presente = g.collegato;
    c.mirando = false;
    c.lampo = Math.max(0, c.lampo - dt);
    // La barra della vita "rincorre" la vita vera (si vede quanto si è appena perso)
    if (c.vitaMostrata > c.vita) c.vitaMostrata = Math.max(c.vita, c.vitaMostrata - 25 * dt);
    if (!g.collegato || partita.fase !== "gioco") return;

    // Movimento: la levetta sinistra dà direzione e velocità
    c.x += g.sinistra.x * c.scheda.velocita * dt;
    c.y += g.sinistra.y * c.scheda.velocita * dt;

    // Mira
    if (g.destra.intensita > 0) {
      c.mira = Math.atan2(g.destra.y, g.destra.x);
      c.mirando = true;
    } else if (MIRA_SEGUE_MOVIMENTO && g.sinistra.intensita > 0) {
      c.mira = Math.atan2(g.sinistra.y, g.sinistra.x);
    }

    // Abilità: per ogni tasto della scheda, se è premuto e la ricarica è finita, si usa.
    // (Tenendo premuto, l'abilità riparte appena è di nuovo pronta.)
    for (const [tasto, dati] of Object.entries(c.scheda.abilita)) {
      c.ricariche[tasto] = Math.max(0, (c.ricariche[tasto] || 0) - dt);
      const tipo = TIPI_ABILITA[dati.tipo];
      if (!tipo || !g.tasti[tasto]) continue;
      if (g.tasti[tasto].premuto && c.ricariche[tasto] === 0) {
        tipo.usa(c, dati, mondo);
        c.ricariche[tasto] = dati.ricarica;
      }
    }
  });

  risolviUrti();

  // Ogni tipo di abilità aggiorna le sue cose (es. i colpi in volo)
  for (const tipo of Object.values(TIPI_ABILITA)) tipo.aggiorna?.(mondo, dt);

  // Effetti di impatto
  for (const e of mondo.effetti) e.t += dt;
  mondo.effetti = mondo.effetti.filter((e) => e.t < e.durata);
}

// ---------- Urti ----------

function risolviUrti() {
  // Ripetiamo qualche volta: spingere via da un pilastro può far finire contro l'avversario.
  for (let giro = 0; giro < 3; giro++) {
    const [a, b] = combattenti;
    if (a.presente && b.presente) separaGiocatori(a, b);
    for (const c of combattenti) {
      if (!c.presente) continue;
      for (const p of ARENA.pilastri) fuoriDalPilastro(c, p);
      dentroAlCampo(c);
    }
  }
}

// I due giocatori non si sovrappongono: ognuno viene spinto indietro di metà.
function separaGiocatori(a, b) {
  let dx = b.x - a.x, dy = b.y - a.y;
  let distanza = Math.hypot(dx, dy);
  const minima = a.scheda.raggio + b.scheda.raggio;
  if (distanza >= minima) return;
  if (distanza === 0) { dx = 1; dy = 0; distanza = 1; }
  const spinta = (minima - distanza) / 2;
  const nx = dx / distanza, ny = dy / distanza;
  a.x -= nx * spinta; a.y -= ny * spinta;
  b.x += nx * spinta; b.y += ny * spinta;
}

function fuoriDalPilastro(c, p) {
  let dx = c.x - p.x, dy = c.y - p.y;
  let distanza = Math.hypot(dx, dy);
  const minima = c.scheda.raggio + p.raggio;
  if (distanza >= minima) return;
  if (distanza === 0) { dx = 0; dy = 1; distanza = 1; }
  c.x = p.x + (dx / distanza) * minima;
  c.y = p.y + (dy / distanza) * minima;
}

function dentroAlCampo(c) {
  const k = ARENA.campo, r = c.scheda.raggio;
  c.x = Math.max(k.x + r, Math.min(k.x + k.larghezza - r, c.x));
  c.y = Math.max(k.y + r, Math.min(k.y + k.altezza - r, c.y));

  // Negli angoli arrotondati: il personaggio deve restare dentro la curva.
  const a = k.angoli;
  if (a <= r) return; // angoli più piccoli del personaggio: basta il rettangolo
  const cx = c.x < k.x + a ? k.x + a : (c.x > k.x + k.larghezza - a ? k.x + k.larghezza - a : null);
  const cy = c.y < k.y + a ? k.y + a : (c.y > k.y + k.altezza - a ? k.y + k.altezza - a : null);
  if (cx === null || cy === null) return;
  const dx = c.x - cx, dy = c.y - cy;
  const distanza = Math.hypot(dx, dy), massima = a - r;
  if (distanza > massima) {
    c.x = cx + (dx / distanza) * massima;
    c.y = cy + (dy / distanza) * massima;
  }
}

// ---------- Disegno ----------

function testo(t, x, y, dimensione = 28, colore = "#f2f4f8", allinea = "left", grassetto = false) {
  ctx.font = `${grassetto ? "bold " : ""}${dimensione}px "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = colore;
  ctx.textAlign = allinea;
  ctx.textBaseline = "middle";
  ctx.fillText(t, x, y);
}

function cerchio(x, y, r, colore) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colore;
  ctx.fill();
}

function disegna() {
  schermo.inizioFotogramma(ARENA.colori.sfondo);
  disegnaArena();

  // Prima chi sta più in alto, così chi è più in basso viene disegnato "davanti".
  for (const c of combattenti) disegnaMira(c);
  const inOrdine = [...combattenti].sort((a, b) => a.y - b.y);
  for (const c of inOrdine) disegnaCombattente(c);

  for (const tipo of Object.values(TIPI_ABILITA)) tipo.disegna?.(ctx, mondo);
  disegnaEffetti();

  disegnaIntestazione();
  if (partita.fase === "ko") disegnaKo();
}

// Impatti: un anello che si allarga e svanisce
function disegnaEffetti() {
  for (const e of mondo.effetti) {
    const avanzamento = e.t / e.durata; // da 0 a 1
    ctx.globalAlpha = 1 - avanzamento;
    ctx.strokeStyle = e.colore;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 10 + avanzamento * 26 * e.forza, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Scritta grande dopo il K.O.
function disegnaKo() {
  const v = partita.vincitore.squadra;
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 440, 1920, 260);
  ctx.globalAlpha = 1;
  testo(v.nome + " VINCE!", 960, 540, 96, v.colore, "center", true);
  testo("Nuovo round tra " + Math.max(1, Math.ceil(partita.timer)) + "…", 960, 636, 40, "#f2f4f8", "center");
}

function disegnaArena() {
  const k = ARENA.campo, col = ARENA.colori;

  // Pavimento
  ctx.beginPath();
  ctx.roundRect(k.x, k.y, k.larghezza, k.altezza, k.angoli);
  ctx.fillStyle = col.pavimento;
  ctx.fill();

  // Piastrelle: righe leggere ogni 115 pixel (dentro il pavimento)
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = col.piastrelle;
  ctx.lineWidth = 3;
  ctx.beginPath();
  const passo = 115;
  for (let x = k.x + passo; x < k.x + k.larghezza; x += passo) { ctx.moveTo(x, k.y); ctx.lineTo(x, k.y + k.altezza); }
  for (let y = k.y + passo; y < k.y + k.altezza; y += passo) { ctx.moveTo(k.x, y); ctx.lineTo(k.x + k.larghezza, y); }
  ctx.stroke();
  ctx.restore();

  // Cerchio e linea di metà campo
  const cx = k.x + k.larghezza / 2, cy = k.y + k.altezza / 2;
  ctx.strokeStyle = col.bordo;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.moveTo(cx, k.y);
  ctx.lineTo(cx, k.y + k.altezza);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Punti di partenza, nel colore del giocatore
  ARENA.partenze.forEach((p, i) => {
    ctx.strokeStyle = SQUADRE[i].colore;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Muro intorno (disegnato appena fuori dal pavimento)
  ctx.beginPath();
  ctx.roundRect(k.x - 6, k.y - 6, k.larghezza + 12, k.altezza + 12, k.angoli + 6);
  ctx.strokeStyle = col.bordo;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Pilastri: ombra, corpo e riflesso
  for (const p of ARENA.pilastri) {
    ctx.globalAlpha = 0.45;
    cerchio(p.x + 8, p.y + 12, p.raggio, "#000");
    ctx.globalAlpha = 1;
    cerchio(p.x, p.y, p.raggio, col.pilastro);
    cerchio(p.x - p.raggio * 0.12, p.y - p.raggio * 0.15, p.raggio * 0.72, col.pilastroLuce);
  }
}

// Linea di mira tratteggiata davanti al personaggio
// (più marcata quando si usa la levetta destra).
function disegnaMira(c) {
  if (!c.presente || c.vita <= 0) return;
  const r = c.scheda.raggio;
  const dx = Math.cos(c.mira), dy = Math.sin(c.mira);
  const fineX = c.x + dx * LUNGHEZZA_MIRINO, fineY = c.y + dy * LUNGHEZZA_MIRINO;
  ctx.save();
  // La linea non esce dall'arena
  const k = ARENA.campo;
  ctx.beginPath();
  ctx.roundRect(k.x, k.y, k.larghezza, k.altezza, k.angoli);
  ctx.clip();
  ctx.globalAlpha = c.mirando ? 0.9 : 0.35;
  ctx.strokeStyle = c.squadra.colore;
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(c.x + dx * (r + 14), c.y + dy * (r + 14));
  ctx.lineTo(fineX, fineY);
  ctx.stroke();
  ctx.setLineDash([]);
  // Mirino alla fine della linea
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(fineX, fineY, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function disegnaCombattente(c) {
  const r = c.scheda.raggio;
  const s = c.squadra;
  const fantasma = !c.presente; // senza controller: disegnato trasparente
  const sconfitto = c.vita <= 0;

  ctx.globalAlpha = fantasma ? 0.3 : (sconfitto ? 0.45 : 1);

  // Ombra
  ctx.globalAlpha *= 0.45;
  ctx.beginPath();
  ctx.ellipse(c.x + 4, c.y + r * 0.75, r * 0.95, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.globalAlpha = fantasma ? 0.3 : (sconfitto ? 0.45 : 1);

  const dx = Math.cos(c.mira), dy = Math.sin(c.mira);

  // Punta che indica dove guarda
  ctx.beginPath();
  ctx.moveTo(c.x + dx * (r + 18), c.y + dy * (r + 18));
  ctx.lineTo(c.x + Math.cos(c.mira + 0.55) * (r - 2), c.y + Math.sin(c.mira + 0.55) * (r - 2));
  ctx.lineTo(c.x + Math.cos(c.mira - 0.55) * (r - 2), c.y + Math.sin(c.mira - 0.55) * (r - 2));
  ctx.closePath();
  ctx.fillStyle = s.colore;
  ctx.fill();

  // Corpo: bordo scuro, interno colorato, simbolo del personaggio al centro
  const colorePieno = c.lampo > 0 ? "#ffffff" : (sconfitto ? "#6b7385" : s.colore);
  cerchio(c.x, c.y, r, sconfitto ? "#3a4052" : s.scuro);
  cerchio(c.x, c.y, r - 6, colorePieno);
  cerchio(c.x, c.y, r * 0.32, c.scheda.colore);

  // Sigla sopra la testa (sotto i piedi se il personaggio è vicino al bordo in alto,
  // altrimenti finirebbe sotto le barre della vita)
  const siglaSotto = c.y - ARENA.campo.y < 90;
  testo(s.sigla, c.x, siglaSotto ? c.y + r + 26 : c.y - r - 26, 30, s.colore, "center", true);

  ctx.globalAlpha = 1;

  // Se manca il controller, scritta sotto il personaggio
  if (fantasma) {
    testo("Premi un tasto", c.x, c.y + r + 40, 30, "#f2f4f8", "center");
    testo("sul controller " + (c.numero + 1), c.x, c.y + r + 76, 30, "#f2f4f8", "center");
  }
}

// Fascia in alto: nome, personaggio e vita dei due giocatori
function disegnaIntestazione() {
  for (const c of combattenti) {
    const s = c.squadra;
    const aSinistra = c.numero === 0;
    const allinea = aSinistra ? "left" : "right";
    const bordoX = aSinistra ? 50 : 1870;

    ctx.globalAlpha = c.presente ? 1 : 0.4;
    testo(s.nome, bordoX, 36, 34, s.colore, allinea, true);
    testo(c.scheda.nome, bordoX + (aSinistra ? 250 : -250), 37, 30, "#c4cbd8", allinea);

    // Barra della vita
    const larghezza = 640, altezza = 36, y = 70;
    const x = aSinistra ? 50 : 1870 - larghezza;
    const quota = Math.max(0, c.vita / c.scheda.vita);
    ctx.beginPath();
    ctx.roundRect(x, y, larghezza, altezza, 8);
    ctx.fillStyle = "#2a3242";
    ctx.fill();
    // Parte bianca: vita appena persa, che si svuota piano
    const quotaMostrata = Math.max(0, c.vitaMostrata / c.scheda.vita);
    for (const [q, colore] of [[quotaMostrata, "#ffffff"], [quota, s.colore]]) {
      if (q <= 0) continue;
      const piena = larghezza * q;
      ctx.beginPath();
      ctx.roundRect(aSinistra ? x : x + larghezza - piena, y, piena, altezza, 8);
      ctx.fillStyle = colore;
      ctx.fill();
    }
    // Numero con contorno scuro, così si legge anche sopra la parte bianca
    ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(10, 12, 18, 0.7)";
    ctx.strokeText(Math.ceil(c.vita) + " / " + c.scheda.vita, x + larghezza / 2, y + altezza / 2 + 1);
    testo(Math.ceil(c.vita) + " / " + c.scheda.vita, x + larghezza / 2, y + altezza / 2 + 1, 28, "#ffffff", "center", true);
    ctx.globalAlpha = 1;
  }

  // Al centro: titolo, versione e fotogrammi al secondo (per controllare la fluidità sulla Xbox)
  testo("ARENA", 960, 40, 44, "#ffffff", "center", true);
  testo("v " + VERSIONE.split(" ")[0] + "  ·  " + fps.valore + " fps", 960, 90, 26, "#8a93a6", "center");
}

requestAnimationFrame(ciclo);
