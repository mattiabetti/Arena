// Pagina della partita.
// Due giocatori si muovono (levetta sinistra), mirano (levetta destra) e usano le abilità
// della loro scheda (per ora il colpo su RT). Chi porta a zero la vita dell'altro vince il round.

import { creaSchermo, collegaPulsanteSchermoIntero, controllaSchermoIntero } from "./core/schermo.js?v=0.5.0";
import { leggiController, vibra } from "./core/input.js?v=0.5.0";
import { proteggiNavigazione } from "./core/navigazione.js?v=0.5.0";
import { VERSIONE } from "./core/versione.js?v=0.5.0";
import { PERSONAGGI } from "./personaggi/indice.js?v=0.5.0";
import { ARENE, controllaSimmetria } from "./arene/indice.js?v=0.5.0";
import { TEMI } from "./temi/indice.js?v=0.5.0";
import { TIPI_ABILITA } from "./abilita/indice.js?v=0.5.0";

// ---------- Impostazioni facili da cambiare ----------

// Se la levetta destra è ferma, il personaggio guarda dove cammina.
// (Mettere false se si preferisce che resti girato verso l'ultima mira.)
const MIRA_SEGUE_MOVIMENTO = true;

// Lunghezza della linea di mira davanti al personaggio (pixel).
const LUNGHEZZA_MIRINO = 260;

// Secondi di pausa dopo un K.O., prima del round successivo.
const PAUSA_DOPO_KO = 3;

// Round da vincere per vincere la partita (2 = "al meglio di 3").
const ROUND_PER_VINCERE = 2;

// Secondi della scritta "ROUND N" a inizio round (intanto i giocatori sono fermi).
const DURATA_INIZIO_ROUND = 1.5;

// A fine partita, dopo quanti secondi si può premere A per giocare ancora
// (così non si riparte per sbaglio mentre si stava sparando).
const ATTESA_RIGIOCA = 1.5;

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

// Arena in uso: si cambia a ogni nuova partita (vedi impostaArena più sotto).
let indiceArena = 0;
let arena = ARENE[indiceArena];
let problemiSimmetria = [];

function creaCombattente(numero) {
  const scheda = PERSONAGGI[numero % PERSONAGGI.length];
  const partenza = arena.partenze[numero];
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

// Stato della partita. Le fasi sono:
//   "inizio" = scritta "ROUND N", giocatori fermi
//   "gioco"  = si combatte
//   "ko"     = pausa dopo un K.O., prima del round successivo
//   "fine"   = qualcuno ha vinto la partita: si aspetta A per rigiocare
const partita = {
  fase: "inizio",
  timer: DURATA_INIZIO_ROUND,
  round: 1,
  vittorie: [0, 0],  // round vinti da Giocatore 1 e Giocatore 2
  vincitore: null,   // chi ha vinto l'ultimo round (o la partita)
  via: 0,            // secondi della scritta "VIA!" a inizio combattimento
};

// "Mondo": tutto ciò che le abilità possono vedere e toccare.
const mondo = {
  arena,
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
  partita.vincitore = vincitore;
  partita.vittorie[vincitore.numero]++;
  mondo.proiettili = [];
  mondo.effetto(sconfitto.x, sconfitto.y, "#ffffff", 4);
  vibra(sconfitto.numero, 500, 1, 1);

  if (partita.vittorie[vincitore.numero] >= ROUND_PER_VINCERE) {
    // Partita finita
    partita.fase = "fine";
    partita.timer = ATTESA_RIGIOCA;
  } else {
    partita.fase = "ko";
    partita.timer = PAUSA_DOPO_KO;
  }
}

function nuovoRound() {
  for (const c of combattenti) rimettiInPartenza(c);
  mondo.proiettili = [];
  mondo.effetti = [];
  partita.fase = "inizio";
  partita.timer = DURATA_INIZIO_ROUND;
  partita.vincitore = null;
}

function nuovaPartita() {
  impostaArena((indiceArena + 1) % ARENE.length); // a ogni partita un'arena diversa
  partita.round = 1;
  partita.vittorie = [0, 0];
  nuovoRound();
}

// Sceglie l'arena e prepara il suo sfondo (disegnato una volta sola).
function impostaArena(indice) {
  indiceArena = indice;
  arena = ARENE[indice];
  mondo.arena = arena;
  problemiSimmetria = controllaSimmetria(arena);
  schermo.preparaSfondo(disegnaSfondoArena);
}

function disegnaSfondoArena(c2) {
  // La grafica dell'arena la fa il suo tema (js/temi/)
  const tema = TEMI[arena.tema] || TEMI.pietra;
  tema.disegna(c2, arena);

  // Punti di partenza, nel colore del giocatore
  arena.partenze.forEach((p, i) => {
    c2.strokeStyle = SQUADRE[i].colore;
    c2.globalAlpha = 0.45;
    c2.lineWidth = 5;
    c2.beginPath();
    c2.arc(p.x, p.y, 60, 0, Math.PI * 2);
    c2.stroke();
  });
  c2.globalAlpha = 1;

  // Fascia scura in alto per nomi e barre della vita, così si leggono su ogni tema
  c2.globalAlpha = 0.85;
  c2.fillStyle = "#07090d";
  c2.fillRect(0, 0, 1920, 114);
  c2.globalAlpha = 1;
}

impostaArena(0);

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
  partita.timer -= dt;
  partita.via = Math.max(0, partita.via - dt);

  if (partita.fase === "inizio" && partita.timer <= 0) {
    // Fine della scritta "ROUND N": si combatte!
    partita.fase = "gioco";
    partita.via = 0.8;
  } else if (partita.fase === "ko" && partita.timer <= 0) {
    partita.round++;
    nuovoRound();
  } else if (partita.fase === "fine" && partita.timer <= 0) {
    // Basta che uno dei due giocatori prema A
    if (giocatori.some((g) => g.collegato && g.tasti.A.appenaPremuto)) nuovaPartita();
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
      for (const p of arena.pilastri) fuoriDalPilastro(c, p);
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
  const k = arena.campo, r = c.scheda.raggio;
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
  schermo.disegnaSfondo(); // arena già pronta (vedi impostaArena)

  // Prima chi sta più in alto, così chi è più in basso viene disegnato "davanti".
  for (const c of combattenti) disegnaMira(c);
  const inOrdine = [...combattenti].sort((a, b) => a.y - b.y);
  for (const c of inOrdine) disegnaCombattente(c);

  for (const tipo of Object.values(TIPI_ABILITA)) tipo.disegna?.(ctx, mondo);
  disegnaEffetti();

  disegnaIntestazione();
  if (partita.fase === "inizio") disegnaScrittaRound();
  if (partita.fase === "gioco" && partita.via > 0) disegnaVia();
  if (partita.fase === "ko") disegnaKo();
  if (partita.fase === "fine") disegnaFinePartita();
  if (problemiSimmetria.length > 0) disegnaAvvisoSimmetria();
}

// Avviso per chi crea le arene: questa arena non è simmetrica
function disegnaAvvisoSimmetria() {
  fasciaScura(130, 50 + problemiSimmetria.length * 36);
  testo("ATTENZIONE: arena \"" + arena.nome + "\" non simmetrica", 960, 158, 32, "#ff5a5a", "center", true);
  problemiSimmetria.forEach((p, i) => testo(p, 960, 196 + i * 36, 28, "#ffb0b0", "center"));
}

// Fascia scura orizzontale dietro le scritte grandi
function fasciaScura(y, altezza) {
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, y, 1920, altezza);
  ctx.globalAlpha = 1;
}

function disegnaScrittaRound() {
  fasciaScura(460, 220);
  const ultimo = partita.vittorie.every((v) => v === ROUND_PER_VINCERE - 1);
  if (partita.round === 1) {
    // Primo round: si mostra anche il nome dell'arena
    testo("ROUND 1", 960, 545, 110, "#ffffff", "center", true);
    testo(arena.nome, 960, 635, 44, "#c4cbd8", "center");
  } else {
    testo(ultimo ? "ROUND DECISIVO" : "ROUND " + partita.round, 960, 570, 110, "#ffffff", "center", true);
  }
}

function disegnaVia() {
  // "VIA!" che svanisce
  ctx.globalAlpha = Math.min(1, partita.via / 0.4);
  testo("VIA!", 960, 570, 130, "#ffd23f", "center", true);
  ctx.globalAlpha = 1;
}

function disegnaFinePartita() {
  const v = partita.vincitore.squadra;
  fasciaScura(330, 470);
  testo(v.nome, 960, 420, 120, v.colore, "center", true);
  testo("VINCE LA PARTITA!", 960, 530, 72, "#ffffff", "center", true);
  testo(partita.vittorie[0] + "  –  " + partita.vittorie[1], 960, 625, 64, "#c4cbd8", "center", true);
  if (partita.timer <= 0) {
    testo("Premi A per giocare ancora", 960, 730, 44, "#5bd45b", "center", true);
  }
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
  fasciaScura(440, 260);
  testo(v.nome + " VINCE IL ROUND!", 960, 540, 84, v.colore, "center", true);
  testo("Prossimo round tra " + Math.max(1, Math.ceil(partita.timer)) + "…", 960, 636, 40, "#f2f4f8", "center");
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
  const k = arena.campo;
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
  const siglaSotto = c.y - arena.campo.y < 90;
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
  testo("ROUND " + partita.round, 960, 40, 44, "#ffffff", "center", true);

  // Round vinti: due pallini per giocatore, accanto alle barre della vita (pieni = vinti)
  for (const c of combattenti) {
    for (let n = 0; n < ROUND_PER_VINCERE; n++) {
      const x = c.numero === 0 ? 722 + n * 36 : 1198 - n * 36;
      ctx.beginPath();
      ctx.arc(x, 88, 13, 0, Math.PI * 2);
      if (n < partita.vittorie[c.numero]) {
        ctx.fillStyle = c.squadra.colore;
        ctx.fill();
      }
      ctx.lineWidth = 4;
      ctx.strokeStyle = c.squadra.colore;
      ctx.stroke();
    }
  }
  testo("v " + VERSIONE.split(" ")[0] + "  ·  " + fps.valore + " fps", 960, 90, 26, "#8a93a6", "center");
}

requestAnimationFrame(ciclo);
