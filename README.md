# Forma 3D

Editor STL locale e web con un flusso di lavoro ispirato a SketchUp, pensato
per piccole modifiche a modelli da stampa 3D senza caricare file su servizi
esterni.

Prima di fare nuove modifiche al codice, leggere anche
[`docs/DIARIO_SVILUPPO.md`](docs/DIARIO_SVILUPPO.md): contiene architettura,
logiche geometriche, limiti noti, decisioni tecniche e possibili evoluzioni.

## Avvio locale

Su Windows:

```text
Avvia Forma 3D.bat
```

Da una cartella clonata da GitHub:

```bash
npm install
npm start
```

Per sviluppo web:

```bash
npm run dev
```

Per verificare prima di committare:

```bash
npm test
npm run build
```

## Versione web su GitHub Pages

La pagina pubblica deve servire il build Vite, non i file sorgenti della root.
Il workflow `.github/workflows/pages.yml` esegue `npm ci`, `npm test`,
`npm run build` e pubblica la cartella `dist` su GitHub Pages.

Se GitHub Pages mostra HTML senza stile o senza scena 3D, nelle impostazioni del
repository verificare che Pages usi **GitHub Actions** come sorgente di deploy.

URL pubblico:

```text
https://lukethehawk.github.io/3Deditor/
```

## Comandi e navigazione

- Click sinistro in `Select`: seleziona una faccia.
- Doppio click in `Select` o `Transform`: seleziona il corpo cliccato.
- `Spazio`: selezione.
- `P`: Push/Pull.
- `B`: box.
- `C`: cilindro.
- `V`: cono.
- `I`: piramide.
- `K`: ingranaggio.
- `A`: testo 3D.
- `T`: sottrai figura di taglio.
- `H`: foro.
- `F`: sposta foro.
- `L`: linee/guide 2D-3D.
- `N`: piani 2D piatti.
- `M`: misura.
- `G`: trasforma corpo selezionato.
- `O`: orbita.
- Rotellina premuta: orbita.
- Rotellina: zoom.
- Tasto destro: panoramica.
- `Ctrl+Z` / `Ctrl+Y`: annulla / ripristina.
- `Canc`: cancella anteprima attiva, guida corrente, faccia o corpo selezionato.

Il menu `Options` contiene lingua, guida rapida, riparazione mesh ed esportazione
STL. Inglese è la lingua primaria; italiano è selezionabile dal menu.

## Strumenti principali

### Select

Il click singolo seleziona una faccia complanare. Il doppio click seleziona solo
il corpo connesso cliccato, anche quando più oggetti sono contenuti nello stesso
STL. La selezione è evidenziata con overlay blu marcati.

### Push/Pull

Lavora su facce piane selezionate. I piani 2D appena creati vengono selezionati
automaticamente come facce, così si può passare subito a Push/Pull per dare
volume.

### Solids

Il menu `Solids` contiene box, cilindro, cono, piramide, ingranaggio e testo 3D.
Le primitive usano anteprima, offset numerici e asse su faccia/X/Y/Z dove
applicabile.

L'ingranaggio viene aggiunto come corpo separato, senza booleane pesanti, per
evitare blocchi del browser. Ha limite di 80 denti e controlli su modulo,
spessore, foro centrale, mozzo, gioco e qualità.

### Booleans

Il menu `Booleans` contiene sottrai, foro e sposta foro. Le operazioni booleane
richiedono mesh sufficientemente chiuse e pulite.

### 2D

Il menu `2D` contiene linee e piani. Le linee sono guide persistenti e possono
creare facce chiuse; i piani creano rettangoli, quadrati o cerchi piatti
estrudibili con Push/Pull.

### Transform

Trasforma solo il corpo selezionato. Entrando nello strumento, la modalità
selezione passa automaticamente a Object; se era selezionata una faccia, viene
convertita nel corpo connesso. Spostamento, rotazione e scala hanno anteprima
wireframe e vengono applicati direttamente ai vertici STL.

### Text 3D

Permette testo estruso con font open inclusi in Three.js, bold, corsivo simulato,
altezza, profondità, larghezza lettere, smusso, rotazione e offset. Il testo può
essere aggiunto come rilievo o sottratto per incisione.

### Measure

Mostra distanza diretta e componenti firmate sugli assi X, Y e Z.

### Repair mesh

Salda vertici vicini, rimuove triangoli degeneri/duplicati, riorienta triangoli
quando possibile e planarizza in modo conservativo superfici quasi piatte. Non
chiude automaticamente buchi né trasforma una mesh STL in un solido CAD.

## Architettura rapida

- `index.html`: interfaccia.
- `src/style.css`: layout e stile.
- `src/main.parts/*.js`: controller principale diviso in parti.
- `src/main.js`: file generato, non modificare a mano.
- `src/geometry.js`: logiche mesh, selezione, riparazione, push/pull.
- `src/primitives.js`: primitive solide, piani, testo e ingranaggi.
- `src/snapping.js`: snap a griglia, punti, assi e inferenze.
- `src/measurement.js`: misure.
- `src/hole-detection.js`: riconoscimento fori cilindrici.
- `test/*.test.js`: test unitari.

`src/main.js` viene rigenerato da:

```bash
npm run build
```

oppure dai comandi `dev` e `start`.

## Limiti del prototipo

Forma 3D lavora su STL, quindi su mesh triangolari senza cronologia CAD,
vincoli o feature parametriche. Le booleane possono fallire su mesh aperte,
sporche o non manifold. Alcune operazioni producono corpi separati nello stesso
STL; molti slicer li gestiscono correttamente, ma non equivalgono sempre a una
unione CSG perfetta.
