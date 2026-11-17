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
| RT                | colpo base (tenere premuto = spara di continuo) |
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

## Colpo e vita (v0.3.0)
- Colpo base su RT: proiettile nel colore del giocatore, parte nella direzione della mira.
  Danno 10, un colpo ogni 0,5 s, velocità 900, sparisce dopo 1000 pixel.
- Il colpo si ferma su muri e pilastri (ci si può riparare dietro).
- Vita 100: servono 10 colpi. Chi viene colpito lampeggia di bianco e il suo controller vibra;
  la barra mostra in bianco la vita appena persa.
- A vita zero: scritta "GIOCATORE X VINCE!", pausa di 3 secondi, poi nuovo round
  (tutti al punto di partenza con la vita piena). Per ora non si contano i round vinti.

## Da decidere (insieme, nelle prossime sessioni)
- Quanti round per partita, durata di un round.
- Forma e ostacoli definitivi dell'arena (per ora quella provvisoria qui sopra).
- Primi 2 personaggi e le loro abilità.
- Stile grafico (forme semplici colorate all'inizio).
