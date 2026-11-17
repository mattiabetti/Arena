// PERSONAGGIO: Fatina.
// Veloce e precisa: stelline rapide ma leggere, colpo di bacchetta corto.

export default {
  id: "fatina",
  nome: "Fatina",
  aspetto: "fatina",        // disegno: js/aspetti/fatina.js
  colore: "#c79bff",        // colore "di riconoscimento" (lilla)
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  abilita: {
    // Grilletto destro: stellina che gira e lascia una scia luccicante
    RT: { nome: "Stellina", tipo: "proiettile", aspetto: "stellina", colore: "#ffd84a",
          danno: 8, ricarica: 0.4, velocita: 1000, raggio: 10, gittata: 1000 },
    // Grilletto sinistro: colpo di bacchetta (corpo a corpo)
    LT: { nome: "Bacchetta", tipo: "mischia", aspetto: "bacchetta", colore: "#ffd84a",
          danno: 12, portata: 50, ampiezza: 110, spinta: 500, ricarica: 0.8 },
    // B: scatto
    B:  { nome: "Scatto", tipo: "scatto", distanza: 280, durata: 0.16, ricarica: 3 },
  },
};
