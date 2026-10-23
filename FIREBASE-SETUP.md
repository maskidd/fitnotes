# FitNotes med "Fortsæt med Google" (Firebase)

Med en konto bliver dine træninger gemt online og er de samme på telefon og computer.
Login og lagring kører gennem Firebase, som er Googles egen tjeneste, så alt sættes op med din Google-konto.
Uden opsætning gemmer appen kun på enheden, præcis som før.

Login virker kun, når appen ligger på en **almindelig hjemmeside**. På et Claude-link bruger appen i stedet din Claude-konto.

## 1. Læg appen på en hjemmeside (ca. 5 min)

1. Gå til https://app.netlify.com/drop og opret en gratis konto (fx med "Sign up with Google").
2. Træk mappen `dist` ind på siden.
3. Du får en adresse som `https://dit-navn.netlify.app`. Den skal du bruge i trin 3.

Når du senere opdaterer appen, trækker du `dist` ind igen på samme site under **Deploys**.

## 2. Opret Firebase-projektet (ca. 2 min)

1. Gå til https://console.firebase.google.com og log ind med din Google-konto.
2. Tryk **Opret et projekt** (Create a project), kald det `fitnotes`.
3. Slå **Google Analytics** fra. Det er ikke nødvendigt. Tryk **Opret projekt**.

## 3. Slå "Fortsæt med Google" til (ca. 1 min)

1. I menuen til venstre: **Build → Authentication → Kom i gang** (Get started).
2. Under **Sign-in method**: vælg **Google** → slå **Aktivér** til → vælg din mail som support-mail → **Gem**.
3. Gå til fanen **Settings → Authorized domains → Add domain**, og tilføj din Netlify-adresse uden `https://`, fx `dit-navn.netlify.app`.

## 4. Opret databasen (ca. 2 min)

1. I menuen til venstre: **Build → Firestore Database → Opret database**.
2. Vælg placeringen **eur3 (Europe)** og **production mode**.
3. Gå til fanen **Regler** (Rules), erstat alt med dette, og tryk **Udgiv** (Publish):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Reglerne betyder, at hver person kun kan se og ændre sine egne træninger.

## 5. Hent nøglerne til appen (ca. 1 min)

1. Tryk på tandhjulet ved **Projektoversigt** → **Projektindstillinger**.
2. Under **Dine apps**: tryk på **`</>`** (Web), kald appen `FitNotes`, og tryk **Registrer app**. Lad "Firebase Hosting" være slået fra.
3. Du ser et stykke kode med `firebaseConfig`. Send det til Claude, eller indsæt det i `dist/config.js`:

```js
window.FITNOTES_CONFIG={
  firebase:{
    apiKey:'AIza...',
    authDomain:'fitnotes-xxxx.firebaseapp.com',
    projectId:'fitnotes-xxxx',
    appId:'1:...:web:...'
  }
};
```

Nøglerne er beregnet til at ligge i browseren. Det er reglerne fra trin 4, der beskytter dine data.

4. Træk `dist` ind på Netlify igen.

## Sådan virker det

- Tryk på konto-ikonet øverst til højre → **Min konto** → **Fortsæt med Google**.
- Første gang du logger ind på en enhed, lægges de træninger, der kun findes på enheden, sammen med dem på kontoen.
- Derefter vinder den nyeste version. Ændringer sendes et par sekunder efter, du gemmer, og appen henter nyt, når du åbner den igen.
- Appen gemmer stadig også lokalt, så den virker, selvom forbindelsen falder ud et øjeblik.
- Under **Min konto** kan du logge ud (og vælge om træningerne skal fjernes fra enheden) og logge ind med en anden Google-konto.
- Brug ikke appen på to enheder samtidig. Så vinder den, der gemte sidst.
- Firebase er gratis til personlig brug (op til 50.000 læsninger og 20.000 skrivninger om dagen).
