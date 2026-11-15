# StudyNet — Rapport de refonte globale UI/UX & compatibilité de déploiement

**Date :** 2026-11-15  
**Direction retenue :** `R3 — Cahier Universitaire (Warm Analog)` (voir [`docs/STYLE.md`](STYLE.md))  
**Inventaire des routes :** [`docs/UI-REFORMAT-INVENTORY.md`](UI-REFORMAT-INVENTORY.md)

---

## 1. Synthèse avant / après

| Axe | Avant | Après |
| --- | --- | --- |
| **Identité visuelle** | Accueil et 3 portails sombres génériques (`#0a0a0c`, lueurs radiales, texte dégradé bleu→cyan, icônes émojis, 3 cartes identiques, statistique vague `« ∞ »`) + 17 cours aux en-têtes disparates. | Système cohérent **Cahier Universitaire** sur les **22 pages** : papier chaud `#FAF7F1`, encre sépia `#231E19`, filets `1px` `#DFD8CA`, accent terre cuite `#A63E1C`, séparation organique SVG, sommaire numéroté `01`–`09` avec sous-chapitres directs, icône SVG géométrique de cahier ouvert, zéro texte dégradé, zéro lueur radiale, zéro ombre plate, zéro émoji d'interface. |
| **Tokens & mode sombre** | Couleurs hexadécimales dispersées dans 21 feuilles `style.css` et 33 attributs `style=""` en ligne ; pas de bascule de thème. | Source unique `shared/tokens.css` (`--sn-*`) + mappage complet des variables héritées + script bloquant `<head>` anti-FOUC (`studynet:theme`), respect de `prefers-color-scheme`, mode sombre espresso `#151210` / encre `#F1ECE2` / accent `#E58560`, 0 fond clair codé en dur hors `:root`. |
| **Navigation & parcours d'étude** | En-têtes hétérogènes, pas de recherche globale depuis les cours, pas de suivi de lecture ni de lien chapitre suivant/précédent. | `header.sn-topbar` unifié sur les 22 pages : fil d'Ariane, accès rapide aux parties du cours (avec synchronisation d'onglets `#exercices`/`#projects`/`#quiz`), palette `Ctrl+K` / `⌘K` des 17 supports, sommaire latéral repliable sur bureau (`studynet:sidebar:collapsed`), tiroir mobile avec piège de focus, pagination précédent/suivant et marque-page local (`studynet:progress:v1`). |
| **Onboarding & états** | Aucun accompagnement de première visite ; 18 appels bloquants `window.alert()` ; 4 `console.log()` de débogage ; image externe `picsum.photos` ; 3 liens morts `href="#"`. | Bandeau facultatif de première visite + visite guidée en 4 étapes (`role="dialog"`, progression `« X sur 4 »`, Précédent / Suivant / Ignorer / Terminer, `Échap`, retour du focus, relançable, respect de `prefers-reduced-motion`) ; 18/18 `alert()` remplacés par `StudyNet.notify()` (`aria-live`) ; 0 `console.log()` ; confirmation en ligne avant réinitialisation de la progression ; bandeau hors-ligne et carte d'erreur MathJax avec bouton `Réessayer` ; SVG local `shared/demo-paysage.svg` ; 0 `href="#"`. |
| **Accessibilité & responsive** | Contrôles d'éditeur non reliés à leur `<label>`, titres franglais (`Mastering Python.`, `Python Programming`), feuilles CSS desktop-first. | Mobile-first `min-width` dès `320px`, cibles tactiles `≥ 44×44px`, zoom utilisateur libre, lien d'évitement `#main-content` en premier élément sur les 22 pages, un seul `<h1>` par page, 0 champ sans `<label>`/`aria-label`, `:focus-visible` `2px`, `tabular-nums`, tableaux défilables horizontalement, `@media print` propre. |
| **Vercel & GitHub Pages** | Pas de `vercel.json`, pas de `.nojekyll`, pas de workflow Pages, pas de `404.html`. | `vercel.json` statique (`cleanUrls: false`, `trailingSlash: false`, en-têtes sûrs + `Content-Type` explicite pour `.htm`), `.nojekyll`, `.github/workflows/pages.yml`, et `404.html` autonome compatible racine (`/`) et sous-chemin GitHub Pages (`/studynet/`). |

---

## 2. Vérifications exécutées

- **Contraste WCAG 2.2 AA :** 35/35 couples texte/fond et bordures d'interface vérifiés par calcul de luminance relative en thème clair (`5.87:1` à `15.45:1` pour le texte ; `6.21:1` sur bouton primaire ; `3.61:1` sur `--sn-ui-border`) et en thème sombre (`6.52:1` à `15.84:1` pour le texte ; `6.98:1` sur bouton primaire ; `3.50:1` sur `--sn-ui-border`).
- **Intégrité des 22 routes et 696 liens/ancres/ressources :** 0 lien cassé, 0 erreur de casse Linux (`Fondamentaux`, `JavaScript`, `PHP.html`, `SQL-bases-de-donnees`), 0 espace ou apostrophe non encodé (`%20`, `%27`), 0 ancre `#id` introuvable, correspondance exacte `17/17` entre `CATALOGUE` et `[data-sn-course]`.
- **Qualité HTML / CSS / JS :** `node --check` validé sur 19/19 fichiers `.js` et les scripts en ligne de `Generalites-et-notions-de-base.htm` ; 0 `alert()` d'interface ; 0 `console.log()` d'exécution ; 0 champ de formulaire sans étiquette ; 100 % des contenus de cours, éditeurs HTML/CSS, corrigés et banques de quiz conservés.
- **Test HTTP local & production :** 28/28 routes et ressources partagées testées en `HTTP 200 OK` (`text/html`, `text/css`, `text/javascript`, `image/svg+xml`), complétées par un test des URL de production Vercel après déploiement.
- **Note transparente sur l'environnement :** l'environnement d'exécution ne disposant pas de navigateur headless (Playwright/Chromium), les contrôles ont été réalisés par analyse DOM/CSS/JS automatisée, calcul mathématique de contraste WCAG, serveur d'aperçu en direct et requêtes HTTP réelles sur le déploiement de production.
