// PERSONAGGIO PROVVISORIO: "Recluta".
// Serve solo per provare l'arena (muoversi e mirare) finché non decidiamo
// i veri personaggi. Non ha ancora abilità.

export default {
  id: "recluta",
  nome: "Recluta",
  colore: "#e8ecf4",        // colore del simbolo al centro del personaggio
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 36,               // grandezza del personaggio (pixel)

  // Le abilità arriveranno nelle prossime sessioni (vedi modello.js per il formato).
  abilita: {},
};
