# Klar til at kopiere ind i Claude

## Prompt til Claude.ai (chat)

Jeg udvikler FitNotes, én samlet dansk fitness-webapp. Læs README.md og gennemgå de tilhørende kildetekster fra pakken. Din rolle er at være en kritisk produkt- og UX-reviewer, ikke at oprette en ny app. Fokusér først på (1) om rangsystemets styrkesammenligninger er videnskabeligt redelige, (2) fejl og inkonsekvenser i workout-logning og weighted pull-ups, (3) om 3D-hologrammet og mobil-UI er naturligt, elegant og forståeligt. Giv kun forslag, der kan begrundes med konkrete problemer eller tydelige forbedringer. Skeln mellem fejl, usikre estimater og subjektiv smag. Giv mig en prioriteret liste, som jeg kan få indarbejdet i den eksisterende FitNotes-app.

## Prompt til Claude Code

Åbn dette projekt som én sammenhængende, statisk HTML/CSS/JS-app. Læs README.md først. Lav en teknisk audit af appens ranking-, logger- og 3D-kode. Kør de angivne tests og relevante statiske kontroller. Prioritér verificerbare fejl. Ret gerne afgrænsede tekniske fejl i denne arbejdskopi, men undgå at ændre rank-metoden eller lave stort redesign uden først at forklare konsekvenserne. Sørg for, at logged weighted pull-up `+kg` er ekstra vægt oveni kropsvægt, og at ranks ikke fremstilles som en ægte verdenspercentil. Returnér en præcis liste over ændrede filer, tests og en patch/diff. Publicér ikke en ny app; ændringerne skal kunne integreres i den eksisterende FitNotes-side.
