// MODELLO di scheda personaggio.
// Per creare un personaggio nuovo:
//   1. copia questo file con un nome nuovo (es. "mago.js")
//   2. cambia i valori qui sotto
//   3. aggiungilo all'elenco in "indice.js"
// La scheda contiene solo dati: il codice che fa funzionare le abilità sta in js/abilita/
// e il disegno del personaggio in js/aspetti/.

export default {
  id: "modello",            // nome tecnico, senza spazi
  nome: "Modello",          // nome mostrato a schermo
  aspetto: "base",          // disegno: "base" (cerchio colorato), "fatina", "guerriera"...
  colore: "#cccccc",
  vita: 100,
  velocita: 420,            // pixel al secondo
  raggio: 26,               // grandezza del personaggio (pixel)

  // Abilità: su quale tasto, che tipo, e i suoi numeri.
  // Tipi già funzionanti: "proiettile", "mischia", "scatto" (vedi js/abilita/, ogni file
  // spiega i suoi numeri). Tasti: RT, LT, RB, LB, A, B, X, Y.
  abilita: {
    RT: { nome: "Colpo", tipo: "proiettile", danno: 10, ricarica: 0.5, velocita: 900, raggio: 12, gittata: 1000 },
    LT: { nome: "Pugno", tipo: "mischia", danno: 15, portata: 60, ampiezza: 120, spinta: 600, ricarica: 1 },
    B:  { nome: "Scatto", tipo: "scatto", distanza: 260, durata: 0.15, ricarica: 3 },
    // Esempi futuri (tipi non ancora scritti, per ora ignorati):
    // RB: { nome: "Scudo", tipo: "scudo", durata: 1.5, ricarica: 8 },
    // LB: { nome: "Esplosione", tipo: "area", danno: 20, raggioArea: 150, ricarica: 10 },
  },
};
