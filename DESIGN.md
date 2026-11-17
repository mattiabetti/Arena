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

## Round e partita (v0.4.0)
- Partita al meglio di 3: vince chi vince per primo 2 round (`ROUND_PER_VINCERE` in gioco.js).
- Inizio round: scritta "ROUND N" (o "ROUND DECISIVO" sull'1–1) per 1,5 s a giocatori fermi,
  poi "VIA!".
- A vita zero: "GIOCATORE X VINCE IL ROUND!", pausa di 3 s, nuovo round (tutti al punto di
  partenza, vita piena).
- Round vinti: due pallini per giocatore accanto alle barre della vita.
- Fine partita: "GIOCATORE X VINCE LA PARTITA!" con il punteggio; dopo 1,5 s
  "Premi A per giocare ancora" (A di uno qualsiasi dei due controller).

## Da decidere (insieme, nelle prossime sessioni)
- Durata massima di un round (serve? per ora nessun limite di tempo).
- Forma e ostacoli definitivi dell'arena (per ora quella provvisoria qui sopra).
- Primi 2 personaggi e le loro abilità.
- Stile grafico (forme semplici colorate all'inizio).
