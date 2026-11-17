// SCHEDA ARENA: "Arena di pietra" (la prima arena del gioco).
// Contiene solo dati (forma, pilastri, punti di partenza, tema grafico).
// Tutte le misure sono in pixel dello schermo logico 1920x1080.
// REGOLA: le arene devono essere SIMMETRICHE (vedi indice.js), così i due giocatori
// partono nelle stesse condizioni. Il gioco lo controlla da solo.

export default {
  id: "pietra",
  nome: "Arena di pietra",
  tema: "pietra",            // grafica: js/temi/pietra.js

  // Il pavimento: un rettangolo con gli angoli arrotondati.
  // In alto lasciamo spazio (130 pixel) per i nomi e le barre della vita.
  campo: { x: 40, y: 130, larghezza: 1840, altezza: 910, angoli: 40 },

  // Pilastri rotondi: bloccano il passaggio e i colpi.
  pilastri: [
    { x: 560,  y: 375, raggio: 60 },
    { x: 1360, y: 375, raggio: 60 },
    { x: 560,  y: 795, raggio: 60 },
    { x: 1360, y: 795, raggio: 60 },
  ],

  // Dove compaiono i giocatori e verso dove guardano all'inizio
  // (mira in gradi: 0 = destra, 180 = sinistra).
  partenze: [
    { x: 240,  y: 585, mira: 0 },   // Giocatore 1, a sinistra
    { x: 1680, y: 585, mira: 180 }, // Giocatore 2, a destra
  ],

  colori: {
    sfondo: "#07090d",     // fuori dall'arena
    pavimento: "#1b2130",
    piastrelle: "#232b3d", // righe leggere sul pavimento
    bordo: "#4a5670",      // muro intorno all'arena
    pilastro: "#3a4458",
    pilastroLuce: "#566381",
  },
};
