/* ============================================================
   21. MAIN RENDER DISPATCHER
   ============================================================ */
function currentQuiz(){ return getQuiz(STATE.currentQuizId); }
function renderMain(){
  switch(STATE.view){
    case 'publicHome': return renderPublicHome();
    case 'publicQuizzes': return renderPublicQuizzes();
    case 'publicCategories': return renderPublicCategories();
    case 'publicQuiz': return renderPublicQuizDetail();
    case 'publicProfile': return renderPublicProfile();
    case 'dashboard': return renderDashboard();
    case 'library': return renderLibrary();
    case 'categories': return renderCategories();
    case 'quizEditor': return renderQuizEditorView();
    case 'play': return renderPlayView();
    case 'autoplaySetup': return renderAutoplaySetupView();
    default: return renderPublicHome();
  }
}
function render(){
  if(!STATE.ready) return;
  const publicViews=['publicHome','publicQuizzes','publicCategories','publicQuiz','publicProfile'];
  const isPublicPage=publicViews.includes(STATE.view)||STATE.view==='play';
  if(isPublicPage){const theme=STATE.settings?.publicTheme||'warm';document.documentElement.dataset.qcTheme=theme;try{sessionStorage.setItem('quizcast:public-theme',theme);}catch(e){}}else{delete document.documentElement.dataset.qcTheme;}
  if(publicViews.includes(STATE.view) || STATE.view==='play'){ document.getElementById('app').innerHTML=renderMain(); }
  else { document.getElementById('app').innerHTML = renderSidebar() + '<div class="main">' + renderMain() + '</div>'; }
  flushPendingModeImages();
  wireViewSpecificEffects();
}
function wireViewSpecificEffects(){
  if(STATE.view==='quizEditor') setupQuestionListDnD();
  if(STATE.view==='play' && STATE.play){ const q=getQuiz(STATE.play.quizId)?.questions[STATE.play.order[STATE.play.pos]]; if(q?.type==='ranking' && !STATE.play.revealed) setupRankingPlayDnD(); }
}
