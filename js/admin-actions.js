/* ============================================================
   22. HANDLERS — quizzes (create / duplicate / delete / export)
   ============================================================ */
function createNewQuiz(){
  const quiz = { id:uid(), name:'', description:'', categoryIds:[], language: STATE.settings.uiLanguage==='en'?'en':'fr',
    thumbnail:null, difficulty:'moyen', createdAt:nowISO(), updatedAt:nowISO(), questions:[] };
  STATE.quizzes.push(quiz);
  saveQuiz(quiz);
  STATE.currentQuizId = quiz.id;
  STATE.view = 'quizEditor';
  render();
}
function duplicateQuiz(id){
  const q = getQuiz(id); if(!q) return;
  const suffix = STATE.settings.uiLanguage==='en' ? ' (copy)' : ' (copie)';
  const copy = JSON.parse(JSON.stringify(q));
  copy.id = uid(); copy.name = (q.name||'') + suffix; copy.isDemo=false;
  copy.createdAt = nowISO(); copy.updatedAt = nowISO();
  copy.questions = copy.questions.map(qq=>{
    const oldToNew = {};
    const nq = JSON.parse(JSON.stringify(qq));
    nq.answers = qq.answers.map(a=>{ const nid=uid(); oldToNew[a.id]=nid; return {...a,id:nid}; });
    nq.correctAnswerId = oldToNew[qq.correctAnswerId];
    nq.id = uid();
    return nq;
  });
  STATE.quizzes.push(copy);
  saveQuiz(copy);
  render();
  showToast(tr('toast_quiz_duplicated'));
}
function doDeleteQuiz(id){
  STATE.quizzes = STATE.quizzes.filter(q=>q.id!==id);
  deleteQuizStorage(id);
  if(STATE.currentQuizId===id){ STATE.currentQuizId=null; STATE.view='library'; }
  render();
  showToast(tr('toast_quiz_deleted'));
}
function sanitizeFilename(s){
  return (s||'quiz').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'quiz';
}
function exportSingleQuiz(quiz){
  const cats = STATE.categories.filter(c=>(quiz.categoryIds||[]).includes(c.id));
  downloadJSON({ version:1, exportedAt:nowISO(), categories:cats, quizzes:[quiz] }, sanitizeFilename(quiz.name)+'.json');
  showToast(tr('toast_exported'));
}
function exportAllData(){
  downloadJSON({ version:1, exportedAt:nowISO(), categories:STATE.categories, quizzes:STATE.quizzes }, 'quizcast-export.json');
  showToast(tr('toast_exported'));
}
function triggerImport(){ const el=document.getElementById('import-file-input'); if(el) el.click(); }
async function handleImportFile(file){
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(!data || !Array.isArray(data.quizzes)) throw new Error('bad shape');
    const idMap = {};
    (data.categories||[]).forEach(c=>{
      const existing = STATE.categories.find(ec=>ec.name===c.name);
      if(existing){ idMap[c.id]=existing.id; }
      else{ const newId=uid(); idMap[c.id]=newId; STATE.categories.push({id:newId,name:c.name,color:c.color||'#7c5cfc',parentId:null}); }
    });
    let count=0;
    const importedQuizzes = [];
    data.quizzes.forEach(q=>{
      const nq = JSON.parse(JSON.stringify(q));
      // Imported quizzes get a fresh id so repeated imports never overwrite an existing quiz.
      nq.id = uid();
      nq.categoryIds = (q.categoryIds||[]).map(cid=>idMap[cid]).filter(Boolean);
      nq.questions = (q.questions||[]).map(qq=>{
        const nqq = JSON.parse(JSON.stringify(qq));
        const oldToNew={};
        nqq.answers = (qq.answers||[]).map(a=>{
          const nid=uid();
          oldToNew[a.id]=nid;
          return {...a,id:nid};
        });
        nqq.correctAnswerId = oldToNew[qq.correctAnswerId] || null;
        nqq.id = uid();
        return nqq;
      });
      nq.createdAt = nowISO(); nq.updatedAt = nowISO(); nq.isDemo=false;
      STATE.quizzes.push(nq);
      importedQuizzes.push(nq);
      count++;
    });
    // Persist everything BEFORE rendering. Otherwise a newly imported quiz can appear
    // in the current page but disappear when its dedicated page loads and reads storage.
    await Promise.all(importedQuizzes.map(saveQuiz));
    await saveCategories();
    showToast(tr('toast_imported')+' ('+count+')');
    render();
  }catch(err){
    console.error(err);
    showToast(tr('toast_import_error'),'err');
  }
}
async function handleQuizThumbFile(file){
  if(!file) return;
  const q = currentQuiz(); if(!q) return;
  try{
    q.thumbnail = await ImageUtil.fileToDataURL(file, 500, 0.8);
    saveQuiz(q); flashSavedIndicator(); render();
  }catch(e){ showToast(tr('toast_import_error'),'err'); }
}

/* ============================================================
   23. HANDLERS — questions (duplicate / delete) + modal image upload
   ============================================================ */
function duplicateQuestion(id){
  const quiz = currentQuiz(); if(!quiz) return;
  const idx = quiz.questions.findIndex(q=>q.id===id);
  if(idx<0) return;
  const orig = quiz.questions[idx];
  const oldToNew = {};
  const copy = JSON.parse(JSON.stringify(orig));
  copy.answers = orig.answers.map(a=>{ const nid=uid(); oldToNew[a.id]=nid; return {...a,id:nid}; });
  copy.correctAnswerId = oldToNew[orig.correctAnswerId];
  copy.id = uid();
  quiz.questions.splice(idx+1,0,copy);
  saveQuiz(quiz); flashSavedIndicator();
  render();
}
function doDeleteQuestion(id){
  const quiz = currentQuiz(); if(!quiz) return;
  quiz.questions = quiz.questions.filter(q=>q.id!==id);
  saveQuiz(quiz); flashSavedIndicator();
  render();
  showToast(tr('toast_question_deleted'));
}
async function handleQuestionImageFile(file){
  if(!file || !STATE._questionDraft) return;
  try{
    STATE._questionDraft.image = STATE._questionDraft.type==='guess_character' ? await ImageUtil.fileToDataURLPreserveAlpha(file, 900) : await ImageUtil.fileToDataURL(file, 900, 0.85);
    renderQuestionModal();
  }catch(e){ showToast(tr('toast_import_error'),'err'); }
}

/* ============================================================
   24. HANDLERS — categories
   ============================================================ */
function submitNewCategory(){
  const d = STATE._newCategoryDraft;
  if(!d || !d.name || !d.name.trim()){ showToast(tr('new_category_name_ph'),'err'); return; }
  STATE.categories.push({ id:uid(), name:d.name.trim(), color:d.color||'#7c5cfc', parentId: d.parentId||null });
  STATE._newCategoryDraft = { name:'', color:'#7c5cfc', parentId:'' };
  saveCategories();
  render();
  showToast(tr('toast_cat_added'));
}
function startEditCategory(id){
  const cat = getCategory(id); if(!cat) return;
  STATE._editingCategoryId = id;
  STATE._editingCategoryDraft = { name:cat.name, color:cat.color, parentId:cat.parentId||'' };
  render();
}
function saveEditCategory(){
  const id = STATE._editingCategoryId;
  const cat = getCategory(id); const d = STATE._editingCategoryDraft;
  if(!cat || !d) return;
  if(!d.name || !d.name.trim()){ showToast(tr('new_category_name_ph'),'err'); return; }
  cat.name = d.name.trim(); cat.color = d.color; cat.parentId = d.parentId || null;
  STATE._editingCategoryId=null; STATE._editingCategoryDraft=null;
  saveCategories();
  render();
  showToast(tr('toast_saved'));
}
function doDeleteCategory(id){
  STATE.categories = STATE.categories.filter(c=>c.id!==id);
  STATE.categories.forEach(c=>{ if(c.parentId===id) c.parentId=null; });
  STATE.quizzes.forEach(q=>{
    if((q.categoryIds||[]).includes(id)){ q.categoryIds = q.categoryIds.filter(cid=>cid!==id); saveQuiz(q); }
  });
  saveCategories();
  render();
  showToast(tr('toast_cat_deleted'));
}

/* ============================================================
   25. CONFIRM-TO-DELETE (no native dialogs — sandbox-safe)
   ============================================================ */
function armConfirm(btn, action){
  if(!btn){ action(); return; }
  if(btn.dataset.armed==='1'){ action(); return; }
  btn.dataset.armed='1';
  const orig = btn.innerHTML;
  btn.innerHTML = tr('yes_delete');
  clearTimeout(btn._armTimer);
  btn._armTimer = setTimeout(()=>{ btn.dataset.armed='0'; btn.innerHTML=orig; }, 2800);
}
const debouncedLibRender = debounce(()=>{
  render();
  const el = document.querySelector('.toolbar input[type=search]');
  if(el){ el.focus(); const v=el.value; el.setSelectionRange(v.length, v.length); }
}, 180);
function handleLibSearchInput(value){ STATE.library.search = value; debouncedLibRender(); }
const debouncedPublicRender = debounce(()=>{ render(); const els=document.querySelectorAll('[data-action=public-search]'); const el=els[els.length-1]; if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);} },180);

