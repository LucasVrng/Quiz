# Comprendre QuizCast : guide du code

Ce guide décrit le projet tel qu’il est organisé aujourd’hui. Il sert de carte pour retrouver le code à modifier, comprendre les fonctions nommées et suivre le trajet des données entre l’administration et le site public.

## Pour commencer

Si tu veux changer…

| Objectif | Fichier à ouvrir en premier |
|---|---|
| Les textes ou traductions | `js/core.js` — objets `I18N`, fonction `tr` |
| La page d’accueil, les cartes ou la fiche quiz | `js/public.js`, puis `css/public.css` et `css/themes.css` |
| Un thème public ou les couleurs du mode jeu | `css/themes.css` |
| Le contenu d’une question (texte, réponses, image) | `js/question-types.js` et `js/admin.js` |
| Le déroulement d’une partie classique | `js/play.js` — première partie du fichier |
| L’écran et les actions d’administration | `js/admin.js`, `js/admin-actions.js`, `js/events.js` |
| L’Auto Play destiné à l’enregistrement vidéo | `js/play.js` — partie Auto Play, et `css/guess.css` |
| Les animations, espacements, composants partagés | `css/base.css`; les variantes publiques sont surtout dans `css/public.css` / `css/themes.css` |
| Une adresse ou une page HTML | les fichiers `index.html` dans le dossier concerné |

Les fichiers JavaScript ne sont pas des modules ES : les pages chargent des scripts classiques dans un ordre précis. Les fonctions et objets déclarés dans un fichier sont donc réutilisés globalement par les scripts suivants.

## Comment une page s’affiche

1. Un fichier HTML choisit une vue de départ dans `window.QC_BOOT` (par exemple `publicHome`, `publicQuiz`, `play` ou `dashboard`) et définit `window.QC_ROOT`, qui sert à fabriquer les liens relatifs.
2. La page charge `core.js`, `question-types.js`, `public.js`, `admin.js`, `play.js`, `app.js`, `admin-actions.js` et enfin `events.js`. L’ordre compte : les scripts du bas utilisent les fonctions déclarées au-dessus.
3. `core.js` lit les données enregistrées et remplit l’objet global `STATE`.
4. `app.js` transforme la vue actuelle en HTML et la place dans `#app`.
5. `events.js` écoute les actions par délégation : les boutons portent un `data-action`, puis un `switch` appelle la fonction adéquate. Les éléments étant souvent recréés au rendu, cette délégation évite d’attacher un écouteur à chaque bouton.
6. Les modifications sont enregistrées par les fonctions de sauvegarde de `core.js`, puis `render()` actualise l’écran.

### Schéma rapide

```text
HTML / QC_BOOT
      ↓
core.js : STATE + stockage
      ↓
app.js : renderMain() choisit une vue
      ↓
public.js / admin.js / play.js : fonctions render…() produisent le HTML
      ↓
DOM (#app)
      ↑
events.js : data-action → fonction d’action → sauvegarde → render()
```

## Pages et points d’entrée HTML

| Fichier | Rôle / vue initiale |
|---|---|
| `index.html` | Accueil public. Définit le chemin racine et charge les scripts partagés. |
| `quizzes/index.html` | Catalogue public, avec recherche et filtres. |
| `quizzes/quiz.html?id=…` | Fiche d’un quiz ; l’identifiant est lu dans l’URL. |
| `categories/index.html` | Découverte par catégories. |
| `profile/index.html` | Profil local, historique et progression. |
| `play/index.html?id=…` | Partie publique. Charge le quiz demandé. |
| `admin/index.html` | Tableau de bord / bibliothèque d’administration. |
| `admin/editor.html?id=…` | Édition du quiz indiqué dans l’URL. |
| `admin/autoplay.html?id=…` | Préparation d’une session Auto Play. |

Les écrans publics sont des pages HTML distinctes. Les changements de page font donc une navigation normale du navigateur, puis relisent le stockage. Le panel admin garde son interface applicative à vues internes.

## État et données

`STATE` dans `js/core.js` est la mémoire de travail de l’application : quiz, catégories, réglages, vue active, quiz en cours, profil et brouillons temporaires de l’éditeur. Le rendu lit `STATE`; les fonctions d’action le modifient.

### Forme générale des données

- **Quiz** : `id`, `name`, `description`, `categoryIds`, `language`, `thumbnail`, `difficulty`, dates, `questions`. `youtubeUrl` relie facultativement la fiche au clip YouTube.
- **Question** : `id`, `type`, `text`, éventuellement `image`, `answers`, `correctAnswerId`, `explanation`, `duration`, `difficulty`, `tags`. Les questions numériques et personnage ont des champs spécialisés.
- **Réponse** : identifiant propre et texte. Les classements conservent un ordre dans `answers`.
- **Catégorie** : identifiant, nom, couleur et éventuellement `parentId`.
- **Profil** : XP, séries, statistiques, historique des parties et succès.

Le navigateur est le stockage principal : IndexedDB, avec compatibilité/migration depuis `window.storage` et l’ancien `localStorage`; une mémoire de session sert de dernier recours. Cela ne synchronise pas les quiz entre les visiteurs ou appareils. L’état temporaire d’une partie n’est pas un compte distant.

## JavaScript : rôle de chaque fichier

### `js/core.js` — fondations communes

Contient les traductions `I18N`, `STATE`, le stockage `Store`, les utilitaires, le profil, la sauvegarde/lecture, les icônes `Icons`, le traitement d’image `ImageUtil`, ainsi que le chargement initial. C’est le bon endroit pour une fonction réellement partagée par plusieurs zones.

**Traductions et stockage**

| Fonction / objet | Responsabilité |
|---|---|
| `tr(key)` | Renvoie le texte de la langue choisie, avec repli sur le français puis sur la clé. |
| `_memKey`, `browserKey` | Construisent les noms de clés de stockage privé/partagé. |
| `liveStorageAvailable`, `browserStorageAvailable`, `indexedDBAvailable` | Détectent les stockages disponibles dans ce navigateur. |
| `openQuizCastDB` | Ouvre/crée la base IndexedDB et son magasin de données. |
| `idbGet`, `idbSet`, `idbDelete`, `idbList` | Opérations de bas niveau sur IndexedDB. |
| `Store.getRaw`, `Store.setRaw`, `Store.delete`, `Store.list` | API de stockage : essaie IndexedDB, compatibilité historique, puis mémoire. |
| `Store.getJSON`, `Store.setJSON` | Adaptateurs JSON qui s’appuient sur `Store`. |

**Utilitaires et affichage**

| Fonction / objet | Responsabilité |
|---|---|
| `uid`, `nowISO` | Créent un identifiant et une date ISO. |
| `youtubeVideoId` | Extrait et valide un identifiant depuis les formats usuels d’URL YouTube. |
| `escapeHTML` | Échappe le texte avant de l’insérer dans un template HTML. À conserver pour toute donnée utilisateur. |
| `truncate`, `debounce`, `clamp` | Coupure de texte, limitation des appels répétés, bornage numérique. |
| `showToast`, `downloadJSON`, `qcRoute` | Notification, téléchargement JSON, création d’un chemin tenant compte du dossier racine. |
| `ic`, `Icons` | Produit les SVG et expose les icônes réutilisées dans les templates. |
| `cssFilterForMode`, `modeImageHTML`, `flushPendingModeImages` | Calcule et applique les effets image (normal, pixelisé, silhouette, flou) et traite les images différées. |
| `ImageUtil.loadEl`, `fileToDataURL`, `fileToDataURLPreserveAlpha`, `pixelate`, `silhouette` | Charge les images, les reduit/redimensionne, preserve la transparence et met en cache les transformations Canvas. |

**Profil et progression**

| Fonction | Responsabilité |
|---|---|
| `getProfile`, `saveProfile` | Charge et persiste le profil public local. |
| `profileLevelFromXP`, `profileLevelProgress` | Convertissent l’XP en niveau et pourcentage dans le niveau. |
| `localDateKey`, `daysBetween` | Normalisent les dates locales et calculent un écart en jours. |
| `achievementMap`, `refreshAchievements`, `achievementInfo` | Consultent, recalculent ou décrivent les succès. |
| `recordPublicResult` | Ajoute une partie terminée aux statistiques, XP, série, historique et succès. |
| `dailyQuiz` | Choisit le défi quotidien à partir des quiz disponibles et de la date. |

**Persistance et démarrage**

| Fonction | Responsabilité |
|---|---|
| `saveCategories`, `saveSettings`, `saveQuizIndex` | Écrivent les collections ou réglages correspondants. |
| `saveQuiz`, `deleteQuizStorage` | Persistance individuelle d’un quiz et suppression de sa clé. |
| `flashSavedIndicator` | Affiche brièvement l’indicateur de sauvegarde de l’éditeur. |
| `seedDemoData` | Crée des données de démonstration lorsque l’application n’a pas de contenu. |
| `loadAll` | Charge catégories, réglages, index, quiz et données demandées ; termine l’initialisation de `STATE`. |

### `js/question-types.js` — registre des questions

`QUESTION_TYPE_ORDER` ordonne les types dans l’éditeur. `QuestionTypes` décrit chaque type (`qcm`, `guess_character`, `true_false`, `ranking`, `zoom`, `number`) avec son icône, accent, libellé, fonction de création par défaut, titre de modal, champs d’édition et rendu de tuile en jeu. Pour ajouter un type, commencer ici, puis vérifier son traitement dans `play.js` et ses styles spécifiques.

- `defaultTileInner(answer, letter)` : contenu visuel commun d’une réponse à choix.
- `letterFor(idx)` : associe un index à une lettre de tuile.

### `js/public.js` — site visiteur et composants partagés

| Fonction | Responsabilité |
|---|---|
| `getQuiz`, `getCategory`, `getFilteredQuizzes` | Recherche une entrée par identifiant ou construit la liste filtrée côté bibliothèque. |
| `renderImageUploadBox`, `renderMaskEditor`, `setupMaskEditorEvents` | Composants de formulaire et interaction de sélection d’une zone à masquer dans une image. Les fonctions internes `pct`, `down`, `move`, `up` convertissent et suivent le geste pointeur. |
| `publicQuizList`, `publicDiff`, `publicCatIcon` | Sélectionne les quiz publiables, traduit la difficulté et choisit une icône de secours. |
| `renderYouTubeEpisode` | Affiche la vidéo liée à un quiz si son URL est reconnue. |
| `publicQuizCard` | Produit une carte de quiz réutilisée dans accueil, catalogue et suggestions. |
| `publicThemePicker`, `publicHeader` | Sélecteur d’apparence et en-tête de navigation publics. |
| `renderPublicHome` | Accueil : défi du jour, mise en avant, sections de découverte, statistiques. |
| `renderPublicQuizzes` | Catalogue public et ses résultats filtrés. |
| `renderPublicCategories` | Grille des catégories et compte de quiz par catégorie. |
| `renderPublicQuizDetail` | Fiche du quiz : informations, lancement, vidéo liée et quiz associés. |
| `renderPublicProfile` | Profil, progression, succès et historique récent. |
| `enterAdmin` | Navigue du public vers l’administration. |

### `js/play.js` — partie classique et Auto Play

Le haut du fichier gère une partie interactive classique. La grande partie centrale/finale configure et joue une scène Auto Play. Pour savoir à quelle zone appartient une fonction, les séparateurs de sections du fichier sont utiles.

**Partie classique**

| Fonction | Responsabilité |
|---|---|
| `quizHasGuessCharacters`, `startPlay` | Détecte la nécessité du choix de mode et initialise l’état d’une partie. |
| `renderGuessModeSetup`, `startSelectedGuessMode`, `closeGuessModeSetup` | Affiche, confirme ou ferme les options de mode pour les questions personnage. |
| `guessEffectValues`, `getGuessDisplayQuestion`, `normalizeGuess` | Calcule les effets, prépare une question adaptée au mode et normalise une réponse tapée. |
| `selectPlayAnswer`, `submitPlayRanking`, `submitPlayGuess`, `submitPlayNumber` | Valide les quatre familles de saisie et met à jour score/révélation. |
| `renderGuessNormal`, `renderRankingNormal`, `renderNumberNormal` | Rend les contrôles ou la révélation pour ces types particuliers. |
| `nextPlayQuestion`, `restartPlay`, `changeGuessMode` | Avance, recommence ou change les options du mode personnage. |
| `guessModeLabel`, `guessDifficultyLabel`, `publicScoreMessage` | Libellés visibles sur le résultat public. |
| `renderScoreScreen` | Calcule et rend le score, enregistre le résultat public et propose la suite. |
| `shareQuizResult` | Partage le résultat via l’API native, le presse-papiers ou une solution de repli. |
| `renderPlayView` | Assemble la question, les réponses, le progrès et les actions de la vue de jeu. |

**Configuration et rendu Auto Play**

| Fonction | Responsabilité |
|---|---|
| `ensureAutoplayGuessSelections` | Complète les réglages personnage manquants dans une configuration. |
| `guessEffectChoices`, `guessEffectOptions` | Fournissent les choix et les options HTML d’effets. |
| `autoplayPresets`, `getAutoplayPreset` | Définit les univers visuels et retrouve un preset par identifiant. |
| `autoplayLayoutChoices`, `autoplayQuestionTypeLabel`, `autoplayDefaultLayoutForType`, `effectiveAutoplayLayout`, `autoplayLayoutOverrideOptions`, `autoplayLayoutByTypeRows` | Décrit les mises en page, leur choix par défaut et les réglages globaux/par type. |
| `autoplayTimerChoices`, `autoplayTimerThumb`, `autoplayTimerOptions`, `autoplayTimerMarkup` | Décrit les styles, positions et aperçus du compte à rebours. |
| `autoplayLayoutThumb`, `autoplayLayoutOptions`, `autoplayLayoutClass` | Construit les aperçus et classes CSS de mise en page. |
| `autoplayBackgroundVariantChoices`, `autoplayBackgroundUrl`, `autoplayBackgroundMarkup`, `autoplayBackgroundPreviewMarkup` | Sélectionne et rend fonds intégrés, miniatures ou média personnalisé. |
| `getQuizCategoryNames`, `resolveAutoplayPreset`, `applyAutoplayPreset` | Choisit un preset automatique selon les catégories et l’applique aux réglages. |
| `autoplayTextStyleOptions` | Génère les réglages de style du texte d’écran. |
| `autoplayMediaTypeFromFile`, `autoplayExternalMediaPreview` | Reconnaît et prévisualise une image ou vidéo externe. |
| `autoplayRevealLanguage`, `autoplayCorrectLabel`, `autoplayResultLabel`, `autoplayDifficultyLabel`, `autoplayIntroWorld`, `autoplayIntroMessageOptions`, `autoplayIntroMessage` | Détermine langue, libellés et textes d’introduction/révélation. |
| `buildAutoplayQuestionMarkup` | Produit le contenu d’une question pour l’étape Auto Play. |
| `openAutoplaySetup`, `renderAutoplaySetupView` | Ouvre et dessine l’éditeur de configuration de diffusion. |
| `clearApTimers`, `shuffleArray`, `launchAutoplayStage` | Nettoie les minuteries, mélange les listes et démarre la scène. |
| `renderAutoplayIntro`, `autoplayIntroSlideMarkup`, `startAutoplayCountdown`, `runAutoplayIntroSequence` | Rend l’introduction et son compte à rebours animé. |
| `runAutoplayPhaseTimer`, `tickCountdown`, `updateCountdownDOM` | Gère le temps de réponse et actualise les compteurs. |
| `renderStageShell`, `renderQuestionIntoStage`, `getAutoplayGuessQuestion`, `populateStageContent` | Prépare la scène vidéo et insère une question à l’écran. |
| `updateRevealVisuals` | Anime la révélation des réponses selon le type de question. |
| `confettiPieces`, `renderFinishedStage` | Produit les confettis et l’écran de fin. |
| `toggleFullscreenStage`, `exitAutoplayStage`, `replayAutoplayStage` | Plein écran, sortie ou relance de la scène. |

### `js/admin.js` — rendu des écrans d’administration

| Fonction | Responsabilité |
|---|---|
| `renderSidebar`, `renderDashboard`, `renderQuizCard`, `renderLibrary` | Navigation admin, tableau de bord, carte de quiz et bibliothèque. |
| `renderNewCategoryForm`, `renderEditCategoryForm`, `renderCategories` | Formulaires et liste des catégories. |
| `renderQuestionRow`, `renderQuizEditorView` | Ligne de question et écran d’édition du quiz. |
| `setupQuestionListDnD`, `commitQuestionReorder` | Glisser-déposer et enregistrement de l’ordre des questions. |
| `openQuestionModal`, `closeQuestionModal`, `renderQuestionModal` | Cycle d’ouverture, rendu et fermeture de l’éditeur de question. |
| `updateGuessEditorPreview` | Actualise l’aperçu d’une question personnage. |
| `setupRankingEditorDnD`, `refreshRankingIndexes`, `syncRankingDraftFromDOM` | Tri de réponses de classement dans l’éditeur et synchronisation du brouillon. |
| `setupRankingPlayDnD`, `rankingOrderFromDOM` | Tri en jeu des classements et lecture de l’ordre soumis. |
| `saveQuestionFromModal`, `deleteQuestionFromModal` | Valide ou supprime la question actuellement éditée. |
| `guessCharacterNameFromFilename`, `openGuessBulkImport`, `closeGuessBulkImport`, `renderGuessBulkImportModal`, `handleGuessBulkFiles`, `confirmGuessBulkImport` | Import groupé de personnages depuis des images et création des questions associées. |

Aides locales des rendus admin : `navItem` cree un lien de barre laterale, `statCard` et `miniQuizRow` forment des blocs du tableau de bord, `countQuizzes` et `catCard` forment les cartes de categories. Les callbacks de glisser-deposer ne sont utilises que par leurs fonctions `setup…`.

### `js/admin-actions.js` — opérations sur les données

| Fonction | Responsabilité |
|---|---|
| `createNewQuiz`, `duplicateQuiz`, `doDeleteQuiz` | Créer, copier (avec nouveaux identifiants de questions/réponses) et supprimer un quiz. |
| `sanitizeFilename`, `exportSingleQuiz`, `exportAllData` | Prépare un nom de fichier et exporte un quiz ou l’ensemble des données en JSON. |
| `triggerImport`, `handleImportFile` | Ouvre le sélecteur de fichier, vérifie le JSON, recrée des identifiants et importe quiz/catégories. |
| `handleQuizThumbFile` | Lit et réduit la miniature du quiz. |
| `duplicateQuestion`, `doDeleteQuestion`, `handleQuestionImageFile` | Copie/supprime une question et traite ses images. |
| `submitNewCategory`, `startEditCategory`, `saveEditCategory`, `doDeleteCategory` | Crée, prépare, enregistre et supprime les catégories en nettoyant les liens des quiz. |
| `armConfirm` | Demande une seconde activation sur un bouton avant l’action destructive. |
| `handleLibSearchInput` | Met à jour la recherche de la bibliothèque avec rendu différé. |

### `js/app.js` et `js/events.js` — orchestration

| Fonction | Responsabilité |
|---|---|
| `currentQuiz` (`app.js`) | Renvoie le quiz actuellement sélectionné dans l’admin. |
| `renderMain` | Associe `STATE.view` à la fonction de rendu correspondante. |
| `render` | Met à jour le thème public, injecte l’écran dans `#app`, puis déclenche les effets de vue. |
| `wireViewSpecificEffects` | Réinstalle seulement les interactions DOM qui dépendent d’une vue (par ex. drag de classement). |
| `debouncedLibRender`, `debouncedPublicRender` | Temporise le rendu apres une recherche et remet le focus/caret dans son champ. |
| `onGlobalClick` | Route les clics `data-action` vers les opérations publiques, admin, jeu et Auto Play. |
| `onGlobalInput` | Met à jour les valeurs de saisie au fil de la frappe et les brouillons. |
| `onGlobalChange` | Traite les changements de sélecteurs et fichiers. |
| `initEventDelegation` | Installe une fois les écouteurs globaux `click`, `input`, `change`, `keydown`. |

Pour ajouter une interaction, cherche d’abord le `data-action` dans le template, puis ajoute/ajuste son cas dans `onGlobalClick`, `onGlobalInput` ou `onGlobalChange`. Les `data-*` relient le HTML généré au code sans écouteur par élément.

## CSS : où intervenir

Les feuilles sont chargées dans cet ordre dans les pages : `base.css` → `public.css` → `themes.css` → `guess.css`. Une règle plus bas peut remplacer une règle précédente si sa spécificité est suffisante.

| Feuille | Ce qu’elle contrôle | Quand la modifier |
|---|---|---|
| `css/base.css` | Variables globales, styles communs, admin, boutons, modales, jeu classique et éléments de scène. | Composant partagé par l’admin et/ou le jeu. Attention : certaines règles publiques réutilisent les composants communs. |
| `css/public.css` | Mise en page des pages visiteur : en-tête, accueil, grilles, cartes, fiche, profil. Le fichier contient plusieurs passes de retouches successives. | Structure ou style commun aux pages publiques. |
| `css/themes.css` | Variantes `warm`, `retro`, `pop`, `midnight`; responsive public; finitions du jeu public et couleurs de page initiales. | Couleur, coins, ombres et cohérence d’un thème à travers les pages. Le thème est porté par `data-public-theme`. |
| `css/guess.css` | Questions personnage, import groupé et configuration/scène Auto Play : presets, layouts, timer, intro, révélations. | Toute apparence propre au mode personnage ou à l’enregistrement vidéo. |

### Repères CSS utiles

- Les **tokens** sont au début de `base.css` sous `:root` (couleurs `--text`, `--panel`, etc.). Modifier un token peut impacter de nombreuses vues.
- Les classes de **page publique** commencent souvent par `public-`; les classes de **jeu classique** par `play-`; la scène vidéo utilise `stage-` / `autoplay-`; l’admin utilise notamment `sidebar`, `panel`, `editor-`.
- Pour les thèmes publics, cibler par exemple `.public-shell[data-public-theme="midnight"] .public-card`. Le jeu porte également `data-public-theme` sur `.public-play-shell`.
- Le responsive se trouve dans les blocs `@media`; la plupart des seuils publics sont autour de 760, 600 et 520 px.
- Les animations sont souvent associées à `prefers-reduced-motion`. Conserver cette règle lors de l’ajout d’un mouvement.
- Plusieurs sections de `public.css`/`themes.css` sont des couches d’override ajoutées au fil des refontes. Avant d’éditer, chercher toutes les définitions de la classe avec `rg -n "nom-de-classe" css` et privilégier une règle finale clairement nommée plutôt que modifier une copie ancienne au mauvais endroit.

## Ajouter un type de question

1. Ajouter son identifiant à `QUESTION_TYPE_ORDER` et son objet à `QuestionTypes` dans `question-types.js` : libellé, défaut, champs admin et rendu des réponses.
2. Ajouter les champs spécialisés à la sauvegarde si nécessaire (les questions sont des objets JSON et leurs champs voyagent avec elles).
3. Gérer sa saisie, validation, révélation et progression dans `play.js` (`renderPlayView` et fonctions associées).
4. Si Auto Play doit le montrer, vérifier `buildAutoplayQuestionMarkup`, `updateRevealVisuals` et le choix de layout par type.
5. Ajouter les styles dans `base.css` ou `guess.css` selon la portée.
6. Vérifier qu’import/export JSON conserve les données et qu’un ancien quiz sans les nouveaux champs garde des valeurs par défaut sûres.

## Ajouter un champ au quiz

Le formulaire du quiz se rend dans `renderQuizEditorView` (`admin.js`). Le champ doit utiliser un `data-action`, être traité par `onGlobalInput`/`onGlobalChange` (`events.js`), être écrit sur l’objet quiz et sauvegardé avec `saveQuiz`. Les exports sérialisent l’objet du quiz, ce qui conserve les nouveaux champs sans format d’export spécial.

## Vocabulaire

- **Rendu** : fonction qui fabrique une chaîne HTML à partir de l’état.
- **Vue** : valeur comme `publicQuiz` ou `quizEditor` dans `STATE.view`.
- **Brouillon** : copie temporaire dans `STATE._questionDraft` ou autre propriété `_…`, avant validation.
- **Délégation d’événements** : un écouteur au niveau du document retrouve le contrôle cliqué via `data-action`.
- **Auto Play** : scène de présentation temporisée, distincte du jeu classique ; conçue pour une capture vidéo.
- **Thème public** : apparence stockée dans `STATE.settings.publicTheme` et partagée entre les pages publiques.

## Conseils pour modifier sans se perdre

1. Chercher le texte, `data-action` ou nom de classe (`rg -n "..." js css`).
2. Remonter du template à son handler, puis à la sauvegarde, si la modification touche les données.
3. Pour le CSS, retrouver toutes les définitions de la classe avant de changer une couleur ou une taille.
4. Garder séparés les rendus public/admin et jeu/Auto Play : ils partagent des utilitaires, mais pas toujours les mêmes règles visuelles.
5. Les pages publiques reposent sur un stockage navigateur local. Un lien vers un quiz ne garantit donc pas qu’un autre appareil possède ses données.
