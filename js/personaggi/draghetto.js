// PERSONAGGIO: Draghetto.
// Per ora tutti i personaggi hanno gli STESSI numeri (danno, velocità, grandezza):
// cambiano solo aspetto ed effetti. Il bilanciamento verrà più avanti.

export default {
  id: "draghetto",
  nome: "Draghetto",
  aspetto: "draghetto",     // disegno: js/aspetti/draghetto.js
  colore: "#6fcf5a",        // colore "di riconoscimento" (verde)
  descrizione: "Piccolo drago sputafuoco",
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: palla di fuoco con le fiammelle dietro
    RT: { nome: "Palla di fuoco", descrizione: "sputa una palla di fuoco",
          tipo: "proiettile", aspetto: "fuoco", colore: "#ff7a1a",
          danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
    // Grilletto sinistro: scodata (giravolta con colpo di coda)
    LT: { nome: "Scodata", descrizione: "giravolta e colpo di coda",
          tipo: "mischia", aspetto: "coda", colore: "#6fcf5a",
          danno: 15, portata: 60, ampiezza: 120, spinta: 600, ricarica: 1 },
    // B: scatto
    B:  { nome: "Scatto", descrizione: "scatto velocissimo",
          tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 },
  },
};
