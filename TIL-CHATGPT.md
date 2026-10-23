# FitNotes – til ChatGPT

FitNotes er en dansk træningsapp (statisk HTML/CSS/JS, ingen build-trin). Selve appen ligger i mappen `dist/` – åbn `dist/index.html` via en lokal webserver (fx `python3 -m http.server` inde i `dist/`). 3D-modellen indlæses med `fetch`, så den virker ikke ved at dobbeltklikke på filen.

## Status (oktober 2026)

- Program, logning, pausetimer (justerbar), historik med "ret workout", styrkerang, ugentlig styrkegraf, indstillinger, "Min konto".
- Login/synkronisering: Claude-konto på Claude-links, ellers "Fortsæt med Google" via Firebase (nøgler mangler i `dist/config.js`, se `FIREBASE-SETUP.md`).
- **Hologram på Udvikling** – to visninger, valgt med knapperne "Billede"/"3D":
  - **Billede**: `dist/neon-hologram.jpg` (CC0, Stockcake) farves om til rangfarven i `dist/progress.js` (`paintHologram`).
  - **3D** (standard): Tripo AI-model (betalt plan), slanket fra 65 MB til ca. 90.000 trekanter. Filer: `dist/holo-mesh.bin` (eget kompakt format "FNH2"), `dist/holo-tex.jpg` (R = neon-linjer, G = kropstone, B = grå pletter) og `dist/holo3d.js` (WebGL). Farves i rangfarven, kan drejes med fingeren og har knapperne Forfra og Bagfra, en lysstribe der scanner op gennem kroppen og en kort glitch hvert 6.–8. sekund.
  - Linjerne er håndrettet: små stumper og "ar"-streger på brystet er fjernet, lænden har rygstrækkere og latissimus, og læggene har skarpe, kantede linjer.

- **Rang pr. muskelgruppe** (panelet "Rang pr. muskel" på Udvikling, `groupRanks` i progress.js): Bryst, Ryg, Skuldre, Biceps og Triceps får hver sin rang ud fra gennemsnittet af deres øvelsers percentiler. Hver øvelse tæller kun for sin primære muskel. Grupper med kun én øvelse er "foreløbige". Core har ingen standarder og får ingen rang.

## Rangfarver

Bronze `#ce9767`, Silver `#c1d0e2`, Gold `#efca73`, Platinum `#9ae0e5`, Diamond `#88b9ff`, Obsidian `#a99bc9` (3D: næsten sort glaskrop, hvide linjer, violet kant). 3D-hologrammets krop-, kant- og linjefarver pr. rang står i `holoColors` i progress.js, ingen rang: farveløs og mat i 3D.

## Vigtige regler for appen

- Brugerens gemte træningsdata (localStorage-nøgle `fitnesslog.maskidd.v1`) må aldrig gå tabt.
- Ben-træning er bevidst slået fra (brugeren har en nervesygdom) – det skal ikke ændres.
- Teksten i appen er på dansk.
- Ret ikke i `holo-mesh.bin` eller `holo-tex.jpg` i hånden – de er genereret.
