# Style — StudyNet

```text
DIRECTION:       R3 — Cahier Universitaire (Warm Analog, shifted for StudyNet; selected by user)
ANCESTOR:        Polycopié universitaire tunisien (L1 TI) & cahier de cours cousu à marge terracotta
PALETTE (LIGHT): paper #FAF7F1 · surface #FFFDF9 · sunken #F2EDE3 · ink #231E19 · ink-2 #4A433B
                 mute #675F55 · rule #DFD8CA · rule-strong #C6BCAE · ui-border #8E8478
                 accent #A63E1C · accent-hover #8C3214 · accent-soft #F8ECE6 · sage #4E6347
PALETTE (DARK):  paper #151210 · surface #1D1916 · sunken #100E0C · ink #F1ECE2 · ink-2 #CEC6B9
                 mute #A69D90 · rule #2F2924 · rule-strong #433B34 · ui-border #786E63
                 accent #E58560 · accent-hover #F09A78 · accent-soft #2A1C16 · sage #96B58B
ACCENT JOBS:     primary CTA, notebook margin thread, active tab/section marker, focus ring, progress bar (~5% surface)
TYPE:            display = "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif (weight 400, -0.018em)
                 body    = "Avenir Next",Avenir,"Segoe UI",system-ui,-apple-system,sans-serif (16.5px / 1.65)
                 mono    = ui-monospace,SFMono-Regular,Menlo,Consolas,monospace (code, formulas, tabular indices only)
SCALE:           56 / 34 / 22 / 16.5 / 14 / 12 (fluid via clamp(); hierarchy survives greyscale)
LAYOUT:          Mobile-first (320px -> 640px -> 1024px -> 1280px); asymmetric left-aligned editorial grid;
                 collapsible notebook margin sidebar on course readers; 68ch max prose measure
RADIUS:          4px (small tags/code), 6px (buttons/inputs/sheets), 8px (dialogs). Never pill cards or 20px tiles.
SHADOW:          None on flat containers (1px warm rules define structure). Soft low-opacity shadow on modals/drawers only.
SIGNATURE:       (1) Interactive numbered L1 TI "Sommaire du Polycopié" (01–09 + 17 direct chapter rows & local study status)
                 (2) Vertical terracotta cahier margin rule + organic hand-drawn ink divider + open-cahier SVG emblem
BANNED:          gradient text · radial hero glows · emoji icons · pure #000/#fff · cold greys · rainbow icon cards ·
                 centred body copy · fake 3-dot terminal chrome · eyebrow pills · flat drop shadows · window.alert() ·
                 placeholder/lorem/invented stats (e.g. "∞ Possibilités")
REJECTED:        1) R2 Affiche Polytechnique (vélin #F8F9FB + noir #0C0D10 + outremer #1847D6, 0px, grotesk 900) —
                    rejeté car trop froid et brutaliste pour de longues séances de lecture de cours et d'exercices.
                 2) R4 Manuel Technique / Datasheet (gris #F4F5F3 + graphite #101314 + ambre #A85808, 3px, mono display) —
                    rejeté car les titres tout-monospace conviennent au code mais manquent de chaleur pour l'analyse mathématique.
                 (R1 Paper & Ink #F5F3EE/#C4340B et AgencyOS #F7F7F5/#14624F exclus d'office par la règle anti-répétition.)
```

## Justification de chaque couleur (dérivée de l'ancêtre)

| Token | Clair | Sombre | Dérivation physique & contraste WCAG 2.2 AA |
| --- | --- | --- | --- |
| `--sn-paper` | `#FAF7F1` | `#151210` | Papier craie non blanchi d'un polycopié universitaire (décalé de `#FBFAF7`) / bureau d'étude en bois sombre le soir. |
| `--sn-surface` | `#FFFDF9` | `#1D1916` | Feuillet intérieur de cahier légèrement plus lumineux (jamais blanc pur `#FFFFFF`) / page sombre posée au-dessus du bureau. |
| `--sn-sunken` | `#F2EDE3` | `#100E0C` | Marge d'index et cartouche de référence teinté parchemin / encoche sombre pour blocs secondaires. |
| `--sn-ink` | `#231E19` | `#F1ECE2` | Encre sépia-fusain de stylo (15.45:1 sur paper) / craie chaude lisible sans éblouissement (15.84:1 sur paper). |
| `--sn-ink-2` | `#4A433B` | `#CEC6B9` | Encre d'annotation courante pour paragraphes d'explication (9.10:1 clair / 10.31:1 sombre). |
| `--sn-mute` | `#675F55` | `#A69D90` | Notes de marge, numéros de chapitre et légendes (5.87:1 clair / 6.52:1 sombre — passe AA partout). |
| `--sn-rule` | `#DFD8CA` | `#2F2924` | Réglure fine de cahier séparant les sections sans ombres portées. |
| `--sn-ui-border` | `#8E8478` | `#786E63` | Filet de champ de saisie et contrôle interactif (3.61:1 clair / 3.50:1 sombre — passe AA 3:1 UI). |
| `--sn-accent` | `#A63E1C` | `#E58560` | Filet de marge terracotta cuite & tampon d'université (5.90:1 sur paper, 6.21:1 avec texte `#FFFDF9`; 6.98:1 en sombre). |
| `--sn-sage` | `#4E6347` | `#96B58B` | Encre vert-olivier discrète réservée au repère « cours étudié » (5.78:1 clair / 7.13:1 sombre). |
| `--sn-success` | `#27633F` | `#6EC491` | Validation d'une bonne réponse de quiz (6.29:1 sur `#E9F3EC` / 7.59:1 sur `#15251C`, toujours accompagnée de texte). |
| `--sn-warning` | `#8A5610` | `#E5AE5C` | Remarque méthodologique ou mode hors ligne (5.52:1 sur `#FBF2E1` / 8.23:1 sur `#271E11`). |
| `--sn-danger` | `#A32929` | `#EE8484` | Réponse incorrecte ou erreur de chargement (6.26:1 sur `#FBEBEB` / 6.75:1 sur `#2A1616`). |
| `--sn-code-bg` | `#1E1A16` | `#0F0D0B` | Encrier brun-noir chaud pour extraits C, Python, SQL, PHP, JS, Octave et Bash (14.71:1 / 16.47:1). |

## Trois règles strictes

1. **Aucune décoration artificielle :** zéro dégradé de texte, zéro halo radial, zéro fausse fenêtre de terminal à trois points, zéro ombre sur surface plane, zéro emoji d'interface.
2. **Hiérarchie par l'échelle et la réglure :** titres en serif léger (graisse 400), corps sans-serif fluide limité à `68ch`, chiffres tabulaires (`tabular-nums`), filets fins de 1 px et filet de marge terracotta.
3. **Un seul système du sommaire au dernier quiz :** les 22 pages (accueil, 3 pôles de matières, 17 cours/chapitres, page 404) partagent les mêmes tokens clair/sombre sans FOUC, la même barre d'étude, le même catalogue rapide (`Ctrl+K`) et des chemins relatifs encodés compatibles Vercel et GitHub Pages.
