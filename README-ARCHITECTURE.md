# QuizCast — architecture publique et studio

L’application reste statique, avec des pages publiques distinctes et une administration à vues internes. Les scripts classiques sont chargés dans l’ordre déclaré dans chaque HTML. Aucun backend, service tiers ou processus de build n’est nécessaire.

## Données

`js/core.js` charge en parallèle le catalogue `data/catalog.json` et le stockage du navigateur. Les quiz du catalogue sont la base commune à tous les visiteurs ; une sauvegarde locale portant le même identifiant la remplace pour ce navigateur. Les créations locales s’ajoutent à la base. Les suppressions de contenu intégré sont conservées dans des listes locales de masquage.

IndexedDB est le stockage principal. Les anciennes données `window.storage` et `localStorage` restent compatibles. Aucun transfert automatique vers un autre utilisateur ou appareil n’a lieu. L’import crée de nouveaux identifiants ; l’export permet de sauvegarder et d’échanger les créations. Modifier l’admin ne modifie pas le fichier du catalogue livré aux visiteurs.

## Routes

- `/` : accueil (`index.html` désormais présent).
- `/quizcast.html` : accueil historique compatible.
- `/quizzes/`, `/quizzes/quiz.html?id=…`, `/categories/`, `/profile/`, `/play/?id=…` : expérience publique.
- `/admin/` : espace créateur, bibliothèque, collections et catégories.
- `/admin/editor.html?id=…` : édition.
- `/admin/autoplay.html?id=…` : studio vidéo.

## Studio vidéo

`js/studio.js` gère les parcours créateur, les modèles, la validation, les réglages sauvegardés, l’aperçu, l’import en lot et les commandes. `js/play.js` compose les questions et pilote les phases : intro, réflexion, révélation, pause entre questions, intermède, fin. Le temporisateur est annulable et peut être suspendu. Le même cadre est conservé pendant la lecture pour garder le plein écran.

La scène utilise des unités relatives à son conteneur, pour conserver la composition entre l’aperçu et la capture. Les commandes sont placées en dehors de la scène à capturer. Le téléchargement de la fiche de production est du texte ; la vidéo doit être enregistrée avec OBS ou un outil comparable.

## Limites à conserver en tête

Les modules partagent encore l’état global `STATE` et le rendu recrée les vues. La refonte n’introduit pas une bibliothèque de composants ni une base distante. Un futur travail de collaboration synchronisée doit prévoir authentification admin, API, stockage des médias, sauvegardes et publication explicite. L’admin actuel ne donne accès qu’aux modifications locales du navigateur.

Les tests navigateur sont décrits dans [README.md](README.md). La décision commerciale et le plan d’expérimentation sont dans [docs/STRATEGIE-YOUTUBE.md](docs/STRATEGIE-YOUTUBE.md).
