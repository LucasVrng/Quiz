/* ============================================================
   26. GLOBAL EVENT DELEGATION
   ============================================================ */
function onGlobalClick(e){
  if(!e.target.closest('.public-theme-wrap')){
    const menu=document.querySelector('[data-public-theme-menu]');
    const btn=document.querySelector('.public-theme-toggle');
    if(menu) menu.classList.remove('open');
    if(btn) btn.setAttribute('aria-expanded','false');
  }
  if(!e.target.closest('.add-q-menu')){
    const dd = document.getElementById('add-question-dropdown');
    if(dd) dd.classList.remove('open');
  }
  const el = e.target.closest('[data-action]');
  if(!el) return;
  if(el.tagName === 'SELECT' || el.tagName === 'OPTION' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
  const action = el.dataset.action;
  const id = el.dataset.id;
  switch(action){
    case 'choose-guess-mode': { const s=window._guessModeSelection||{mode:'normal',difficulty:'normal'}; s.mode=el.dataset.mode; window._guessModeSelection=s; document.querySelectorAll('.guess-mode-choice').forEach(x=>x.classList.toggle('selected',x===el)); break; }
    case 'choose-guess-difficulty': { const s=window._guessModeSelection||{mode:'normal',difficulty:'normal'}; s.difficulty=el.dataset.difficulty; window._guessModeSelection=s; document.querySelectorAll('.guess-difficulty-choice').forEach(x=>x.classList.toggle('selected',x===el)); break; }
    case 'start-guess-mode': startSelectedGuessMode(); break;
    case 'change-guess-mode': changeGuessMode(); break;
    case 'close-guess-mode': closeGuessModeSetup(); break;
    case 'set-view': STATE.publicMode=false; STATE.view = el.dataset.view; render(); break;
    case 'enter-admin': location.href=qcRoute('admin/'); break;
    case 'public-home': location.href=qcRoute(''); break;
    case 'public-quizzes': location.href=qcRoute('quizzes/'); break;
    case 'public-categories': location.href=qcRoute('categories/'); break;
    case 'public-profile': location.href=qcRoute('profile/'); break;
    case 'public-view-quiz': location.href=qcRoute('quizzes/quiz.html')+'?id='+encodeURIComponent(id); break;
    case 'public-daily-play': { const q=getQuiz(id)||dailyQuiz(); if(q) startPlay(q.id,'publicQuiz'); break; }
    case 'public-random': { const qs=publicQuizList(); if(qs.length){ const q=qs[Math.floor(Math.random()*qs.length)]; location.href=qcRoute('quizzes/quiz.html')+'?id='+encodeURIComponent(q.id); } break; }
    case 'public-theme-toggle': {
      const menu=document.querySelector('[data-public-theme-menu]');
      const btn=el;
      if(menu){ const open=menu.classList.toggle('open'); btn.setAttribute('aria-expanded', open?'true':'false'); }
      break;
    }
    case 'public-theme-select': {
      const theme=el.dataset.theme;
      if(PUBLIC_THEMES.some(t=>t.id===theme)){ STATE.settings.publicTheme=theme; try{sessionStorage.setItem('quizcast:public-theme',theme);}catch(e){} saveSettings(); render(); }
      break;
    }
    case 'public-open-quiz': location.href=qcRoute('quizzes/quiz.html')+'?id='+encodeURIComponent(id); break;
    case 'public-play-quiz': location.href=qcRoute('play/')+'?id='+encodeURIComponent(id); break;
    case 'public-back': location.href=qcRoute('quizzes/'); break;
    case 'public-category': location.href=qcRoute('quizzes/')+'?category='+encodeURIComponent(id); break;
    case 'new-quiz': createNewQuiz(); break;
    case 'set-lang': STATE.settings.uiLanguage = el.dataset.lang; saveSettings(); render(); break;

    case 'open-quiz-editor': location.href=qcRoute('admin/editor.html')+'?id='+encodeURIComponent(id); break;
    case 'play-quiz': startPlay(id); break;
    case 'autoplay-setup': location.href=qcRoute('admin/autoplay.html')+'?id='+encodeURIComponent(id); break;
    case 'duplicate-quiz': duplicateQuiz(id); break;
    case 'delete-quiz': armConfirm(el, ()=>doDeleteQuiz(id)); break;
    case 'export-this-quiz': { const q=getQuiz(id); if(q) exportSingleQuiz(q); break; }
    case 'trigger-import': triggerImport(); break;
    case 'export-all': exportAllData(); break;

    case 'new-cat-color-select': STATE._newCategoryDraft.color = el.dataset.color; render(); break;
    case 'submit-new-category': submitNewCategory(); break;
    case 'edit-category': startEditCategory(id); break;
    case 'delete-category': armConfirm(el, ()=>doDeleteCategory(id)); break;
    case 'edit-cat-color-select': if(STATE._editingCategoryDraft){ STATE._editingCategoryDraft.color = el.dataset.color; render(); } break;
    case 'cancel-edit-category': STATE._editingCategoryId=null; STATE._editingCategoryDraft=null; render(); break;
    case 'save-edit-category': saveEditCategory(); break;

    case 'pick-quiz-thumb': { const f=document.getElementById('quiz-thumb-file'); if(f) f.click(); break; }
    case 'remove-quiz-thumb': { const q=currentQuiz(); if(q){ q.thumbnail=null; saveQuiz(q); render(); } break; }
    case 'toggle-quiz-category': { const q=currentQuiz(); if(q){ const cid=el.dataset.catid; q.categoryIds=q.categoryIds||[];
        const i=q.categoryIds.indexOf(cid); if(i>=0) q.categoryIds.splice(i,1); else q.categoryIds.push(cid);
        saveQuiz(q); flashSavedIndicator(); render(); } break; }
    case 'toggle-add-question-menu': { const dd=document.getElementById('add-question-dropdown'); if(dd) dd.classList.toggle('open'); break; }
    case 'open-guess-bulk-import': { openGuessBulkImport(); break; }
    case 'close-guess-bulk': { closeGuessBulkImport(); break; }
    case 'guess-bulk-pick-files': { const f=document.getElementById('guess-bulk-files'); if(f) f.click(); break; }
    case 'guess-bulk-pick-folder': { const f=document.getElementById('guess-bulk-folder'); if(f) f.click(); break; }
    case 'guess-bulk-remove': { const i=Number(el.dataset.index); if(STATE._guessBulkImport){ STATE._guessBulkImport.splice(i,1); renderGuessBulkImportModal(); } break; }
    case 'confirm-guess-bulk': { confirmGuessBulkImport(); break; }
    case 'add-question': { const q=currentQuiz(); if(q){ const dd=document.getElementById('add-question-dropdown'); if(dd) dd.classList.remove('open'); openQuestionModal(q.id, null, el.dataset.type); } break; }
    case 'edit-question': { const q=currentQuiz(); if(q){ const qq=q.questions.find(x=>x.id===id); if(qq) openQuestionModal(q.id, qq, null); } break; }
    case 'duplicate-question': duplicateQuestion(id); break;
    case 'delete-question': armConfirm(el, ()=>doDeleteQuestion(id)); break;
    case 'preview-quiz': startPlay(id, 'quizEditor'); break;

    case 'close-question-modal': closeQuestionModal(); break;
    case 'save-question-from-modal': saveQuestionFromModal(); break;
    case 'delete-question-from-modal': armConfirm(el, deleteQuestionFromModal); break;
    case 'set-correct': if(STATE._questionDraft){ STATE._questionDraft.correctAnswerId = el.dataset.aid; renderQuestionModal(); } break;
    case 'remove-answer': { const d=STATE._questionDraft; if(d){ d.answers=d.answers.filter(a=>a.id!==el.dataset.aid); if(d.correctAnswerId===el.dataset.aid) d.correctAnswerId=null; renderQuestionModal(); } break; }
    case 'add-answer': { const d=STATE._questionDraft; if(d && d.answers.length<6){ d.answers.push({id:uid(),text:''}); renderQuestionModal(); } break; }
    case 'pick-image': { const f=document.getElementById(el.dataset.target+'-file'); if(f) f.click(); break; }
    case 'remove-image': if(STATE._questionDraft){ STATE._questionDraft.image=null; renderQuestionModal(); } break;

    case 'select-answer': selectPlayAnswer(el.dataset.aid); break;
    case 'submit-ranking': submitPlayRanking(); break;
    case 'submit-number': submitPlayNumber(); break;
    case 'submit-guess': submitPlayGuess(); break;
    case 'next-play-question': nextPlayQuestion(); break;
    case 'restart-play': restartPlay(); break;
    case 'share-quiz-result': shareQuizResult(el); break;
    case 'back-to-library-from-play': { STATE.play=null; location.href=qcRoute('admin/'); break; }
    case 'public-exit-play': { STATE.play=null; STATE.publicMode=true; STATE.publicQuizId=null; STATE.view='publicHome'; render(); break; }
    case 'public-random-after-play': { const qs=publicQuizList(); if(qs.length){ const q=qs[Math.floor(Math.random()*qs.length)]; startPlay(q.id,'publicQuiz'); } break; }

    case 'ap-set-preset': { const id=el.dataset.preset||'auto'; applyAutoplayPreset(STATE.autoplaySetup,id); render(); break; }
    case 'ap-set-background-variant': { const id=el.dataset.variant || el.value || '1'; STATE.autoplaySetup.backgroundVariant=id; render(); break; }
    case 'ap-set-response-time': STATE.autoplaySetup.responseTime = parseInt(el.dataset.value,10); render(); break;
    case 'ap-set-background-mode': STATE.autoplaySetup.backgroundMode = el.value || 'style'; break;
    case 'ap-set-background-variant': STATE.autoplaySetup.backgroundVariant = el.value || '1'; break;
    case 'ap-set-reveal-language': STATE.autoplaySetup.revealLanguage = el.value || 'auto'; break;
    case 'ap-toggle-shuffle-q': STATE.autoplaySetup.shuffleQ = !STATE.autoplaySetup.shuffleQ; render(); break;
    case 'ap-toggle-shuffle-a': STATE.autoplaySetup.shuffleA = !STATE.autoplaySetup.shuffleA; render(); break;
    case 'ap-set-guess-mode': STATE.autoplaySetup.guessMode = el.dataset.mode || 'normal'; render(); break;
    case 'ap-set-layout': STATE.autoplaySetup.layout = el.dataset.layout || 'auto'; render(); break;
    case 'ap-set-layout-default': if(STATE.autoplaySetup){ STATE.autoplaySetup.layout = el.value || 'auto'; render(); } break;
    case 'ap-set-layout-type': if(STATE.autoplaySetup){ if(!STATE.autoplaySetup.layoutByType) STATE.autoplaySetup.layoutByType={}; const type=el.dataset.qtype; const value=el.value||'auto'; if(value==='auto') delete STATE.autoplaySetup.layoutByType[type]; else STATE.autoplaySetup.layoutByType[type]=value; render(); } break;
    case 'ap-set-timer-style': STATE.autoplaySetup.timerStyle = el.dataset.timerStyle || 'ring'; render(); break;
    case 'ap-set-guess-difficulty': STATE.autoplaySetup.guessDifficulty = el.dataset.difficulty || 'normal'; render(); break;
    case 'ap-set-text-style': STATE.autoplaySetup.textStyle = el.value || 'preset'; render(); break;
    case 'ap-set-custom-media-url': if(STATE.autoplaySetup){ STATE.autoplaySetup.customMediaUrl=el.value; STATE.autoplaySetup.customMediaType=/\.(mp4|webm|ogg|mov)(?:\?|#|$)/i.test(el.value)?'video':'image'; } break;
    case 'launch-autoplay-stage': launchAutoplayStage(); break;
    case 'start-autoplay-countdown': startAutoplayCountdown(); break;

    case 'toggle-fullscreen-stage': toggleFullscreenStage(); break;
    case 'exit-autoplay-stage': exitAutoplayStage(); break;
    case 'replay-autoplay-stage': replayAutoplayStage(); break;
  }
}
function onGlobalInput(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  switch(action){
    case 'lib-search': handleLibSearchInput(el.value); break;
    case 'public-search': STATE.publicSearch=el.value; if(STATE.view!=='publicQuizzes') STATE.view='publicQuizzes'; debouncedPublicRender(); break;
    case 'new-cat-name-input': if(STATE._newCategoryDraft) STATE._newCategoryDraft.name = el.value; break;
    case 'edit-cat-name-input': if(STATE._editingCategoryDraft) STATE._editingCategoryDraft.name = el.value; break;
    case 'qz-name-input': { const q=currentQuiz(); if(q){ q.name=el.value; autosaveQuiz(q); } break; }
    case 'qz-desc-input': { const q=currentQuiz(); if(q){ q.description=el.value; autosaveQuiz(q); } break; }
    case 'qz-youtube-input': { const q=currentQuiz(); if(q){ q.youtubeUrl=el.value.trim(); autosaveQuiz(q); } break; }
    case 'q-text-input': if(STATE._questionDraft) STATE._questionDraft.text = el.value; break;
    case 'guess-answer-input': if(STATE._questionDraft) STATE._questionDraft.answerText = el.value; break;
    case 'guess-bulk-name': { const i=Number(el.dataset.index); if(STATE._guessBulkImport?.[i]) STATE._guessBulkImport[i].name=el.value; break; }
    case 'q-explanation-input': if(STATE._questionDraft) STATE._questionDraft.explanation = el.value; break;
    case 'q-tags-input': if(STATE._questionDraft) STATE._questionDraft._tagsRaw = el.value; break;
    case 'ranking-answer-text-input': if(STATE._questionDraft){ const a=STATE._questionDraft.answers.find(x=>x.id===el.dataset.aid); if(a)a.text=el.value; } break;
    case 'ranking-criterion-input': if(STATE._questionDraft) STATE._questionDraft.criterion=el.value; break;
    case 'set-zoom-start': if(STATE._questionDraft){ STATE._questionDraft.zoomStart=parseFloat(el.value); const v=el.parentElement.querySelector('.val'); if(v)v.textContent=el.value+'×'; } break;
    case 'number-value-input': if(STATE._questionDraft) STATE._questionDraft.value=parseFloat(el.value); break;
    case 'number-unit-input': if(STATE._questionDraft) STATE._questionDraft.unit=el.value; break;
    case 'number-min-input': if(STATE._questionDraft) STATE._questionDraft.min=parseFloat(el.value); break;
    case 'number-max-input': if(STATE._questionDraft) STATE._questionDraft.max=parseFloat(el.value); break;
    case 'number-step-input': if(STATE._questionDraft) STATE._questionDraft.step=parseFloat(el.value); break;
    case 'answer-text-input': { if(STATE._questionDraft){ const a=STATE._questionDraft.answers.find(x=>x.id===el.dataset.aid); if(a) a.text=el.value; } break; }
    case 'ap-set-reveal-duration': { const val=parseFloat(el.value); STATE.autoplaySetup.revealDuration=val; const lbl=document.getElementById('ap-reveal-val'); if(lbl) lbl.textContent=val+'s'; break; }
    case 'ap-set-next-delay': { const val=parseFloat(el.value); STATE.autoplaySetup.nextDelay=val; const lbl=document.getElementById('ap-delay-val'); if(lbl) lbl.textContent=val+'s'; break; }
    case 'ap-set-intro-message': if(STATE.autoplaySetup){ STATE.autoplaySetup.introMessage=el.value||'lets-go'; render(); } break;
    case 'ap-set-custom-media-url': if(STATE.autoplaySetup){ STATE.autoplaySetup.customMediaUrl=el.value; } break;
    case 'ap-set-guess-question-mode': { if(STATE.autoplaySetup){ if(!STATE.autoplaySetup.guessModeByQuestion) STATE.autoplaySetup.guessModeByQuestion={}; STATE.autoplaySetup.guessModeByQuestion[el.dataset.qid]=el.value; } break; }
  }
}
function onGlobalChange(e){
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const action = el.dataset.action;
  switch(action){
    case 'lib-filter-cat': STATE.library.category = el.value; render(); break;
    case 'public-category-filter': STATE.publicCategoryFilter=el.value; render(); break;
    case 'lib-filter-diff': STATE.library.difficulty = el.value; render(); break;
    case 'lib-filter-lang': STATE.library.language = el.value; render(); break;
    case 'lib-sort': STATE.library.sort = el.value; render(); break;
    case 'new-cat-parent-select': if(STATE._newCategoryDraft){ STATE._newCategoryDraft.parentId = el.value; render(); } break;
    case 'edit-cat-parent-select': if(STATE._editingCategoryDraft){ STATE._editingCategoryDraft.parentId = el.value; render(); } break;
    case 'qz-language-select': { const q=currentQuiz(); if(q){ q.language=el.value; saveQuiz(q); flashSavedIndicator(); } break; }
    case 'qz-difficulty-select': { const q=currentQuiz(); if(q){ q.difficulty=el.value; saveQuiz(q); flashSavedIndicator(); } break; }
    case 'ap-set-background-mode': { if(STATE.autoplaySetup){ STATE.autoplaySetup.backgroundMode = el.value || 'style'; render(); } break; }
    case 'ap-set-background-variant': { if(STATE.autoplaySetup){ STATE.autoplaySetup.backgroundVariant = el.value || '1'; render(); } break; }
    case 'ap-set-reveal-language': { if(STATE.autoplaySetup){ STATE.autoplaySetup.revealLanguage = el.value || 'auto'; render(); } break; }
    case 'ap-set-timer-position': { if(STATE.autoplaySetup){ STATE.autoplaySetup.timerPosition = el.value || 'auto'; render(); } break; }
    case 'ap-set-layout-default': { if(STATE.autoplaySetup){ STATE.autoplaySetup.layout = el.value || 'auto'; render(); } break; }
    case 'ap-set-layout-type': { if(STATE.autoplaySetup){ if(!STATE.autoplaySetup.layoutByType) STATE.autoplaySetup.layoutByType={}; const type=el.dataset.qtype; const value=el.value || 'auto'; if(value==='auto') delete STATE.autoplaySetup.layoutByType[type]; else STATE.autoplaySetup.layoutByType[type]=value; render(); } break; }
    case 'ap-set-text-style': { if(STATE.autoplaySetup){ STATE.autoplaySetup.textStyle = el.value || 'preset'; render(); } break; }
    case 'ap-set-custom-media-url': { if(STATE.autoplaySetup){ STATE.autoplaySetup.customMediaUrl = el.value; STATE.autoplaySetup.customMediaType=/\.(mp4|webm|ogg|mov)(?:\?|#|$)/i.test(el.value)?'video':'image'; render(); } break; }
    case 'ap-set-custom-media-file': { if(STATE.autoplaySetup && el.files && el.files[0]){ const file=el.files[0]; if(STATE.autoplaySetup.customMediaObjectUrl) URL.revokeObjectURL(STATE.autoplaySetup.customMediaObjectUrl); const url=URL.createObjectURL(file); STATE.autoplaySetup.customMediaObjectUrl=url; STATE.autoplaySetup.customMediaUrl=url; STATE.autoplaySetup.customMediaType=file.type.startsWith('video/')?'video':'image'; render(); } break; }
    case 'ap-set-guess-question-mode': { if(STATE.autoplaySetup){ if(!STATE.autoplaySetup.guessModeByQuestion) STATE.autoplaySetup.guessModeByQuestion={}; STATE.autoplaySetup.guessModeByQuestion[el.dataset.qid]=el.value; render(); } break; }
    case 'q-duration-input': if(STATE._questionDraft) STATE._questionDraft.duration = parseInt(el.value,10); break;
    case 'q-difficulty-input': if(STATE._questionDraft) STATE._questionDraft.difficulty = el.value; break;
    case 'quiz-thumb-file-change': if(el.files[0]) handleQuizThumbFile(el.files[0]); break;
    case 'file-image-change': if(el.files[0]) handleQuestionImageFile(el.files[0]); break;
    case 'guess-bulk-files': if(el.files) handleGuessBulkFiles(el.files); el.value=''; break;
    case 'guess-bulk-folder': if(el.files) handleGuessBulkFiles(el.files); el.value=''; break;
    case 'import-file-change': if(el.files[0]) handleImportFile(el.files[0]); el.value=''; break;
  }
}
function initEventDelegation(){
  document.addEventListener('click', onGlobalClick);
document.addEventListener('keydown', e=>{ if(STATE.view==='play' && STATE.play && STATE.play.returnView==='publicQuiz' && !STATE.play.revealed){ const q=getQuiz(STATE.play.quizId)?.questions[STATE.play.order[STATE.play.pos]]; const n=Number(e.key); if(n>=1&&n<=6 && q && q.type!=='ranking' && q.type!=='number' && q.type!=='guess_character' && q.answers?.[n-1]){ selectPlayAnswer(q.answers[n-1].id); return; } if(e.key==='Enter' && q?.type==='guess_character'){ submitPlayGuess(); return; } if(e.key==='Escape'){ STATE.play=null; STATE.publicMode=true; STATE.publicQuizId=null; STATE.view='publicHome'; render(); } }});
  document.addEventListener('input', onGlobalInput);
  document.addEventListener('change', onGlobalChange);
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      if(STATE.autoplayEngine) exitAutoplayStage();
      else if(STATE._questionDraft) closeQuestionModal();
    }
  });
}
/* NEXT_INSERT */
