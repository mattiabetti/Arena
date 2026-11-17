// SCHEDA ARENA: "Foresta".
// Una radura nel bosco: prato, siepe tutto intorno, e alberi al posto dei pilastri.
// Gli alberi funzionano come i pilastri: bloccano i giocatori e i colpi.
// REGOLA: le arene devono essere SIMMETRICHE (vedi indice.js). Il gioco lo controlla da solo.

export default {
  id: "foresta",
  nome: "Foresta",
  tema: "foresta",           // grafica: js/temi/foresta.js
  seme: 11,                  // cambia la disposizione di erba e fiori (qualsiasi numero)

  campo: { x: 40, y: 130, larghezza: 1840, altezza: 910, angoli: 40 },

  // Alberi (raggio = la parte che blocca; la chioma disegnata è un po' più grande).
  pilastri: [
    // grande quercia al centro: impedisce di spararsi dritti dalla partenza
    { x: 960,  y: 585, raggio: 70 },
    // quattro alberi medi
    { x: 640,  y: 350, raggio: 50 },
    { x: 1280, y: 350, raggio: 50 },
    { x: 640,  y: 820, raggio: 50 },
    { x: 1280, y: 820, raggio: 50 },
    // quattro alberelli vicino alle partenze, per ripararsi
    { x: 420,  y: 420, raggio: 36 },
    { x: 1500, y: 420, raggio: 36 },
    { x: 420,  y: 750, raggio: 36 },
    { x: 1500, y: 750, raggio: 36 },
  ],

  partenze: [
    { x: 240,  y: 585, mira: 0 },   // Giocatore 1, a sinistra
    { x: 1680, y: 585, mira: 180 }, // Giocatore 2, a destra
  ],
};
