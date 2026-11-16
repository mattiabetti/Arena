// Protezione dalla navigazione di Edge: alcuni tasti del controller (es. B)
// potrebbero far tornare indietro il browser o scorrere la pagina.
// Qui proviamo a bloccarli e contiamo quante volte succede (utile nella pagina di test).

export const registro = {
  tastiera: [],       // ultimi tasti "da tastiera" ricevuti dal browser
  indietroBloccati: 0 // quante volte abbiamo impedito il "torna indietro"
};

const TASTI_DA_BLOCCARE = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "BrowserBack",
  "PageUp", "PageDown", "Home", "End", "Tab",
]);

export function proteggiNavigazione() {
  // "Torna indietro": aggiungiamo un passo finto alla cronologia e lo rimettiamo ogni volta.
  history.pushState({ arena: true }, "");
  window.addEventListener("popstate", () => {
    registro.indietroBloccati++;
    history.pushState({ arena: true }, "");
  });

  window.addEventListener("keydown", (e) => {
    registro.tastiera.unshift(e.key || e.code || String(e.keyCode));
    registro.tastiera.length = Math.min(registro.tastiera.length, 8);
    if (TASTI_DA_BLOCCARE.has(e.key) || (e.key && e.key.startsWith("Gamepad"))) e.preventDefault();
  });

  // Niente menu contestuale né scorrimento.
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
}
