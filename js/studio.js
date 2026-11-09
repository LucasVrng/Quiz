/* Creator tools shared by the admin and the broadcast studio. No remote service. */
const STUDIO_TEMPLATES=[
  ['image_clues','▧','3 images, 1 réponse','Films, jeux, lieux : compose tes indices.'],
  ['visual_guess','◐','Image mystère','Silhouette, zoom, cases cachées ou flou.'],
  ['odd_one_out','⌕','Trouve l’intrus','Une grille d’images et une différence à repérer.'],
  ['blank','✦','Page blanche','Construis ton propre format.'],
  ['qcm','🧠','Le grand quiz','Quatre propositions par question.'],
  ['true_false','⚡','Vrai ou faux','Des affirmations, un rythme rapide.'],
  ['open_answer','💬','Devinettes','Des réponses à trouver, sans image.'],
  ['number','🔢','Le juste nombre','Des estimations avec révélation.'],
  ['ranking','↕','Dans le bon ordre','Des listes à remettre en ordre.'],
  ['guess_character','🕵','Personnages mystères','Commence par importer tes images.']
];
function renderStudioDashboard(){
  const count=STATE.quizzes.reduce((n,q)=>n+q.questions.length,0);
  const recent=[...STATE.quizzes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,4);
  return `<div class="studio-heading"><div><span class="eyebrow">QUIZCAST · ESPACE CRÉATEUR</span><h1>Une idée. Un quiz. Une vidéo.</h1><p>Ton prochain épisode commence ici.</p></div><button class="btn btn-primary" data-action="new-quiz">${Icons.plus(18)} Créer un quiz</button></div>
  <section class="creator-welcome"><div><span class="eyebrow">TON STUDIO, À TON RYTHME</span><h2>Fais jouer la curiosité.</h2><p>Crée tes questions, choisis une ambiance et prépare une vidéo que l’on a envie de regarder jusqu’au bout.</p><button class="btn btn-primary" data-action="set-view" data-view="collection">Explorer les collections ${Icons.arrowRight(16)}</button></div><div class="welcome-art" aria-hidden="true"><span>?</span><i>▶</i><b>✦</b><small>LET’S PLAY</small></div></section>
  <div class="creator-metrics"><span><b>${STATE.quizzes.length}</b> quiz dans la bibliothèque</span><span><b>${count}</b> questions à explorer</span><span><b>100 %</b> sous ton contrôle</span></div>
  <section class="workflow-grid">${[['01','Écris ton quiz','Choisis un format, puis ajoute tes questions.','new-quiz'],['02','Donne-lui du style','Couleurs, rythme et mise en scène, dans le studio.','library'],['03','Prépare ta vidéo','Lance la lecture et enregistre la scène avec OBS.','collection']].map(([n,t,d,a])=>`<button class="workflow-card" data-action="${a==='new-quiz'?a:'set-view'}" data-view="${a}"><span>${n}</span><h3>${t}</h3><p>${d}</p>${Icons.arrowRight(17)}</button>`).join('')}</section>
  ${renderExperimentPlan()}
  <div class="section-title">À retrouver dans ta bibliothèque<button class="btn btn-ghost btn-sm" data-action="set-view" data-view="library">Tout voir →</button></div><div class="quiz-grid">${recent.map(renderQuizCard).join('')}</div>
  <aside class="creator-note">${Icons.download(20)}<div><strong>Tes créations sont sauvegardées sur cet appareil.</strong><p>Exporte ta bibliothèque pour travailler avec ta sœur sur un autre ordinateur. Les quiz intégrés au site sont accessibles à tous ; tes modifications restent locales.</p></div><button class="btn btn-outline" data-action="export-all">Exporter une copie</button></aside>`;
}
function openTemplateChooser(){
  document.getElementById('modal-root').innerHTML=`<div class="modal-overlay open"><div class="modal template-modal" role="dialog" aria-modal="true" aria-label="Créer un quiz"><div class="modal-header"><div><span class="eyebrow">ON PART DE QUOI ?</span><h3>Choisis ton point de départ</h3></div><button class="btn btn-icon btn-outline" data-action="close-template" aria-label="Fermer">${Icons.x(18)}</button></div><div class="modal-body"><p class="hint">Les modèles créent une structure à remplir. Les collections contiennent déjà des questions.</p><div class="template-grid">${STUDIO_TEMPLATES.map(([id,e,t,d])=>`<button class="template-card" data-action="create-template" data-template="${id}"><span>${e}</span><strong>${t}</strong><small>${d}</small></button>`).join('')}</div><button class="btn btn-outline btn-block" data-action="browse-collection">Parcourir les quiz prêts à personnaliser →</button></div></div></div>`;
}
function createFromTemplate(key){
  const entry=STUDIO_TEMPLATES.find(t=>t[0]===key);if(!entry)return;
  document.getElementById('modal-root').innerHTML='';
  createNewQuiz();
  const quiz=currentQuiz();
  if(key!=='blank'){
    quiz.name=entry[2];
    // A template is an outline, never a collection of unanswered placeholder questions.
    quiz.description=entry[3];
    saveQuiz(quiz);render();
    if(key==='guess_character')openGuessBulkImport();else openQuestionModal(quiz.id,null,key);
  }
}
function renderCollection(){
  const all=STATE.quizzes.filter(q=>q.catalogKey).sort((a,b)=>Number(!!b.visualCollection)-Number(!!a.visualCollection));
  const filter=STATE.collectionFilter||'visual';
  const list=all.filter(q=>filter==='all'||(filter==='visual'?q.visualCollection&&q.status!=='draft':q.status==='draft'));
  const tabs=[['visual','Défis visuels jouables'],['storyboards','Mes captures à importer'],['all','Tout le catalogue']];
  const types=[...new Set(list.flatMap(q=>q.questions.map(x=>x.type)))];
  return `<div class="studio-heading"><div><span class="eyebrow">LE PLEIN D’IDÉES</span><h1>Les collections du studio</h1><p>${list.length} quiz · des thèmes variés · ${types.length} formats de questions. À adapter à ta chaîne.</p></div><button class="btn btn-primary" data-action="new-quiz">Créer mon propre quiz</button></div><div class="collection-tabs">${tabs.map(([id,t])=>`<button class="${id===filter?'active':''}" data-action="collection-filter" data-filter="${id}">${t}</button>`).join('')}</div><div class="visual-collection-banner"><h2>Des défis visuels, enfin mélangés</h2><p>Commence par « Nintendo Remix » ou « Le grand mix visuel ». Silhouette, trois images, zoom, intrus, chiffres et devinettes s’alternent. Les deux storyboards « 3 captures » attendent tes propres images avant de pouvoir être filmés.</p></div>${renderExperimentPlan()}<div class="quiz-grid">${list.map(renderQuizCard).join('')}</div>`;
}
function quizIssues(quiz){
  const issues=[];
  if(!quiz.name?.trim())issues.push('Donne un titre au quiz.');
  if(!quiz.questions.length)issues.push('Ajoute ta première question.');
  quiz.questions.forEach((q,i)=>{
    let reason='';
    if(!QuestionTypes[q.type])reason='type de question inconnu';
    else if(visualQuestionIssue(q))reason=visualQuestionIssue(q);
    else if(!q.text?.trim())reason='énoncé vide';
    else if(['qcm','true_false','zoom','odd_one_out'].includes(q.type)&&(!q.answers?.some(a=>a.id===q.correctAnswerId)||q.answers.length<2||q.answers.some(a=>!a.text?.trim())))reason='réponses à compléter';
    else if(isFreeResponseQuestion(q)&&!q.answerText?.trim())reason='réponse manquante';
    else if(['guess_character','zoom'].includes(q.type)&&!q.image)reason='image manquante';
    else if(q.type==='ranking'&&((q.answers||[]).length<2||!q.criterion?.trim()))reason='classement incomplet';
    else if(q.type==='number'&&(!Number.isFinite(q.value)||!Number.isFinite(q.min)||!Number.isFinite(q.max)||q.max<=q.min||q.value<q.min||q.value>q.max||!(q.step>0)))reason='bornes numériques à vérifier';
    if(reason)issues.push(`Question ${i+1} : ${reason}.`);
  });return issues;
}
function renderQuizReadiness(quiz){
  const issues=quizIssues(quiz);
  return `<div class="quiz-readiness ${issues.length?'needs-work':'is-ready'}"><span>${issues.length?'◌':'✓'}</span><div><strong>${issues.length?'Encore quelques détails':'Prêt pour une répétition'}</strong><p>${escapeHTML(issues.slice(0,3).join(' ')||'Questions → aperçu → studio vidéo. Tes changements sont sauvegardés automatiquement sur cet appareil.')}</p></div></div>`;
}
function renderQuestionPresentationFields(q){
  return `<details class="question-presentation"><summary>Mise en scène vidéo <small>facultatif</small></summary><div class="two-col"><div class="field"><label class="field-label">Disposition pour cette question</label>${['image_clues','visual_guess'].includes(q.type)?`<p class="hint">${q.type==='image_clues'?'Trois indices alignés, avec révélation progressive.':'La composition se règle avec l’effet de l’image, ci-dessus.'}</p>`:`<select data-action="question-layout">${autoplayLayoutOverrideOptions(q.videoLayout||'auto')}</select>`}</div><div class="field"><label class="field-label">Chapitre / manche</label><input data-action="question-chapter" value="${escapeHTML(q.chapter||'')}" placeholder="La finale, niveau expert…"></div></div><div class="field"><label class="field-label">Source ou référence pour la relecture</label><input data-action="question-source" value="${escapeHTML(q.source||'')}" placeholder="Lien ou référence (non affiché en vidéo)"></div><p class="hint">La durée de la question sera utilisée si tu choisis « Durées de l’éditeur » dans le studio.</p></details>`;
}
function studioDefaults(quiz){
  return {quizId:quiz.id,responseTime:12,revealDuration:4,nextDelay:.8,shuffleQ:false,shuffleA:true,guessMode:'normal',guessDifficulty:'normal',guessModeByQuestion:{},preset:'show',backgroundMode:'style',backgroundVariant:'1',customMediaUrl:'',customMediaType:'image',revealLanguage:'auto',layout:'auto',layoutByType:{},timerStyle:'bar',timerPosition:'auto',textStyle:'clean',sceneVersion:2,introMessage:'lets-go',timingMode:'fixed',checkpointEvery:5,sound:true,introDuration:4,outroDuration:6,hook:quiz.videoHook||(quiz.language==='en'?'How many can you get right?':'Combien de bonnes réponses vas-tu trouver ?'),endMessage:quiz.language==='en'?'Your score out of {total}? Tell us in the comments!':'Ton score sur {total} ? Écris-le en commentaire !'};
}
function saveStudioSettings(){
  const s=STATE.autoplaySetup;if(!s)return;
  const q=getQuiz(s.quizId);if(!q)return;
  const clean={...s};delete clean.quizId;delete clean.customMediaObjectUrl;
  // Object URLs are session-only and must never be restored as durable media.
  if(clean.customMediaUrl?.startsWith('blob:'))clean.customMediaUrl='';
  q.videoSettings=clean;return saveQuiz(q);
}
function studioResponseTime(s,q){return s.timingMode==='question'?clamp(Number(q.duration)||12,3,60):clamp(Number(s.responseTime)||12,3,60);}
function studioDuration(s,quiz){
  return s.introDuration+s.outroDuration+quiz.questions.reduce((n,q,i)=>n+studioResponseTime(s,q)+s.revealDuration+(i<quiz.questions.length-1?s.nextDelay+.28:0),0)+(s.checkpointEvery?Math.floor((quiz.questions.length-1)/s.checkpointEvery)*3:0);
}
function studioClock(seconds){const n=Math.round(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
function studioSelect(key,label,options,value){return `<label class="studio-field"><span>${label}</span><select data-action="studio-setting" data-key="${key}">${options.map(([v,t])=>`<option value="${v}" ${String(value)===String(v)?'selected':''}>${t}</option>`).join('')}</select></label>`;}
function studioNumber(key,label,value,min,max,step=1){return `<label class="studio-field"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-action="studio-setting" data-key="${key}"></label>`;}
function renderStudioSetup(){
  const s=STATE.autoplaySetup,quiz=s&&getQuiz(s.quizId);if(!quiz)return renderLibrary();
  const tab=STATE.studioTab||'essentials';
  const duration=studioDuration(s,quiz),isEn=quiz.language==='en',issues=quizIssues(quiz);
  let fields='';
  if(tab==='essentials')fields=`<div class="studio-section-title"><span>01</span><div><h2>Le rythme de ton épisode</h2><p>Laisse le temps de lire, puis récompense la curiosité.</p></div></div><div class="two-col">${studioSelect('timingMode','Temps de réflexion',[['fixed','Même durée pour toutes'],['question','Durées de l’éditeur']],s.timingMode)}${studioNumber('responseTime','Réflexion (secondes)',s.responseTime,3,60)}${studioNumber('revealDuration','Réponse & explication (s)',s.revealDuration,1,15,.5)}${studioNumber('nextDelay','Pause entre les questions (s)',s.nextDelay,0,5,.1)}</div><div class="studio-section-title"><span>02</span><div><h2>Une accroche, pas d’attente</h2><p>Une seule intro courte avant de jouer.</p></div></div><label class="studio-field"><span>Accroche d’introduction</span><input maxlength="150" data-action="studio-setting" data-key="hook" value="${escapeHTML(s.hook)}"></label><div class="two-col">${studioNumber('introDuration','Durée de l’intro (s)',s.introDuration,0,10)}${studioSelect('checkpointEvery','Intermède de 3 secondes',[['0','Aucun'],['5','Toutes les 5 questions'],['10','Toutes les 10 questions']],s.checkpointEvery)}</div><label class="studio-field"><span>Message de fin · {total} = nombre de questions</span><input maxlength="150" data-action="studio-setting" data-key="endMessage" value="${escapeHTML(s.endMessage)}"></label><p class="hint">La scène est prévue pour une capture OBS. Elle ne génère pas de fichier vidéo.</p>`;
  if(tab==='style')fields=`<div class="studio-section-title"><span>01</span><div><h2>Choisis ton univers</h2><p>Un habillage contrasté, pensé pour l’écran vidéo.</p></div></div><div class="studio-preset-grid">${autoplayPresets().filter(p=>p.id!=='auto').map(p=>`<button class="studio-preset ${s.preset===p.id?'selected':''}" data-action="studio-preset" data-preset="${p.id}" aria-pressed="${s.preset===p.id}"><i class="preset-swatch swatch-${p.id}">${p.icon}</i><strong>${p.title}</strong><small>${p.desc}</small></button>`).join('')}</div>${studioSelect('layout','Disposition par défaut',[['auto','Adaptée à chaque type'],...autoplayLayoutChoices().map(([a,b])=>[a,b])],s.layout)}<div class="autoplay-type-layout-list">${autoplayLayoutByTypeRows(quiz,s)}</div><div class="two-col">${studioSelect('timerStyle','Compte à rebours',autoplayTimerChoices().map(([a,b])=>[a,b]),s.timerStyle)}${studioSelect('textStyle','Typographie',[['bold','Titre fort'],['clean','Épurée'],['playful','Ludique'],['retro','Arcade'],['editorial','Éditoriale']],s.textStyle)}</div>`;
  if(tab==='advanced')fields=`<div class="studio-section-title"><span>✦</span><div><h2>Les détails qui font la différence</h2><p>Ces réglages sont enregistrés avec ce quiz.</p></div></div><div class="two-col">${studioSelect('revealLanguage','Langue des textes vidéo',[['auto','Langue du quiz'],['fr','Français'],['en','English']],s.revealLanguage)}${studioSelect('sound','Sons originaux synthétisés',[['false','Désactivés'],['true','Bips & révélation (sans musique)']],s.sound)}${studioSelect('shuffleQ','Ordre des questions',[['false','Ordre de l’éditeur'],['true','Aléatoire']],s.shuffleQ)}${studioSelect('shuffleA','Ordre des réponses',[['false','Ordre de l’éditeur'],['true','Aléatoire']],s.shuffleA)}${studioSelect('guessMode','Effet des personnages',guessEffectChoices().map(([a,b])=>[a,b]),s.guessMode)}${studioSelect('guessDifficulty','Intensité des effets',[['easy','Légère'],['normal','Normale'],['hard','Forte']],s.guessDifficulty)}${studioSelect('backgroundMode','Fond vidéo',[['style','Ambiance intégrée'],['mix','Ambiance + miniature'],['thumbnail','Miniature'],['custom','Média personnel']],s.backgroundMode)}${studioNumber('outroDuration','Durée de l’écran de fin (s)',s.outroDuration,2,15)}</div>${s.guessMode==='per_question'?quiz.questions.filter(q=>q.type==='guess_character').map(q=>`<label class="studio-field"><span>${escapeHTML(q.answerText||q.text)}</span><select data-action="ap-set-guess-question-mode" data-qid="${q.id}">${guessEffectOptions(s.guessModeByQuestion[q.id]||'normal')}</select></label>`).join(''):''}${s.backgroundMode==='custom'?`<label class="studio-field"><span>Image ou vidéo personnelle (session en cours)</span><input type="file" accept="image/*,video/*" data-action="ap-set-custom-media-file"></label><p class="hint">Choisis un média dont tu possèdes les droits. Un fichier local doit être sélectionné à nouveau après fermeture.</p>`:''}<p class="hint">Le choix FR / EN concerne les libellés de la scène. Les questions, ton accroche et ton message de fin doivent être traduits manuellement.</p><button class="btn btn-outline btn-block" data-action="studio-production-kit">${Icons.download(16)} Télécharger la fiche de production</button><p class="hint">Réglages, déroulé horodaté, titre et suggestion de description pour le montage.</p>`;
  return `<div class="studio-heading"><div><button class="back-link" data-action="open-quiz-editor" data-id="${quiz.id}">← Retour au quiz</button><span class="eyebrow">LE STUDIO VIDÉO</span><h1>${escapeHTML(quiz.name)||'Ton prochain épisode'}</h1><p>${quiz.questions.length} questions · ${isEn?'English':'Français'} · 16:9 · réglages sauvegardés sur cet appareil</p></div><span class="studio-badge">${Icons.cast(16)} ${issues.length?'Médias à compléter':'Scène 16:9 · OBS'}</span></div><div class="studio-workspace"><section class="studio-controls panel"><div class="studio-tabs" role="tablist" aria-label="Réglages vidéo">${[['essentials','Rythme'],['style','Habillage'],['advanced','Options']].map(([a,b])=>`<button role="tab" aria-selected="${a===tab}" data-action="studio-tab" data-tab="${a}" class="${a===tab?'active':''}">${b}</button>`).join('')}</div>${fields}</section><aside class="studio-monitor"><div class="monitor-heading"><span><i></i> APERÇU DU RENDU</span><span>16:9</span></div><div id="studio-preview"></div><div class="preview-controls"><button class="btn btn-outline btn-sm" data-action="launch-autoplay-sample" ${quizIssues({...quiz,questions:[quiz.questions[STATE.studioSample||0]].filter(Boolean)}).length?'disabled':''}>Tester cette question</button>${samplePreviewControls(quiz.questions[STATE.studioSample||0])}<button class="btn btn-outline btn-sm" data-action="studio-sample-prev" ${quiz.questions.length?'':'disabled'} aria-label="Question précédente">←</button><span>Question ${quiz.questions.length?(STATE.studioSample||0)+1:0} / ${quiz.questions.length}</span><button class="btn btn-outline btn-sm" data-action="studio-sample-next" ${quiz.questions.length?'':'disabled'} aria-label="Question suivante">→</button><button class="btn btn-outline btn-sm" data-action="studio-preview-reveal">${STATE.studioReveal?'Voir la question':'Voir la réponse'}</button></div><div class="episode-duration"><span>Durée estimée de la vidéo<strong id="studio-duration">${studioClock(duration)}</strong></span><p id="studio-duration-hint">${duration<300?'Pour 5 à 10 minutes : vise environ 20 à 35 questions, selon le rythme.':'Estimation hors pauses manuelles et chargement des médias.'}</p></div>${issues.length?`<button class="btn btn-outline btn-block" data-action="complete-storyboard" data-id="${quiz.id}">${Icons.image(16)} Importer les captures manquantes</button><p class="hint">${escapeHTML(issues[0])}</p>`:''}<button class="btn btn-primary studio-launch" data-action="launch-autoplay-stage" ${issues.length?'disabled':''}>${Icons.play(18)} Lancer la répétition</button><p class="monitor-help">Espace : pause · ← → : question · Échap : retour<br>Pour enregistrer : capture OBS, cadre 16:9 sans les commandes.</p></aside></div>`;
}
function studioAnswer(q){
  if(isFreeResponseQuestion(q))return q.answerText||'';
  if(q.type==='number')return `${q.value}${q.unit?' '+q.unit:''}`;
  if(q.type==='ranking')return q.answers.map(a=>a.text).join(' → ');
  return q.answers.find(a=>a.id===q.correctAnswerId)?.text||'';
}
function studioRevealMarkup(q,eng,quiz){return `<div class="studio-answer-card"><span class="eyebrow">${autoplayCorrectLabel(eng,quiz)}</span>${q.type==='image_clues'?renderClueImages({...q,progressiveClues:false}):q.image?`<img src="${escapeHTML(q.image)}" alt="">`:""}<strong>${escapeHTML(studioAnswer(q))}</strong>${q.explanation?`<p>${escapeHTML(q.explanation)}</p>`:""}</div>`;}
function renderStudioPreview(){
  const host=document.getElementById('studio-preview'),s=STATE.autoplaySetup;if(!host||!s)return;
  const quiz=getQuiz(s.quizId),q=quiz.questions[STATE.studioSample||0]||quiz.questions[0];if(!q){host.innerHTML='<div class="preview-empty">Ajoute ta première question dans l’éditeur pour voir le rendu.</div>';return;}
  const eng={...s,responseTime:studioResponseTime(s,q),preset:resolveAutoplayPreset(quiz,s.preset),guessRandomByQuestion:{}};
  let body=STATE.studioReveal?studioRevealMarkup(q,eng,quiz):buildAutoplayQuestionMarkup(eng,quiz,q,true);
  body=body.replace(/id="([^"]+)"/g,'id="preview-$1"');
  host.innerHTML=`<div class="stage-16x9 studio-scene broadcast-v2 autoplay-preset-${eng.preset} autoplay-text-style-${s.textStyle}" data-preview>${autoplayBackgroundMarkup(eng.preset,s.backgroundMode,quiz.thumbnail,s.backgroundVariant,s.customMediaUrl,s.customMediaType)}<div class="scene-orb orb-one"></div><div class="scene-orb orb-two"></div><div class="stage-video-meta"><span>QUIZCAST</span><span>${(STATE.studioSample||0)+1} / ${quiz.questions.length}</span></div><div class="stage-content">${body}</div><div class="scene-footer">${escapeHTML(q.chapter||'À toi de jouer !')}</div></div>`;
  if(q.type==='image_clues')host.querySelectorAll('.clue-card').forEach((el,i)=>el.classList.toggle('clue-locked',q.progressiveClues!==false&&i>(STATE.studioHint||0)));
  if(q.type==='visual_guess'){const picture=host.querySelector('.mystery-picture');if(picture&&STATE.studioHint){picture.outerHTML=renderMysteryImage(q,false,STATE.studioHint);}}
  flushPendingModeImages();
}
function updateStudioSetting(el){
  const s=STATE.autoplaySetup;if(!s)return;
  const key=el.dataset.key;if(!(key in studioDefaults(getQuiz(s.quizId))))return;
  const bounds={responseTime:[3,60],revealDuration:[1,15],nextDelay:[0,5],introDuration:[0,10],outroDuration:[2,15],checkpointEvery:[0,10]};
  let value=el.value;
  if(bounds[key]){if(!value.trim()||!Number.isFinite(Number(value))||(el.type==='number'&&!el.checkValidity()))return;value=clamp(Number(value),...bounds[key]);}
  if(['sound','shuffleQ','shuffleA'].includes(key))value=value==='true';
  s[key]=value;saveStudioSettings();
  // Preserve focus while typing a hook or changing a duration.
  if(['hook','endMessage'].includes(key)||el.type==='number'){
    const quiz=getQuiz(s.quizId),seconds=studioDuration(s,quiz),d=document.getElementById('studio-duration');if(d)d.textContent=studioClock(seconds);
    const hint=document.getElementById('studio-duration-hint');if(hint)hint.textContent=seconds<300?'Pour 5 à 10 minutes : vise environ 20 à 35 questions, selon le rythme.':'Estimation hors pauses manuelles et chargement des médias.';
    renderStudioPreview();
  }else render();
}
function downloadProductionKit(){
  const s=STATE.autoplaySetup,quiz=getQuiz(s.quizId);let time=s.introDuration;
  const lines=[quiz.name,'','Accroche : '+s.hook,'Format : 1920 × 1080 · '+autoplayRevealLanguage(s,quiz),'Durée estimée : '+studioClock(studioDuration(s,quiz)),'','DÉROULÉ (ordre avant mélange)'];
  quiz.questions.forEach((q,i)=>{lines.push(`${studioClock(time)} · Q${i+1} · ${q.text}\nRéponse : ${studioAnswer(q)}\n${q.explanation||''}`);time+=studioResponseTime(s,q)+s.revealDuration+(i<quiz.questions.length-1?s.nextDelay+.28:0);if(s.checkpointEvery&&(i+1)%s.checkpointEvery===0&&i<quiz.questions.length-1)time+=3;});
  lines.push('','DESCRIPTION À PERSONNALISER',quiz.description||'',`${quiz.questions.length} questions. Note ton score en commentaire !`,'','Avant publication : relire les réponses, vérifier les droits des médias, tester le mix sonore. Aucun résultat de monétisation garanti.');
  const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='production-'+sanitizeFilename(quiz.name)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderAutoplayCheckpoint(){
  const eng=STATE.autoplayEngine,quiz=getQuiz(eng.quizId),en=autoplayRevealLanguage(eng,quiz)==='en';
  document.getElementById('stage-content').innerHTML=`<div class="studio-checkpoint"><span class="eyebrow">${en?'QUICK SCORE CHECK':'PETIT POINT SUR LE SCORE'}</span><h2>${en?'Still in the game?':'Toujours dans la course ?'}</h2><strong>? <small>/ ${eng.pos+1}</small></strong><p>${en?'Keep going. Your next challenge is coming!':'Garde tes points en tête. La suite arrive !'}</p></div>`;
}
function studioPause(){
  const eng=STATE.autoplayEngine;if(!eng||eng.transitioning||['preparing','media-error'].includes(eng.phase))return;
  if(eng.phase==='ended'){replayAutoplayStage();return;}
  const stage=document.getElementById('stage-16x9');
  if(!eng.paused){
    eng.remaining=Math.max(0,(eng.nextAt||performance.now())-performance.now());eng.pausedAt=performance.now();eng.paused=true;clearApTimers();
  }else{
    eng.phaseStart+=performance.now()-eng.pausedAt;eng.paused=false;
    scheduleAutoplay(eng.nextAction,eng.remaining);if(eng.phase==='counting')tickCountdown();
  }
  stage?.classList.toggle('is-paused',eng.paused);
  stage?.getAnimations({subtree:true}).forEach(a=>eng.paused?a.pause():a.play());
  const button=document.getElementById('studio-pause');if(button)button.textContent=eng.paused?'Reprendre':'Pause';
}
function studioSkip(delta){
  const eng=STATE.autoplayEngine;if(!eng||['preparing','media-error'].includes(eng.phase))return;
  clearApTimers();eng.pos=clamp(eng.pos+delta,0,eng.order.length-1);eng.phase='counting';eng.paused=false;
  document.getElementById('stage-16x9')?.classList.remove('is-paused');
  document.getElementById('studio-pause').textContent='Pause';
  renderQuestionIntoStage(runAutoplayPhaseTimer);
}
let studioAudio=null;
function studioInitAudio(enabled){studioStopAudio();if(!enabled)return;try{studioAudio=new (window.AudioContext||window.webkitAudioContext)();studioAudio.resume();}catch(e){showToast('Audio indisponible : la vidéo reste utilisable sans son.','err');}}
function studioTone(kind){
  if(!studioAudio||studioAudio.state!=='running'||!STATE.autoplayEngine?.sound)return;
  const start=studioAudio.currentTime;
  (kind==='reveal'?[523.25,659.25,783.99]:[440]).forEach((frequency,i)=>{
    const o=studioAudio.createOscillator(),g=studioAudio.createGain(),t=start+i*.08;o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(studioAudio.destination);o.start(t);o.stop(t+.2);
  });
}
function studioStopAudio(){if(studioAudio){studioAudio.close().catch(()=>{});studioAudio=null;}}
// Studio shortcuts are scoped to the broadcast. They never intercept form editing.
document.addEventListener('keydown',event=>{
  if(!STATE.autoplayEngine||event.target.matches('input,textarea,select,[contenteditable]'))return;
  if(event.code==='Space'){event.preventDefault();studioPause();}
  if(event.key==='ArrowRight'){event.preventDefault();studioSkip(1);}
  if(event.key==='ArrowLeft'){event.preventDefault();studioSkip(-1);}
});
function validateQuizImport(data){
  if(data.categories&&!Array.isArray(data.categories))throw Error('Liste de catégories invalide');
  for(const c of data.categories||[]){if(typeof c.id!=='string'||typeof c.name!=='string')throw Error('Catégorie sans nom ou identifiant');}
  for(const quiz of data.quizzes){
    if(!quiz||typeof quiz.name!=='string'||!Array.isArray(quiz.questions))throw Error('Structure de quiz invalide');
    const ids=new Set();
    for(const q of quiz.questions){
      if(!q||typeof q.id!=='string'||ids.has(q.id))throw Error('Identifiants de questions absents ou dupliqués');ids.add(q.id);
      if(!QuestionTypes[q.type])throw Error('Type de question inconnu : '+q.type);
      if(typeof q.text!=='string')throw Error('Énoncé invalide');
      if(q.type==='image_clues'&&(!Array.isArray(q.clues)||q.clues.length!==3||q.clues.some(c=>!c||typeof c.image!=='string')))throw Error('Les trois indices doivent être définis');
      if(q.type==='visual_guess'&&(!['silhouette','zoom','hidden','blurred','normal'].includes(q.visualMode)||typeof q.image!=='string'))throw Error('Image mystère invalide');
      if(q.type==='odd_one_out'&&(!Array.isArray(q.answers)||q.answers.length!==4||q.answers.some(a=>typeof a.image!=='string')))throw Error('Quatre images sont nécessaires pour l’intrus');
      if(q.answers&&!Array.isArray(q.answers))throw Error('Liste de réponses invalide');
      const aids=new Set();for(const a of q.answers||[]){if(typeof a.id!=='string'||typeof a.text!=='string'||aids.has(a.id))throw Error('Réponses invalides ou dupliquées');aids.add(a.id);}
      // Incomplete drafts may be imported; structural errors must not corrupt the library.
      if(q.correctAnswerId&&!aids.has(q.correctAnswerId))throw Error('Bonne réponse introuvable');
    }
  }
}
const LAUNCH_EXPERIMENTS=[
 ['catalog-nintendo-remix','1','Quiz mixte','Nintendo Remix : des images et des surprises','Comparer ce format visuel aux deux premiers essais Nintendo.'],
 ['catalog-films-3-captures','2','Trois captures','Devine 20 films avec trois images','Importer vos captures, puis tester des indices progressifs sans QCM.'],
 ['catalog-grand-mix-visuel','3','Formats variés','20 défis sans routine','Observer si les changements de format donnent envie de continuer.'],
 ['catalog-personnages-mysteres','4','Personnages','Ombre, zoom, cases : qui se cache ici ?','Comparer les quatre effets sur un épisode sans choix multiples.'],
 ['catalog-nombres','5','Le juste nombre','20 questions : sauras-tu trouver le juste nombre ?','Tester les estimations et la comparaison des scores.'],
 ['catalog-jeux-3-captures','6','Jeux vidéo','20 jeux à retrouver avec trois captures','Préparer les captures et comparer ce thème aux films de la semaine 2.']
];
function renderExperimentPlan(){
  return `<section class="experiment-plan"><div class="section-title">Votre prochaine série de tests <span class="hint">1 épisode par semaine · français · sans voix</span></div><p>Changez le thème, gardez une durée et une présentation comparables. Ces pistes sont des hypothèses à tester.</p><div class="experiment-grid">${LAUNCH_EXPERIMENTS.map(([id,n,t,title,hypothesis])=>`<button class="experiment-card" data-action="open-quiz-editor" data-id="${id}"><span>SEMAINE ${n} · ${t}</span><strong>${title}</strong><small>${hypothesis}</small><b>Préparer cet épisode →</b></button>`).join('')}</div></section>`;
}
function openBulkQuestionEditor(){
  STATE.bulkQuestions={quizId:STATE.currentQuizId,type:'qcm',text:''};renderBulkQuestionEditor();
}
function renderBulkQuestionEditor(){
  const s=STATE.bulkQuestions;if(!s)return;
  const help=s.type==='qcm'?'Question | Bonne réponse | Autre réponse | Autre réponse (2 à 6 réponses)':s.type==='true_false'?'Affirmation | Vrai (ou Faux)':'Question | Réponse attendue | Synonyme facultatif';
  document.getElementById('modal-root').innerHTML=`<div class="modal-overlay open"><div class="modal" role="dialog" aria-modal="true" aria-label="Ajouter des questions en lot"><div class="modal-header"><h3>Ajouter des questions en lot</h3><button class="btn btn-icon btn-outline" data-action="close-bulk-questions" aria-label="Fermer">${Icons.x(18)}</button></div><div class="modal-body"><p class="hint">Une question par ligne. Sépare les colonnes avec le caractère | ou une tabulation depuis ton tableur. Aucun ajout n’est effectué tant qu’une ligne est invalide.</p><label class="studio-field"><span>Format</span><select data-action="bulk-question-type">${[['qcm','QCM'],['true_false','Vrai / faux'],['open_answer','Réponse libre']].map(([id,t])=>`<option value="${id}" ${s.type===id?'selected':''}>${t}</option>`).join('')}</select></label><label class="studio-field"><span>${help}</span><textarea rows="10" data-action="bulk-question-text" placeholder="${s.type==='qcm'?'Quelle est la capitale du Canada ? | Ottawa | Toronto | Montréal | Vancouver':s.type==='true_false'?'Le Soleil est une étoile. | Vrai':'Quelle est la capitale du Canada ? | Ottawa'}">${escapeHTML(s.text)}</textarea></label><p class="hint">Pour les QCM, la première réponse est la bonne ; son emplacement est ensuite mélangé. Relis et enrichis les explications dans l’éditeur avant de filmer.</p><div id="bulk-question-errors" role="alert"></div></div><div class="modal-footer"><button class="btn btn-outline" data-action="close-bulk-questions">Annuler</button><button class="btn btn-primary" data-action="confirm-bulk-questions">Ajouter les questions</button></div></div></div>`;
}
function parseBulkQuestions(text,type){
  const rows=text.split(/\r?\n/).map((text,i)=>({text:text.trim(),line:i+1})).filter(r=>r.text),questions=[],errors=[];
  if(!rows.length)return {questions:[],errors:['Ajoute au moins une ligne.']};
  if(rows.length>200)return {questions:[],errors:['Limite : 200 questions par ajout.']};
  rows.forEach(({text,line})=>{
    const cells=text.split(/\t|\|/).map(s=>s.trim());
    const good=cells[1];
    if(!cells[0]||!good||cells.some(c=>!c)){errors.push(`Ligne ${line} : une colonne est vide.`);return;}
    if(type==='qcm'&&(cells.length<3||cells.length>7)){errors.push(`Ligne ${line} : prévois 2 à 6 réponses.`);return;}
    if(type==='qcm'&&new Set(cells.slice(1).map(normalizeGuess)).size!==cells.length-1){errors.push(`Ligne ${line} : deux réponses sont identiques.`);return;}
    if(type==='true_false'&&(cells.length!==2||!['vrai','faux','true','false'].includes(normalizeGuess(good)))){errors.push(`Ligne ${line} : utilise Vrai ou Faux.`);return;}
    const q=QuestionTypes[type].createDefault();q.text=cells[0];q.duration=12;
    if(type==='qcm'){q.answers=shuffleArray(cells.slice(1).map(text=>({id:uid(),text})));q.correctAnswerId=q.answers.find(a=>a.text===good).id;}
    if(type==='true_false')q.correctAnswerId=q.answers[['vrai','true'].includes(normalizeGuess(good))?0:1].id;
    if(type==='open_answer'){q.answerText=good;q.acceptedAnswers=cells.slice(2);}
    questions.push(q);
  });return {questions,errors};
}
async function confirmBulkQuestions(){
  const s=STATE.bulkQuestions,quiz=s&&getQuiz(s.quizId);if(!quiz)return;
  const result=parseBulkQuestions(s.text,s.type);
  if(result.errors.length){document.getElementById('bulk-question-errors').textContent=result.errors.slice(0,8).join('\n');return;}
  quiz.questions.push(...result.questions);await saveQuiz(quiz);STATE.bulkQuestions=null;document.getElementById('modal-root').innerHTML='';render();showToast(result.questions.length+' questions ajoutées');
}
async function moveQuestion(id,direction){
  const quiz=currentQuiz();if(!quiz)return;const index=quiz.questions.findIndex(q=>q.id===id),next=index+direction;
  if(index<0||next<0||next>=quiz.questions.length)return;
  [quiz.questions[index],quiz.questions[next]]=[quiz.questions[next],quiz.questions[index]];await saveQuiz(quiz);render();
}
function samplePreviewControls(q) {
  return ['image_clues','visual_guess'].includes(q?.type)?'<button class="btn btn-outline btn-sm" data-action="studio-preview-hint">Dévoiler un indice</button>':'';
}
