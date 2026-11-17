# DESIGN.md — Design del gioco Arena

Gioco amatoriale 1v1 in stile Battlerite, da giocare in locale sulla Xbox con le figlie e gli amici.
Nessuno scopo commerciale.

## Idea di base
- Due giocatori sullo stesso schermo, ognuno con il suo controller.
- Arena vista dall'alto, fissa, che occupa tutta la TV.
- Ogni giocatore sceglie un personaggio con abilità diverse.
- Si vince portando a zero la vita dell'avversario. Partita al meglio di più round (da decidere).

## Comandi (twin-stick)
| Comando           | Azione                         |
|-------------------|--------------------------------|
| Levetta sinistra  | muoversi                       |
| Levetta destra    | mirare                         |
| RT                | attacco base (da confermare)   |
| LT, LB, RB        | abilità del personaggio        |
| A, B, X, Y        | liberi per abilità/azioni      |
| L3+R3 insieme     | schermo intero sì/no           |
| View / Menu       | non usati (li usa Edge)        |

## Arena (provvisoria, v0.2.0)
- Pavimento rettangolare con angoli arrotondati, 4 pilastri rotondi simmetrici.
- In alto una fascia con nome, personaggio e vita dei due giocatori.
- Giocatore 1 blu (parte a sinistra), Giocatore 2 rosso (parte a destra).
- Linea di mira tratteggiata davanti al personaggio; se la levetta destra è ferma,
  il personaggio guarda dove cammina.
- I personaggi non si attraversano: si spingono a vicenda.

## Da decidere (insieme, nelle prossime sessioni)
- Quanti round per partita, quanta vita, durata di un round.
- Forma e ostacoli definitivi dell'arena (per ora quella provvisoria qui sopra).
- Primi 2 personaggi e le loro abilità.
- Stile grafico (forme semplici colorate all'inizio).
