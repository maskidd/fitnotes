# FitNotes — samlet kildekode til Claude.ai og Claude Code

Dette er en **arbejdskopi** af FitNotes, som skal gennemgås med begge Claude-værktøjer. Den er **ikke en ny app** og indeholder ikke brugerens registrerede træningshistorik.

## Ét projekt, to roller

1. **Claude.ai:** Gennemgå brugeroplevelse, visuel kvalitet, ranking-logik og forklaringstekster. Giv en prioriteret liste over konkrete forbedringer og mulige fejl. Ingen antagelse om, at chatten kan rette den live hjemmeside.
2. **Claude Code:** Gennemgå de faktiske filer, kør tests, undersøg eventuelle fejl, og foreslå eller implementér velafgrænsede rettelser i **denne arbejdskopi**. Lever ændrede filer eller en diff og resultatet af tests.
3. **ChatGPT/Sites:** Integrerer godkendte ændringer i den oprindelige FitNotes-kilde, tester den samlede løsning og publicerer fortsat på **samme FitNotes-side**. Undgå at oprette en konkurrerende offentlig deployment.

Live app: https://maskidd.github.io/fitnotes/ (udgives automatisk fra `dist/` ved hvert push til `main`)

## Vigtige produktkrav

- Dansk, mobilvenlig, minimalistisk træningsapp med dark/blue visuel identitet.
- Push/Pull-program, workout-logning, sæt, reps, vægt, historik og styrkerang.
- Rank-systemet måler **aktuelt styrkeniveau i forhold til en ekstern styrkereference**, ikke streaks, antal workouts eller en personlig XP/progressionsscore.
- Samlet score tager gennemsnittet af sammenlignelige øvelsers estimerede percentil. Hver øvelse tæller højst én gang. Brug stærkeste sæt fra den **seneste** loggede træning for hver øvelse.
- **Weighted pull-ups:** Indtastet `+kg` er ekstra vægt på kroppen. 0 kg betyder almindelige pull-ups med egen kropsvægt. Må ikke fortolkes som assistancemaskine/modvægt.
- **Push-ups:** Egen kropsvægt tæller; eventuel ekstern belastning har en grov estimeringsmodel, som skal omtales ærligt.
- Hologrammet er en neutral, glat menneskesilhuet med lukket mund, ingen brystvorter, en smule fyldigere arme og naturlig A-pose. Hologrammets farve viser rank, ikke den faktiske fysik.
- Det eksisterende projekt og brugerens lokal-gemte træningsdata skal bevares ved integration. Ingen unødvendig totalomskrivning.

## Videnskabelige begrænsninger — vigtigst af alt

Rank-beregningen i `dist/progress.js` bruger offentlige Strength Level-tabeller baseret på **mandlige brugere, som logger styrkeløft**. Der er **ingen repræsentativ global stikprøve over alle mennesker**. Derfor må appen ikke påstå, at en bestemt rank er en verificeret verdenspercentil. Tallet er en **estimeret sammenligning med en træningsorienteret referencegruppe**.

Et gennemsnit på tværs af øvelsespercentiler er **ikke statistisk identisk** med den tilsvarende percentil for en samlet styrkeprofil. Alderskorrektion, kropsvægtskorrektion, 1RM-udregning og øvelses-proxyer introducerer yderligere usikkerhed. Undersøg især disse antagelser. Hvis du foreslår stærkere dokumentation, vedlæg originalkilder og forklar målpopulationen.

Kilde-eksempler:

- https://strengthlevel.com/strength-standards/pull-ups/kg
- https://strengthlevel.com/strength-standards/push-ups/kg
- https://strengthlevel.com/strength-standards/dumbbell-bench-press/kg

## Filer

| Fil | Funktion |
| --- | --- |
| `dist/index.html`, `dist/style.css` | Appens struktur og design |
| `dist/app.js` | Program, logning, state, settings og navigation |
| `dist/progress.js` | Ranks, eksterne benchmarks, muskeloversigt |
| `dist/body3d-fluid.js` | WebGL-hologram og fallback |
| `dist/human-silhouette-refined.bin` | 3D-model, der bruges på hjemmesiden |
| `dist/body3d-premium.js`, `dist/human-silhouette.bin` | Tidligere/reservegrafik; fjern ikke blindt |
| `tools/test-strength-ranks.mjs` | Automatiske ranking-tests |
| `MODEL-SOURCE.md` | Modellens ophav, licens og bearbejdning |

Appen er statisk HTML/CSS/JS. Ingen npm-installation er nødvendig for at læse eller teste projektet.

## Kør kontroller

Fra denne mappes rod:

```bash
node --check dist/app.js
node --check dist/progress.js
node --check dist/body3d-fluid.js
node tools/test-strength-ranks.mjs
```

Ved browser-test: servér `dist/` via en lokal HTTP-server (3D-modellen hentes med `fetch`, så direkte `file://` kan fejle). Undgå at overskrive eksisterende gemte data ved at teste på en separat browserprofil.

## Hvad skal du levere fra gennemgangen?

1. Fund opdelt i **kritiske fejl**, **meningsfulde forbedringer** og **smag/design**.
2. For hvert fund: præcis fil, hvordan det reproduceres, hvorfor det er vigtigt, og anbefalet løsning.
3. Eventuelle ændrede kildefiler/diff samt hvilke kontroller der er kørt.
4. Beskrivelse af usikkerheder i rangsystemet uden at fremstille estimater som dokumenteret verdensrang.

Der er ikke inkluderet brugerens private trænings-backup, kontodata eller Site-adgangsoplysninger.
