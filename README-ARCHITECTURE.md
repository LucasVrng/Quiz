# QuizCast — Architecture publique/admin

Le projet utilise maintenant une architecture hybride :

- **Public** : pages HTML distinctes et URL dédiées.
- **Admin** : interface applicative conservée comme SPA pour éviter de casser les outils d'édition.
- **Données** : le stockage actuel reste local (`window.storage`). Cela signifie que les URLs de quiz sont partageables comme pages, mais les quiz ne sont pas encore synchronisés entre appareils/utilisateurs. Un backend sera nécessaire pour une vraie plateforme publique multi-utilisateurs.

## Pages publiques

- `/` — accueil
- `/quizzes/` — catalogue
- `/quizzes/quiz.html?id=...` — détail d'un quiz
- `/categories/` — catégories
- `/profile/` — profil et progression
- `/play/?id=...` — jeu

## Administration

- `/admin/` — dashboard/admin
- `/admin/editor.html?id=...` — éditeur d’un quiz
- `/admin/autoplay.html?id=...` — configuration Auto Play

Les fichiers restent volontairement simples pour cette première étape. Les fonctions communes sont encore chargées depuis `js/`, mais les points d'entrée HTML sont désormais séparés afin de pouvoir extraire progressivement `profile.js`, `storage.js`, `editor.js`, etc. sans refaire toute l'application d'un coup.
