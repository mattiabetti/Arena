// Elenco dei TEMI grafici delle arene. Nella scheda di un'arena, "tema" deve essere uno di questi nomi.
// Ogni tema ha una funzione disegna(ctx, arena) che disegna le parti fisse dell'arena
// (fuori, pavimento, bordo, pilastri). Per aggiungerne uno: creare il file e metterlo qui.

import * as pietra from "./pietra.js?v=0.7.1";
import * as foresta from "./foresta.js?v=0.7.1";

export const TEMI = { pietra, foresta };
