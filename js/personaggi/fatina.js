// PERSONAGGIO: Fatina.
// Per ora tutti i personaggi hanno gli STESSI numeri (danno, velocità, grandezza):
// cambiano solo aspetto ed effetti. Il bilanciamento verrà più avanti.

export default {
  id: "fatina",
  nome: "Fatina",
  aspetto: "fatina",        // disegno: js/aspetti/fatina.js
  colore: "#c79bff",        // colore "di riconoscimento" (lilla)
  descrizione: "Piccola fata con le ali che sbattono",
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: stellina che gira e lascia una scia luccicante
    RT: { nome: "Stellina", descrizione: "lancia una stellina luccicante",
          tipo: "proiettile", aspetto: "stellina", colore: "#ffd84a",
          danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
    // Grilletto sinistro: colpo di bacchetta (corpo a corpo)
    LT: { nome: "Bacchetta", descrizione: "colpo di bacchetta, spinge via",
          tipo: "mischia", aspetto: "bacchetta", colore: "#ffd84a",
          danno: 15, portata: 60, ampiezza: 120, spinta: 600, ricarica: 1 },
    // B: scatto
    B:  { nome: "Scatto", descrizione: "scatto velocissimo",
          tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 },
  },
};
