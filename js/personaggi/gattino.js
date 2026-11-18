// PERSONAGGIO: Gattino.
// Per ora tutti i personaggi hanno gli STESSI numeri (danno, velocità, grandezza):
// cambiano solo aspetto ed effetti. Il bilanciamento verrà più avanti.

export default {
  id: "gattino",
  nome: "Gattino",
  aspetto: "gattino",       // disegno: js/aspetti/gattino.js
  colore: "#ffa94d",        // colore "di riconoscimento" (arancione)
  descrizione: "Micio agile e graffiante",
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: palla di pelo che rotola
    RT: { nome: "Palla di pelo", descrizione: "la sputa lontano",
          tipo: "proiettile", aspetto: "pelo", colore: "#b89a7a",
          danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
    // Grilletto sinistro: artigliata (tre graffi)
    LT: { nome: "Artigliata", descrizione: "graffio con gli artigli",
          tipo: "mischia", aspetto: "artigli", colore: "#ffffff",
          danno: 15, portata: 60, ampiezza: 120, spinta: 600, ricarica: 1 },
    // B: scatto
    B:  { nome: "Scatto", descrizione: "scatto velocissimo",
          tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 },
  },
};
