// PERSONAGGIO: Guerriera (nome provvisorio: si può cambiare qui sotto).
// Colpi più lenti ma più forti: bolla grande da lanciare, fendente di spada largo.

export default {
  id: "guerriera",
  nome: "Guerriera",
  aspetto: "guerriera",     // disegno: js/aspetti/guerriera.js
  colore: "#1f7a80",        // colore "di riconoscimento" (verde acqua)
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: lancia con il braccio una bolla (lenta, grande, forte)
    RT: { nome: "Bolla", tipo: "proiettile", aspetto: "bolla", colore: "#7fe3ff",
          danno: 14, ricarica: 0.8, velocita: 650, raggio: 18, gittata: 900 },
    // Grilletto sinistro: colpo di spada (corpo a corpo, largo e forte)
    LT: { nome: "Spada", tipo: "mischia", aspetto: "spada", colore: "#e4ebf3",
          danno: 18, portata: 70, ampiezza: 140, spinta: 700, ricarica: 1 },
    // B: scatto
    B:  { nome: "Scatto", tipo: "scatto", distanza: 240, durata: 0.15, ricarica: 3 },
  },
};
