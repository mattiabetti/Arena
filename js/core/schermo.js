// Schermo: si disegna sempre in coordinate fisse 1920x1080.
// Questo file adatta il canvas alla finestra (TV) mantenendo il 16:9,
// con bande nere se la finestra ha proporzioni diverse.
//
// RISOLUZIONE: sulla Xbox Edge è un'"app", non un gioco, e ha solo una parte della scheda
// grafica e della memoria. Disegnare in 4K (8 milioni di punti a fotogramma) la sovraccaricava:
// comandi in ritardo di secondi e console rallentata (v0.7.0). Per questo il canvas non supera
// mai 1920x1080 (SCALA_MASSIMA = 1): è la TV a ingrandire l'immagine.

export const LARGHEZZA = 1920;
export const ALTEZZA = 1080;

// Quante volte la risoluzione logica può essere moltiplicata (1 = massimo 1920x1080).
const SCALA_MASSIMA = 1;

export function creaSchermo(canvas) {
  // alpha: false = il canvas non è trasparente, così il browser fa meno lavoro per mostrarlo
  const ctx = canvas.getContext("2d", { alpha: false });
  let scala = 1; // pixel reali per ogni pixel logico

  // Sfondo "fisso" (es. l'arena): disegnato una volta sola in un'immagine a parte
  // e poi solo ricopiato a ogni fotogramma. Così anche uno sfondo pieno di dettagli
  // (erba, fiori, alberi...) non rallenta il gioco.
  // L'immagine è UNA sola, creata una volta e sempre riusata (niente immagini nuove a ogni
  // partita o cambio di schermo intero, che riempivano la memoria).
  let sfondo = null; // funzione che disegna lo sfondo
  const immagineSfondo = document.createElement("canvas");
  let sfondoPronto = false;

  function rifaiSfondo() {
    if (!sfondo) return;
    if (immagineSfondo.width !== canvas.width || immagineSfondo.height !== canvas.height) {
      immagineSfondo.width = canvas.width;
      immagineSfondo.height = canvas.height;
    }
    const c2 = immagineSfondo.getContext("2d", { alpha: false });
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.clearRect(0, 0, immagineSfondo.width, immagineSfondo.height);
    c2.setTransform(scala, 0, 0, scala, 0, 0); // si disegna in coordinate 1920x1080
    sfondo(c2);
    sfondoPronto = true;
  }

  function adatta() {
    const finestraL = window.innerWidth;
    const finestraA = window.innerHeight;
    const scalaCss = Math.min(finestraL / LARGHEZZA, finestraA / ALTEZZA);
    const cssL = Math.floor(LARGHEZZA * scalaCss);
    const cssA = Math.floor(ALTEZZA * scalaCss);
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = cssL + "px";
    canvas.style.height = cssA + "px";
    const larghezza = Math.min(Math.round(cssL * dpr), LARGHEZZA * SCALA_MASSIMA);
    const altezza = Math.round(larghezza * ALTEZZA / LARGHEZZA);
    if (canvas.width === larghezza && canvas.height === altezza) return; // niente da rifare
    canvas.width = larghezza;
    canvas.height = altezza;
    scala = canvas.width / LARGHEZZA;
    rifaiSfondo(); // la grandezza è cambiata: lo sfondo va ridisegnato
  }

  // Quando la finestra cambia (es. schermo intero) arrivano tanti avvisi di fila:
  // si aspetta che smettano e si adatta una volta sola.
  let attesa = null;
  const adattaTraPoco = () => {
    clearTimeout(attesa);
    attesa = setTimeout(adatta, 150);
  };
  window.addEventListener("resize", adattaTraPoco);
  document.addEventListener("fullscreenchange", adattaTraPoco);
  adatta();

  return {
    ctx,
    // Da chiamare all'inizio di ogni fotogramma: pulisce e imposta le coordinate 1920x1080.
    inizioFotogramma(colore = "#10131a") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = colore;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scala, 0, 0, scala, 0, 0);
    },
    // Prepara lo sfondo fisso: "funzioneDisegno(ctx)" disegna in coordinate 1920x1080.
    preparaSfondo(funzioneDisegno) {
      sfondo = funzioneDisegno;
      rifaiSfondo();
    },
    // Da chiamare all'inizio di ogni fotogramma (al posto di inizioFotogramma).
    disegnaSfondo() {
      if (!sfondoPronto) return this.inizioFotogramma();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(immagineSfondo, 0, 0);
      ctx.setTransform(scala, 0, 0, scala, 0, 0);
    },
    risoluzioneReale() {
      return canvas.width + "x" + canvas.height;
    },
  };
}

// Pulsante "schermo intero": il browser lo permette solo dopo un clic.
export function collegaPulsanteSchermoIntero(pulsante) {
  if (!pulsante) return;
  pulsante.addEventListener("click", () => {
    const el = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  });
  document.addEventListener("fullscreenchange", () => {
    pulsante.textContent = document.fullscreenElement ? "Esci da schermo intero" : "Schermo intero";
  });
}

// Mette o toglie lo schermo intero. Su Xbox funziona anche dalla pressione di un tasto
// del controller (Edge la considera come un clic).
export function alternaSchermoIntero() {
  const el = document.documentElement;
  if (document.fullscreenElement) {
    return document.exitFullscreen ? document.exitFullscreen() : Promise.reject();
  }
  return el.requestFullscreen ? el.requestFullscreen() : Promise.reject();
}

// Tasto ufficiale per lo schermo intero: le due levette premute insieme (L3+R3),
// da qualsiasi controller. (View funziona ma fa perdere il "fuoco" alla pagina su Xbox.)
// Da chiamare ogni fotogramma con il risultato di leggiController().
// Restituisce true se in questo fotogramma è stato chiesto lo schermo intero.
export function controllaSchermoIntero(giocatori) {
  for (const g of giocatori) {
    if (!g.collegato) continue;
    const t = g.tasti;
    if ((t.L3.appenaPremuto && t.R3.premuto) || (t.R3.appenaPremuto && t.L3.premuto)) {
      alternaSchermoIntero().catch(() => {});
      return true;
    }
  }
  return false;
}
