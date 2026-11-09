# QuizCast

Site de quiz statique et studio Auto Play pour préparer des vidéos YouTube 16:9. Le site public accompagne [GumwinSarball](https://www.youtube.com/@GumwinSarball). Sans dépendance applicative, backend ou clé API.

## Démarrer

```sh
cd /workspace/Quiz
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir la racine pour le public, `/admin/` pour créer, `/quizzes/` pour explorer. `quizcast.html` reste un ancien point d’entrée compatible. Servir en HTTP : ouvrir directement un fichier avec `file://` ne permet pas de charger le catalogue.

## Ce qui est inclus

- 34 quiz, 540 questions : 13 nouvelles séries originales (260 questions), 20 séries françaises préexistantes (260 questions) et un quiz Nintendo anglais préexistant (20 questions).
- QCM, vrai/faux, réponse libre avec synonymes, personnage mystère, zoom, estimation numérique et classement.
- Admin guidé, formats de départ, ajout groupé depuis un tableur ou du texte, import/export JSON, réorganisation par boutons ou glisser-déposer.
- Studio : aperçu du rendu, neuf styles (huit explicites et sélection automatique), trois nouveaux univers Pop Studio / Grand jeu / Clair & net ; durées fixes ou par question, disposition par type et par question, sons synthétisés facultatifs, accroche, intermèdes, pause/reprise et fiche de production.
- Accueil public, catalogue filtrable par catégorie et langue, profil local, score, lien vers la chaîne et association d’un épisode YouTube à un quiz.

**Auto Play joue une scène à enregistrer avec OBS. Il ne fabrique ni MP4, ni voix, ni publication YouTube.** Aucun changement de la chaîne ou du site en ligne n’est effectué par le développement local.

## Créer et enregistrer un épisode

1. Dans l’admin, choisir une collection ou « Nouveau quiz ». Les modèles ouvrent une première question à rédiger, sans créer de fausses questions préremplies.
2. « Ajouter en lot » accepte une question par ligne, colonnes séparées par `|` ou tabulation. Ex. `Capitale du Canada ? | Ottawa | Toronto | Montréal | Vancouver`. Les autres formats proposés précisent leurs colonnes dans la fenêtre. Un lot invalide n’ajoute aucune ligne.
3. Relire les réponses, les explications et les sources. Les questions intégrées sont du contenu éditorial à vérifier avant diffusion, pas une base factuelle certifiée. Emojis et devinettes peuvent admettre plusieurs interprétations.
4. Cliquer « Auto Play », choisir le rythme puis l’habillage. L’aperçu utilise le rendu réel ; il fige les animations. Les réglages sont conservés par quiz sur cet appareil. Les médias importés comme fond sont propres à la session et doivent être sélectionnés à nouveau après fermeture.
5. Lancer une répétition. Espace : pause/reprise ; flèches : changer de question ; Échap : fermer. Le plein écran vise uniquement la scène. Hors plein écran, les commandes de répétition apparaissent au survol du bas ; cadrer **uniquement la scène** dans OBS.
6. Enregistrer en 1920 × 1080. Pour les sons, vérifier que la capture audio d’OBS inclut le navigateur ; le téléchargement de la fiche de production ne contient pas de piste audio. Couper les notifications et essayer le premier et le dernier écran avant la prise.
7. Renseigner l’URL de l’épisode dans l’éditeur une fois la vidéo publiée manuellement.

## Catalogue partagé et créations locales

`data/catalog.json` est livré à tous les visiteurs. IndexedDB stocke les créations, les modifications, le profil et les réglages de ce navigateur. Les sauvegardes locales ont priorité sur la version intégrée. Supprimer un quiz intégré le masque localement ; il reste dans le catalogue pour les autres visiteurs. Il n’y a ni compte distant ni synchronisation entre appareils. Exporter régulièrement et utiliser l’import JSON pour échanger avec un autre ordinateur. Un import crée de nouveaux identifiants et ne remplace pas un quiz existant.

Éditer une fiche dans l’admin **ne publie pas** cette modification à tous. La publication actuelle consiste à mettre à jour le fichier du catalogue dans le dépôt puis à déployer le site statique. La refonte conserve les anciens quiz stockés dans IndexedDB.

Le catalogue est généré par :

```sh
python3 scripts/build-catalog.py
```

Ce script relit les packs historiques et les nouvelles séries éditoriales, normalise leurs identifiants, produit les couvertures SVG originales et le catalogue. Le préfixe de miniature `COVER_ROOT/` est résolu au chargement pour fonctionner aussi sous un sous-dossier. Ne pas régénérer sans conserver les modifications éditoriales apportées directement au JSON : reporter les changements dans les entrées du générateur.

## Vérifier

Python 3, Node et Playwright/Chromium sont disponibles dans l’environnement cloud préparé. Pour une autre machine, installer Playwright et Chromium via les mécanismes officiels, puis définir `CHROMIUM_PATH` si nécessaire.

```sh
for f in js/*.js; do node --check "$f" || exit; done
node --test tests/browser.test.cjs
```

Le test démarre son propre serveur local sur 8765. Il vérifie catalogue, routes, création et persistance, sept types, réglages, déroulé temporel de la scène, isolation des navigateurs, import invalide et affichage mobile. Aucun appel YouTube n’est nécessaire. Pas de build ou dépendance externe à charger pour jouer.

## Organisation

- `js/core.js` : stockage, chargement du catalogue et outils communs.
- `js/question-types.js` : registre des sept formats.
- `js/studio.js` : parcours créateur, modèles, validation, aperçu, options vidéo, import groupé, sons et contrôles.
- `js/play.js` : jeu interactif, composition de la scène et moteur des phases.
- `js/admin.js`, `js/admin-actions.js`, `js/events.js` : écrans, sauvegardes et interactions.
- `css/studio.css` : administration claire, scène avec dimensions relatives à son cadre, responsive et réglages d’accessibilité liés au mouvement.
- `scripts/build-catalog.py`, `data/catalog.json`, `assets/covers/` : contenu livré avec le site.

Voir [la stratégie de lancement](docs/STRATEGIE-YOUTUBE.md) et [le tableau de suivi](docs/SUIVI-EPISODES.csv). L’architecture utilise encore des scripts classiques partagés ; une migration vers des modules et une base distante devra faire l’objet d’une étape distincte si le besoin est confirmé.
