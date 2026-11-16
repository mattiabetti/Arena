// MODELLO di scheda personaggio.
// Per creare un personaggio nuovo:
//   1. copia questo file con un nome nuovo (es. "guerriera.js")
//   2. cambia i valori qui sotto
//   3. aggiungilo all'elenco in "indice.js"
// La scheda contiene solo dati: il codice che fa funzionare le abilità sta altrove.

export default {
  id: "modello",            // nome tecnico, senza spazi
  nome: "Modello",          // nome mostrato a schermo
  colore: "#cccccc",
  vita: 100,
  velocita: 400,            // pixel al secondo
  raggio: 32,               // grandezza del personaggio (pixel)

  // Abilità: su quale tasto, che tipo, e i suoi numeri.
  abilita: {
    RT: { nome: "Colpo", tipo: "proiettile", danno: 10, ricarica: 0.5, velocita: 900, raggio: 10 },
    LT: { nome: "Scatto", tipo: "scatto", distanza: 250, ricarica: 4 },
    RB: { nome: "Scudo", tipo: "scudo", durata: 1.5, ricarica: 8 },
    LB: { nome: "Esplosione", tipo: "area", danno: 20, raggioArea: 150, ricarica: 10 },
  },
};
