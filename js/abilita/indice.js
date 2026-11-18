// Elenco dei TIPI di abilità che il gioco sa far funzionare.
// Nella scheda di un personaggio, il campo "tipo" di ogni abilità deve essere uno di questi nomi.
// Ogni tipo è un file con le funzioni:
//   usa(personaggio, dati, mondo, controller)  quando si preme il tasto
//   aggiorna(mondo, dt)                         ogni fotogramma (facoltativa)
//   disegnaSotto(ctx, mondo)                    disegno sotto i personaggi (facoltativa)
//   disegna(ctx, mondo)                         disegno sopra i personaggi (facoltativa)
// Le abilità con un tipo non ancora presente qui vengono semplicemente ignorate.

import * as proiettile from "./proiettile.js?v=0.8.0";
import * as mischia from "./mischia.js?v=0.8.0";
import * as scatto from "./scatto.js?v=0.8.0";

export const TIPI_ABILITA = { proiettile, mischia, scatto };
