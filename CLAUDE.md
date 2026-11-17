# CLAUDE.md — Regole tecniche del progetto Arena

Leggi questo file, DESIGN.md e ROADMAP.md a inizio sessione.
A fine sessione aggiorna ROADMAP.md (fatto / da fare / bug).

## Chi è l'utente
- Non programma. Spiegazioni semplici, niente gergo.
- Dire sempre cosa deve fare lui per provare (es. "ricarica la pagina sulla Xbox e premi A").
- Rispondere in italiano. Commenti nel codice in italiano.
- Piccoli passi testabili: ogni sessione ha un obiettivo preciso.

## Piattaforma
- Gioco web 2D in HTML5 + JavaScript puro (nessun framework, nessun passaggio di build, nessun npm).
- Gira nel browser Edge della Xbox Series X, su TV LG 65" 4K.
- Ospitato gratis su GitHub Pages: https://mattiabetti.github.io/Arena/
- Repository: github.com/mattiabetti/Arena (nome con la A maiuscola), ramo `main`, cartella principale.
- I file JS usano i moduli ES (`import` / `export`): la pagina va aperta via http(s)
  (GitHub Pages o un server locale), non con doppio clic sul file.

## Schermo
- Risoluzione logica fissa 1920x1080. Si disegna sempre in queste coordinate.
- `js/core/schermo.js` scala il canvas per riempire la finestra mantenendo il 16:9 (bande nere se serve).
- Arena fissa che occupa tutto lo schermo. Niente splitscreen, niente telecamera che segue.
- Testi grandi: si guarda da un divano a qualche metro (minimo ~28 px logici).

## Input
- Solo controller Xbox tramite Gamepad API. `js/core/input.js` è l'unico punto che legge i controller.
- Tasti View (indice 8) e Menu (indice 9): MAI usati per il gameplay (Edge li usa per la navigazione).
- Il tasto Xbox (16) è del sistema: ignorarlo.
- Comandi twin-stick:
  - levetta sinistra = movimento
  - levetta destra = mira
  - abilità su LB, RB, LT, RT (dorsali e grilletti); A/B/X/Y per azioni secondarie se servono
    (tutti verificati funzionanti sulla Xbox).
  - L3+R3 insieme = schermo intero (riservato, non usarlo per il gioco).
- Zona morta radiale delle levette: 0.20 (valore in `input.js`).
- Assegnazione giocatori: il primo controller collegato è il Giocatore 1, il secondo il Giocatore 2.
- Mappatura standard Gamepad API (indici pulsanti):
  0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT · 8 View · 9 Menu ·
  10 L3 · 11 R3 · 12 su · 13 giù · 14 sinistra · 15 destra · 16 Xbox.
  Assi: 0/1 levetta sinistra X/Y, 2/3 levetta destra X/Y (Y positivo = in basso).

## Avvio sulla Xbox (verificato)
1. Aprire la pagina in Edge (NON a schermo intero).
2. Cliccare col cursore l'icona del controller in fondo alla barra degli indirizzi
   → "controlli di gioco": sparisce il cursore e i controller arrivano al gioco.
   (Tenere premuto Menu NON funziona.)
3. Schermo intero: premere le due levette insieme (L3+R3), da qualsiasi controller.
   Già pronto in `js/core/schermo.js` → `controllaSchermoIntero(giocatori)`, da chiamare
   ogni fotogramma in ogni pagina. (Edge accetta un tasto del controller come "clic".)
- View: funziona per lo schermo intero ma fa perdere il "fuoco" alla pagina → NON usarlo.
- Premere Menu riporta ai controlli di navigazione (cursore).
- Anche nei controlli di gioco alcuni tasti arrivano pure come eventi tastiera
  (es. B → "Unidentified"): vanno ignorati, si legge solo la Gamepad API.
  B funziona normalmente come tasto del controller: è utilizzabile per il gioco.
- La vibrazione (`vibra()` in input.js) funziona.

## Personaggi
- Ogni personaggio è una scheda di configurazione in `js/personaggi/` (un file per personaggio).
- La scheda contiene solo dati (nome, colore, velocità, vita, abilità con valori numerici).
  Il codice che fa funzionare le abilità sta altrove e legge la scheda.
- Ogni abilità della scheda ha un `tipo` (es. "proiettile"): il codice del tipo sta in
  `js/abilita/<tipo>.js` con tre funzioni `usa` / `aggiorna` / `disegna`, registrato in
  `js/abilita/indice.js`. Tipi non ancora scritti vengono ignorati.
- Tenendo premuto il tasto, un'abilità si ripete appena finisce la sua `ricarica`.
- Aggiungere un personaggio = copiare `js/personaggi/modello.js`, cambiare i valori e
  registrarlo in `js/personaggi/indice.js`.

## Arene
- Ogni arena è una scheda di dati in `js/arene/` (come i personaggi), registrata in
  `js/arene/indice.js`. A ogni nuova partita si passa all'arena successiva dell'elenco.
- REGOLA: le arene devono essere SIMMETRICHE (allo specchio sinistra/destra oppure a
  mezzo giro intorno al centro), pilastri e partenze compresi. `controllaSimmetria()`
  lo verifica e, se non lo è, il gioco mostra un avviso rosso con i problemi.
- I "pilastri" bloccano giocatori e colpi; il tema decide come appaiono (es. alberi).
- La grafica la fa il tema (`tema: "foresta"` → `js/temi/foresta.js`, funzione
  `disegna(ctx, arena)`). Disegna solo le parti fisse: viene disegnata UNA volta in
  un'immagine (`schermo.preparaSfondo`) e poi ricopiata ogni fotogramma
  (`schermo.disegnaSfondo`), così i dettagli non rallentano il gioco.
- Decorazioni: usare `casuale(seme)` e `specchiato()` di `js/temi/utilita.js`, così sono
  sempre uguali e simmetriche. Luce sempre da in alto a sinistra.

## Struttura cartelle
```
index.html            pagina iniziale (menu)
gioco.html            pagina della partita (arena)
test-controller.html  pagina di test dei controller
css/stile.css         stile comune
js/core/              schermo, input, utilità condivise
js/personaggi/        schede dei personaggi
js/arene/             schede delle arene (forma, pilastri, partenze, tema) + indice.js
                      con l'elenco ARENE e il controllo della simmetria
js/temi/              grafica delle arene (pietra.js, foresta.js...) + indice.js
js/abilita/           codice dei TIPI di abilità (es. proiettile.js) + indice.js con l'elenco
js/gioco.js           logica della partita
js/test-controller.js logica della pagina di test
CLAUDE.md DESIGN.md ROADMAP.md
.nojekyll             dice a GitHub Pages di pubblicare i file così come sono
```

## Versione e cache
- Ogni modifica pubblicata aggiorna `VERSIONE` in `js/core/versione.js`; la versione è mostrata
  a schermo, così sulla Xbox si vede subito se la pagina caricata è quella nuova.
- La Xbox tiene in memoria i file JS: per questo OGNI riferimento a un file (nei tag HTML e in
  ogni `import`) porta in coda `?v=<numero versione>`, ad es. `"./core/input.js?v=0.1.4"`.
  A ogni nuova versione sostituire il numero in tutti i file in un colpo solo, es.:
  `grep -rl "?v=0.1.4" --include=*.html --include=*.js . | xargs sed -i "s/?v=0.1.4/?v=0.1.5/g"`
  (solo file .html e .js: senza il filtro il comando modifica anche questo esempio).
  Usare sempre lo stesso `?v=` per lo stesso file, altrimenti il browser lo carica due volte.
- GitHub Pages può impiegare 1–2 minuti a pubblicare e la cache fino a ~10 minuti:
  se la versione a schermo è vecchia, aspettare e ricaricare.
