# StudyNet — UI/UX Reformat Inventory & Verification

Direction verrouillée : **R3 — Cahier Universitaire (Warm Analog)** — voir [`docs/STYLE.md`](STYLE.md).
Cibles d'hébergement : **Vercel** (racine `/`) et **GitHub Pages** (sous-chemin `/studynet/`, `.nojekyll` + workflow Actions).

## Inventaire complet des 22 routes

| # | Type | Fichier | État avant rebuild | État après rebuild |
| --- | --- | --- | --- | --- |
| 01 | Accueil | `index.html` | Hero sombre à halo + texte dégradé, 9 icônes arc-en-ciel, pas de mode sombre, liens avec espaces/apostrophe non encodés | Ouverture asymétrique Cahier Universitaire, marque-page « Reprendre l'étude », sommaire interactif 09 matières / 17 supports (vue Sommaire + Fiches), recherche `/` + filtres synchronisés dans l'URL, visite guidée spotlight (4 étapes), mode clair/sombre sans FOUC |
| 02 | Pôle (2 ch.) | `cours/Fondamentaux/fondamentaux-informatique.html` | Hero sombre, pas de mode sombre, liens `les chapitres/` non encodés | En-tête unifié, fil d'Ariane, progression `X/2`, sommaire réglé des 2 chapitres, accès directs Cours/Exercices/Quiz encodés, clair/sombre |
| 03 | Pôle (4 ch.) | `cours/math/mathematiques.html` | `@import` Google Fonts, titre coupé « Mathé matiques. », pas de mode sombre, liens non encodés | Titre corrigé « Mathématiques », polices locales zéro CLS, progression `X/4`, sommaire réglé des 4 chapitres, liens encodés, clair/sombre |
| 04 | Pôle (5 ch.) | `cours/web/langages-web.html` | `@import` Google Fonts, hero sombre, pas de mode sombre, liens non encodés | Polices locales, progression `X/5`, sommaire réglé des 5 chapitres (dont `.htm` et `PHP.html` respectant la casse), clair/sombre |
| 05 | Chapitre | `cours/Fondamentaux/les chapitres/Architecture-des-ordinateurs-L1TI/Architecture-des-ordinateurs-L1TI.html` | Palette isolée, `alert()` dans quiz, pas de mode sombre | Shell Cahier Universitaire, sommaire latéral répliable + tiroir mobile, quiz avec notification accessible, clair/sombre, pager |
| 06 | Chapitre | `cours/Fondamentaux/les chapitres/Representation-information-machine-L1TI/Representation-information-machine-L1TI.html` | Palette isolée, `alert()` dans quiz, pas de mode sombre | Shell Cahier Universitaire, sommaire répliable + tiroir mobile, notifications accessibles, clair/sombre, pager |
| 07 | Cours | `cours/algorithme/algorithmique.html` | Titre franglais « Mastering Algorithmique. », `alert()` (2×), couleurs codées en dur | Titre « Algorithmique », shell unifié, sommaire répliable, notifications accessibles, clair/sombre, pager |
| 08 | Cours | `cours/electricite/electricite.html` | Palette `#f58220` isolée, pas de sommaire latéral, `alert()` (2×) | Shell unifié, tiroir de sommaire auto-généré, notifications accessibles, clair/sombre, pager |
| 09 | Cours | `cours/language c/langage-c.html` | Titre « Mastering Language C. », couleurs codées en dur, pas de mode sombre | Titre « Langage C », shell unifié, sommaire répliable, clair/sombre, pager |
| 10 | Cours | `cours/language python/python.html` | Titre « Mastering Python. », couleurs codées en dur, pas de mode sombre | Titre « Programmation Python », shell unifié, sommaire répliable, clair/sombre, pager |
| 11 | Chapitre | `cours/math/les chapitres/derivabilite/derivabilite.html` | Double `<link href="style.css">`, palette isolée, pas de mode sombre | Lien CSS dédupliqué, shell unifié, navigation de chapitre harmonisée, clair/sombre, pager |
| 12 | Chapitre | `cours/math/les chapitres/developpements-limites/developpements-limites.html` | MathJax CDN sans gestion d'échec/délai, glyphes `☰✎`, pas de mode sombre | Shell unifié, état de chargement + bannière humaine avec bouton **Réessayer** si MathJax échoue/hors ligne, clair/sombre, pager |
| 13 | Chapitre | `cours/math/les chapitres/fonctions-sinusoidales/fonctions-sinusoidales.html` | Emojis `📚 ✏ 🎯 ☰`, `alert()` (2×), palette verte/orange isolée | Emojis retirés, shell unifié, notifications accessibles, modale de quiz harmonisée clair/sombre, pager |
| 14 | Chapitre | `cours/math/les chapitres/limites-continuite/limites-continuite.html` | Onglets isolés, `alert()` (1×), pas de mode sombre | Shell unifié, onglets accessibles harmonisés, notifications accessibles, clair/sombre, pager |
| 15 | Cours | `cours/systeme d'exploitation/systemes-exploitation.html` | Emojis `⚙ 🌐 👤 📁 🔌`, 29 styles inline, `alert()` (1×), pas de mode sombre | Emojis remplacés par repères typographiques propres, styles harmonisés clair/sombre, sommaire répliable, pager |
| 16 | Cours | `cours/tp math/tp-mathematiques.html` | En-tête sans `<nav>`, `alert()` (2×), pas de mode sombre | Shell unifié sémantique, sommaire répliable + tiroir mobile, notifications accessibles, clair/sombre, pager |
| 17 | Chapitre | `cours/web/les chapitres/Generalites-et-notions-de-base/Generalites-et-notions-de-base.htm` | Extension `.htm` conservée, hero isolé, pas de mode sombre | Shell unifié, onglets Cours/Exercices/Quiz harmonisés, clair/sombre, pager |
| 18 | Chapitre | `cours/web/les chapitres/JavaScript/JavaScript.html` | `alert()` (2× UI), éditeur live isolé, pas de mode sombre | Shell unifié, notifications accessibles (« Code copié »), éditeur & aperçu harmonisés clair/sombre, pager |
| 19 | Chapitre | `cours/web/les chapitres/SQL-bases-de-donnees/SQL-bases-de-donnees.html` | Fausse barre `.code-dots` à 3 points, `alert()` (1×), pas de mode sombre | `.code-dots` supprimé, shell unifié, sommaire répliable, notifications accessibles, clair/sombre, pager |
| 20 | Chapitre | `cours/web/les chapitres/html_css/html_css.html` | Image externe `picsum.photos`, 3 `href='#'` dans démo, `alert()` (2×), pas de mode sombre | Image locale `shared/demo-paysage.svg`, ancres réelles `#accueil/#projets/#contact`, atelier live préservé, clair/sombre, pager |
| 21 | Chapitre | `cours/web/les chapitres/php/PHP.html` | Onglets + sidebar isolés, `alert()` (1×), pas de mode sombre | Shell unifié, onglets & blocs PHP harmonisés clair/sombre, notifications accessibles, pager |
| 22 | Erreur 404 | `404.html` | Absente | Page 404 autonome Cahier Universitaire (clair/sombre sans FOUC, fonctionne à toute profondeur d'URL sur Vercel et GitHub Pages) |

## Composants partagés créés / mis à niveau

- `shared/tokens.css` — Tokens sémantiques R3 Cahier Universitaire (clair + `[data-theme="dark"]`), typographie, échelle 4 px, rayons, transitions, `prefers-reduced-motion`, `:focus-visible`, `::selection`, `@media print`.
- `shared/studynet-ui.css` — Barre d'étude globale, fil d'Ariane, en-tête de cours, sommaire latéral répliable & tiroir mobile, harmonisation complète clair/sombre des cours et quiz, skeletons, bannière hors ligne, carte d'erreur + bouton Réessayer, toasts accessibles, palette catalogue `Ctrl+K`, visite guidée spotlight, pager chapitre précédent/suivant et pied de page.
- `shared/studynet-ui.js` — Gestion du thème (système + bascule persistante), registre des 9 matières / 17 supports, suivi de progression local (`studynet:progress:v1`), catalogue rapide (`Ctrl+K`), tiroir & repli du sommaire, notifications `StudyNet.notify()`, gestion hors ligne & reprise MathJax, visite guidée spotlight (`studynet:onboard:v1:done`).
- `shared/hub.css` — Feuille de style mobile-first partagée par les 3 pôles (`Fondamentaux`, `Mathématiques`, `Langages Web`).
- `shared/favicon.svg` & `shared/demo-paysage.svg` — Emblème géométrique cahier ouvert et illustration SVG locale pour l'atelier HTML.
- `vercel.json`, `.nojekyll`, `.github/workflows/pages.yml`, `404.html` — Compatibilité complète Vercel + GitHub Pages.
