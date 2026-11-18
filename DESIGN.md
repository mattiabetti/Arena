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
| RT                | colpo a distanza (tenere premuto = spara di continuo) |
| LT                | attacco corpo a corpo (spinge indietro) |
| LT, LB, RB        | abilità del personaggio        |
| B                 | scatto (nella direzione in cui ci si muove, o della mira) |
| A, X, Y           | liberi per abilità/azioni (A = rigioca a fine partita) |
| L3+R3 insieme     | schermo intero sì/no           |
| View / Menu       | non usati (li usa Edge)        |

## Scelta dei personaggi (v0.7.0)
- Dopo "Gioca" compare "SCEGLI IL PERSONAGGIO": una scheda per personaggio con immagine
  animata, nome, descrizione e abilità (tasto, nome, breve spiegazione).
- Ogni giocatore sposta il suo riquadro (G1 blu, G2 rosso) con la levetta sinistra o le
  frecce, conferma con A, annulla con B. Un personaggio già scelto non si può prendere.
- Quando sono pronti entrambi: "Si combatte!" e parte la partita.
- A fine partita: A = rivincita (stessi personaggi, arena successiva), X = torna alla scelta.

## Personaggi (v0.7.0)
PER ORA tutti hanno gli stessi numeri, cambiano solo aspetto ed effetti (il bilanciamento
verrà più avanti): vita 100, velocità 420, raggio 26; RT danno 10, ogni 0,5 s, velocità 900,
grandezza 12; LT danno 15, portata 60, spicchio 120°, spinta 600, ricarica 1 s;
B scatto 260 pixel, ricarica 3 s. Il colore del giocatore (blu/rosso) è l'anello per
terra e la sigla G1/G2; il personaggio ha i suoi colori.
- **Fatina** (lilla, ali che sbattono, bacchetta con stellina): RT Stellina (gira e lascia
  una scia luccicante), LT Bacchetta (arco di stelline), B Scatto.
- **Guerriera** (nome provvisorio; personaggio originale ispirato alle eroine combattenti
  con la spada): RT Bolla (lanciata col braccio), LT Spada (fendente argentato), B Scatto.
- **Draghetto** (verde, alette, cornetti, coda a freccia che scodinzola): RT Palla di fuoco
  (con fiammelle dietro), LT Scodata (fa una giravolta; la coda colpisce davanti), B Scatto.
- **Gattino** (arancione tigrato, coda che ondeggia): RT Palla di pelo (rotola), LT Artigliata
  (allunga la zampa, tre graffi bianchi), B Scatto.
- Nella fascia in alto, accanto al nome del personaggio, le icone LT / B / RT: colorate
  quando l'abilità è pronta, scure mentre si ricarica.

## Arene (v0.5.0)
- Più arene, a ogni nuova partita si cambia (per ora a turno: Foresta, poi Arena di pietra).
  Il nome dell'arena compare sotto "ROUND 1".
- Le arene devono essere simmetriche: i due giocatori partono nelle stesse condizioni.
- Foresta: radura con prato, fiori, terra battuta al centro e alle partenze, siepe come bordo.
  Alberi al posto dei pilastri: una grande quercia al centro (blocca il tiro dritto tra
  le partenze), 4 alberi medi e 4 alberelli vicino alle partenze per ripararsi.
- Arena di pietra: la prima arena (pavimento scuro, muro, 4 pilastri).
- Idee per altre arene: neve/ghiaccio, deserto, castello, spiaggia... (da decidere insieme).

## Elementi comuni a tutte le arene
- Campo rettangolare con angoli arrotondati.
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
