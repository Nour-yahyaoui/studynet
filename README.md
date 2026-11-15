# StudyNet — Cahier universitaire L1 TI

Plateforme éducative francophone dédiée aux étudiants de **Licence 1 Technologies de l'Information (L1 TI)** : **9 matières** et **17 supports complets** réunissant cours structurés, exercices et projets corrigés, éditeurs interactifs et quiz d'évaluation.

## Matières et supports inclus

| N° | Matière | Supports |
| --- | --- | --- |
| `01` | **Électricité & Arduino Uno** | Cours complet, projets guidés et quiz |
| `02` | **Mathématiques — Analyse** | 4 chapitres : *Limites et continuité*, *Dérivabilité*, *Fonctions trigonométriques*, *Développements limités* |
| `03` | **Algorithmique** | 24 modules en pseudo-code, 35 exercices corrigés et quiz |
| `04` | **Systèmes d'exploitation & Linux** | Cours ECUEF132, commandes shell, exercices et quiz |
| `05` | **Programmation Python** | 20 modules, 40 exercices corrigés et quiz |
| `06` | **Fondamentaux de l'informatique** | 2 chapitres : *Architecture des ordinateurs*, *Représentation de l'information en machine* |
| `07` | **TP Mathématiques — GNU Octave** | 17 chapitres Octave, 20 travaux pratiques corrigés et quiz |
| `08` | **Langages & Développement Web** | 5 chapitres : *Généralités du Web*, *HTML & CSS* (atelier interactif), *PHP & MySQLi*, *Bases de données & SQL*, *JavaScript* |
| `09` | **Langage C** | 25 modules, 30 exercices corrigés et quiz |

## Système visuel et expérience d'étude

StudyNet adopte la direction éditoriale **Cahier Universitaire (Warm Analog)** documentée dans [`docs/STYLE.md`](docs/STYLE.md) :

- **Tokens CSS centralisés** (`shared/tokens.css`) : papier chaud `#FAF7F1`, encre sépia `#231E19`, accent terre cuite `#A63E1C` et mode sombre espresso `#151210` vérifiés selon les seuils de contraste **WCAG 2.2 AA**.
- **Thème clair / sombre sans flash (no-FOUC)** : respect automatique de `prefers-color-scheme` et mémorisation du choix dans `localStorage` (`studynet:theme`).
- **Navigation unifiée sur les 22 pages** (`shared/studynet-ui.css`, `shared/studynet-ui.js`) : fil d'Ariane, catalogue rapide des 17 supports (`Ctrl+K` / `⌘K`), sommaire latéral repliable sur ordinateur, tiroir mobile accessible, pagination chapitre précédent / suivant et impression soignée (`@media print`).
- **Suivi local des révisions** : marque-page de reprise et compteur de supports étudiés enregistrés uniquement dans le navigateur (`studynet:progress:v1`), sans compte ni pistage.
- **Visite guidée facultative** : découverte en 4 étapes non bloquante, ignorable dès la première seconde et relançable depuis l'en-tête.

## Architecture du dépôt

```text
studynet/
├── index.html                 # Couverture et sommaire interactif des 9 matières
├── 404.html                   # Page d'erreur autonome (Vercel & GitHub Pages)
├── style.css                  # Styles mobile-first de la page d'accueil
├── script.js                  # Recherche, filtres synchronisés à l'URL et marque-page
├── shared/
│   ├── tokens.css             # Source unique des tokens couleur, typographie et espace
│   ├── studynet-ui.css        # Barre globale, tiroir, palette Ctrl+K, thème de cours
│   ├── studynet-ui.js         # Thème, progression locale, catalogue, visite guidée, toasts
│   ├── hub.css                # Mise en page partagée des portails multi-chapitres
│   ├── favicon.svg            # Icône géométrique de cahier ouvert
│   └── demo-paysage.svg       # Illustration locale pour l'atelier HTML & CSS
├── cours/                     # 3 portails multi-chapitres + 17 cours complets
├── docs/                      # Documentation du système de design et rapport d'audit UI
├── .nojekyll                  # Compatibilité directe GitHub Pages sans Jekyll
├── .github/workflows/pages.yml # Déploiement automatique GitHub Pages sur main
└── vercel.json                # Configuration statique Vercel (sans étape de build)
```

## Lancer le projet en local

Aucune dépendance ni étape de compilation n'est requise. Sers simplement la racine du dépôt avec n'importe quel serveur HTTP statique :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000` dans ton navigateur.

## Déploiement (Vercel & GitHub Pages)

Tous les liens internes sont relatifs, respectent la casse exacte des fichiers Linux et encodent les espaces et apostrophes (`%20`, `%27`), ce qui garantit un fonctionnement identique à la racine d'un domaine comme sous un sous-chemin `/studynet/`.
- **GitHub Pages** : dans *Settings → Pages*, choisir **GitHub Actions** (workflow `.github/workflows/pages.yml` déclenché à chaque fusion sur `main`) ou **Deploy from a branch** (`main` / `/ (root)`, pris en charge grâce à `.nojekyll`).

## Auteur

Réalisé par **Mohamed Ali Sablaoui** — © StudyNet.
