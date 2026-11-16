# ROADMAP.md — Stato del progetto

## Fatto
- [x] Sessione 1 (2026-11-16): struttura del progetto, file CLAUDE.md / DESIGN.md / ROADMAP.md,
      scalatura 1920x1080, lettura controller (`js/core/input.js`), pagina di test dei controller.
- [x] Pubblicato su GitHub Pages: https://mattiabetti.github.io/Arena/
- [x] Primo test sulla Xbox (v0.1.0), vedi "Risultati test" sotto.
- [x] v0.1.1: la pagina di test spiega come passare a "Usa controlli di gioco".

## Risultati test Xbox (v0.1.0, Edge in modalità "controlli di navigazione")
- Edge mostra il cursore, che si muove con la levetta sinistra. A = clic.
- Nessun controller rilevato dal gioco (Gamepad API vuota): in questa modalità Edge
  "si tiene" il controller per navigare.
- Y, LB, RB arrivano come tasto tastiera "Unidentified"; B arriva come "Escape".
- B: la prima pressione esce dallo schermo intero, le successive vengono bloccate da noi
  (contatore "Indietro bloccati" sale). Il blocco del "torna indietro" funziona.
- RT e levetta destra nascondono il cursore; LT, A, X nessun effetto visibile.
- Causa: Edge su Xbox ha due modalità, "controlli di navigazione" (predefinita) e
  "controlli di gioco". Si cambia tenendo premuto Menu e scegliendo "Usa controlli di gioco".

## Da fare
- [ ] Ripetere il test in modalità "Usa controlli di gioco": controller rilevati? tutti i tasti?
      vibrazione? B esce ancora dallo schermo intero?
- [ ] Capire se Edge ricorda la modalità "controlli di gioco" per il sito o va scelta ogni volta.
- [ ] Decidere i primi 2 personaggi (DESIGN.md).
- [ ] Prima arena giocabile: due cerchi che si muovono e mirano, con collisione con i bordi.
- [ ] Attacco base (proiettile) e vita.
- [ ] Round, vittoria, schermata di fine partita.
- [ ] Menu di scelta del personaggio.

## Bug / da verificare sulla Xbox
- [ ] Da verificare: la vibrazione funziona su Edge Xbox?
- [ ] Noto (da altri progetti web su Xbox): premere View può far perdere il "fuoco" alla pagina;
      di solito si risolve aprendo e chiudendo la Guida con il tasto Xbox.
- [ ] Consigliato da altri progetti: in Impostazioni Xbox disattivare il bordo di overscan
      per le app (migliora le prestazioni di Edge).
