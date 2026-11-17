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

  // Abilità: per ora solo il colpo base sul grilletto destro.
  // Tenendo premuto RT spara di continuo, un colpo ogni "ricarica" secondi.
  abilita: {
    RT: { nome: "Colpo", tipo: "proiettile", danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
  },
};
