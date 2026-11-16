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
  - abilità su LB, RB, LT, RT (dorsali e grilletti); A/B/X/Y per azioni secondarie se servono.
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
3. Lo schermo intero si mette/toglie da codice con un tasto del controller (Edge accetta la
   pressione di un tasto del controller come "clic"; Y funziona). Y però serve al gioco:
   tasto definitivo da scegliere (in prova View e L3+R3, v0.1.3+).
- Premere Menu riporta ai controlli di navigazione (cursore).
- Anche nei controlli di gioco alcuni tasti arrivano pure come eventi tastiera
  (es. B → "Unidentified"): vanno ignorati, si legge solo la Gamepad API.
- La vibrazione (`vibra()` in input.js) funziona.

## Personaggi
- Ogni personaggio è una scheda di configurazione in `js/personaggi/` (un file per personaggio).
- La scheda contiene solo dati (nome, colore, velocità, vita, abilità con valori numerici).
  Il codice che fa funzionare le abilità sta altrove e legge la scheda.
- Aggiungere un personaggio = copiare `js/personaggi/modello.js`, cambiare i valori e
  registrarlo in `js/personaggi/indice.js`.

## Struttura cartelle
```
index.html            pagina iniziale (menu)
test-controller.html  pagina di test dei controller
css/stile.css         stile comune
js/core/              schermo, input, utilità condivise
js/personaggi/        schede dei personaggi
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
  `grep -rl "?v=0.1.4" . | xargs sed -i "s/?v=0.1.4/?v=0.1.5/g"`.
  Usare sempre lo stesso `?v=` per lo stesso file, altrimenti il browser lo carica due volte.
- GitHub Pages può impiegare 1–2 minuti a pubblicare e la cache fino a ~10 minuti:
  se la versione a schermo è vecchia, aspettare e ricaricare.
