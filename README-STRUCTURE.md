# QuizCast — structure refactorisée

Le projet reste une application statique, mais le monolithe `index.html` a été séparé par responsabilité.

## Structure

- `index.html` — shell HTML minimal et ordre de chargement.
- `css/base.css` — tokens, composants communs, admin, modales, lecture et Auto Play.
- `css/public.css` — structure et présentation du site visiteur.
- `css/themes.css` — thèmes publics sélectionnables.
- `css/guess.css` — styles spécifiques à « Deviner le personnage ».
- `js/core.js` — i18n, stockage, état global, utilitaires, icônes et traitement d'images.
- `js/question-types.js` — registre des types de questions et leurs éditeurs.
- `js/public.js` — pages et composants publics.
- `js/admin.js` — interface de création/édition des quiz et questions.
- `js/play.js` — mode de jeu normal et Auto Play.
- `js/app.js` — dispatcher de rendu et effets de vue.
- `js/admin-actions.js` — actions CRUD/import/export de l'administration.
- `js/events.js` — délégation globale des événements.

## Pourquoi garder des scripts classiques ?

La première étape du refactor sépare les responsabilités sans transformer tout le projet en modules ES. Cela limite les risques de régression avec `window.storage`, l'état global et les handlers existants. Une migration vers des modules ES peut ensuite être faite progressivement si nécessaire.

## Silhouette

La silhouette utilise les PNG transparents : chaque pixel visible devient noir et conserve son alpha, tandis que les pixels transparents restent transparents. Aucun curseur de sensibilité n'est nécessaire.


## Guess the Character — modes publics
Un même quiz peut contenir de nombreux personnages. Lorsqu'un visiteur lance un quiz contenant des questions `guess_character`, il choisit une fois pour toute la partie : Normal, Pixelisé, Silhouette, Flouté ou Surprise. Une difficulté Facile/Normale/Difficile règle automatiquement l'intensité du pixelisé et du flou. La silhouette ne dépend d'aucun réglage.


## Guide de lecture

Pour le parcours d'exécution, les fonctions JavaScript, les types de questions et les zones CSS à modifier, voir [docs/COMPRENDRE-LE-CODE.md](docs/COMPRENDRE-LE-CODE.md).
