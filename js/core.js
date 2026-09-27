/* ============================================================
   0. I18N
   ============================================================ */
const I18N = {
fr:{
  app_name:'QuizCast',
  public_nav_home:'Accueil', public_nav_quizzes:'Quiz', public_nav_categories:'Catégories', public_nav_random:'Quiz aléatoire', public_admin:'Admin',
  public_kicker:'Des quiz. Du fun. À toi de jouer.', public_hero_title:'Teste tes connaissances.<br><span>Montre ce que tu sais.</span>', public_hero_sub:'Découvre des quiz sur le gaming, les films, la culture, Internet et bien plus. Choisis un quiz et lance-toi.', public_play_random:'Jouer à un quiz aléatoire', public_browse:'Explorer les quiz', public_popular:'Quiz populaires', public_new:'Nouveaux quiz', public_categories:'Explorer par catégorie', public_see_all:'Tout voir', public_no_quizzes:'Aucun quiz disponible pour le moment.', public_questions:'questions', public_question:'question', public_play:'Jouer', public_quizzes_found:'quiz', public_back:'Retour', public_start:'Commencer le quiz', public_about:'À propos de ce quiz', public_related:'Tu pourrais aussi aimer', public_category_count:'quiz', public_footer:'QuizCast — joue, découvre, recommence.',
  nav_dashboard:'Tableau de bord', nav_library:'Bibliothèque', nav_categories:'Catégories',
  sidebar_new_quiz:'Nouveau quiz',
  storage_note:'Sauvegarde automatique dans cet artefact.',
  storage_note_offline:'⚠ Mode local : non sauvegardé après fermeture. Utilise cet artefact dans Claude.ai pour la sauvegarde auto.',
  dash_title:'Tableau de bord', dash_sub:"Vue d'ensemble de ta plateforme de quiz",
  stat_quizzes:'Quiz', stat_questions:'Questions', stat_categories:'Catégories', stat_fr:'Quiz FR', stat_en:'Quiz EN',
  recent_created:'Créés récemment', recent_updated:'Modifiés récemment', quick_actions:'Actions rapides',
  action_new_quiz:'Créer un quiz', action_library:'Voir la bibliothèque', action_categories:'Gérer les catégories',
  see_all:'Tout voir',
  empty_dash_title:"C'est calme par ici", empty_dash:"Crée ton premier quiz pour voir tes statistiques apparaître.",
  library_title:'Bibliothèque', library_sub:'Tous tes quiz, prêts à jouer ou à enregistrer',
  search_ph:'Rechercher un quiz…',
  filter_all_cat:'Toutes les catégories', filter_all_diff:'Toutes difficultés', filter_all_lang:'Toutes langues',
  sort_updated:'Modifié récemment', sort_created:'Créé récemment', sort_name:'Nom (A-Z)', sort_qcount:'Nb. de questions',
  btn_export_all:'Exporter tout', btn_import:'Importer un JSON',
  q_count:'questions', q_count_1:'question',
  empty_library_title:'Aucun quiz trouvé', empty_library:'Essaie un autre filtre, ou crée un nouveau quiz.',
  btn_play:'Jouer', btn_autoplay:'Auto Play', btn_edit:'Modifier', btn_duplicate:'Dupliquer', btn_delete:'Supprimer', btn_export:'Exporter',
  diff_facile:'Facile', diff_moyen:'Moyen', diff_difficile:'Difficile',
  cat_title:'Catégories', cat_sub:'Organise tes quiz par thème',
  cat_new:'Nouvelle catégorie', cat_name_ph:'Nom de la catégorie', cat_parent:'Catégorie parente (optionnel)',
  cat_none_parent:'— Aucune (catégorie principale) —',
  cat_add:'Ajouter', cat_empty_title:'Aucune catégorie', cat_empty:'Crée ta première catégorie ci-dessus.',
  confirm_delete_cat:'Supprimer cette catégorie ? Elle sera retirée des quiz qui l\'utilisent.',
  editor_new_title:'Nouveau quiz', editor_edit_title:'Modifier le quiz',
  field_name:'Nom du quiz', field_name_ph:'Ex : Culture Nintendo #1',
  field_desc:'Description', field_desc_ph:'Une courte description de ce quiz…',
  field_categories:'Catégories', field_language:'Langue du contenu', field_difficulty:'Difficulté générale',
  field_thumbnail:'Miniature', thumb_upload_hint:'Cliquer pour importer une image', youtube_video_url:'Vidéo YouTube associée', youtube_video_help:'Colle l’URL de la vidéo YouTube liée à cet épisode.', youtube_linked_title:'La vidéo de ce quiz', youtube_linked_copy:'Regarde l’épisode, puis reviens tenter le quiz.', youtube_home_title:'Joue au quiz, puis regarde l’épisode', youtube_home_copy:'Un quiz de la chaîne à essayer en attendant la prochaine vidéo.', youtube_score_title:'Prolonge le quiz en vidéo', youtube_score_copy:'Regarde l’épisode associé et compare tes réponses.', youtube_watch:'Regarder sur YouTube', share_score:'Partager mon score', share_copied:'Lien du quiz copié!',
  back_to_library:'Retour à la bibliothèque',
  questions_title:'Questions', add_question:'Ajouter une question',
  qtype_qcm:'QCM classique', qtype_qcm_desc:'Question à choix multiple',
  qtype_character:'Deviner un personnage', qtype_character_desc:'Image à révéler progressivement',
  qtype_true_false:'Vrai / Faux', qtype_true_false_desc:'Deux réponses fixes',
  qtype_ranking:'Classement', qtype_ranking_desc:'Remettre les éléments dans le bon ordre',
  qtype_zoom:'Zoom progressif', qtype_zoom_desc:'Deviner une image qui se révèle progressivement',
  qtype_number:'Deviner le nombre', qtype_number_desc:'Trouver une valeur précise sur une échelle',
  empty_questions_title:'Aucune question', empty_questions:'Ajoute ta première question pour commencer à construire ce quiz.',
  duration_short:'s', preview_quiz:'Aperçu', launch_autoplay:'Lancer Auto Play',
  saved_indicator:'Enregistré',
  confirm_delete_question:'Supprimer cette question ?',
  confirm_delete_quiz:'Supprimer définitivement ce quiz ?',
  modal_new_qcm:'Nouvelle question QCM', modal_edit_qcm:'Modifier la question QCM',
  modal_new_character:'Nouvelle question — Deviner un personnage', modal_edit_character:'Modifier — Deviner un personnage',
  modal_new_true_false:'Nouvelle question — Vrai / Faux', modal_edit_true_false:'Modifier — Vrai / Faux',
  modal_new_ranking:'Nouvelle question — Classement', modal_edit_ranking:'Modifier — Classement',
  modal_new_zoom:'Nouvelle question — Zoom progressif', modal_edit_zoom:'Modifier — Zoom progressif',
  modal_new_number:'Nouvelle question — Deviner le nombre', modal_edit_number:'Modifier — Deviner le nombre',
  field_question_text:'Texte de la question', field_question_text_ph:'Quelle est la question ?',
  field_illustration:'Image d\'illustration (optionnel)',
  field_character_image:'Image du personnage', field_expected_answer:'Réponse attendue', field_answers:'Réponses proposées', field_answer_ph:'Réponse…',
  add_answer:'Ajouter une réponse', remove_answer:'Retirer',
  ranking_criterion:'Critère de classement', ranking_criterion_ph:'Ex : du plus ancien au plus récent',
  ranking_items:'Éléments à classer', ranking_drag_hint:'Glisse les éléments pour définir l’ordre correct.',
  zoom_start:'Niveau de zoom initial', zoom_start_hint:'L’image commencera très zoomée puis se dévoilera pendant le compte à rebours.',
  field_number_value:'Valeur correcte', field_number_min:'Minimum', field_number_max:'Maximum', field_number_step:'Pas', field_number_unit:'Unité (optionnel)',
  number_hint:'La valeur doit être trouvée précisément. La barre affichera la position correcte lors de la révélation.',
  validate_order:'Valider l’ordre', submit_number:'Valider', ranking_correct:'Ordre correct !', ranking_wrong:'Ordre incorrect', number_correct:'Bonne valeur !', number_wrong:'Valeur incorrecte',
  number_reveal:'Valeur correcte :', zoom_reveal:'Révélation',
  mark_correct_hint:'Coche la bonne réponse',
  field_explanation:'Explication (optionnel)', field_explanation_ph:'Affichée après la réponse…',
  field_duration:'Durée de la question', field_difficulty_q:'Difficulté',
  field_image_mode:'Effet sur l\'image', field_tags:'Tags (séparés par une virgule)',
  mode_normal:'Normale', mode_silhouette:'Silhouette', mode_pixelated:'Pixelisée', mode_blurred:'Floutée',
  mode_masked:'Zone masquée',
  mask_hint:'Clique-glisse sur l\'image pour dessiner la zone à masquer.', guess_answer_ph:'Entre ta réponse…', submit_guess:'Valider', guess_correct_answer:'Réponse correcte', guess_your_answer:'Ta réponse',
  blur_amount:'Intensité du flou', darken_amount:'Intensité de l\'assombrissement',
  cancel:'Annuler', save:'Enregistrer', delete:'Supprimer', close:'Fermer',
  upload_image_hint:'Cliquer pour importer une image', replace_image:'Remplacer', remove_image:'Retirer',
  play_of:'sur',
  answer_correct:'Bonne réponse !', answer_wrong:'Mauvaise réponse',
  next_question:'Question suivante', see_results:'Voir les résultats',
  score_title:'Quiz terminé !', score_sub_pre:'Tu as obtenu', score_sub_post:'bonnes réponses', public_score_percent:'de réussite', public_score_message_high:'Excellent résultat. Tu maîtrises vraiment ce quiz.', public_score_message_mid:'Bien joué. Encore quelques bonnes réponses et tu seras au top.', public_score_message_low:'Pas mal pour une première tentative. Tu peux rejouer et faire mieux.', public_exit_quiz:'Quitter le quiz', public_replay:'Rejouer le quiz', public_next_random:'Quiz aléatoire', public_more_like:'Tu pourrais aussi aimer', public_question_progress:'Question', public_correct_short:'correctes',
  restart:'Rejouer', back_library_btn:'Retour à la bibliothèque',
  autoplay_setup_title:'Configurer Auto Play', autoplay_setup_sub:'Pensé pour l\'enregistrement de vidéos YouTube (OBS)',
  timing_title:'Timing', response_time:'Temps de réponse', reveal_duration:'Durée d\'affichage de la réponse',
  next_delay:'Délai avant la question suivante',
  shuffle_title:'Aléatoire', shuffle_questions:'Mélanger les questions', shuffle_answers:'Mélanger les réponses',
  start_quiz:'Démarrer le quiz', exit_stage:'Quitter', fullscreen_hint:'Plein écran recommandé pour l\'enregistrement',
  toggle_fullscreen:'Plein écran',
  stage_end_title:'Quiz terminé', stage_end_sub:'questions diffusées',
  stage_thanks:'Merci d\u2019avoir regardé !',
  stage_replay:'Rejouer', stage_exit_lib:'Retour',
  toast_saved:'Enregistré', toast_cat_added:'Catégorie ajoutée', toast_cat_deleted:'Catégorie supprimée',
  toast_quiz_deleted:'Quiz supprimé', toast_quiz_duplicated:'Quiz dupliqué', toast_exported:'Export téléchargé',
  toast_imported:'Import réussi', toast_import_error:'Fichier JSON invalide',
  toast_question_deleted:'Question supprimée',
  yes_delete:'Oui, supprimer',
  new_category_name_ph:'Ex : Pokémon',
  demo_badge:'Exemple',
  answers_count:'Nombre de réponses', true_label:'Vrai', false_label:'Faux', true_false_hint:'Deux réponses fixes : Vrai et Faux. Définis simplement laquelle est correcte.',
},
en:{
  app_name:'QuizCast',
  public_nav_home:'Home', public_nav_quizzes:'Quizzes', public_nav_categories:'Categories', public_nav_random:'Random Quiz', public_admin:'Admin',
  public_kicker:'Quizzes. Fun. Your turn.', public_hero_title:'Test your knowledge.<br><span>Show what you know.</span>', public_hero_sub:'Discover quizzes about gaming, movies, trivia, the internet and more. Pick a quiz and start playing.', public_play_random:'Play a random quiz', public_browse:'Explore quizzes', public_popular:'Popular quizzes', public_new:'New quizzes', public_categories:'Explore by category', public_see_all:'See all', public_no_quizzes:'No quizzes available yet.', public_questions:'questions', public_question:'question', public_play:'Play', public_quizzes_found:'quizzes', public_back:'Back', public_start:'Start quiz', public_about:'About this quiz', public_related:'You might also like', public_category_count:'quizzes', public_footer:'QuizCast — play, discover, repeat.',
  nav_dashboard:'Dashboard', nav_library:'Library', nav_categories:'Categories',
  sidebar_new_quiz:'New quiz',
  storage_note:'Auto-saved inside this artifact.',
  storage_note_offline:'⚠ Local mode: not saved after closing. Use this artifact inside Claude.ai for autosave.',
  dash_title:'Dashboard', dash_sub:'An overview of your quiz platform',
  stat_quizzes:'Quizzes', stat_questions:'Questions', stat_categories:'Categories', stat_fr:'FR quizzes', stat_en:'EN quizzes',
  recent_created:'Recently created', recent_updated:'Recently updated', quick_actions:'Quick actions',
  action_new_quiz:'Create a quiz', action_library:'Browse the library', action_categories:'Manage categories',
  see_all:'See all',
  empty_dash_title:'Nice and quiet in here', empty_dash:'Create your first quiz to see your stats show up.',
  library_title:'Library', library_sub:'All your quizzes, ready to play or record',
  search_ph:'Search a quiz…',
  filter_all_cat:'All categories', filter_all_diff:'All difficulties', filter_all_lang:'All languages',
  sort_updated:'Recently updated', sort_created:'Recently created', sort_name:'Name (A-Z)', sort_qcount:'Question count',
  btn_export_all:'Export all', btn_import:'Import a JSON',
  q_count:'questions', q_count_1:'question',
  empty_library_title:'No quiz found', empty_library:'Try another filter, or create a new quiz.',
  btn_play:'Play', btn_autoplay:'Auto Play', btn_edit:'Edit', btn_duplicate:'Duplicate', btn_delete:'Delete', btn_export:'Export',
  diff_facile:'Easy', diff_moyen:'Medium', diff_difficile:'Hard',
  cat_title:'Categories', cat_sub:'Organize your quizzes by topic',
  cat_new:'New category', cat_name_ph:'Category name', cat_parent:'Parent category (optional)',
  cat_none_parent:'— None (top-level category) —',
  cat_add:'Add', cat_empty_title:'No categories yet', cat_empty:'Create your first category above.',
  confirm_delete_cat:'Delete this category? It will be removed from any quiz using it.',
  editor_new_title:'New quiz', editor_edit_title:'Edit quiz',
  field_name:'Quiz name', field_name_ph:'E.g. Nintendo Trivia #1',
  field_desc:'Description', field_desc_ph:'A short description of this quiz…',
  field_categories:'Categories', field_language:'Content language', field_difficulty:'Overall difficulty',
  field_thumbnail:'Thumbnail', thumb_upload_hint:'Click to upload an image', youtube_video_url:'Linked YouTube video', youtube_video_help:'Paste the YouTube URL for the video related to this episode.', youtube_linked_title:'The video for this quiz', youtube_linked_copy:'Watch the episode, then come back and try the quiz.', youtube_home_title:'Play the quiz, then watch the episode', youtube_home_copy:'Try a quiz from the channel while you wait for the next video.', youtube_score_title:'Keep the quiz going with the video', youtube_score_copy:'Watch the related episode and compare your answers.', youtube_watch:'Watch on YouTube', share_score:'Share my score', share_copied:'Quiz link copied!',
  back_to_library:'Back to library',
  questions_title:'Questions', add_question:'Add a question',
  qtype_qcm:'Classic MCQ', qtype_qcm_desc:'Multiple-choice question',
  qtype_character:'Guess the character', qtype_character_desc:'Image revealed progressively',
  qtype_true_false:'True / False', qtype_true_false_desc:'Two fixed answers',
  qtype_ranking:'Ranking', qtype_ranking_desc:'Put the items in the correct order',
  qtype_zoom:'Progressive zoom', qtype_zoom_desc:'Guess an image as it progressively reveals',
  qtype_number:'Guess the number', qtype_number_desc:'Find an exact value on a scale',
  empty_questions_title:'No questions yet', empty_questions:'Add your first question to start building this quiz.',
  duration_short:'s', preview_quiz:'Preview', launch_autoplay:'Launch Auto Play',
  saved_indicator:'Saved',
  confirm_delete_question:'Delete this question?',
  confirm_delete_quiz:'Permanently delete this quiz?',
  modal_new_qcm:'New MCQ question', modal_edit_qcm:'Edit MCQ question',
  modal_new_character:'New question — Guess the character', modal_edit_character:'Edit — Guess the character',
  modal_new_true_false:'New question — True / False', modal_edit_true_false:'Edit — True / False',
  modal_new_ranking:'New question — Ranking', modal_edit_ranking:'Edit — Ranking',
  modal_new_zoom:'New question — Progressive zoom', modal_edit_zoom:'Edit — Progressive zoom',
  modal_new_number:'New question — Guess the number', modal_edit_number:'Edit — Guess the number',
  field_question_text:'Question text', field_question_text_ph:"What's the question?",
  field_illustration:'Illustration image (optional)',
  field_character_image:'Character image', field_expected_answer:'Expected answer', field_answers:'Answer options', field_answer_ph:'Answer…',
  add_answer:'Add an answer', remove_answer:'Remove',
  ranking_criterion:'Ranking criterion', ranking_criterion_ph:'E.g. oldest to newest',
  ranking_items:'Items to rank', ranking_drag_hint:'Drag the items to define the correct order.',
  zoom_start:'Initial zoom level', zoom_start_hint:'The image starts highly zoomed in and reveals itself during the countdown.',
  field_number_value:'Correct value', field_number_min:'Minimum', field_number_max:'Maximum', field_number_step:'Step', field_number_unit:'Unit (optional)',
  number_hint:'The value must be found exactly. The scale shows the correct position on reveal.',
  validate_order:'Validate order', submit_number:'Submit', ranking_correct:'Correct order!', ranking_wrong:'Incorrect order', number_correct:'Correct value!', number_wrong:'Incorrect value',
  number_reveal:'Correct value:', zoom_reveal:'Reveal',
  mark_correct_hint:'Check the correct answer',
  field_explanation:'Explanation (optional)', field_explanation_ph:'Shown after the answer…',
  field_duration:'Question duration', field_difficulty_q:'Difficulty',
  field_image_mode:'Image effect', field_tags:'Tags (comma-separated)',
  mode_normal:'Normal', mode_silhouette:'Silhouette', mode_pixelated:'Pixelated', mode_blurred:'Blurred',
  mode_masked:'Masked area',
  mask_hint:'Click and drag on the image to draw the area to hide.',
  blur_amount:'Blur intensity', darken_amount:'Darkening intensity', guess_answer_ph:'Type your answer…', submit_guess:'Submit', guess_correct_answer:'Correct answer', guess_your_answer:'Your answer',
  cancel:'Cancel', save:'Save', delete:'Delete', close:'Close',
  upload_image_hint:'Click to upload an image', replace_image:'Replace', remove_image:'Remove',
  play_of:'of',
  answer_correct:'Correct answer!', answer_wrong:'Wrong answer',
  next_question:'Next question', see_results:'See results',
  score_title:'Quiz complete!', score_sub_pre:'You got', score_sub_post:'correct answers', public_score_percent:'success rate', public_score_message_high:'Excellent result. You really know this quiz.', public_score_message_mid:'Nice work. A few more correct answers and you will be at the top.', public_score_message_low:'Not bad for a first try. Replay it and see if you can improve.', public_exit_quiz:'Leave quiz', public_replay:'Replay quiz', public_next_random:'Random quiz', public_more_like:'You might also like', public_question_progress:'Question', public_correct_short:'correct',
  restart:'Play again', back_library_btn:'Back to library',
  autoplay_setup_title:'Configure Auto Play', autoplay_setup_sub:'Built for recording YouTube videos (OBS)',
  timing_title:'Timing', response_time:'Response time', reveal_duration:'Answer reveal duration',
  next_delay:'Delay before next question',
  shuffle_title:'Shuffle', shuffle_questions:'Shuffle questions', shuffle_answers:'Shuffle answers',
  start_quiz:'Start the quiz', exit_stage:'Exit', fullscreen_hint:'Fullscreen recommended for recording',
  toggle_fullscreen:'Fullscreen',
  stage_end_title:'Quiz complete', stage_end_sub:'questions aired',
  stage_thanks:'Thanks for watching!',
  stage_replay:'Play again', stage_exit_lib:'Back',
  toast_saved:'Saved', toast_cat_added:'Category added', toast_cat_deleted:'Category deleted',
  toast_quiz_deleted:'Quiz deleted', toast_quiz_duplicated:'Quiz duplicated', toast_exported:'Export downloaded',
  toast_imported:'Import successful', toast_import_error:'Invalid JSON file',
  toast_question_deleted:'Question deleted',
  yes_delete:'Yes, delete',
  new_category_name_ph:'E.g. Pokémon',
  demo_badge:'Sample',
  answers_count:'Number of answers', true_label:'True', false_label:'False', true_false_hint:'Two fixed answers: True and False. Simply mark which one is correct.',
}
};
function tr(key){
  const lang = STATE.settings.uiLanguage || 'fr';
  return (I18N[lang] && I18N[lang][key]) || I18N.fr[key] || key;
}

/* ============================================================
   1. STORAGE LAYER
   ============================================================ */
const _memStore = new Map();

/*
 * Browser persistence
 * -------------------
 * QuizCast stores quiz images as data URLs, so localStorage is too small for
 * anything beyond a handful of lightweight quizzes. IndexedDB is therefore
 * the primary browser backend. localStorage is kept only as a compatibility
 * fallback for old installations and tiny datasets.
 */
const QC_DB_NAME = 'quizcast-db';
const QC_DB_VERSION = 1;
const QC_DB_STORE = 'kv';
let _idbPromise = null;

function _memKey(key,shared){ return (shared?'S:':'P:')+key; }
function liveStorageAvailable(){ return !!(window.storage && typeof window.storage.get==='function'); }
function browserStorageAvailable(){
  try { return typeof window !== 'undefined' && !!window.localStorage; }
  catch(e){ return false; }
}
function browserKey(key,shared){ return 'quizcast:'+_memKey(key,shared); }

function indexedDBAvailable(){
  try { return typeof window !== 'undefined' && !!window.indexedDB; }
  catch(e){ return false; }
}
function openQuizCastDB(){
  if(!indexedDBAvailable()) return Promise.resolve(null);
  if(_idbPromise) return _idbPromise;
  _idbPromise = new Promise((resolve,reject)=>{
    const req = window.indexedDB.open(QC_DB_NAME, QC_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(QC_DB_STORE)) db.createObjectStore(QC_DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB unavailable'));
  }).catch(err=>{ _idbPromise=null; console.warn('IndexedDB unavailable',err); return null; });
  return _idbPromise;
}
async function idbGet(key, shared=false){
  const db=await openQuizCastDB(); if(!db) return null;
  return new Promise(resolve=>{
    const req=db.transaction(QC_DB_STORE,'readonly').objectStore(QC_DB_STORE).get(_memKey(key,shared));
    req.onsuccess=()=>resolve(req.result==null?null:req.result);
    req.onerror=()=>resolve(null);
  });
}
async function idbSet(key,value,shared=false){
  const db=await openQuizCastDB(); if(!db) return false;
  return new Promise(resolve=>{
    const tx=db.transaction(QC_DB_STORE,'readwrite');
    tx.objectStore(QC_DB_STORE).put(value,_memKey(key,shared));
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>resolve(false);
    tx.onabort=()=>resolve(false);
  });
}
async function idbDelete(key,shared=false){
  const db=await openQuizCastDB(); if(!db) return false;
  return new Promise(resolve=>{
    const tx=db.transaction(QC_DB_STORE,'readwrite');
    tx.objectStore(QC_DB_STORE).delete(_memKey(key,shared));
    tx.oncomplete=()=>resolve(true);
    tx.onerror=()=>resolve(false);
    tx.onabort=()=>resolve(false);
  });
}
async function idbList(prefix='',shared=false){
  const db=await openQuizCastDB(); if(!db) return null;
  const wanted=_memKey(prefix,shared);
  return new Promise(resolve=>{
    const out=[];
    const req=db.transaction(QC_DB_STORE,'readonly').objectStore(QC_DB_STORE).openCursor();
    req.onsuccess=()=>{
      const cur=req.result;
      if(!cur){ resolve(out); return; }
      const key=String(cur.key);
      if(key.startsWith(wanted)) out.push(key.slice(2));
      cur.continue();
    };
    req.onerror=()=>resolve(null);
  });
}

const Store = {
  async getRaw(key, shared=false){
    // 1) IndexedDB — persistent and suitable for large quiz data / images.
    const idbValue=await idbGet(key,shared);
    if(idbValue !== null) return idbValue;

    // 2) Existing window.storage data. Migrate it to IndexedDB when possible.
    if(liveStorageAvailable()){
      try{
        const r = await window.storage.get(key, shared);
        if(r && r.value != null){
          await idbSet(key,r.value,shared);
          return r.value;
        }
      } catch(e){ console.warn('window.storage get failed', key, e); }
    }

    // 3) Old localStorage data. Migrate it to IndexedDB when possible.
    if(browserStorageAvailable()){
      try {
        const value=window.localStorage.getItem(browserKey(key,shared));
        if(value !== null){
          await idbSet(key,value,shared);
          return value;
        }
      } catch(e){ console.warn('localStorage get failed', key, e); }
    }

    const k=_memKey(key,shared);
    return _memStore.has(k) ? _memStore.get(k) : null;
  },
  async setRaw(key, value, shared=false){
    // Never prefer localStorage: large quizzes with embedded images can exceed
    // its quota even though the browser still has plenty of IndexedDB space.
    if(await idbSet(key,value,shared)) return {key,value,shared,browser:'indexeddb'};

    // Compatibility backend for environments where IndexedDB is unavailable.
    if(liveStorageAvailable()){
      try{ await window.storage.set(key,value,shared); return {key,value,shared,browser:'window.storage'}; }
      catch(e){ console.warn('window.storage set failed', key, e); }
    }

    if(browserStorageAvailable()){
      try { window.localStorage.setItem(browserKey(key,shared), value); return {key,value,shared,browser:'localStorage'}; }
      catch(e){ console.warn('localStorage set failed', key, e); }
    }

    // Memory is deliberately last: do not pretend this is durable storage.
    // The app can still continue during this page session, but a navigation
    // cannot be expected to preserve data without one of the backends above.
    _memStore.set(_memKey(key,shared), value);
    return {key,value,shared,browser:'memory'};
  },
  async delete(key, shared=false){
    await idbDelete(key,shared);
    if(liveStorageAvailable()){
      try{ await window.storage.delete(key, shared); }catch(e){ console.warn('window.storage delete failed', key, e); }
    }
    if(browserStorageAvailable()){
      try{ window.localStorage.removeItem(browserKey(key,shared)); }catch(e){ console.warn('localStorage delete failed', key, e); }
    }
    _memStore.delete(_memKey(key,shared));
    return {key, deleted:true, shared};
  },
  async list(prefix, shared=false){
    const found = new Set();

    // IndexedDB is authoritative for new data.
    const idbKeys=await idbList(prefix,shared);
    if(idbKeys) idbKeys.forEach(k=>found.add(k));

    // Also discover old data from legacy backends so it can be migrated.
    if(liveStorageAvailable()){
      try{
        const r = await window.storage.list(prefix, shared);
        if(r && Array.isArray(r.keys)) r.keys.forEach(k=>found.add(k));
      }catch(e){ console.warn('window.storage list failed', prefix, e); }
    }
    if(browserStorageAvailable()){
      try{
        const prefixKey=browserKey(prefix||'',shared), basePrefix='quizcast:'+(shared?'S:':'P:');
        for(let i=0;i<window.localStorage.length;i++){
          const key=window.localStorage.key(i);
          if(key && key.startsWith(prefixKey)) found.add(key.slice(basePrefix.length));
        }
      }catch(e){ console.warn('localStorage list failed', prefix, e); }
    }

    const pre=_memKey(prefix||'',shared);
    for(const k of _memStore.keys()) if(k.startsWith(pre)) found.add(k.slice(2));
    return [...found];
  },
  async getJSON(key){
    const raw = await Store.getRaw(key);
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null; }
  },
  async setJSON(key, obj){
    return Store.setRaw(key, JSON.stringify(obj));
  }
};

/* ============================================================
   2. UTILS
   ============================================================ */
function uid(){ return 'id_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function nowISO(){ return new Date().toISOString(); }
function youtubeVideoId(input){
  let url; try{url=new URL(String(input||''));}catch(e){return '';}
  const host=url.hostname.toLowerCase().replace(/^www\./,''); let id='';
  if(host==='youtu.be') id=url.pathname.split('/').filter(Boolean)[0]||'';
  else if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)) id=url.searchParams.get('v')||url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]||'';
  return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';
}
function escapeHTML(str){
  if(str===undefined||str===null) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function truncate(str,n){ if(!str) return ''; return str.length>n ? str.slice(0,n-1)+'…' : str; }
function debounce(fn, ms){
  let t; return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), ms); };
}
function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function showToast(msg, type='ok'){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<span class="toast-dot"></span>' + escapeHTML(msg);
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s'; el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 2200);
}
function downloadJSON(obj, filename){
  const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}


function qcRoute(path=''){
  const root = window.QC_ROOT || './';
  return root + String(path).replace(/^\/+/, '');
}

/* ============================================================
   3. APP STATE
   ============================================================ */
const STATE = {
  categories: [],
  quizzes: [],
  settings: { uiLanguage:'fr', publicTheme:'warm' },
  view: window.QC_BOOT?.view || 'publicHome',
  publicMode: window.QC_BOOT?.publicMode ?? true,
  publicQuizId: window.QC_BOOT?.publicQuizId || null,
  publicSearch: window.QC_BOOT?.publicSearch || '',
  publicCategoryFilter: window.QC_BOOT?.publicCategoryFilter || '',
  currentQuizId: window.QC_BOOT?.currentQuizId || null,
  publicProfile: null,
  currentQuizId: null,
  library: { search:'', category:'', difficulty:'', language:'', sort:'updatedDesc' },
  play: null,      // {quizId, order:[idx...], pos, selectedId, revealed, score}
  autoplay: null,  // engine state, see AUTOPLAY section
  ready:false,
};

/* ============================================================
   4.5 PUBLIC PROFILE / PROGRESSION
   ============================================================ */
const DEFAULT_PROFILE = {
  xp:0, level:1, totalPlays:0, totalQuestions:0, correctAnswers:0,
  perfectQuizzes:0, guessCharacters:0, dailyCompletions:0, lastPlayDate:null,
  streak:0, bestStreak:0, history:[], achievements:[]
};
async function getProfile(){ return (await Store.getJSON('app:profile')) || {...DEFAULT_PROFILE,history:[],achievements:[]}; }
async function saveProfile(profile){ await Store.setJSON('app:profile', profile); STATE.publicProfile=profile; }
function profileLevelFromXP(xp){ return Math.max(1, Math.floor(Math.max(0,xp)/500)+1); }
function profileLevelProgress(xp){ const level=profileLevelFromXP(xp); const base=(level-1)*500; return Math.round(((xp-base)/500)*100); }
function localDateKey(d=new Date()){ const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; }
function daysBetween(a,b){ return Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000); }
const ACHIEVEMENTS = [
  ['first_play','Premier quiz','Terminer ton premier quiz'],
  ['five_plays','Curieux','Terminer 5 quiz'],
  ['ten_plays','Habitué','Terminer 10 quiz'],
  ['perfect','Sans faute','Obtenir 100 % sur un quiz'],
  ['hundred_questions','Centenaire','Répondre à 100 questions'],
  ['character_hunter','Chasseur de personnages','Reconnaître 25 personnages'],
  ['daily','Rituel quotidien','Terminer ton premier Quiz du jour'],
  ['streak_3','Petite série','Jouer 3 jours de suite'],
  ['streak_7','Une semaine','Jouer 7 jours de suite']
];
function achievementMap(profile){ return new Set(profile.achievements||[]); }
function refreshAchievements(profile){
  const unlocked=achievementMap(profile);
  const rules={
    first_play:profile.totalPlays>=1, five_plays:profile.totalPlays>=5, ten_plays:profile.totalPlays>=10,
    perfect:profile.perfectQuizzes>=1, hundred_questions:profile.totalQuestions>=100, character_hunter:profile.guessCharacters>=25,
    daily:profile.dailyCompletions>=1, streak_3:profile.bestStreak>=3, streak_7:profile.bestStreak>=7
  };
  Object.entries(rules).forEach(([id,ok])=>{if(ok)unlocked.add(id);});
  profile.achievements=[...unlocked]; return profile;
}
function achievementInfo(id){ return ACHIEVEMENTS.find(a=>a[0]===id); }
async function recordPublicResult(quiz,p){
  if(!quiz || !p || p._profileRecorded) return;
  p._profileRecorded=true;
  const profile=await getProfile();
  const today=localDateKey();
  const previous=profile.lastPlayDate;
  if(previous!==today){
    if(previous && daysBetween(previous,today)===1) profile.streak=(profile.streak||0)+1;
    else profile.streak=1;
    profile.bestStreak=Math.max(profile.bestStreak||0,profile.streak);
    profile.lastPlayDate=today;
  }
  const total=p.order?.length||0, correct=p.correctCount||0;
  const xp=100 + correct*20 + (correct===total?100:0);
  profile.xp=(profile.xp||0)+xp; profile.level=profileLevelFromXP(profile.xp);
  profile.totalPlays++; profile.totalQuestions+=total; profile.correctAnswers+=correct;
  if(total>0 && correct===total) profile.perfectQuizzes++;
  const guesses=quiz.questions?.filter((q,i)=>q.type==='guess_character' && p.order?.includes(i)).length||0;
  profile.guessCharacters+=guesses;
  if(p.isDailyQuiz) profile.dailyCompletions=(profile.dailyCompletions||0)+1;
  refreshAchievements(profile);
  profile.history=[{quizId:quiz.id,quizName:quiz.name,date:nowISO(),correct,total,pct:total?Math.round(correct/total*100):0,xp,guessMode:p.guessMode||null},...(profile.history||[])].slice(0,20);
  await saveProfile(profile);
}
function dailyQuiz(){
  const list=publicQuizList(); if(!list.length)return null;
  const key=localDateKey(); let hash=0; for(const c of key) hash=((hash*31)+c.charCodeAt(0))>>>0;
  return list[hash%list.length];
}

/* ============================================================
   4. PERSISTENCE HELPERS
   ============================================================ */
async function saveCategories(){ await Store.setJSON('app:categories', STATE.categories); }
async function saveSettings(){ await Store.setJSON('app:settings', STATE.settings); }
async function saveQuizIndex(){
  const ids = [...new Set((STATE.quizzes||[]).map(q=>q&&q.id).filter(Boolean))];
  await Store.setJSON('app:quiz-index', ids);
}
async function saveQuiz(quiz){
  quiz.updatedAt = nowISO();
  await Store.setJSON('quiz:'+quiz.id, quiz);
  await saveQuizIndex();
}
async function deleteQuizStorage(id){
  await Store.delete('quiz:'+id);
  await saveQuizIndex();
}

const autosaveQuiz = debounce(async (quiz)=>{
  await saveQuiz(quiz);
  flashSavedIndicator();
}, 500);

function flashSavedIndicator(){
  const el = document.getElementById('saved-indicator');
  if(!el) return;
  el.style.opacity='1';
  clearTimeout(flashSavedIndicator._t);
  flashSavedIndicator._t = setTimeout(()=>{ if(el) el.style.opacity='0'; }, 1400);
}

/* ============================================================
   5. SEED DEMO DATA (first run only)
   ============================================================ */
function seedDemoData(){
  const catGames = { id: uid(), name:'Jeux vidéo', color:'#7c5cfc', parentId:null };
  const catNintendo = { id: uid(), name:'Nintendo', color:'#ff5d6c', parentId: catGames.id };
  const catGeneral = { id: uid(), name:'Culture générale', color:'#2fd8c9', parentId:null };
  STATE.categories = [catGames, catNintendo, catGeneral];

  const demoQuiz = {
    id: uid(), name:'Culture Nintendo — Exemple', description:"Un quiz de démonstration pour découvrir les différents types de questions.",
    categoryIds:[catNintendo.id], language:'fr', thumbnail:null, difficulty:'moyen',
    createdAt: nowISO(), updatedAt: nowISO(), isDemo:true,
    questions:[
      {
        id: uid(), type:'qcm', text:'Quel est le premier jeu vidéo de Mario ?', image:null,
        answers:[{id:uid(),text:'Donkey Kong'},{id:uid(),text:'Super Mario Bros.'},{id:uid(),text:'Mario Bros.'},{id:uid(),text:'Super Mario World'}],
        correctAnswerId:null, explanation:"Mario apparaît pour la première fois dans Donkey Kong (1981), avant d'avoir son propre jeu.",
        duration:10, difficulty:'facile', tags:['mario','nintendo']
      },
      {
        id: uid(), type:'qcm', text:'Combien y a-t-il de générations de Pokémon (au 29 août 2026) ?', image:null,
        answers:[{id:uid(),text:'7'},{id:uid(),text:'8'},{id:uid(),text:'9'},{id:uid(),text:'10'}],
        correctAnswerId:null, explanation:'La 9e génération a débuté avec Pokémon Écarlate et Violet.',
        duration:10, difficulty:'moyen', tags:['pokemon']
      }
    ]
  };
  demoQuiz.questions[0].correctAnswerId = demoQuiz.questions[0].answers[1].id;
  demoQuiz.questions[1].correctAnswerId = demoQuiz.questions[1].answers[2].id;
  STATE.quizzes = [demoQuiz];
}

/* ============================================================
   6. INIT / LOAD
   ============================================================ */
async function loadAll(){
  const requestedQuizId = window.QC_BOOT?.publicQuizId || window.QC_BOOT?.currentQuizId || null;
  const [cats, settings, quizKeys, quizIndex, requestedQuiz] = await Promise.all([
    Store.getJSON('app:categories'),
    Store.getJSON('app:settings'),
    Store.list('quiz:'),
    Store.getJSON('app:quiz-index'),
    requestedQuizId ? Store.getJSON('quiz:'+requestedQuizId) : Promise.resolve(null)
  ]);
  STATE.categories = cats || [];
  STATE.settings = settings || { uiLanguage:'fr', publicTheme:'warm' };

  const byId = new Map();
  const allQuizIds = new Set((quizKeys||[]).filter(Boolean));
  for(const id of Array.isArray(quizIndex)?quizIndex:[]){ if(id) allQuizIds.add('quiz:'+id); }
  for(const k of allQuizIds){
    const q = await Store.getJSON(k);
    if(q && q.id) byId.set(q.id,q);
  }
  // A dedicated quiz page can recover its quiz directly from quiz:<id>, even if
  // the storage backend cannot enumerate all quiz keys correctly.
  if(requestedQuiz && requestedQuiz.id) byId.set(requestedQuiz.id, requestedQuiz);
  STATE.quizzes = [...byId.values()];

  if(STATE.categories.length===0 && STATE.quizzes.length===0){
    seedDemoData();
    await saveCategories();
    for(const q of STATE.quizzes) await saveQuiz(q);
    await saveQuizIndex();
  }
  // The page may have loaded a quiz directly even though it was absent from the
  // enumerated list. Keep the requested ID as the active public/current quiz.
  if(window.QC_BOOT?.publicQuizId) STATE.publicQuizId = window.QC_BOOT.publicQuizId;
  if(window.QC_BOOT?.currentQuizId) STATE.currentQuizId = window.QC_BOOT.currentQuizId;
  STATE.ready = true;
  if(window.QC_BOOT?.view==='publicProfile') getProfile().then(p=>{STATE.publicProfile=p; render();});
  else if(window.QC_BOOT?.view==='play' && window.QC_BOOT?.publicQuizId) startPlay(window.QC_BOOT.publicQuizId,'publicQuiz');
  else if(window.QC_BOOT?.view==='autoplaySetup' && window.QC_BOOT?.currentQuizId) openAutoplaySetup(window.QC_BOOT.currentQuizId);
  else render();
}

document.addEventListener('DOMContentLoaded', ()=>{ initEventDelegation(); loadAll(); });
/* ============================================================
   7. ICONS (hand-rolled, stroke-based, consistent set)
   ============================================================ */
function ic(inner, size=18, cls=''){
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
const Icons = {
  home:(s,c)=>ic('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',s,c),
  library:(s,c)=>ic('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',s,c),
  tag:(s,c)=>ic('<path d="M20.6 13.4L11 3.8a2 2 0 0 0-1.4-.6H4a1 1 0 0 0-1 1v5.6a2 2 0 0 0 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z"/><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none"/>',s,c),
  globe:(s,c)=>ic('<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',s,c),
  plus:(s,c)=>ic('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',s,c),
  edit:(s,c)=>ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',s,c),
  trash:(s,c)=>ic('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',s,c),
  copy:(s,c)=>ic('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',s,c),
  play:(s,c)=>ic('<polygon points="6 3 20 12 6 21 6 3"/>',s,c),
  cast:(s,c)=>ic('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',s,c),
  image:(s,c)=>ic('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',s,c),
  upload:(s,c)=>ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',s,c),
  download:(s,c)=>ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',s,c),
  x:(s,c)=>ic('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',s,c),
  chevronDown:(s,c)=>ic('<polyline points="6 9 12 15 18 9"/>',s,c),
  search:(s,c)=>ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',s,c),
  grip:(s,c)=>ic('<circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/>',s,c),
  check:(s,c)=>ic('<polyline points="20 6 9 17 4 12"/>',s,c),
  clock:(s,c)=>ic('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',s,c),
  maximize:(s,c)=>ic('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',s,c),
  arrowLeft:(s,c)=>ic('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',s,c),
  user:(s,c)=>ic('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',s,c),
  checkSquare:(s,c)=>ic('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',s,c),
  barChart:(s,c)=>ic('<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',s,c),
  layers:(s,c)=>ic('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>',s,c),
  arrowRight:(s,c)=>ic('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',s,c),
  repeat:(s,c)=>ic('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',s,c),
  shuffle:(s,c)=>ic('<path d="M3 6h3c3.5 0 4.5 12 9 12h6"/><path d="M18 15l3 3-3 3"/><path d="M3 18h3c1.4 0 2.4-1.1 3.3-2.5"/><path d="M15.7 8.5C16.6 7 17.6 6 19 6h2"/><path d="M18 3l3 3-3 3"/>',s,c),
};

/* ============================================================
   8. IMAGE PROCESSING UTILITIES
   ============================================================ */
const ImageUtil = {
  _elCache:new Map(), _procCache:new Map(),
  loadEl(dataURL){
    if(this._elCache.has(dataURL)) return Promise.resolve(this._elCache.get(dataURL));
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{ this._elCache.set(dataURL,img); resolve(img); };
      img.onerror=reject;
      img.src=dataURL;
    });
  },
  fileToDataURLPreserveAlpha(file, maxDim=900){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1, maxDim/Math.max(img.width,img.height));
          const w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale));
          const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror=reject; img.src=reader.result;
      };
      reader.onerror=reject; reader.readAsDataURL(file);
    });
  },
  fileToDataURL(file, maxDim=900, quality=0.85){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1, maxDim/Math.max(img.width,img.height));
          const w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale));
          const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror=reject;
        img.src=reader.result;
      };
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  },
  async pixelate(dataURL, pixelSize=16){
    const key='px:'+pixelSize+':'+dataURL.length;
    if(this._procCache.has(key)) return this._procCache.get(key);
    const img=await this.loadEl(dataURL);
    const w=img.width,h=img.height;
    const sw=Math.max(1,Math.round(w/pixelSize)), sh=Math.max(1,Math.round(h/pixelSize));
    const c1=document.createElement('canvas'); c1.width=sw; c1.height=sh;
    c1.getContext('2d').drawImage(img,0,0,sw,sh);
    const c2=document.createElement('canvas'); c2.width=w; c2.height=h;
    const ctx2=c2.getContext('2d'); ctx2.imageSmoothingEnabled=false;
    ctx2.drawImage(c1,0,0,sw,sh,0,0,w,h);
    const out=c2.toDataURL('image/png');
    this._procCache.set(key,out);
    return out;
  },
  async silhouette(dataURL){
    const key='silhouette-alpha:'+dataURL.length;
    if(this._procCache.has(key)) return this._procCache.get(key);
    const img=await this.loadEl(dataURL);
    const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);
    const image=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<image.data.length;i+=4){
      if(image.data[i+3]>0){ image.data[i]=0; image.data[i+1]=0; image.data[i+2]=0; }
    }
    ctx.putImageData(image,0,0);
    const out=canvas.toDataURL('image/png');
    this._procCache.set(key,out);
    return out;
  }};
function cssFilterForMode(mode, q){
  if(mode==='blurred') return 'blur('+((q&&q.blurPx)||16)+'px)';
  return '';
}
let pendingModeImages=[];
function modeImageHTML(question, extraClass, wrapStyle){
  extraClass = extraClass||''; wrapStyle = wrapStyle||'';
  if(!question.image) return '';
  const mode = question.imageMode || 'normal';
  if(mode==='masked'){
    const r = question.maskRect || {x:25,y:25,w:50,h:50};
    return `<div class="${extraClass}" style="position:relative;overflow:hidden;${wrapStyle}">
      <img src="${question.image}" style="width:100%;height:100%;object-fit:contain;display:block;">
      <div style="position:absolute;left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;background:#17142b;border-radius:6px;"></div>
    </div>`;
  }
  if(mode==='pixelated' || mode==='silhouette'){
    const elId='mi_'+uid();
    pendingModeImages.push({elId, dataURL:question.image, mode, pixelSize:question.pixelSize||16});
    return `<img id="${elId}" class="${extraClass}" src="${question.image}" style="filter:blur(4px);opacity:.55;${wrapStyle}">`;
  }
  const filter = cssFilterForMode(mode, question);
  return `<img class="${extraClass} qedit-preview-img" src="${question.image}" style="${filter?('filter:'+filter+';'):''}${wrapStyle}">`;
}
async function flushPendingModeImages(){
  const jobs = pendingModeImages.splice(0);
  await Promise.all(jobs.map(async job=>{
    try{
      const out = job.mode==='pixelated' ? await ImageUtil.pixelate(job.dataURL, job.pixelSize) : await ImageUtil.silhouette(job.dataURL);
      const el = document.getElementById(job.elId);
      if(el){ el.src=out; el.style.filter=''; el.style.opacity='1'; }
    }catch(e){}
  }));
}

