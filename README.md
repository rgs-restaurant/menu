# Restaurant Menu — Site GitHub Pages

Site de menu multi-établissements hébergé gratuitement sur GitHub Pages.  
Landing page de sélection → chaque établissement a son propre site, ses propres données, son propre style.

---

## Structure du projet

```
/
├── index.html        ← Landing page (sélection établissement)
├── landing.css       ← Styles landing
├── app.js            ← Logique partagée par les deux sous-sites
├── bistrot/
│   ├── index.html    ← Site du Bistrot (thème sombre)
│   ├── style.css     ← Thème sombre, animation Art Déco dorée
│   └── config.js     ← Config Bistrot (SITE_ID, Firebase, etc.)
└── camping/
    ├── index.html    ← Site de La Guinguette (thème clair)
    ├── style.css     ← Thème estival, animation arbres feuillus
    └── config.js     ← Config Camping (SITE_ID, Firebase, etc.)
```

**Le `SITE_ID`** dans chaque `config.js` isole complètement les données :
- `bistrot_config`, `bistrot_items` dans Firestore
- `camping_config`, `camping_items` dans Firestore
- Même isolation dans le localStorage (mode local)

---

## Mise en ligne (5 minutes)

1. Créez un dépôt GitHub (public)
2. Uploadez **tous les fichiers en respectant l'arborescence** ci-dessus
3. **Settings → Pages → Source : Deploy from branch → main**
4. Votre site est live sur `https://pseudo.github.io/repo/`

> Conseil : téléchargez le `.zip` fourni, extrayez-le, puis uploadez le contenu du dossier `restaurant-menu/` à la racine du repo.

---

## Étape 1 — Connecter Firebase

Un seul projet Firebase pour les deux établissements.

### Créer le projet

1. [console.firebase.google.com](https://console.firebase.google.com) → **Créer un projet**
2. Donnez un nom → désactivez Analytics → **Créer**
3. **Build → Firestore Database → Créer** → mode test → région `europe-west3`

### Récupérer les clés

1. ⚙ **Paramètres du projet → Vos applications → icône `</>`**
2. Donnez un surnom → **Enregistrer**
3. Copiez le bloc `firebaseConfig` affiché :

```js
const firebaseConfig = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain:        "mon-projet.firebaseapp.com",
  projectId:         "mon-projet",
  storageBucket:     "mon-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abcdef1234567890"
};
```

4. Collez ces valeurs dans **`bistrot/config.js`** ET **`camping/config.js`** (identiques) :

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyXXX...",
  // ...
};
```

### Règles Firestore

**Firestore → Règles → Publier :**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## Étape 2 — Cloudinary (upload de photos par glisser-déposer)

Sans Cloudinary, vous pouvez coller des URLs d'images manuellement. Avec Cloudinary, glissez-déposez directement depuis le panneau d'édition.

1. Compte gratuit sur [cloudinary.com](https://cloudinary.com) (25 Go offerts)
2. Notez votre **Cloud name** (affiché en haut à gauche du dashboard)
3. **Settings → Upload → Upload presets → Add upload preset**
   - Nom : `menu-restau`
   - **Signing Mode : Unsigned** ← important
   - Folder : `menu` (optionnel, pour ranger les photos)
   - **Save**
4. Dans `bistrot/config.js` ET `camping/config.js` :

```js
const CLOUDINARY_CONFIG = {
  cloudName:    "mon-cloud-name",
  uploadPreset: "menu-restau",
};
```

---

## Étape 3 — Google Auth (sécuriser le mode édition)

1. Firebase Console → **Build → Authentication → Commencer**
2. **Sign-in method → Google → Activer** → email de support → **Enregistrer**
3. Dans chaque `config.js`, mettez vos adresses Gmail autorisées :

```js
const ALLOWED_EMAILS = [
  'patron@gmail.com',
  'gerant@gmail.com',
];
```

Sans Firebase configuré, la séquence ouvre le panneau directement (mode local = pas d'auth).

---

## Mode édition

Tapez **`c` `h` `e` `f`** sur le clavier (hors champ texte) sur la page d'un établissement.

- Sans Firebase → panneau s'ouvre directement
- Avec Firebase → popup Google Sign-In → vérification email → panneau

L'indice de la séquence est visible dans le footer **uniquement en mode local** (sans Firebase).

### Ce que vous pouvez modifier

| Onglet | Actions |
|--------|---------|
| **Infos** | Nom, logo (emoji ou image par glisser-déposer), accroche |
| **Menu** | Ajouter / modifier / supprimer — toggle Dispo/Indispo |
| **Bar** | Idem — Cocktails, Vins, Spiritueux/Bières, Softs |
| **Horaires** | Créneaux par jour + heure de fermeture cuisine |

**Indisponible** : l'article est grisé sur le site. Se remet à zéro automatiquement à minuit. Peut être re-coché manuellement dans la journée.

---

## Cache Firebase (lectures réduites automatiquement)

Chaque visite lit ~20 documents Firestore. Le cache intégré (5 minutes, localStorage) fait que :
- Un visiteur qui revient dans les 5 minutes → **0 lecture Firebase**
- Un visiteur qui reste sur la page → **0 lecture supplémentaire**
- En mode édition, toute modification invalide le cache immédiatement

En pratique, pour 100 visites/jour → **~50–70 lectures effectives** au lieu de 2 000. La limite gratuite de 50 000/jour reste très confortable.

---

## Personnaliser les établissements

### Changer le nom et les couleurs par défaut

Dans chaque `config.js`, modifiez `RESTAURANT_DEFAULTS` :

```js
const RESTAURANT_DEFAULTS = {
  name:    "Mon Restaurant",
  logo:    "⚜",            // emoji ou URL d'image
  tagline: "Mon accroche",
  hours:   { ... }
};
```

### Changer la séquence secrète

```js
const EDIT_SEQUENCE = ['m', 'o', 'n', 's', 'i', 't', 'e'];
```

### Ajouter un troisième établissement

1. Copiez le dossier `camping/` → `troisieme/`
2. Changez `SITE_ID = 'troisieme'` dans `config.js`
3. Adaptez `style.css` (variables de couleur en haut)
4. Ajoutez une troisième card dans `index.html` et `landing.css`

---

## Limites gratuites

| Service | Limite | Usage typique |
|---------|--------|---------------|
| GitHub Pages | Illimité | — |
| Firebase Firestore | 50 000 lectures/jour | ~1 000 visites/jour grâce au cache |
| Firebase Firestore | 20 000 écritures/jour | ~10 modifs de menu |
| Cloudinary | 25 Go stockage | 30 photos ≈ 15–30 Mo |
