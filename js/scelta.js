// SCHERMATA DI SCELTA DEL PERSONAGGIO (dentro la pagina della partita, così lo schermo
// intero e i "controlli di gioco" restano attivi).
// Ogni giocatore sposta il suo riquadro con la levetta sinistra (o le frecce) e conferma con A;
// B annulla. Due giocatori NON possono scegliere lo stesso personaggio.
// Quando entrambi hanno confermato, dopo un attimo parte la partita.

import { PERSONAGGI } from "./personaggi/indice.js?v=0.7.1";
import { ASPETTI } from "./aspetti/indice.js?v=0.7.1";
import { vibra } from "./core/input.js?v=0.7.1";

// Ordine in cui sono elencate le abilità nelle schede
const ORDINE_TASTI = ["RT", "LT", "B", "RB", "LB", "A", "X", "Y"];

// Secondi tra "entrambi pronti" e l'inizio della partita
const ATTESA_PARTENZA = 1.2;

// Descrizioni di riserva, se un'abilità della scheda non ha la sua
const DESCRIZIONE_TIPO = {
  proiettile: "colpo a distanza",
  mischia: "colpo corpo a corpo",
  scatto: "scatto velocissimo",
};

// ctx, testo = strumenti di disegno di gioco.js; squadre = colori dei giocatori;
// alConfermare(schede) = cosa fare quando tutti e due hanno scelto.
export function creaScelta({ ctx, testo, squadre, alConfermare }) {
  const giocatori = [
    { indice: 0, confermato: false, levaPronta: true, avviso: 0 },
    { indice: Math.min(1, PERSONAGGI.length - 1), confermato: false, levaPronta: true, avviso: 0 },
  ];
  let partenza = 0; // conto alla rovescia quando entrambi sono pronti
  let presenti = [false, false];

  // Si può confermare un personaggio solo se l'altro giocatore non l'ha già confermato
  function preso(numero, indice) {
    const altro = giocatori[1 - numero];
    return altro.confermato && altro.indice === indice;
  }

  function aggiorna(controller, dt) {
    const primaPresenti = presenti;
    presenti = controller.map((g) => g.collegato);
    controller.forEach((g, numero) => {
      const s = giocatori[numero];
      s.avviso = Math.max(0, s.avviso - dt);
      if (!g.collegato) return;
      // Il tasto premuto per "svegliare" il controller non deve confermare per sbaglio
      if (!primaPresenti[numero]) return;

      if (!s.confermato) {
        // Spostamento: levetta sinistra (deve tornare al centro prima di spostarsi ancora)
        // oppure le frecce della croce direzionale
        let passo = 0;
        if (g.tasti.SINISTRA.appenaPremuto) passo = -1;
        if (g.tasti.DESTRA.appenaPremuto) passo = 1;
        if (Math.abs(g.sinistra.x) < 0.3) s.levaPronta = true;
        if (s.levaPronta && Math.abs(g.sinistra.x) > 0.6) {
          passo = Math.sign(g.sinistra.x);
          s.levaPronta = false;
        }
        if (passo !== 0) {
          s.indice = (s.indice + passo + PERSONAGGI.length) % PERSONAGGI.length;
          s.avviso = 0;
        }
        if (g.tasti.A.appenaPremuto) {
          if (preso(numero, s.indice)) {
            s.avviso = 1.5; // "Già scelto dall'altro giocatore"
            vibra(numero, 120, 0.4, 0.4);
          } else {
            s.confermato = true;
            s.avviso = 0;
            vibra(numero, 80, 0.3, 0.5);
          }
        }
      } else if (g.tasti.B.appenaPremuto && partenza === 0) {
        s.confermato = false; // ripensamento
      }
    });

    const tuttiPronti = giocatori.every((s, i) => s.confermato && presenti[i]);
    if (tuttiPronti) {
      partenza += dt;
      if (partenza >= ATTESA_PARTENZA) {
        partenza = 0;
        alConfermare(giocatori.map((s) => PERSONAGGI[s.indice]));
      }
    } else {
      partenza = 0;
    }
  }

  // Torna alla scelta: i riquadri restano sugli ultimi personaggi scelti, ma da confermare
  function ricomincia() {
    for (const s of giocatori) { s.confermato = false; s.avviso = 0; }
    partenza = 0;
  }

  function disegna(tempo) {
    // Titolo
    testo("SCEGLI IL PERSONAGGIO", 960, 90, 64, "#ffffff", "center", true);

    // Schede dei personaggi, in fila e centrate
    const n = PERSONAGGI.length;
    const spazio = 40;
    const larghezza = Math.min(560, (1800 - spazio * (n - 1)) / n);
    const altezza = 720;
    const xInizio = 960 - (n * larghezza + (n - 1) * spazio) / 2;
    const y = 165;
    PERSONAGGI.forEach((scheda, i) => {
      disegnaScheda(scheda, i, xInizio + i * (larghezza + spazio), y, larghezza, altezza, tempo);
    });

    // Stato dei due giocatori, sotto le schede
    giocatori.forEach((s, numero) => {
      const squadra = squadre[numero];
      const x = numero === 0 ? 60 : 1860;
      const allinea = numero === 0 ? "left" : "right";
      let frase;
      if (!presenti[numero]) frase = "premi un tasto sul controller " + (numero + 1);
      else if (s.avviso > 0) frase = "già scelto dall'altro giocatore!";
      else if (s.confermato) frase = "PRONTO!  (B per cambiare)";
      else frase = "scegli e premi A";
      testo(squadra.nome + ": " + frase, x, 955, 32, squadra.colore, allinea, true);
    });

    if (partenza > 0) {
      testo("Si combatte!", 960, 955, 44, "#ffd23f", "center", true);
    }

    // Istruzioni
    testo("Levetta sinistra o frecce: cambia personaggio   ·   A: conferma   ·   B: annulla",
          960, 1030, 30, "#8a93a6", "center");
  }

  function disegnaScheda(scheda, i, x, y, larghezza, altezza, tempo) {
    // Chi ha il riquadro su questa scheda? Chi l'ha confermata?
    const qui = giocatori.map((s, numero) => s.indice === i && presenti[numero]);
    const confermataDa = giocatori.findIndex((s, numero) => s.indice === i && s.confermato && presenti[numero]);

    // Fondo della scheda
    ctx.beginPath();
    ctx.roundRect(x, y, larghezza, altezza, 24);
    ctx.fillStyle = confermataDa >= 0 ? squadre[confermataDa].scuro : "#161b26";
    ctx.fill();

    // Bordi dei giocatori che la stanno guardando (G1 fuori, G2 dentro)
    qui.forEach((c, numero) => {
      if (!c) return;
      const rientro = numero === 0 ? -8 : 8;
      ctx.beginPath();
      ctx.roundRect(x + rientro, y + rientro, larghezza - rientro * 2, altezza - rientro * 2, 24);
      ctx.strokeStyle = squadre[numero].colore;
      ctx.lineWidth = 8;
      ctx.stroke();
    });
    // Etichette G1 (in alto a sinistra) / G2 (in alto a destra), sopra i bordi
    qui.forEach((c, numero) => {
      if (!c) return;
      const ex = numero === 0 ? x + 24 : x + larghezza - 24 - 80;
      ctx.beginPath();
      ctx.roundRect(ex, y - 26, 80, 48, 10);
      ctx.fillStyle = squadre[numero].colore;
      ctx.fill();
      testo(squadre[numero].sigla, ex + 40, y - 1, 32, "#ffffff", "center", true);
    });

    const cx = x + larghezza / 2;

    // Nome e descrizione
    testo(scheda.nome, cx, y + 70, 54, scheda.colore, "center", true);
    if (scheda.descrizione) testo(scheda.descrizione, cx, y + 120, 28, "#c4cbd8", "center");

    // Il personaggio, ingrandito e animato, su un piccolo "palco"
    const yFigura = y + 265;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(cx, yFigura + 20, 120, 95, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.globalAlpha = 1;
    const aspetto = ASPETTI[scheda.aspetto] || ASPETTI.base;
    const finto = {
      x: 0, y: 0,
      mira: -Math.PI / 2 + Math.sin(tempo * 1.4) * 0.35, // guarda in su, girandosi un po'
      scheda,
      squadra: squadre[confermataDa >= 0 ? confermataDa : 0],
      fendente: null,
    };
    // Ingrandito: lo stesso disegno del gioco, ma 2,7 volte più grande
    ctx.save();
    ctx.translate(cx, yFigura);
    ctx.scale(2.7, 2.7);
    aspetto.disegna(ctx, finto, { tempo });
    ctx.restore();

    // Abilità: tasto, nome e breve descrizione
    let yRiga = y + 420;
    for (const tasto of ORDINE_TASTI) {
      const a = scheda.abilita[tasto];
      if (!a) continue;
      ctx.beginPath();
      ctx.roundRect(x + 30, yRiga, 70, 40, 8);
      ctx.fillStyle = "#2a3242";
      ctx.fill();
      testo(tasto, x + 65, yRiga + 21, 26, "#ffffff", "center", true);
      testo(a.nome, x + 120, yRiga + 20, 30, "#ffffff", "left", true);
      testo(a.descrizione || DESCRIZIONE_TIPO[a.tipo] || "", x + 120, yRiga + 56, 28, "#aab3c4", "left");
      yRiga += 88;
    }

    // Scritta "SCELTO" quando un giocatore l'ha confermata
    if (confermataDa >= 0) {
      ctx.beginPath();
      ctx.roundRect(x + larghezza / 2 - 150, y + altezza - 24, 300, 52, 12);
      ctx.fillStyle = squadre[confermataDa].colore;
      ctx.fill();
      testo(squadre[confermataDa].sigla + "  SCELTO", cx, y + altezza + 2, 34, "#ffffff", "center", true);
    }
  }

  return { aggiorna, disegna, ricomincia };
}
