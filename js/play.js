/* ============================================================
   18. NORMAL PLAY MODE
   ============================================================ */
function quizHasGuessCharacters(quiz){ return !!quiz?.questions?.some(q=>q.type==='guess_character' && q.image); }
function startPlay(quizId, returnView, guessMode=null, guessDifficulty='normal'){
  const quiz=getQuiz(quizId);
  if(!quiz || quiz.questions.length===0){showToast(tr('empty_questions_title'),'err');return;}
  if(returnView==='publicQuiz' && quizHasGuessCharacters(quiz) && !guessMode){
    STATE._guessModeSetup={quizId,returnView};
    renderGuessModeSetup(quiz);
    return;
  }
  const dq = returnView==='publicQuiz' ? dailyQuiz() : null;
  STATE.play={quizId,order:quiz.questions.map((_,i)=>i),pos:0,selectedId:null,revealed:false,correctCount:0,returnView:returnView||'library',answerValue:null,rankingSubmitted:false,guessMode:guessMode||'normal',guessDifficulty:guessDifficulty||'normal',guessModeByPos:{},isDailyQuiz:!!dq&&dq.id===quiz.id};
  STATE.view='play'; render();
}
function renderGuessModeSetup(quiz){
  const html=`<div class="modal-overlay open" id="guess-mode-overlay"><div class="modal guess-mode-modal">
    <div class="modal-header"><h3>Choisis ton mode de jeu</h3><div class="modal-close" data-action="close-guess-mode">${Icons.x(18)}</div></div>
    <div class="modal-body"><p class="sub" style="margin-top:0">${escapeHTML(quiz.name)} contient des questions « Guess the character ».</p>
      <div class="guess-mode-section"><label class="field-label">Mode</label><div class="guess-mode-grid">
        ${[['normal','Normal','Image originale'],['pixelated','Pixelisé','Détails réduits'],['silhouette','Silhouette','Personnage entièrement noir'],['blurred','Flouté','Détails masqués'],['random','Surprise','Un effet différent selon les questions']].map(([id,title,desc])=>`<button type="button" class="guess-mode-choice ${id==='normal'?'selected':''}" data-action="choose-guess-mode" data-mode="${id}"><strong>${title}</strong><span>${desc}</span></button>`).join('')}
      </div></div>
      <div class="guess-mode-section"><label class="field-label">Difficulté des effets</label><div class="guess-difficulty-grid">
        ${[['easy','Facile','Effets légers'],['normal','Normale','Bon équilibre'],['hard','Difficile','Effets plus marqués']].map(([id,title,desc])=>`<button type="button" class="guess-difficulty-choice ${id==='normal'?'selected':''}" data-action="choose-guess-difficulty" data-difficulty="${id}"><strong>${title}</strong><span>${desc}</span></button>`).join('')}
      </div></div>
      <div class="hint" style="margin-top:18px">La difficulté ne change que l'intensité du pixelisé et du flou. La silhouette n'a pas de réglage supplémentaire.</div>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" data-action="close-guess-mode">Annuler</button><button class="btn btn-primary" data-action="start-guess-mode">${Icons.play(14)} Jouer</button></div>
  </div></div>`;
  document.getElementById('modal-root').innerHTML=html;
  window._guessModeSelection={mode:'normal',difficulty:'normal'};
}
function startSelectedGuessMode(){
  const s=window._guessModeSelection||{mode:'normal',difficulty:'normal'};
  const pending=STATE._guessModeSetup;
  if(!pending)return;
  STATE._guessModeSetup=null; window._guessModeSelection=null; document.getElementById('modal-root').innerHTML='';
  startPlay(pending.quizId,pending.returnView,s.mode,s.difficulty);
}
function closeGuessModeSetup(){ STATE._guessModeSetup=null; window._guessModeSelection=null; document.getElementById('modal-root').innerHTML=''; }
function guessEffectValues(difficulty){ return difficulty==='easy'?{pixelSize:8,blurPx:6}:difficulty==='hard'?{pixelSize:28,blurPx:24}:{pixelSize:16,blurPx:14}; }
function getGuessDisplayQuestion(q,p){
  if(q.type!=='guess_character') return q;
  let mode=p.guessMode||'normal';
  if(mode==='random'){
    if(!p.guessModeByPos[p.pos]){ const pool=['normal','pixelated','silhouette','blurred']; p.guessModeByPos[p.pos]=pool[Math.floor(Math.random()*pool.length)]; }
    mode=p.guessModeByPos[p.pos];
  }
  const values=guessEffectValues(p.guessDifficulty||'normal');
  return {...q,imageMode:mode,pixelSize:values.pixelSize,blurPx:values.blurPx};
}
function selectPlayAnswer(aid){
  const p=STATE.play;if(!p||p.revealed)return;
  const quiz=getQuiz(p.quizId);const q=quiz.questions[p.order[p.pos]];
  p.selectedId=aid;p.revealed=true;p.lastAnswerCorrect=aid===q.correctAnswerId;if(p.lastAnswerCorrect)p.correctCount++;render();
}
function submitPlayRanking(){
  const p=STATE.play;if(!p||p.revealed)return;
  const quiz=getQuiz(p.quizId),q=quiz.questions[p.order[p.pos]];const ids=rankingOrderFromDOM();
  p.rankingSubmitted=true;p.rankingAnswerOrder=ids.slice();p.revealed=true;
  const correct=ids.length===q.answers.length && ids.every((id,i)=>id===q.answers[i].id);p.lastAnswerCorrect=correct;if(correct)p.correctCount++;render();
}
function normalizeGuess(value){
  return String(value||'').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
}
function submitPlayGuess(){
  const p=STATE.play;if(!p||p.revealed)return;
  const quiz=getQuiz(p.quizId),q=quiz.questions[p.order[p.pos]],input=document.getElementById('play-guess-input');
  const value=(input?.value||'').trim();if(!value)return;
  p.answerText=value;p.revealed=true;
  const accepted=[q.answerText,...(q.acceptedAnswers||[])].filter(Boolean).map(normalizeGuess);
  p.lastAnswerCorrect=accepted.includes(normalizeGuess(value));if(p.lastAnswerCorrect)p.correctCount++;
  render();
}
function renderGuessNormal(q,p){
  if(!p.revealed) return `<div class=\"guess-input-wrap\"><input id=\"play-guess-input\" class=\"guess-answer-input\" type=\"text\" autocomplete=\"off\" placeholder=\"${escapeHTML(tr('guess_answer_ph'))}\"><button class=\"btn btn-primary\" data-action=\"submit-guess\">${tr('submit_guess')}</button></div>`;
  const accepted=[q.answerText,...(q.acceptedAnswers||[])].filter(Boolean).map(normalizeGuess);
  const correct=accepted.includes(normalizeGuess(p.answerText));
  return `<div class=\"guess-reveal\"><img src=\"${q.image}\"><div class=\"guess-reveal-copy\"><div class=\"guess-answer-label\">${tr('guess_correct_answer')}</div><div class=\"guess-reveal-name\">${escapeHTML(q.answerText)}</div><div class=\"guess-reveal-result\">${correct?tr('answer_correct'):tr('answer_wrong')} — ${tr('guess_your_answer')}: ${escapeHTML(p.answerText)}</div>${q.explanation?`<div class=\"explanation-box\">${escapeHTML(q.explanation)}</div>`:''}</div></div>`;
}
function submitPlayNumber(){
  const p=STATE.play;if(!p||p.revealed)return;
  const quiz=getQuiz(p.quizId),q=quiz.questions[p.order[p.pos]];const input=document.getElementById('play-number-input');
  const val=Number(input&&input.value);if(!Number.isFinite(val))return;p.answerValue=val;p.revealed=true;p.lastAnswerCorrect=val===Number(q.value);if(p.lastAnswerCorrect)p.correctCount++;render();
}
function nextPlayQuestion(){const p=STATE.play;if(!p)return;p.pos++;p.selectedId=null;p.revealed=false;p.answerValue=null;p.rankingSubmitted=false;p._rankingShuffle=null;render();}
function restartPlay(){const p=STATE.play;if(p)startPlay(p.quizId,p.returnView,p.guessMode,p.guessDifficulty);}
function changeGuessMode(){
  const p=STATE.play;
  if(!p)return;
  const quiz=getQuiz(p.quizId);
  if(!quiz)return;
  STATE._guessModeSetup={quizId:p.quizId,returnView:p.returnView};
  renderGuessModeSetup(quiz);
}
function guessModeLabel(mode){
  return ({normal:'Normal',pixelated:'Pixelisé',silhouette:'Silhouette',blurred:'Flouté',random:'Surprise'})[mode]||'Normal';
}
function guessDifficultyLabel(difficulty){
  return ({easy:'Facile',normal:'Normale',hard:'Difficile'})[difficulty]||'Normale';
}
function publicScoreMessage(pct){
  if(pct>=80) return tr('public_score_message_high');
  if(pct>=50) return tr('public_score_message_mid');
  return tr('public_score_message_low');
}
function renderScoreScreen(quiz,p){
  const total=p.order.length, pct=Math.round((p.correctCount/Math.max(1,total))*100);
  if(p.returnView==='publicQuiz') recordPublicResult(quiz,p);
  const sameCats=publicQuizList().filter(x=>x.id!==quiz.id && (x.categoryIds||[]).some(id=>(quiz.categoryIds||[]).includes(id)));
  const related=(sameCats.length?sameCats:[...publicQuizList()].filter(x=>x.id!==quiz.id)).sort(()=>Math.random()-.5).slice(0,3);
  const isPublic=p.returnView==='publicQuiz';
  if(!isPublic) return `<div class="play-wrap"><div class="score-screen panel"><div class="score-num">${p.correctCount}/${total}</div><h2 style="margin:14px 0 6px;font-size:20px;">${tr('score_title')}</h2><p style="color:var(--text-dim);">${tr('score_sub_pre')} ${p.correctCount} ${tr('score_sub_post')}</p><div style="display:flex;gap:10px;justify-content:center;margin-top:26px;"><button class="btn btn-outline" data-action="back-to-library-from-play">${tr('back_library_btn')}</button><button class="btn btn-primary" data-action="restart-play">${Icons.repeat(14)} ${tr('restart')}</button></div></div></div>`;
  const hasGuess=quizHasGuessCharacters(quiz);
  const modeInfo=hasGuess?`<div class="public-result-settings"><span>Mode : <strong>${escapeHTML(guessModeLabel(p.guessMode))}</strong></span><span>Difficulté : <strong>${escapeHTML(guessDifficultyLabel(p.guessDifficulty))}</strong></span></div>`:'';
  const replayActions=hasGuess
    ? `<button class="btn btn-primary" data-action="restart-play">${Icons.repeat(14)} ${tr('public_replay')}</button><button class="btn btn-outline" data-action="change-guess-mode">Changer de mode</button>`
    : `<button class="btn btn-primary" data-action="restart-play">${Icons.repeat(14)} ${tr('public_replay')}</button>`;
  return `<div class="public-play-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}"><header class="public-play-header"><div class="public-play-brand"><span class="brand-mark"><span></span></span><span>QuizCast</span></div><div class="public-play-meta"><span class="play-question-name">${escapeHTML(quiz.name)}</span></div><button class="btn btn-outline btn-sm public-play-exit" data-action="public-exit-play">${tr('public_exit_quiz')}</button></header><main class="public-play-main"><div class="play-wrap"><div class="play-card score-screen" data-fade><div class="public-score-kicker">${tr('score_title')}</div><div class="score-num">${p.correctCount}/${total}</div><div class="public-score-percent">${pct}% ${tr('public_score_percent')}</div><p class="public-score-message">${publicScoreMessage(pct)}</p>${modeInfo}<div class="public-result-actions">${replayActions}<button class="btn btn-outline" data-action="share-quiz-result" data-id="${quiz.id}" data-correct="${p.correctCount}" data-total="${total}">${tr('share_score')}</button><button class="btn btn-outline" data-action="public-random-after-play">${Icons.shuffle(14)} ${tr('public_next_random')}</button></div></div>${renderYouTubeEpisode(quiz,'score')}${related.length?`<section class="public-result-section"><h3>${tr('public_more_like')}</h3><div class="public-quiz-grid">${related.map(publicQuizCard).join('')}</div></section>`:''}</div></main></div>`;
}
async function shareQuizResult(button){
  const quiz=getQuiz(button.dataset.id); if(!quiz)return;
  const score=`${button.dataset.correct||0}/${button.dataset.total||quiz.questions.length}`;
  const url=new URL(qcRoute('quizzes/quiz.html')+'?id='+encodeURIComponent(quiz.id),location.href).href;
  const title=`${score} au quiz ${quiz.name} sur QuizCast`;
  const text=`J'ai obtenu ${score} au quiz « ${quiz.name} ». À ton tour !`;
  if(navigator.share){try{await navigator.share({title,text,url});return;}catch(e){if(e.name==='AbortError')return;}}
  const value=`${text} ${url}`;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);showToast(tr('share_copied'));return;}}catch(e){}
  const field=document.createElement('textarea'); field.value=value; field.style.position='fixed'; field.style.opacity='0'; document.body.appendChild(field); field.select();
  const copied=document.execCommand('copy'); field.remove();
  if(copied) showToast(tr('share_copied')); else window.prompt(tr('share_score'),value);
}
function renderRankingNormal(q,p){
  const items=p.revealed?(p.rankingAnswerOrder||q.answers.map(a=>a.id)).map(id=>q.answers.find(a=>a.id===id)).filter(Boolean):q.answers.slice().sort((a,b)=>((p._rankingShuffle||[]).indexOf(a.id))-((p._rankingShuffle||[]).indexOf(b.id)));
  return `<div class="ranking-play-list" id="ranking-play-list">${items.map((a,i)=>`<div class="ranking-play-item" draggable="${p.revealed?'false':'true'}" data-aid="${a.id}"><span class="ranking-index">${i+1}</span><span>${escapeHTML(a.text)}</span></div>`).join('')}</div>${!p.revealed?`<div class="play-footer"><button class="btn btn-primary" data-action="submit-ranking">${tr('validate_order')} ${Icons.check(14)}</button></div>`:''}`;
}
function renderNumberNormal(q,p){
  const pct=clamp((Number(p.answerValue??q.min)-q.min)/(q.max-q.min)*100,0,100);
  const target=clamp((q.value-q.min)/(q.max-q.min)*100,0,100);
  return `<div class="number-value-display">${p.revealed?(p.answerValue??'—'):'?' }${q.unit?' '+escapeHTML(q.unit):''}</div><div class="number-scale"><div class="number-scale-fill" style="width:${p.revealed?pct:0}%"></div><div class="number-marker ${p.revealed?'revealed':''}" style="left:${p.revealed?target:0}%"></div></div><div class="number-scale-labels"><span>${q.min}</span><span>${q.max}</span></div>${!p.revealed?`<div class="number-input-row" style="margin-top:24px;"><input id="play-number-input" type="number" step="${q.step||1}" min="${q.min}" max="${q.max}" placeholder="${tr('field_number_value')}"><button class="btn btn-primary" data-action="submit-number">${tr('submit_number')}</button></div>`:`<div class="feedback-banner ${p.answerValue===q.value?'ok':'ko'}" style="margin-top:22px;">${p.answerValue===q.value?Icons.check(16):Icons.x(16)} ${p.answerValue===q.value?tr('number_correct'):tr('number_wrong')} — ${tr('number_reveal')} ${q.value}${q.unit?' '+escapeHTML(q.unit):''}</div>`}`;
}
function renderPlayView(){
  const p=STATE.play,quiz=getQuiz(p.quizId);
  if(!quiz){STATE.view='publicQuizzes';STATE.publicMode=true;return renderPublicQuizzes();}
  if(p.pos>=p.order.length)return renderScoreScreen(quiz,p);
  const q=quiz.questions[p.order[p.pos]],type=QuestionTypes[q.type],progressPct=Math.round(((p.pos+(p.revealed?1:0))/p.order.length)*100);
  const answerState=p.revealed?(p.lastAnswerCorrect?'answer-state-correct':'answer-state-incorrect'):'';
  if(q.type==='ranking' && !p._rankingShuffle){p._rankingShuffle=shuffleArray(q.answers.map(a=>a.id));}
  let imgHTML='';
  if(q.image){if(q.type==='guess_character'){const displayQ=getGuessDisplayQuestion(q,p);imgHTML=p.revealed?`<div class="play-question-img" style="display:flex;align-items:center;justify-content:center;"><img src="${q.image}" style="max-height:360px;max-width:100%;object-fit:contain;border-radius:14px;"></div>`:`<div class="play-question-img" style="display:flex;align-items:center;justify-content:center;">${modeImageHTML(displayQ,'','max-height:360px;max-width:100%;object-fit:contain;')}</div>`;}else if(q.type==='zoom')imgHTML=`<div class="zoom-image-wrap" style="height:260px;--zoom-scale:${p.revealed?1:q.zoomStart||3};"><img src="${q.image}"></div>`;else imgHTML=`<img class="play-question-img" src="${q.image}">`; }
  let body='';
  if(q.type==='guess_character') body=renderGuessNormal(q,p);
  else if(q.type==='ranking') body=renderRankingNormal(q,p);
  else if(q.type==='number') body=renderNumberNormal(q,p);
  else {
    const letters=['a','b','c','d','e','f'];
    const answersHTML=q.answers.map((a,idx)=>{const letter=letters[idx],cls='answer-tile '+letter+(p.revealed?(a.id===q.correctAnswerId?' correct-flag':a.id===p.selectedId?' wrong-flag dim':' dim')+' disabled':'');return `<button type="button" class="${cls}" data-action="select-answer" data-aid="${a.id}"><span class="answer-letter">${letter.toUpperCase()}</span>${type.renderPlayTile(a,letter)}</button>`;}).join('');
    body=`<div class="answers-grid">${answersHTML}</div>`;
    if(p.revealed){const wasCorrect=p.selectedId===q.correctAnswerId;body+=`<div class="feedback-banner ${wasCorrect?'ok':'ko'}">${wasCorrect?Icons.check(16):Icons.x(16)} <span>${wasCorrect?tr('answer_correct'):tr('answer_wrong')}</span></div>`;if(q.explanation)body+=`<div class="explanation-box">${escapeHTML(q.explanation)}</div>`;}
  }
  if(p.revealed && q.type==='ranking'){const correct=!!p.lastAnswerCorrect;body+=`<div class="feedback-banner ${correct?'ok':'ko'}">${correct?Icons.check(16):Icons.x(16)} ${correct?tr('ranking_correct'):tr('ranking_wrong')}</div>`;if(q.explanation)body+=`<div class="explanation-box">${escapeHTML(q.explanation)}</div>`;}
  const publicPlay=p.returnView==='publicQuiz';
  if(!publicPlay) return `<div class="play-wrap"><div class="play-topline"><span>${p.pos+1} ${tr('play_of')} ${p.order.length}</span><span>${escapeHTML(quiz.name)}</span></div><div class="play-progress-bar"><div class="play-progress-fill" style="width:${progressPct}%"></div></div><div class="play-card ${answerState}" data-fade>${imgHTML}<div class="play-question-text">${escapeHTML(q.text)}</div>${q.type==='ranking'&&q.criterion?`<p class="hint" style="margin-top:-18px;margin-bottom:20px;text-align:center;">${escapeHTML(q.criterion)}</p>`:''}${body}${p.revealed?`<div class="play-footer"><button class="btn btn-primary" data-action="next-play-question">${p.pos+1>=p.order.length?tr('see_results'):tr('next_question')} ${Icons.arrowRight(14)}</button></div>`:''}</div></div>`;
  return `<div class="public-play-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}"><header class="public-play-header"><div class="public-play-brand"><span class="brand-mark"><span></span></span><span>QuizCast</span></div><div class="public-play-meta"><span class="play-question-name">${escapeHTML(quiz.name)}</span><span class="public-play-score">${p.correctCount}/${p.pos}</span></div><button class="btn btn-outline btn-sm public-play-exit" data-action="public-exit-play">${tr('public_exit_quiz')}</button></header><main class="public-play-main"><div class="play-wrap"><div class="play-progress-row"><span>${tr('public_question_progress')} ${p.pos+1} ${tr('play_of')} ${p.order.length}</span><strong>${progressPct}%</strong></div><div class="play-progress-bar"><div class="play-progress-fill" style="width:${progressPct}%"></div></div><div class="play-card ${answerState}" data-fade>${imgHTML}<div class="play-question-text">${escapeHTML(q.text)}</div>${q.type==='ranking'&&q.criterion?`<p class="hint" style="margin-top:-18px;margin-bottom:20px;text-align:center;">${escapeHTML(q.criterion)}</p>`:''}${body}${p.revealed?`<div class="public-feedback-actions"><button class="btn btn-primary" data-action="next-play-question">${p.pos+1>=p.order.length?tr('see_results'):tr('next_question')} ${Icons.arrowRight(14)}</button></div>`:''}</div></div></main></div>`;
}

/* ============================================================
   19. AUTO PLAY — SETUP SCREEN
   ============================================================ */
function ensureAutoplayGuessSelections(s, quiz){
  if(!s.guessModeByQuestion) s.guessModeByQuestion={};
  (quiz.questions||[]).filter(q=>q.type==='guess_character').forEach(q=>{
    if(!s.guessModeByQuestion[q.id]) s.guessModeByQuestion[q.id]=q.imageMode==='silhouette'?'silhouette':'normal';
  });
}
function guessEffectChoices(){
  return [
    ['normal','Originale','Image complète'],
    ['pixelated','Pixelisé','Détails réduits'],
    ['silhouette','Silhouette','Personnage entièrement noir'],
    ['blurred','Flouté','Détails masqués'],
    ['random','Surprise','Effet différent à chaque question'],
    ['per_question','Personnalisé','Un effet différent pour chaque personnage']
  ];
}
function guessEffectOptions(selected){
  return [['normal','Originale'],['pixelated','Pixelisé'],['silhouette','Silhouette'],['blurred','Flouté']]
    .map(([v,l])=>`<option value="${v}" ${selected===v?'selected':''}>${l}</option>`).join('');
}
function autoplayPresets(){
  return [
    {id:'auto',title:'Auto par catégorie',desc:'Choisit automatiquement un univers visuel adapté au quiz',icon:'✦',responseTime:10,revealDuration:4,nextDelay:1.4,background:'cinematic',layout:'center',timerStyle:'pill',timerPosition:'auto'},
    {id:'nintendo',title:'Nintendo',desc:'Lumineux, joyeux, rond et très lisible',icon:'●',responseTime:9,revealDuration:4,nextDelay:1.2,background:'nintendo',layout:'split-left',timerStyle:'bar',timerPosition:'right-panel'},
    {id:'horror',title:'Horreur',desc:'Tendu, brumeux et plus théâtral',icon:'✦',responseTime:11,revealDuration:4.5,nextDelay:1.7,background:'horror',layout:'split-right',timerStyle:'minimal',timerPosition:'top-right'},
    {id:'cartoon',title:'Cartoon',desc:'Vif, coloré et plus expressif',icon:'★',responseTime:9,revealDuration:3.8,nextDelay:1.1,background:'cartoon',layout:'split-left',timerStyle:'pill',timerPosition:'right-panel'},
    {id:'arcade',title:'Arcade',desc:'Néons, énergie et rythme jeu vidéo',icon:'▦',responseTime:7,revealDuration:3,nextDelay:.8,background:'arcade',layout:'center',timerStyle:'segments',timerPosition:'top-right'},
    {id:'cinematic',title:'Cinématique',desc:'Grand décor, lumière douce et focus image',icon:'◉',responseTime:12,revealDuration:5,nextDelay:1.8,background:'cinematic',layout:'cinematic',timerStyle:'ring',timerPosition:'top-center'},
  ];
}
function autoplayLayoutChoices(){
  return [
    ['center','Centré','Image forte au centre, timer au-dessus, texte dessous'],
    ['split-left','Image à gauche','Personnage grand à gauche, question + timer à droite'],
    ['split-right','Image à droite','Question + timer à gauche, personnage à droite'],
    ['cinematic','Focus image','Image très grande, texte flottant et timer discret'],
    ['stacked','Empilé','Image en haut, question et réponses en dessous'],
  ];
}
function autoplayQuestionTypeLabel(type){
  const labels={qcm:'QCM','guess_character':'Guess the Character','true_false':'Vrai / Faux',ranking:'Classement',zoom:'Image / Zoom',number:'Nombre'};
  return labels[type] || (QuestionTypes[type]?.label ? QuestionTypes[type].label() : type);
}
function autoplayDefaultLayoutForType(type,presetId='cinematic'){
  if(type==='ranking') return 'stacked';
  if(type==='number' || type==='true_false') return 'center';
  if(type==='qcm') return 'center';
  if(type==='guess_character' || type==='zoom'){
    const preferred=getAutoplayPreset(presetId).layout;
    return ['split-left','split-right','cinematic','stacked','center'].includes(preferred) ? preferred : 'split-left';
  }
  return 'center';
}
function effectiveAutoplayLayout(eng,q){
  const byType=eng?.layoutByType||{};
  if(byType[q?.type]) return byType[q.type];
  if(eng?.layout && eng.layout!=='auto') return eng.layout;
  return autoplayDefaultLayoutForType(q?.type,eng?.preset||'cinematic');
}
function autoplayLayoutOverrideOptions(selected){
  return [
    ['auto','Auto par type'],
    ...autoplayLayoutChoices().map(([id,title])=>[id,title])
  ].map(([id,title])=>`<option value="${id}" ${selected===id?'selected':''}>${title}</option>`).join('');
}
function autoplayLayoutByTypeRows(quiz,s){
  const preset=resolveAutoplayPreset(quiz,s.preset==='auto'?'auto':s.preset);
  const types=[...new Set((quiz.questions||[]).map(q=>q.type))];
  const base=s.layout||'auto';
  return types.map(type=>{
    const current=s.layoutByType?.[type] || 'auto';
    const effective=current!=='auto' ? current : effectiveAutoplayLayout({...s,preset}, {type});
    return `<div class="autoplay-type-layout-row">
      <div class="autoplay-type-layout-copy"><strong>${escapeHTML(autoplayQuestionTypeLabel(type))}</strong><small>Par défaut : ${escapeHTML(autoplayLayoutChoices().find(x=>x[0]===effective)?.[1]||effective)}</small></div>
      <div class="autoplay-type-layout-controls"><select data-action="ap-set-layout-type" data-qtype="${escapeHTML(type)}">${autoplayLayoutOverrideOptions(current)}</select><span class="autoplay-type-layout-thumb">${autoplayLayoutThumb(effective)}</span></div>
    </div>`;
  }).join('');
}
function autoplayTimerChoices(){
  return [
    ['ring','Anneau','Classique, lisible et très visible'],
    ['bar','Barre','Progression horizontale continue'],
    ['segments','Segments','Le temps disparaît par blocs'],
    ['pill','Pill','Compact et doux, avec progression intégrée'],
    ['dots','Points','Une rangée de points qui s’efface'],
    ['minimal','Minimal','Grand chiffre sans gros élément graphique'],
  ];
}
function autoplayLayoutThumb(id){
  const image=id==='split-left'?'left':id==='split-right'?'right':id==='stacked'?'stacked':id==='cinematic'?'focus':'center';
  return `<div class="autoplay-layout-thumb layout-thumb-${image}" aria-hidden="true"><span class="thumb-img"></span><span class="thumb-copy"><i></i><i></i><i></i></span><span class="thumb-timer"></span></div>`;
}
function getAutoplayPreset(presetId){ return autoplayPresets().find(p=>p.id===presetId)||autoplayPresets()[0]; }
function autoplayBackgroundVariantChoices(presetId){
  if(presetId==='nintendo') return [
    ['1','Ciel & collines'],
    ['2','Nuages & formes'],
    ['3','Plateau coloré'],
  ];
  return [['1','Décor principal']];
}
function autoplayBackgroundUrl(presetId,variant='1'){
  const preset=getAutoplayPreset(presetId);
  const key=preset.background||'cinematic';
  const file=(key==='nintendo') ? `nintendo-${variant==='2'?'2':variant==='3'?'3':'1'}.svg` : `${key}.svg`;
  return qcRoute(`assets/autoplay/${file}`);
}
function autoplayBackgroundMarkup(presetId,mode='style',thumbnail='',variant='1',customUrl='',customType='image') {
  const art=`<div class="stage-bg-art" aria-hidden="true"><img src="${autoplayBackgroundUrl(presetId,variant)}" alt=""></div>`;
  const thumb=thumbnail?`<div class="stage-bg-media ${mode==='thumbnail'?'stage-bg-media-full':''}" aria-hidden="true"><img src="${thumbnail}" alt=""></div>`:'';
  if(mode==='custom' && customUrl){
    if(customType==='video') return `<div class="stage-bg-custom-media stage-bg-custom-video" aria-hidden="true"><video src="${customUrl}" autoplay muted loop playsinline></video></div>`;
    return `<div class="stage-bg-custom-media stage-bg-custom-image" aria-hidden="true"><img src="${customUrl}" alt=""></div>`;
  }
  if(mode==='thumbnail') return `${thumb}${art}`;
  if(mode==='mix') return `${art}${thumb}`;
  return art;
}
function getQuizCategoryNames(quiz){
  return (quiz?.categoryIds||[]).map(id=>getCategory(id)?.name||'').filter(Boolean).map(x=>x.toLowerCase());
}
function resolveAutoplayPreset(quiz,presetId){
  if(presetId && presetId!=='auto') return presetId;
  const names=getQuizCategoryNames(quiz);
  const joined=names.join(' ');
  if(/horror|horreur|creepy|scary|dark|terror|epouvante/.test(joined)) return 'horror';
  if(/nintendo|mario|zelda|pokemon|pokémon|smash|kirby|metroid|luigi|animal crossing|splatoon/.test(joined)) return 'nintendo';
  if(/cartoon|animation|dessin|simpsons|sponge|tom.?jerry|family guy|disney/.test(joined)) return 'cartoon';
  if(/arcade|retro|gaming|jeu|games|speedrun|minecraft|sonic/.test(joined)) return 'arcade';
  return 'cinematic';
}
function applyAutoplayPreset(setup,presetId){
  const preset=getAutoplayPreset(presetId);
  setup.preset=preset.id;
  setup.responseTime=preset.responseTime;
  setup.revealDuration=preset.revealDuration;
  setup.nextDelay=preset.nextDelay;
  setup.layout=preset.layout||'center';
  setup.timerStyle=preset.timerStyle||'ring';
  setup.timerPosition=preset.timerPosition||'auto';
  setup.backgroundMode='style';
  setup.backgroundVariant='1';
}
function autoplayTextStyleOptions(selected){
  return [
    ['preset','Selon le style','S’adapte automatiquement au preset choisi'],
    ['clean','Clean','Simple et très lisible'],
    ['playful','Playful','Plus rond et joyeux'],
    ['bold','Bold','Très épais, pensé pour mobile/YouTube'],
    ['retro','Retro','Aspect arcade / console'],
    ['editorial','Editorial','Plus élégant et cinématique'],
  ].map(([id,title,desc])=>`<option value="${id}" ${selected===id?'selected':''}>${title} — ${desc}</option>`).join('');
}
function autoplayMediaTypeFromFile(file){
  if(!file) return 'image';
  return file.type.startsWith('video/') ? 'video' : 'image';
}
function autoplayExternalMediaPreview(url,type){
  if(!url) return '';
  if(type==='video') return `<video class="autoplay-custom-media-preview" src="${url}" muted loop autoplay playsinline></video>`;
  return `<img class="autoplay-custom-media-preview" src="${url}" alt="">`;
}
function autoplayRevealLanguage(setup,quiz){
  const choice=setup?.revealLanguage||'auto';
  if(choice==='en') return 'en';
  if(choice==='fr') return 'fr';
  return quiz?.language==='en' ? 'en' : 'fr';
}
function autoplayCorrectLabel(setup,quiz){
  return autoplayRevealLanguage(setup,quiz)==='en' ? 'Correct answer' : 'Réponse correcte';
}
function autoplayResultLabel(setup,quiz){
  return autoplayRevealLanguage(setup,quiz)==='en' ? 'Correct answer' : 'Réponse correcte';
}
function autoplayBackgroundVariantOptions(presetId,selected){
  return autoplayBackgroundVariantChoices(presetId).map(([id,label])=>`<option value="${id}" ${selected===id?'selected':''}>${label}</option>`).join('');
}
function autoplayBackgroundPreviewMarkup(presetId,selected){
  return autoplayBackgroundVariantChoices(presetId).map(([id,label])=>`<button type="button" class="autoplay-background-preview ${selected===id?'selected':''}" data-action="ap-set-background-variant" data-variant="${id}" title="${label}"><img src="${autoplayBackgroundUrl(presetId,id)}" alt="${label}"><span>${label}</span>${selected===id?'<b>✓</b>':''}</button>`).join('');
}

function autoplayLayoutOptions(selected){
  return autoplayLayoutChoices().map(([id,title,desc])=>`<button type="button" class="autoplay-choice-card autoplay-layout-choice ${selected===id?'selected':''}" data-action="ap-set-layout" data-layout="${id}"><span class="autoplay-choice-thumb">${autoplayLayoutThumb(id)}</span><span class="autoplay-choice-copy"><strong>${title}</strong><small>${desc}</small></span></button>`).join('');
}
function autoplayTimerThumb(id){
  if(id==='bar') return '<span class="autoplay-timer-thumb timer-thumb-bar"><i></i><b>10</b></span>';
  if(id==='segments') return '<span class="autoplay-timer-thumb timer-thumb-segments"><i></i><i></i><i></i><i></i><i></i><i></i><b>10</b></span>';
  if(id==='pill') return '<span class="autoplay-timer-thumb timer-thumb-pill"><i></i><b>10s</b></span>';
  if(id==='dots') return '<span class="autoplay-timer-thumb timer-thumb-dots"><i></i><i></i><i></i><i></i><i></i><i></i><b>10</b></span>';
  if(id==='minimal') return '<span class="autoplay-timer-thumb timer-thumb-minimal"><b>10</b></span>';
  return '<span class="autoplay-timer-thumb timer-thumb-ring"><i></i><b>10</b></span>';
}
function autoplayTimerOptions(selected){
  return autoplayTimerChoices().map(([id,title,desc])=>`<button type="button" class="autoplay-choice-card autoplay-timer-choice ${selected===id?'selected':''}" data-action="ap-set-timer-style" data-timer-style="${id}"><span class="autoplay-choice-thumb autoplay-timer-choice-thumb">${autoplayTimerThumb(id)}</span><span class="autoplay-choice-copy autoplay-timer-choice-copy"><strong>${title}</strong><small>${desc}</small></span></button>`).join('');
}
function autoplayTimerMarkup(style='ring',position='auto',value='10',preview=false){
  const pos=position==='auto'?'auto':position;
  const cls=`autoplay-timer timer-style-${style} timer-pos-${pos}${preview?' preview-timer-widget':''}`;
  if(style==='bar') return `<div class="${cls}" id="timer-widget"><div class="timer-bar-head"><span class="timer-label">Temps</span><b class="timer-countdown-num">${escapeHTML(String(value))}</b></div><div class="timer-bar-track"><span id="timer-bar-fill"></span></div></div>`;
  if(style==='segments') return `<div class="${cls}" id="timer-widget"><div class="timer-segments" id="timer-segments">${Array.from({length:12},(_,i)=>`<i data-segment="${i}"></i>`).join('')}</div><b class="timer-countdown-num">${escapeHTML(String(value))}</b></div>`;
  if(style==='pill') return `<div class="${cls}" id="timer-widget"><div class="timer-pill-track"><span id="timer-pill-fill"></span></div><div class="timer-pill-copy"><span>Temps restant</span><b class="timer-countdown-num">${escapeHTML(String(value))}</b></div></div>`;
  if(style==='dots') return `<div class="${cls}" id="timer-widget"><div class="timer-dots" id="timer-dots">${Array.from({length:8},(_,i)=>`<i data-dot="${i}"></i>`).join('')}</div><b class="timer-countdown-num">${escapeHTML(String(value))}</b></div>`;
  if(style==='minimal') return `<div class="${cls}" id="timer-widget"><b class="timer-countdown-num">${escapeHTML(String(value))}</b><span>sec</span></div>`;
  const c=2*Math.PI*55;
  return `<div class="${cls} timer-ring" id="timer-ring-wrap"><svg viewBox="0 0 130 130" width="130" height="130"><circle class="bg" cx="65" cy="65" r="55"></circle><circle class="fg" id="timer-ring-fg" cx="65" cy="65" r="55" stroke-dasharray="${c}" stroke-dashoffset="0"></circle></svg><div class="num timer-countdown-num" id="timer-ring-num">${escapeHTML(String(value))}</div></div>`;
}
function autoplayLayoutClass(layout){ return `layout-${layout||'center'}`; }
function buildAutoplayQuestionMarkup(eng,quiz,sourceQ,preview=false){
  const q=getAutoplayGuessQuestion(sourceQ,eng);
  const type=QuestionTypes[q.type];
  if(eng._answerOrderForQ!==q.id){
    let ord=(q.answers||[]).map((_,i)=>i);
    if(eng.shuffleA && !preview) ord=shuffleArray(ord);
    eng.answerOrder=ord; eng._answerOrderForQ=q.id;
  }
  let imgHTML='';
  if(q.image){
    if(q.type==='guess_character') imgHTML=modeImageHTML(q,'stage-guess-image qfade-in','animation-delay:.08s;');
    else if(q.type==='zoom') imgHTML=`<div class="zoom-stage-wrap qfade-in" style="--zoom-from:${q.zoomStart||3};"><img class="zoom-stage-img" src="${q.image}" style="--zoom-duration:${eng.responseTime}s;animation-duration:${eng.responseTime}s;"></div>`;
    else imgHTML=`<img class="stage-qimg qfade-in" src="${q.image}" style="animation-delay:.08s;">`;
  }
  let info='';
  if(q.type==='number'){
    info=`<div class="stage-number-info"><div class="number-value-display">?</div><div class="number-scale"><div class="number-scale-fill" id="stage-number-fill"></div><div class="number-marker" id="stage-number-marker"></div></div><div class="number-scale-labels"><span>${q.min}</span><span>${q.max}</span></div><div class="stage-number-value" id="stage-number-value"></div></div>`;
  }else if(q.type==='ranking'){
    const ids=eng.answerOrder.map(i=>q.answers[i]);
    info=`${q.criterion?`<div class="stage-q-criterion">${escapeHTML(q.criterion)}</div>`:''}<div class="stage-ranking">${ids.map((a,i)=>`<div class="stage-ranking-item" data-aid="${a.id}"><span class="ranking-index">${i+1}</span><span>${escapeHTML(a.text)}</span></div>`).join('')}</div>`;
  }else if(q.type==='guess_character'){
    info=`<div class="stage-qtext-wrap qfade-in" style="animation-delay:.14s;"><div class="stage-qtext">${escapeHTML(q.text)}</div></div>`;
  }else{
    const letters=['a','b','c','d','e','f'];
    const answersHTML=(eng.answerOrder||[]).map((ansIdx,i)=>{const a=q.answers[ansIdx],letter=letters[i];return `<div class="stage-tile ${letter}" data-aid="${a.id}" style="animation-delay:${(.24+i*.07).toFixed(2)}s">${type.renderPlayTile(a,letter)}</div>`;}).join('');
    info=`<div class="stage-qtext-wrap qfade-in" style="animation-delay:.14s;"><div class="stage-qtext">${escapeHTML(q.text)}</div></div><div class="stage-answers">${answersHTML}</div>`;
  }
  const timer=autoplayTimerMarkup(eng.timerStyle||'ring',eng.timerPosition||'auto',eng.responseTime||3,preview);
  const hasVisual=Boolean(imgHTML);
  const layout=autoplayLayoutClass(effectiveAutoplayLayout(eng,q));
  const rootClass=`stage-question-layout ${layout}${hasVisual?' has-visual':' no-visual'} autoplay-question-type-${q.type}`;
  if(q.type==='number' && !q.image) return `<div class="${rootClass}"><div class="stage-question-info full">${timer}<div class="stage-qtext-wrap qfade-in"><div class="stage-qtext">${escapeHTML(q.text)}</div></div>${info}</div></div>`;
  return `<div class="${rootClass}">${hasVisual?`<div class="stage-question-visual">${imgHTML}</div>`:''}<div class="stage-question-info">${timer}${info}</div></div>`;
}
function autoplayIntroMessageOptions(selected){
  return [
    ['lets-go','Let’s go!'],
    ['have-fun','Have fun!'],
    ['good-luck','Good luck!'],
    ['ready','Ready? Let’s begin!'],
    ['game-on','Game on!'],
  ].map(([id,label])=>`<option value="${id}" ${selected===id?'selected':''}>${label}</option>`).join('');
}
function autoplayIntroMessage(id){
  return ({
    'lets-go':'Let’s go!',
    'have-fun':'Have fun!',
    'good-luck':'Good luck!',
    ready:'Ready? Let’s begin!',
    'game-on':'Game on!',
  })[id]||'Let’s go!';
}
function openAutoplaySetup(quizId){
  const quiz=getQuiz(quizId);
  if(!quiz || quiz.questions.length===0){ showToast(tr('empty_questions_title'),'err'); return; }
  STATE.autoplaySetup={quizId,responseTime:10,revealDuration:4,nextDelay:1.4,shuffleQ:false,shuffleA:false,guessMode:'normal',guessDifficulty:'normal',guessModeByQuestion:{},preset:'auto',backgroundMode:'style',backgroundVariant:'1',customMediaUrl:'',customMediaType:'image',revealLanguage:'auto',layout:'auto',layoutByType:{},timerStyle:'pill',timerPosition:'auto',textStyle:'preset',introMessage:'lets-go'};
  ensureAutoplayGuessSelections(STATE.autoplaySetup,quiz);
  STATE.view='autoplaySetup';
  render();
}
function renderAutoplaySetupView(){
  const s=STATE.autoplaySetup;
  const quiz=getQuiz(s.quizId);
  if(!quiz){STATE.view='library';return renderLibrary();}
  ensureAutoplayGuessSelections(s,quiz);
  const times=[5,10,15,20];
  const guessQuestions=(quiz.questions||[]).filter(q=>q.type==='guess_character');
  const guessSection=guessQuestions.length?`
    <div class="section-title" style="margin-top:28px;">Guess the Character</div>
    <p class="hint" style="margin-bottom:12px;">Ces réglages concernent uniquement les questions « Guess the character ». Les autres types de questions du quiz continuent de fonctionner normalement.</p>
    <div class="field">
      <label class="field-label">Effet des personnages</label>
      <div class="autoplay-effect-grid">
        ${guessEffectChoices().map(([id,title,desc])=>`<button type="button" class="guess-mode-choice ${s.guessMode===id?'selected':''}" data-action="ap-set-guess-mode" data-mode="${id}"><strong>${title}</strong><span>${desc}</span></button>`).join('')}
      </div>
    </div>
    <div class="field" style="margin-top:16px;">
      <label class="field-label">Difficulté des effets</label>
      <div class="guess-difficulty-grid">
        ${[['easy','Facile','Effets légers'],['normal','Normale','Bon équilibre'],['hard','Difficile','Effets plus marqués']].map(([id,title,desc])=>`<button type="button" class="guess-difficulty-choice ${s.guessDifficulty===id?'selected':''}" data-action="ap-set-guess-difficulty" data-difficulty="${id}"><strong>${title}</strong><span>${desc}</span></button>`).join('')}
      </div>
    </div>
    ${s.guessMode==='per_question'?`<div class="autoplay-per-question-list"><div class="field-label" style="margin-bottom:8px;">Effet de chaque personnage</div>${guessQuestions.map((q,i)=>`<div class="autoplay-per-question-row"><div class="autoplay-per-question-copy"><span class="autoplay-q-index">${i+1}</span><div><strong>${escapeHTML(q.answerText||'Personnage')}</strong><small>${escapeHTML((q.text||'').slice(0,90))}</small></div></div><select data-action="ap-set-guess-question-mode" data-qid="${q.id}">${guessEffectOptions(s.guessModeByQuestion[q.id]||'normal')}</select></div>`).join('')}</div>`:''}
  `:'';
  const presets=autoplayPresets();
  return `
  <div class="topbar"><div><button class="btn btn-outline btn-sm" data-action="set-view" data-view="library">${Icons.arrowLeft(13)} ${tr('back_to_library')}</button></div></div>
  <div class="autoplay-setup panel autoplay-setup-youtube">
    <div class="autoplay-setup-header">
      <div><h1 style="margin-bottom:4px;">${tr('autoplay_setup_title')}</h1><p class="sub" style="color:var(--text-dim);margin-bottom:0;">${tr('autoplay_setup_sub')} — <strong>${escapeHTML(quiz.name)}</strong> (${quiz.questions.length} ${tr(quiz.questions.length===1?'q_count_1':'q_count')})</p></div>
      <div class="autoplay-youtube-badge"><span>16:9</span><span>OBS / YouTube</span></div>
    </div>
    <div class="section-title autoplay-section-heading" style="margin-top:28px;">Style vidéo</div>
    <p class="hint autoplay-preset-hint">Choisis une direction visuelle. Tu peux ensuite modifier les réglages de durée, d'effets et de mélange sans changer de preset.</p>
    <div class="autoplay-preset-grid">
      ${presets.map(p=>`<button type="button" class="autoplay-preset-card ${s.preset===p.id?'selected':''}" data-action="ap-set-preset" data-preset="${p.id}">
        <span class="autoplay-preset-icon preset-${p.id}">${p.icon}</span><span class="autoplay-preset-copy"><strong>${p.title}</strong><small>${p.desc}</small></span><span class="autoplay-preset-check">${s.preset===p.id?'✓':''}</span>
      </button>`).join('')}
    </div>
    <div class="field autoplay-background-field">
      <label class="field-label">Décor de fond</label>
      <select class="autoplay-background-select" data-action="ap-set-background-mode">
        <option value="style" ${s.backgroundMode==='style'?'selected':''}>Décor du style — recommandé</option>
        <option value="mix" ${s.backgroundMode==='mix'?'selected':''}>Décor + ambiance de la miniature</option>
        <option value="thumbnail" ${s.backgroundMode==='thumbnail'?'selected':''} ${!quiz.thumbnail?'disabled':''}>Miniature du quiz comme décor</option>
        <option value="custom" ${s.backgroundMode==='custom'?'selected':''}>Média externe — image, GIF ou vidéo</option>
      </select>
      <p class="hint">Tu peux garder le décor du style, utiliser la miniature du quiz, ou remplacer complètement le fond par ton propre média.</p>
      ${s.backgroundMode==='custom'?`
      <div class="autoplay-custom-media-box">
        <div class="two-col">
          <div>
            <label class="field-label">URL du média</label>
            <input class="input" type="url" data-action="ap-set-custom-media-url" value="${escapeHTML(s.customMediaUrl||'')}" placeholder="https://...">
            <p class="hint">Image, GIF ou fichier vidéo hébergé en ligne.</p>
          </div>
          <div>
            <label class="field-label">Ou importer un fichier</label>
            <input class="input" type="file" accept="image/*,video/*,.gif" data-action="ap-set-custom-media-file">
            <p class="hint">Utilisé pour cette session Auto Play. Les vidéos locales ne sont pas copiées dans la bibliothèque.</p>
          </div>
        </div>
        ${s.customMediaUrl?`<div class="autoplay-custom-media-preview-wrap">${autoplayExternalMediaPreview(s.customMediaUrl,s.customMediaType||'image')}</div>`:''}
      </div>`:''}
    </div>
    <div class="two-col autoplay-style-options">
      <div class="field autoplay-background-field">
        <label class="field-label">Variante du décor</label>
        <select class="autoplay-background-select" data-action="ap-set-background-variant">${autoplayBackgroundVariantOptions(s.preset==='auto'?resolveAutoplayPreset(quiz,'auto'):s.preset,s.backgroundVariant||'1')}</select>
        <div class="autoplay-background-preview-grid">${autoplayBackgroundPreviewMarkup(s.preset==='auto'?resolveAutoplayPreset(quiz,'auto'):s.preset,s.backgroundVariant||'1')}</div>
        <p class="hint">Nintendo possède plusieurs décors originaux. Clique directement sur un aperçu ou utilise le sélecteur.</p>
      </div>
      <div class="field autoplay-background-field">
        <label class="field-label">Langue des réponses à l'écran</label>
        <select class="autoplay-background-select" data-action="ap-set-reveal-language">
          <option value="auto" ${(s.revealLanguage||'auto')==='auto'?'selected':''}>Automatique — langue du quiz</option>
          <option value="fr" ${s.revealLanguage==='fr'?'selected':''}>Français — « Réponse correcte »</option>
          <option value="en" ${s.revealLanguage==='en'?'selected':''}>English — “Correct answer”</option>
        </select>
        <p class="hint">Cette langue concerne les labels affichés dans la vidéo, indépendamment de la langue de l'interface admin.</p>
      </div>
      <div class="field autoplay-background-field">
        <label class="field-label">Style du texte</label>
        <select class="autoplay-background-select" data-action="ap-set-text-style">${autoplayTextStyleOptions(s.textStyle||'preset')}</select>
        <p class="hint">Le choix s’applique au titre, à la question, au timer et aux écrans d’introduction.</p>
      </div>
    </div>
    <div class="section-title autoplay-section-heading">Disposition des questions</div>
    <p class="hint autoplay-preset-hint">Le preset donne une direction générale, puis chaque type de question peut avoir son propre layout. Ainsi un QCM peut rester centré pendant qu'un personnage occupe la moitié de l'écran.</p>
    <div class="field autoplay-background-field">
      <label class="field-label">Disposition générale</label>
      <select class="autoplay-background-select" data-action="ap-set-layout-default">${autoplayLayoutOverrideOptions(s.layout||'auto')}</select>
    </div>
    <div class="autoplay-type-layout-list">${autoplayLayoutByTypeRows(quiz,s)}</div>
    <div class="field autoplay-background-field">
      <label class="field-label">Style du timer</label>
      <div class="autoplay-choice-grid autoplay-timer-grid">${autoplayTimerOptions(s.timerStyle||getAutoplayPreset(s.preset==='auto'?resolveAutoplayPreset(quiz,'auto'):s.preset).timerStyle||'ring')}</div>
    </div>
    <div class="field autoplay-background-field">
      <label class="field-label">Position du timer</label>
      <select class="autoplay-background-select" data-action="ap-set-timer-position">
        <option value="auto" ${(s.timerPosition||'auto')==='auto'?'selected':''}>Automatique — adaptée au layout</option>
        <option value="top-center" ${s.timerPosition==='top-center'?'selected':''}>En haut — centré</option>
        <option value="top-right" ${s.timerPosition==='top-right'?'selected':''}>En haut à droite</option>
        <option value="top-left" ${s.timerPosition==='top-left'?'selected':''}>En haut à gauche</option>
        <option value="right-panel" ${s.timerPosition==='right-panel'?'selected':''}>Dans le panneau d'information</option>
      </select>
    </div>
    <div class="field"><label class="field-label">${tr('response_time')}</label><div class="mode-grid" style="grid-template-columns:repeat(4,1fr);">${times.map(t=>`<div class="mode-opt ${s.responseTime===t?'selected':''}" data-action="ap-set-response-time" data-value="${t}">${t}${tr('duration_short')}</div>`).join('')}</div></div>
    <div class="two-col">
      <div class="field"><label class="field-label">${tr('reveal_duration')}</label><div class="range-row"><input type="range" min="1" max="6" value="${s.revealDuration}" data-action="ap-set-reveal-duration"><span class="val" id="ap-reveal-val">${s.revealDuration}s</span></div></div>
      <div class="field"><label class="field-label">${tr('next_delay')}</label><div class="range-row"><input type="range" min="0" max="5" step="0.5" value="${s.nextDelay}" data-action="ap-set-next-delay"><span class="val" id="ap-delay-val">${s.nextDelay}s</span></div></div>
    </div>
    ${guessSection}
    <div class="section-title">${tr('shuffle_title')}</div>
    <div class="checkbox-row" style="margin-bottom:22px;"><div class="cat-toggle ${s.shuffleQ?'selected':''}" data-action="ap-toggle-shuffle-q">${tr('shuffle_questions')}</div><div class="cat-toggle ${s.shuffleA?'selected':''}" data-action="ap-toggle-shuffle-a">${tr('shuffle_answers')}</div></div>
    <p class="hint" style="margin-bottom:18px;">${tr('fullscreen_hint')}</p>
    <div class="field autoplay-background-field autoplay-intro-field">
      <label class="field-label">Message d’introduction vidéo</label>
      <select class="autoplay-background-select" data-action="ap-set-intro-message">${autoplayIntroMessageOptions(s.introMessage||'lets-go')}</select>
      <p class="hint">Un écran d’accueil 16:9 présentera le quiz avant la première question.</p>
    </div>
    <div class="autoplay-static-preview-hint"><strong>Les aperçus ci-dessus sont statiques</strong><span>Ils servent uniquement à visualiser la composition. Le vrai rendu utilise ensuite le décor, les animations et les transitions du style choisi.</span></div>
    <div class="autoplay-launch-actions">
      <button class="btn btn-primary" data-action="launch-autoplay-stage">${Icons.cast(16)} ${tr('start_quiz')}</button>
    </div>
  </div>`;
}

/* ============================================================
   20. AUTO PLAY — BROADCAST STAGE ENGINE
   ============================================================ */
let apTimers = { phaseTimeout:null, tickRAF:null };
let _stageEndActionsTimer = null;
function clearApTimers(){
  if(apTimers.phaseTimeout) clearTimeout(apTimers.phaseTimeout);
  if(apTimers.tickRAF) cancelAnimationFrame(apTimers.tickRAF);
  apTimers.phaseTimeout=null; apTimers.tickRAF=null;
}
function shuffleArray(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function launchAutoplayStage(){
  clearApTimers();
  const s = STATE.autoplaySetup;
  const quiz = getQuiz(s.quizId);
  if(!quiz) return;
  let order = quiz.questions.map((_,i)=>i);
  if(s.shuffleQ) order = shuffleArray(order);
  ensureAutoplayGuessSelections(s,quiz);
  STATE.autoplayEngine = {
    quizId:s.quizId, order, pos:0, phase:'intro', introStep:1,
    responseTime:s.responseTime, revealDuration:s.revealDuration, nextDelay:s.nextDelay, shuffleA:s.shuffleA, preset:resolveAutoplayPreset(quiz,s.preset||'auto'), backgroundMode:s.backgroundMode||'style', backgroundVariant:s.backgroundVariant||'1', customMediaUrl:s.customMediaUrl||'', customMediaType:s.customMediaType||'image', revealLanguage:s.revealLanguage||'auto', textStyle:s.textStyle||'preset', layout:s.layout||'auto', layoutByType:{...(s.layoutByType||{})}, timerStyle:s.timerStyle||getAutoplayPreset(resolveAutoplayPreset(quiz,s.preset||'auto')).timerStyle||'ring', timerPosition:s.timerPosition||getAutoplayPreset(resolveAutoplayPreset(quiz,s.preset||'auto')).timerPosition||'auto',
    guessMode:s.guessMode||'normal', guessDifficulty:s.guessDifficulty||'normal', introMessage:s.introMessage||'lets-go', guessModeByQuestion:{...(s.guessModeByQuestion||{})}, guessRandomByQuestion:{},
    phaseStart:performance.now(), answerOrder:null, _answerOrderForQ:null,
  };
  renderStageShell();        // creates the fullscreen-capable container ONCE for the whole quiz
  runAutoplayIntroSequence();
}
function autoplayIntroWorld(preset){
  return ({nintendo:'Nintendo',horror:'Horreur',cartoon:'Cartoon',arcade:'Arcade',cinematic:'QuizCast'})[preset]||'QuizCast';
}
function autoplayDifficultyLabel(quiz,lang){
  const d=String(quiz?.difficulty||'normal').toLowerCase();
  if(lang==='en') return ({easy:'Easy',facile:'Easy',normal:'Normal',medium:'Normal',hard:'Hard',difficile:'Hard'}[d]||'Normal');
  return ({easy:'Facile',facile:'Facile',normal:'Normale',medium:'Normale',hard:'Difficile',difficile:'Difficile'}[d]||'Normale');
}
function autoplayIntroSlideMarkup(eng,quiz,step){
  const lang=autoplayRevealLanguage(eng,quiz);
  const preset=eng.preset||'cinematic';
  const world=autoplayIntroWorld(preset);
  const difficulty=autoplayDifficultyLabel(quiz,lang);
  const count=quiz.questions.length;
  const seconds=eng.responseTime;
  const text=autoplayIntroMessage(eng.introMessage);
  if(lang==='en'){
    if(step===1) return `<div class="stage-intro-screen stage-intro-screen-1"><span class="stage-intro-eyebrow">QUIZCAST</span><div class="stage-intro-big">Welcome to a<br><strong>${escapeHTML(world)}</strong> quiz</div></div>`;
    if(step===2) return `<div class="stage-intro-screen stage-intro-screen-2"><span class="stage-intro-eyebrow">GET READY</span><div class="stage-intro-stats"><strong>${count}</strong><span>questions</span><i></i><strong>${escapeHTML(difficulty)}</strong><i></i><strong>${seconds}s</strong><span>to think</span></div></div>`;
    return `<div class="stage-intro-screen stage-intro-screen-3"><div class="stage-intro-final">${escapeHTML(text)}</div></div>`;
  }
  if(step===1) return `<div class="stage-intro-screen stage-intro-screen-1"><span class="stage-intro-eyebrow">QUIZCAST</span><div class="stage-intro-big">Bienvenue à un quiz<br><strong>${escapeHTML(world)}</strong></div></div>`;
  if(step===2) return `<div class="stage-intro-screen stage-intro-screen-2"><span class="stage-intro-eyebrow">PRÉPARE-TOI</span><div class="stage-intro-stats"><strong>${count}</strong><span>questions</span><i></i><strong>${escapeHTML(difficulty)}</strong><i></i><strong>${seconds}s</strong><span>pour réfléchir</span></div></div>`;
  return `<div class="stage-intro-screen stage-intro-screen-3"><div class="stage-intro-final">${escapeHTML(text)}</div></div>`;
}
function renderAutoplayIntro(){
  const eng=STATE.autoplayEngine, quiz=eng&&getQuiz(eng.quizId);
  const content=document.getElementById('stage-content');
  if(!eng||!quiz||!content) return;
  content.innerHTML=autoplayIntroSlideMarkup(eng,quiz,eng.introStep||1);
  content.classList.remove('stage-intro-out');
  content.classList.add('stage-intro-in');
  setTimeout(()=>content.classList.remove('stage-intro-in'),700);
}
function startAutoplayCountdown(){
  const eng=STATE.autoplayEngine;
  if(!eng||eng.phase!=='intro') return;
  clearApTimers();
  eng.introStep=3;
  renderAutoplayIntro();
  apTimers.phaseTimeout=setTimeout(()=>{
    eng.phase='counting';
    eng.phaseStart=performance.now();
    renderQuestionIntoStage(()=>runAutoplayPhaseTimer());
  },1300);
}
function runAutoplayIntroSequence(){
  const eng=STATE.autoplayEngine;
  if(!eng||eng.phase!=='intro') return;
  eng.introStep=eng.introStep||1;
  renderAutoplayIntro();
  const duration=eng.introStep===1?1800:eng.introStep===2?2100:1300;
  apTimers.phaseTimeout=setTimeout(()=>{
    if(eng.introStep<3){
      eng.introStep+=1;
      runAutoplayIntroSequence();
    }else{
      eng.phase='counting';
      eng.phaseStart=performance.now();
      renderQuestionIntoStage(()=>runAutoplayPhaseTimer());
    }
  },duration);
}
function runAutoplayPhaseTimer(){
  clearApTimers();
  const eng = STATE.autoplayEngine;
  if(!eng || eng.phase==='intro') return;
  if(eng.phase==='counting'){
    eng.phaseStart = performance.now();
    tickCountdown();
    apTimers.phaseTimeout = setTimeout(()=>{
      eng.phase='revealing'; eng.phaseStart=performance.now();
      updateRevealVisuals();
      runAutoplayPhaseTimer();
    }, eng.responseTime*1000);
  } else if(eng.phase==='revealing'){
    apTimers.phaseTimeout = setTimeout(()=>{
      if(eng.pos >= eng.order.length-1){
        eng.phase='finished';
        renderFinishedStage();
      } else {
        eng.phase='pausing';
        apTimers.phaseTimeout = setTimeout(()=>{
          eng.pos++; eng.phase='counting';
          renderQuestionIntoStage(()=>runAutoplayPhaseTimer());
        }, eng.nextDelay*1000);
      }
    }, eng.revealDuration*1000);
  }
}
function tickCountdown(){
  const eng = STATE.autoplayEngine;
  if(!eng || eng.phase!=='counting') return;
  const elapsed = (performance.now()-eng.phaseStart)/1000;
  const remain = Math.max(0, eng.responseTime-elapsed);
  const pct = clamp(elapsed/eng.responseTime,0,1);
  updateCountdownDOM(remain,pct);
  apTimers.tickRAF = requestAnimationFrame(tickCountdown);
}
function updateCountdownDOM(remain,pct){
  const eng=STATE.autoplayEngine||STATE.autoplaySetup||{};
  const ringFg=document.getElementById('timer-ring-fg');
  const ringWrap=document.getElementById('timer-ring-wrap');
  const nums=document.querySelectorAll('.timer-countdown-num');
  const c=2*Math.PI*55;
  if(ringFg){ ringFg.style.strokeDasharray=c; ringFg.style.strokeDashoffset=c*pct; }
  if(ringWrap) ringWrap.classList.toggle('urgent', remain<=3 && remain>0);
  nums.forEach(n=>{n.textContent=Math.ceil(remain);});
  const bar=document.getElementById('timer-bar-fill'); if(bar) bar.style.width=`${Math.max(0,(1-pct)*100)}%`;
  const pill=document.getElementById('timer-pill-fill'); if(pill) pill.style.width=`${Math.max(0,(1-pct)*100)}%`;
  document.querySelectorAll('#timer-segments i').forEach((el,i)=>el.classList.toggle('active', i < Math.ceil((1-pct)*12)));
  document.querySelectorAll('#timer-dots i').forEach((el,i)=>el.classList.toggle('active', i < Math.ceil((1-pct)*8)));
}

/* The stage container (#stage-16x9) is created ONCE per quiz run and never destroyed
   mid-quiz — only its inner #stage-content is swapped between questions. This keeps the
   browser's fullscreen element alive across phase transitions and avoids re-triggering
   entrance animations on every reveal. */
function renderStageShell(){
  const root = document.getElementById('autoplay-root');
  if(!root) return;
  const quiz=STATE.autoplayEngine ? getQuiz(STATE.autoplayEngine.quizId) : null;
  const presetClass=STATE.autoplayEngine?.preset ? ` autoplay-preset-${STATE.autoplayEngine.preset}` : '';
  const preset = STATE.autoplayEngine?.preset || 'cinematic';
  const textStyle=STATE.autoplayEngine?.textStyle||'preset';
  const bgMedia=autoplayBackgroundMarkup(preset,STATE.autoplayEngine?.backgroundMode||'style',quiz?.thumbnail||'',STATE.autoplayEngine?.backgroundVariant||'1',STATE.autoplayEngine?.customMediaUrl||'',STATE.autoplayEngine?.customMediaType||'image');
  root.innerHTML = `<div class="stage-wrap${presetClass ? ' '+presetClass : ''}" id="stage-wrap"><div class="stage-16x9${presetClass} autoplay-text-style-${textStyle}" id="stage-16x9">
    <svg width="0" height="0" style="position:absolute"><defs>
      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c5cfc"/>
        <stop offset="50%" stop-color="#ffb627"/>
        <stop offset="100%" stop-color="#ff5d6c"/>
      </linearGradient>
    </defs></svg>
    <div class="stage-video-meta">
      <div class="stage-video-title" id="stage-video-title"></div>
      <div class="stage-video-progress" id="stage-video-progress">1 / 1</div>
    </div>
    <div class="stage-video-progress-line"><span id="stage-video-progress-fill"></span></div>
    ${bgMedia}<div class="stage-content" id="stage-content"></div>
    <div class="stage-exit" style="display:flex;gap:8px;">
      <button class="btn btn-ghost btn-icon" data-action="toggle-fullscreen-stage" title="${tr('toggle_fullscreen')}">${Icons.maximize(16)}</button>
      <button class="btn btn-ghost btn-icon" data-action="exit-autoplay-stage" title="${tr('exit_stage')}">${Icons.x(16)}</button>
    </div>
  </div></div>`;
}
function renderQuestionIntoStage(onReady){
  const eng = STATE.autoplayEngine;
  const quiz = eng && getQuiz(eng.quizId);
  const content = document.getElementById('stage-content');
  if(!eng || !quiz || !content) return;
  const populate = () => { populateStageContent(eng, quiz, content); if(onReady) onReady(); };
  if(content.children.length){
    content.classList.add('stage-fade-out');
    setTimeout(populate, 280);
  } else {
    populate();
  }
}
function getAutoplayGuessQuestion(q,eng){
  if(q.type!=='guess_character') return q;
  let mode=eng.guessMode||'normal';
  if(mode==='per_question') mode=eng.guessModeByQuestion?.[q.id]||'normal';
  if(mode==='random'){
    if(!eng.guessRandomByQuestion[q.id]){
      const pool=['normal','pixelated','silhouette','blurred'];
      eng.guessRandomByQuestion[q.id]=pool[Math.floor(Math.random()*pool.length)];
    }
    mode=eng.guessRandomByQuestion[q.id];
  }
  const values=guessEffectValues(eng.guessDifficulty||'normal');
  return {...q,imageMode:mode,pixelSize:values.pixelSize,blurPx:values.blurPx};
}

function populateStageContent(eng,quiz,content){
  const originalQ=quiz.questions[eng.order[eng.pos]];
  eng._answerOrderForQ=null;
  content.classList.remove('stage-fade-out');
  content.innerHTML=buildAutoplayQuestionMarkup(eng,quiz,originalQ,false);
  const titleEl=document.getElementById('stage-video-title');
  const progressEl=document.getElementById('stage-video-progress');
  const progressFill=document.getElementById('stage-video-progress-fill');
  if(titleEl) titleEl.textContent=quiz.name||'QuizCast';
  if(progressEl) progressEl.textContent=`${eng.pos+1} / ${eng.order.length}`;
  if(progressFill) progressFill.style.width=`${((eng.pos+1)/Math.max(1,eng.order.length))*100}%`;
  flushPendingModeImages();
  updateCountdownDOM(eng.responseTime,0);
}
function updateRevealVisuals(){
  const eng=STATE.autoplayEngine,quiz=eng&&getQuiz(eng.quizId);
  if(!eng||!quiz)return;
  const q=quiz.questions[eng.order[eng.pos]];
  const ringWrap=document.getElementById('timer-ring-wrap');
  if(ringWrap)ringWrap.classList.add('hiding');
  const content=document.getElementById('stage-content');
  if(q.type==='ranking'){
    const list=document.querySelector('#stage-content .stage-ranking');if(!list)return;
    const before=new Map([...list.children].map(el=>[el.dataset.aid,el.getBoundingClientRect().top]));
    [...q.answers].forEach((a,i)=>{const el=[...list.children].find(x=>x.dataset.aid===a.id);if(el)list.appendChild(el);});
    list.classList.add('revealed');
    [...list.children].forEach((el,i)=>{const old=before.get(el.dataset.aid);const now=el.getBoundingClientRect().top;if(old!=null){const dy=old-now;el.style.transform=`translateY(${dy}px)`;requestAnimationFrame(()=>{el.style.transform='';});}const n=el.querySelector('.ranking-index');if(n)n.textContent=i+1;});
    return;
  }
  if(q.type==='number'){
    const pct=clamp((q.value-q.min)/(q.max-q.min)*100,0,100);const fill=document.getElementById('stage-number-fill'),marker=document.getElementById('stage-number-marker'),val=document.getElementById('stage-number-value');
    if(fill)fill.style.width=pct+'%';if(marker){marker.style.left=pct+'%';marker.classList.add('revealed');}if(val){val.textContent=`${q.value}${q.unit?' '+q.unit:''}`;val.classList.add('visible');}return;
  }
  if(q.type==='guess_character'){
    if(content){
      content.classList.add('stage-reveal-out');
      setTimeout(()=>{
        content.innerHTML=`<div class="stage-guess-reveal stage-reveal-soft preset-reveal-${eng.preset}">
          <div class="stage-guess-reveal-bg" aria-hidden="true"><img src="${q.image||''}" alt=""></div>
          <div class="stage-guess-reveal-media"><img class="stage-guess-reveal-img" src="${q.image||''}" alt=""></div>
          <div class="stage-guess-reveal-copy">
            <div class="stage-guess-kicker">${autoplayCorrectLabel(eng,quiz)}</div>
            <div class="stage-reveal-line"></div>
            <div class="stage-guess-answer">${escapeHTML(q.answerText||'Réponse inconnue')}</div>
          </div>
        </div>`;
        content.classList.remove('stage-reveal-out');
        content.classList.add('stage-reveal-in');
        setTimeout(()=>content.classList.remove('stage-reveal-in'),800);
      },260);
    }
    return;
  }
  if(content){ content.classList.add('stage-reveal-in'); setTimeout(()=>content.classList.remove('stage-reveal-in'),700); }
  document.querySelectorAll('#stage-content .stage-tile').forEach(tile=>{if(tile.dataset.aid===q.correctAnswerId){tile.classList.add('correct-pulse');const badge=document.createElement('span');badge.className='correct-badge';badge.innerHTML=Icons.check(20);tile.appendChild(badge);}else tile.classList.add('dim');});
}
function confettiPieces(){
  const colors = ['#7c5cfc','#2fd8c9','#ffb627','#ff5d6c','#35d07f','#5ecbff'];
  let html = '';
  for(let i=0;i<18;i++){
    const left = (Math.random()*90+5).toFixed(1);
    const delay = (Math.random()*2.6).toFixed(2);
    const dur = (2.2+Math.random()*1.4).toFixed(2);
    const color = colors[i % colors.length];
    const size = (6+Math.random()*5).toFixed(0);
    const drift = (Math.random()*60-30).toFixed(0);
    html += `<span class="confetti-piece" style="left:${left}%;background:${color};width:${size}px;height:${(size*1.7).toFixed(0)}px;animation-delay:${delay}s;animation-duration:${dur}s;--drift:${drift}px;"></span>`;
  }
  return html;
}
function renderFinishedStage(){
  const eng = STATE.autoplayEngine;
  const quiz = eng && getQuiz(eng.quizId);
  if(!eng || !quiz) return;
  clearApTimers();
  const content = document.getElementById('stage-content');
  if(!content) return;
  content.innerHTML = `
    <div class="stage-end qfade-in">
      <div class="confetti-wrap">${confettiPieces()}</div>
      <div class="stage-end-emoji">🎬</div>
      <h2>${tr('stage_thanks')}</h2>
      <div class="stage-end-actions" id="stage-end-actions" style="opacity:0;pointer-events:none;transition:opacity .6s ease;">
        <button class="btn btn-outline" data-action="exit-autoplay-stage">${tr('stage_exit_lib')}</button>
        <button class="btn btn-primary" data-action="replay-autoplay-stage">${Icons.repeat(14)} ${tr('stage_replay')}</button>
      </div>
    </div>`;
  clearTimeout(_stageEndActionsTimer);
  _stageEndActionsTimer = setTimeout(()=>{
    const el = document.getElementById('stage-end-actions');
    if(el){ el.style.opacity='1'; el.style.pointerEvents='auto'; }
  }, 5000);
}
function toggleFullscreenStage(){
  if(document.fullscreenElement){ document.exitFullscreen().catch(()=>{}); }
  else if(document.documentElement.requestFullscreen){ document.documentElement.requestFullscreen().catch(()=>{}); }
}
function exitAutoplayStage(){
  clearApTimers();
  clearTimeout(_stageEndActionsTimer);
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  STATE.autoplayEngine=null;
  const root = document.getElementById('autoplay-root'); if(root) root.innerHTML='';
  STATE.view='autoplaySetup';
  render();
}
function replayAutoplayStage(){
  clearApTimers();
  clearTimeout(_stageEndActionsTimer);
  launchAutoplayStage();
}
