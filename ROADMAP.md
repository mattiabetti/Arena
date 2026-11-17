# ROADMAP.md — Stato del progetto

## Fatto
- [x] Sessione 1 (2026-11-16): struttura del progetto, file CLAUDE.md / DESIGN.md / ROADMAP.md,
      scalatura 1920x1080, lettura controller (`js/core/input.js`), pagina di test dei controller.
- [x] Pubblicato su GitHub Pages: https://mattiabetti.github.io/Arena/
- [x] Primo test sulla Xbox (v0.1.0), vedi "Risultati test" sotto.
- [x] v0.1.1: la pagina di test spiega come passare a "Usa controlli di gioco".
- [x] Secondo test Xbox (v0.1.1) in "controlli di gioco": entrambi i controller funzionano.
- [x] v0.1.2: istruzioni corrette (icona nella barra indirizzi); esperimento "schermo intero con Y".
- [x] Terzo test Xbox (v0.1.2): Y mette e toglie lo schermo intero (RIUSCITO), X fa vibrare
      entrambi i controller, B nei controlli di gioco arriva anche come tasto "Unidentified"
      (innocuo, viene ignorato). Pagina di test completata: obiettivo sessione 1 raggiunto.
- [x] Quarto test Xbox (v0.1.4): View mette lo schermo intero ma fa perdere il fuoco;
      L3+R3 funziona senza perdere il fuoco; B si accende su entrambi i controller.
- [x] v0.1.5: DECISO schermo intero = L3+R3 (funzione comune in schermo.js), View tolto.
      Verificato sulla Xbox: L3+R3 ok (arriva anche come "Unidentified", innocuo), Y libero.
- [x] v0.1.4: ogni file caricato con "?v=versione" (la Xbox mostrava ancora la 0.1.2 per la cache).
- [x] v0.1.3: Y lasciato libero per il gioco (all'utente non piace Y per lo schermo intero;
      vuole anche B disponibile per le abilità). Prova schermo intero con View o L3+R3,
      e contatore "fuoco perso".
- [x] Sessione 2 (2026-11-17), v0.2.0: prima arena giocabile (`gioco.html`, `js/gioco.js`).
      Pulsante "Gioca" attivo nel menu. Arena rettangolare con 4 pilastri (scheda in
      `js/arene/prima-arena.js`), personaggio provvisorio "Recluta" (`js/personaggi/recluta.js`)
      usato da entrambi. Movimento, linea di mira, urti con muri/pilastri/avversario,
      barre della vita (ancora senza danni), contatore fps. Provata solo sul PC con
      controller simulati.
- [x] Test Xbox v0.2.0: fluido (60 fps fissi con due giocatori), bordi ok a schermo intero,
      velocità 420 giusta, piace che a levetta destra ferma si guardi dove si cammina.
- [x] v0.3.0: colpo base su RT (`js/abilita/proiettile.js`, numeri nella scheda Recluta):
      si ferma su muri e pilastri, toglie 10 di vita, lampo bianco + vibrazione a chi è colpito,
      K.O. a vita zero con scritta del vincitore e nuovo round dopo 3 s.
      Provata sul PC con controller simulati.
- [x] Test Xbox v0.3.0: tutto ok. Velocità del colpo, 0,5 s tra i colpi e 10 colpi per vincere
      vanno bene; vibrazione si sente e non dà fastidio; 60 fps fissi.
- [x] v0.4.0: partita al meglio di 3 (scritte ROUND N / VIA! / vince il round / vince la
      partita, pallini dei round vinti, A per rigiocare).
- [x] Test Xbox v0.4.0: tutto ok, anche ROUND DECISIVO; scritte ben leggibili.
- [x] v0.5.0: arena "Foresta" (tema grafico js/temi/foresta.js, alberi come pilastri) e
      più arene a rotazione (Foresta, Arena di pietra). Sfondo disegnato una volta sola.
      Controllo automatico della simmetria (avviso rosso se un'arena non lo è).
      Provata sul PC: DA VERIFICARE SULLA XBOX.

## Risultati test Xbox (v0.1.0, Edge in modalità "controlli di navigazione")
- Edge mostra il cursore, che si muove con la levetta sinistra. A = clic.
- Nessun controller rilevato dal gioco (Gamepad API vuota): in questa modalità Edge
  "si tiene" il controller per navigare.
- Y, LB, RB arrivano come tasto tastiera "Unidentified"; B arriva come "Escape".
- B: la prima pressione esce dallo schermo intero, le successive vengono bloccate da noi
  (contatore "Indietro bloccati" sale). Il blocco del "torna indietro" funziona.
- RT e levetta destra nascondono il cursore; LT, A, X nessun effetto visibile.
- Causa: Edge su Xbox ha due modalità, "controlli di navigazione" (predefinita) e
  "controlli di gioco".

## Come si entra nei controlli di gioco (verificato sulla Xbox)
- Tenere premuto Menu NON funziona (né col controller 1 né col 2).
- Funziona: fuori dallo schermo intero, cliccare col cursore l'icona del controller
  in fondo alla barra degli indirizzi.
- Premere Menu nei controlli di gioco riporta ai controlli di navigazione.
- Quindi: prima si attivano i controlli di gioco (fuori dallo schermo intero), poi si va
  a schermo intero con L3+R3. Risolto.

## Da fare
- [ ] Test Xbox della v0.5.0 (vedi "Da verificare" sotto).
- [ ] Prossima sessione: scatto sul tasto B (deciso dall'utente: B, non LT, per lasciare
      il grilletto sinistro a un altro tipo di abilità).
- [ ] Altre arene (simmetriche), da inventare insieme. Poi forse un menu per scegliere l'arena.
- [ ] Decidere i primi 2 personaggi veri con le figlie.
- [ ] Idea da valutare: schermo intero automatico premendo A sulla schermata iniziale del gioco.
- [ ] Capire se Edge ricorda la modalità "controlli di gioco" per il sito o va scelta ogni volta.
- [ ] Decidere i primi 2 personaggi (DESIGN.md): l'utente ci pensa con le figlie.
- [ ] Menu di scelta del personaggio.

## Bug / da verificare sulla Xbox
- [ ] v0.5.0: la Foresta piace? Si distinguono bene giocatori e colpi sull'erba?
- [ ] v0.5.0: restano 60 fps anche nella Foresta?
- [ ] v0.5.0: dopo una partita, premendo A si passa all'Arena di pietra (e poi di nuovo Foresta)?
- [x] Confermato: premere View fa perdere il "fuoco" alla pagina (per questo non lo usiamo).
      Se succede: aprire e chiudere la Guida con il tasto Xbox.
- [ ] Consigliato da altri progetti: in Impostazioni Xbox disattivare il bordo di overscan
      per le app (migliora le prestazioni di Edge).
