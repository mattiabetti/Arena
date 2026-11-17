// PERSONAGGIO: Guerriera (nome provvisorio: si può cambiare qui sotto).
// Per ora tutti i personaggi hanno gli STESSI numeri (danno, velocità, grandezza):
// cambiano solo aspetto ed effetti. Il bilanciamento verrà più avanti.

export default {
  id: "guerriera",
  nome: "Guerriera",
  aspetto: "guerriera",     // disegno: js/aspetti/guerriera.js
  colore: "#3fb8bf",        // colore "di riconoscimento" (verde acqua)
  descrizione: "Combattente con la spada",
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: lancia con il braccio una bolla
    RT: { nome: "Bolla", descrizione: "lancia una bolla con il braccio",
          tipo: "proiettile", aspetto: "bolla", colore: "#7fe3ff",
          danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
    // Grilletto sinistro: colpo di spada (corpo a corpo)
    LT: { nome: "Spada", descrizione: "fendente di spada, spinge via",
          tipo: "mischia", aspetto: "spada", colore: "#e4ebf3",
          danno: 15, portata: 60, ampiezza: 120, spinta: 600, ricarica: 1 },
    // B: scatto
    B:  { nome: "Scatto", descrizione: "scatto velocissimo",
          tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 },
  },
};
