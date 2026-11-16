// Schermo: si disegna sempre in coordinate fisse 1920x1080.
// Questo file adatta il canvas alla finestra (TV) mantenendo il 16:9,
// con bande nere se la finestra ha proporzioni diverse.
// Il canvas usa la risoluzione reale dello schermo, così sulla TV 4K le linee restano nitide.

export const LARGHEZZA = 1920;
export const ALTEZZA = 1080;

export function creaSchermo(canvas) {
  const ctx = canvas.getContext("2d");
  let scala = 1; // pixel reali per ogni pixel logico

  function adatta() {
    const finestraL = window.innerWidth;
    const finestraA = window.innerHeight;
    const scalaCss = Math.min(finestraL / LARGHEZZA, finestraA / ALTEZZA);
    const cssL = Math.floor(LARGHEZZA * scalaCss);
    const cssA = Math.floor(ALTEZZA * scalaCss);
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = cssL + "px";
    canvas.style.height = cssA + "px";
    canvas.width = Math.round(cssL * dpr);
    canvas.height = Math.round(cssA * dpr);
    scala = canvas.width / LARGHEZZA;
  }

  window.addEventListener("resize", adatta);
  document.addEventListener("fullscreenchange", adatta);
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
