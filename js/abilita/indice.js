// Elenco dei TIPI di abilità che il gioco sa far funzionare.
// Nella scheda di un personaggio, il campo "tipo" di ogni abilità deve essere uno di questi nomi.
// Per aggiungere un tipo nuovo (es. "scatto"): creare "scatto.js" con le funzioni
// usa / aggiorna / disegna (come in proiettile.js) e aggiungerlo qui sotto.
// Le abilità con un tipo non ancora presente qui vengono semplicemente ignorate.

import * as proiettile from "./proiettile.js?v=0.5.0";

export const TIPI_ABILITA = { proiettile };
