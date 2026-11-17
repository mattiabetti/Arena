// Elenco degli ASPETTI dei personaggi (come sono disegnati).
// Nella scheda di un personaggio, "aspetto" deve essere uno di questi nomi.
// Ogni aspetto è un file con la funzione disegna(ctx, personaggio, info)
// (info.tempo = secondi passati, per le animazioni come ali e capelli).
// Anello colorato, ombra, sigla G1/G2 e lampo bianco li disegna gioco.js per tutti.

import * as base from "./base.js?v=0.7.0";
import * as fatina from "./fatina.js?v=0.7.0";
import * as guerriera from "./guerriera.js?v=0.7.0";

export const ASPETTI = { base, fatina, guerriera };
