/* ============================================================
   12. RENDER — SIDEBAR
   ============================================================ */
function renderSidebar(){
  const lang = STATE.settings.uiLanguage;
  const navItem=(view,label,icon)=>`<button class="nav-item ${STATE.view===view?'active':''}" data-action="set-view" data-view="${view}" ${STATE.view===view?'aria-current="page"':''}>${icon(18)}<span>${label}</span></button>`;
  return `<div class="sidebar">
    <div class="brand"><div class="brand-mark"><span></span></div><div class="brand-word">QUIZ<em>CAST</em></div></div>
    <div class="nav">
      ${navItem('dashboard', tr('nav_dashboard'), Icons.home)}
      ${navItem('library', tr('nav_library'), Icons.library)}
      ${navItem('collection', 'Idées & collections', Icons.cast)}
      ${navItem('categories', tr('nav_categories'), Icons.tag)}
    </div>
    <button class="sidebar-cta" data-action="new-quiz">${Icons.plus(15)} ${tr('sidebar_new_quiz')}</button>
    <div class="sidebar-bottom">
      <button class="btn btn-outline btn-block" data-action="public-home">${Icons.globe(15)} ${tr('public_view_site')}</button>
      <div class="lang-switch">
        <button class="${lang==='fr'?'active':''}" data-action="set-lang" data-lang="fr">FR</button>
        <button class="${lang==='en'?'active':''}" data-action="set-lang" data-lang="en">EN</button>
      </div>
      <div class="storage-note">Sauvegarde sur cet appareil.<br>Exporte régulièrement une copie.</div>
    </div>
  </div>`;
}

/* ============================================================
   13. RENDER — DASHBOARD
   ============================================================ */
function renderDashboard(){ return renderStudioDashboard(); }

/* ============================================================
   14. RENDER — LIBRARY
   ============================================================ */
function renderQuizCard(q){
  const cats = (q.categoryIds||[]).map(id=>getCategory(id)).filter(Boolean);
  const diffLabel = tr('diff_'+(q.difficulty||'moyen'));
  return `<div class="quiz-card">
    <div class="quiz-thumb" style="${q.thumbnail?`background-image:url(${q.thumbnail});`:''}cursor:pointer;" data-action="open-quiz-editor" data-id="${q.id}">
      ${q.thumbnail?'':'🎬'}<span class="lang-badge">${(q.language||'fr').toUpperCase()}</span>
    </div>
    <div class="quiz-body" data-action="open-quiz-editor" data-id="${q.id}" style="cursor:pointer;">
      <h3>${escapeHTML(q.name)||'—'}${q.isDemo?` <span class="chip">${tr('demo_badge')}</span>`:''}</h3>
      <div class="desc">${escapeHTML(q.description)||''}</div>
      <div class="chip-row">
        ${cats.slice(0,2).map(c=>`<span class="chip" style="border-color:${c.color}55;color:${c.color}">${escapeHTML(c.name)}</span>`).join('')}
        <span class="chip chip-diff-${q.difficulty}">${diffLabel}</span>
      </div>
      <div class="quiz-meta-row"><span>${q.questions.length} ${tr(q.questions.length===1?'q_count_1':'q_count')}</span></div>
    </div>
    <div class="quiz-actions">
      <button class="btn btn-ghost" data-action="play-quiz" data-id="${q.id}" title="${tr('btn_play')}">${Icons.play(13)}</button>
      <button class="btn btn-ghost" data-action="public-view-quiz" data-id="${q.id}" title="${tr('public_view_quiz')}">${Icons.globe(13)}</button>
      <button class="btn btn-ghost" data-action="autoplay-setup" data-id="${q.id}" title="${tr('btn_autoplay')}">${Icons.cast(13)} Vidéo</button>
      <button class="btn btn-ghost" data-action="duplicate-quiz" data-id="${q.id}" title="${tr('btn_duplicate')}">${Icons.copy(13)}</button>
      <button class="btn btn-danger" data-action="delete-quiz" data-id="${q.id}" title="${tr('btn_delete')}">${Icons.trash(13)}</button>
    </div>
  </div>`;
}
function renderLibrary(){
  const list = getFilteredQuizzes();
  const L = STATE.library;
  const catOptions = STATE.categories.map(c=>`<option value="${c.id}" ${L.category===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  return `
  <div class="topbar">
    <div><h1>${tr('library_title')}</h1><div class="sub">${tr('library_sub')}</div></div>
    <div class="topbar-actions">
      <input type="file" id="import-file-input" accept="application/json" style="display:none;" data-action="import-file-change">
      <button class="btn btn-outline" data-action="trigger-import">${Icons.upload(14)} ${tr('btn_import')}</button>
      <button class="btn btn-outline" data-action="export-all">${Icons.download(14)} ${tr('btn_export_all')}</button>
      <button class="btn btn-primary" data-action="new-quiz">${Icons.plus(15)} ${tr('sidebar_new_quiz')}</button>
    </div>
  </div>
  <div class="toolbar">
    <div class="search-wrap">${Icons.search(15)}<input type="search" placeholder="${tr('search_ph')}" value="${escapeHTML(L.search)}" data-action="lib-search"></div>
    <select data-action="lib-filter-cat"><option value="" ${!L.category?'selected':''}>${tr('filter_all_cat')}</option>${catOptions}</select>
    <select data-action="lib-filter-diff">
      <option value="" ${!L.difficulty?'selected':''}>${tr('filter_all_diff')}</option>
      <option value="facile" ${L.difficulty==='facile'?'selected':''}>${tr('diff_facile')}</option>
      <option value="moyen" ${L.difficulty==='moyen'?'selected':''}>${tr('diff_moyen')}</option>
      <option value="difficile" ${L.difficulty==='difficile'?'selected':''}>${tr('diff_difficile')}</option>
    </select>
    <select data-action="lib-filter-lang">
      <option value="" ${!L.language?'selected':''}>${tr('filter_all_lang')}</option>
      <option value="fr" ${L.language==='fr'?'selected':''}>FR</option>
      <option value="en" ${L.language==='en'?'selected':''}>EN</option>
    </select>
    <select data-action="lib-sort">
      <option value="updatedDesc" ${L.sort==='updatedDesc'?'selected':''}>${tr('sort_updated')}</option>
      <option value="createdDesc" ${L.sort==='createdDesc'?'selected':''}>${tr('sort_created')}</option>
      <option value="nameAsc" ${L.sort==='nameAsc'?'selected':''}>${tr('sort_name')}</option>
      <option value="qcount" ${L.sort==='qcount'?'selected':''}>${tr('sort_qcount')}</option>
    </select>
  </div>
  ${list.length? `<div class="quiz-grid">${list.map(renderQuizCard).join('')}</div>` : `<div class="empty-state panel">${Icons.search(30)}<h3>${tr('empty_library_title')}</h3><p>${tr('empty_library')}</p></div>`}
  `;
}

/* ============================================================
   15. RENDER — CATEGORIES
   ============================================================ */
function renderNewCategoryForm(){
  const draft = STATE._newCategoryDraft || (STATE._newCategoryDraft = {name:'',color:'#7c5cfc',parentId:''});
  const swatches = ['#7c5cfc','#ff5d6c','#ffb627','#2fd8c9','#35d07f','#9b7bff','#f2789f','#5ecbff'];
  const parentOptions = STATE.categories.map(c=>`<option value="${c.id}" ${draft.parentId===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  return `
  <div class="two-col">
    <div class="field" style="margin-bottom:0;">
      <label class="field-label">${tr('cat_new')}</label>
      <input type="text" value="${escapeHTML(draft.name)}" placeholder="${tr('new_category_name_ph')}" data-action="new-cat-name-input">
    </div>
    <div class="field" style="margin-bottom:0;">
      <label class="field-label">${tr('cat_parent')}</label>
      <select data-action="new-cat-parent-select"><option value="">${tr('cat_none_parent')}</option>${parentOptions}</select>
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;">
    <div class="color-swatches">${swatches.map(s=>`<div class="swatch ${draft.color===s?'selected':''}" style="background:${s}" data-action="new-cat-color-select" data-color="${s}"></div>`).join('')}</div>
    <button class="btn btn-primary btn-sm" data-action="submit-new-category">${Icons.plus(13)} ${tr('cat_add')}</button>
  </div>`;
}
function renderEditCategoryForm(cat){
  const draft = STATE._editingCategoryDraft;
  const swatches = ['#7c5cfc','#ff5d6c','#ffb627','#2fd8c9','#35d07f','#9b7bff','#f2789f','#5ecbff'];
  const parentOptions = STATE.categories.filter(c=>c.id!==cat.id).map(c=>`<option value="${c.id}" ${draft.parentId===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  return `<div class="cat-card" style="flex-direction:column;align-items:stretch;gap:10px;">
    <div class="two-col">
      <div class="field" style="margin-bottom:0;"><label class="field-label">${tr('field_name')}</label>
        <input type="text" value="${escapeHTML(draft.name)}" data-action="edit-cat-name-input"></div>
      <div class="field" style="margin-bottom:0;"><label class="field-label">${tr('cat_parent')}</label>
        <select data-action="edit-cat-parent-select"><option value="">${tr('cat_none_parent')}</option>${parentOptions}</select></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div class="color-swatches">${swatches.map(s=>`<div class="swatch ${draft.color===s?'selected':''}" style="background:${s}" data-action="edit-cat-color-select" data-color="${s}"></div>`).join('')}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline btn-sm" data-action="cancel-edit-category">${tr('cancel')}</button>
        <button class="btn btn-primary btn-sm" data-action="save-edit-category">${Icons.check(13)} ${tr('save')}</button>
      </div>
    </div>
  </div>`;
}
function renderCategories(){
  const cats = STATE.categories;
  function countQuizzes(catId){ return STATE.quizzes.filter(q=>(q.categoryIds||[]).includes(catId)).length; }
  function catCard(c){
    if(STATE._editingCategoryId===c.id) return renderEditCategoryForm(c);
    const parent = c.parentId? getCategory(c.parentId):null;
    return `<div class="cat-card">
      <div class="cat-dot" style="background:${c.color}"></div>
      <div style="flex:1;min-width:0;"><div class="cat-name">${escapeHTML(c.name)}</div>${parent?`<div class="cat-sub">↳ ${escapeHTML(parent.name)}</div>`:''}</div>
      <div class="cat-count">${countQuizzes(c.id)}</div>
      <button class="btn btn-icon btn-outline" data-action="edit-category" data-id="${c.id}">${Icons.edit(13)}</button>
      <button class="btn btn-icon btn-danger" data-action="delete-category" data-id="${c.id}">${Icons.trash(13)}</button>
    </div>`;
  }
  return `
  <div class="topbar"><div><h1>${tr('cat_title')}</h1><div class="sub">${tr('cat_sub')}</div></div></div>
  <div class="panel" style="margin-bottom:24px;">${renderNewCategoryForm()}</div>
  ${cats.length? `<div class="cat-grid">${cats.map(catCard).join('')}</div>` : `<div class="empty-state panel">${Icons.tag(30)}<h3>${tr('cat_empty_title')}</h3><p>${tr('cat_empty')}</p></div>`}
  `;
}
/* ============================================================
   16. RENDER — QUIZ EDITOR
   ============================================================ */
function renderQuestionRow(q, idx){
  const type = QuestionTypes[q.type];
  return `<div class="q-row" draggable="true" data-qid="${q.id}" data-idx="${idx}">
    <div class="drag-handle">${Icons.grip(16)}</div>
    <div class="q-order"><button data-action="question-up" data-id="${q.id}" aria-label="Monter la question ${idx+1}" ${idx===0?'disabled':''}>↑</button><div class="q-num">${idx+1}</div><button data-action="question-down" data-id="${q.id}" aria-label="Descendre la question ${idx+1}" ${idx===currentQuiz().questions.length-1?'disabled':''}>↓</button></div>
    <div class="q-type-icon" style="color:${type.accent}">${type.icon(16)}</div>
    <div class="q-info">
      <div class="q-text">${escapeHTML(q.text)||'—'}</div>
      <div class="q-meta">${type.label()} · ${q.duration}${tr('duration_short')} · ${tr('diff_'+q.difficulty)}</div>
    </div>
    <div class="q-actions">
      <button class="btn btn-icon btn-outline" data-action="edit-question" data-id="${q.id}" title="${tr('btn_edit')}">${Icons.edit(13)}</button>
      <button class="btn btn-icon btn-outline" data-action="duplicate-question" data-id="${q.id}" title="${tr('btn_duplicate')}">${Icons.copy(13)}</button>
      <button class="btn btn-icon btn-danger" data-action="delete-question" data-id="${q.id}" title="${tr('btn_delete')}">${Icons.trash(13)}</button>
    </div>
  </div>`;
}
function renderQuizEditorView(){
  const quiz = getQuiz(STATE.currentQuizId);
  if(!quiz){ STATE.view='library'; return renderLibrary(); }
  const catToggles = STATE.categories.map(c=>`<div class="cat-toggle ${(quiz.categoryIds||[]).includes(c.id)?'selected':''}" data-action="toggle-quiz-category" data-catid="${c.id}">${escapeHTML(c.name)}</div>`).join('');
  const qList = quiz.questions.map((q,idx)=>renderQuestionRow(q,idx)).join('');
  const addMenuItems = QUESTION_TYPE_ORDER.map(k=>{
    const t = QuestionTypes[k];
    return `<div class="dropdown-item" data-action="add-question" data-type="${k}"><div class="ic">${t.icon(15)}</div><div><div>${t.label()}</div><small>${t.desc()}</small></div></div>`;
  }).join('');
  return `
  <div class="topbar">
    <div><button class="btn btn-outline btn-sm" data-action="set-view" data-view="library">${Icons.arrowLeft(13)} ${tr('back_to_library')}</button></div>
    <div class="topbar-actions">
      <span id="saved-indicator" style="opacity:0;transition:opacity .3s;color:var(--green);font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px;">${Icons.check(13)} ${tr('saved_indicator')}</span>
      <button class="btn btn-outline" data-action="export-this-quiz" data-id="${quiz.id}">${Icons.download(14)} ${tr('btn_export')}</button>
      <button class="btn btn-outline" data-action="public-view-quiz" data-id="${quiz.id}">${Icons.globe(14)} ${tr('public_view_quiz')}</button>
      <button class="btn btn-outline" data-action="preview-quiz" data-id="${quiz.id}">${Icons.play(14)} ${tr('preview_quiz')}</button>
      <button class="btn btn-primary" data-action="autoplay-setup" data-id="${quiz.id}">${Icons.cast(14)} ${tr('launch_autoplay')}</button>
    </div>
  </div>
  ${renderQuizReadiness(quiz)}
  <div class="editor-grid">
    <div class="panel">
      <div class="field">
        <label class="field-label">${tr('field_thumbnail')}</label>
        <div class="thumb-upload" style="${quiz.thumbnail?`background-image:url(${quiz.thumbnail});`:''}" data-action="pick-quiz-thumb">
          <input type="file" id="quiz-thumb-file" accept="image/*" style="display:none;" data-action="quiz-thumb-file-change">
          ${quiz.thumbnail? '' : `${Icons.image(22)}<span>${tr('thumb_upload_hint')}</span>`}
        </div>
        ${quiz.thumbnail? `<button class="btn btn-ghost btn-sm" style="margin-top:8px;width:100%;" data-action="remove-quiz-thumb">${tr('remove_image')}</button>`:''}
      </div>
      <div class="field">
        <label class="field-label">${tr('field_name')}</label>
        <input type="text" value="${escapeHTML(quiz.name)}" placeholder="${tr('field_name_ph')}" data-action="qz-name-input">
      </div>
      <div class="field">
        <label class="field-label">${tr('field_desc')}</label>
        <textarea placeholder="${tr('field_desc_ph')}" data-action="qz-desc-input">${escapeHTML(quiz.description)}</textarea>
      </div>
      <div class="field">
        <label class="field-label">${tr('youtube_video_url')}</label>
        <input type="url" value="${escapeHTML(quiz.youtubeUrl||'')}" placeholder="https://www.youtube.com/watch?v=..." data-action="qz-youtube-input">
        <p class="hint">${tr('youtube_video_help')}</p>
      </div>
      <div class="field">
        <label class="field-label">${tr('field_categories')}</label>
        <div class="checkbox-row">${catToggles || `<span class="hint">${tr('cat_empty')}</span>`}</div>
      </div>
      <div class="two-col">
        <div class="field">
          <label class="field-label">${tr('field_language')}</label>
          <select data-action="qz-language-select">
            <option value="fr" ${quiz.language==='fr'?'selected':''}>Français</option>
            <option value="en" ${quiz.language==='en'?'selected':''}>English</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">${tr('field_difficulty')}</label>
          <select data-action="qz-difficulty-select">
            <option value="facile" ${quiz.difficulty==='facile'?'selected':''}>${tr('diff_facile')}</option>
            <option value="moyen" ${quiz.difficulty==='moyen'?'selected':''}>${tr('diff_moyen')}</option>
            <option value="difficile" ${quiz.difficulty==='difficile'?'selected':''}>${tr('diff_difficile')}</option>
          </select>
        </div>
      </div>
      <button class="btn btn-danger btn-block" data-action="delete-quiz" data-id="${quiz.id}">${Icons.trash(14)} ${tr('btn_delete')}</button>
    </div>
    <div>
      <div class="question-palette">${QUESTION_TYPE_ORDER.map(k=>`<button class="question-format" data-action="add-question" data-type="${k}">${QuestionTypes[k].icon(18)}<strong>${QuestionTypes[k].label()}</strong><small>${QuestionTypes[k].desc()}</small></button>`).join('')}</div>
      <div class="q-list-header">
        <h2 style="font-size:16px;">${tr('questions_title')} (${quiz.questions.length})</h2>
        <div class="add-q-menu">
          <button class="btn btn-primary btn-sm" data-action="toggle-add-question-menu">${Icons.plus(13)} ${tr('add_question')}</button>
          <button class="btn btn-outline btn-sm" data-action="open-bulk-questions">${Icons.plus(13)} Ajouter en lot</button>
          <button class="btn btn-outline btn-sm" data-action="open-guess-bulk-import">${Icons.upload(13)} Importer des personnages</button>
          <div class="dropdown" id="add-question-dropdown">${addMenuItems}</div>
        </div>
      </div>
      ${quiz.questions.length? `<div class="q-list" id="q-list">${qList}</div>` : `<div class="empty-state panel">${Icons.checkSquare(28)}<h3>${tr('empty_questions_title')}</h3><p>${tr('empty_questions')}</p></div>`}
    </div>
  </div>`;
}
function setupQuestionListDnD(){
  const list = document.getElementById('q-list');
  if(!list) return;
  let dragEl=null;
  list.querySelectorAll('.q-row').forEach(row=>{
    row.addEventListener('dragstart', e=>{ dragEl=row; row.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
    row.addEventListener('dragend', ()=>{ row.classList.remove('dragging'); dragEl=null; commitQuestionReorder(); });
    row.addEventListener('dragover', e=>{
      e.preventDefault();
      if(!dragEl || dragEl===row) return;
      const rect = row.getBoundingClientRect();
      const after = (e.clientY - rect.top) > rect.height/2;
      row.parentNode.insertBefore(dragEl, after? row.nextSibling : row);
    });
  });
}
function commitQuestionReorder(){
  const quiz = getQuiz(STATE.currentQuizId);
  const listEl = document.getElementById('q-list');
  if(!quiz || !listEl) return;
  const ids = Array.from(listEl.querySelectorAll('.q-row')).map(r=>r.dataset.qid);
  quiz.questions.sort((a,b)=> ids.indexOf(a.id)-ids.indexOf(b.id));
  saveQuiz(quiz); flashSavedIndicator();
  render();
}

/* ============================================================
   17. QUESTION EDITOR MODAL
   ============================================================ */
function openQuestionModal(quizId, existingQuestion, typeKeyIfNew){
  STATE._questionModalQuizId = quizId;
  if(existingQuestion){
    STATE._questionDraft = JSON.parse(JSON.stringify(existingQuestion));
    if(STATE._questionDraft.type==='guess_character'){
      if(!STATE._questionDraft.text) STATE._questionDraft.text='Guess the character';
      if(!STATE._questionDraft.answerText){
        const oldCorrect=STATE._questionDraft.answers?.find(a=>a.id===STATE._questionDraft.correctAnswerId);
        STATE._questionDraft.answerText=oldCorrect?.text||STATE._questionDraft.answers?.find(a=>a.text)?.text||'';
      }
      STATE._questionDraft.answers=[];
      STATE._questionDraft.correctAnswerId=null;
    }
    STATE._questionModalIsNew = false;
  } else {
    STATE._questionDraft = QuestionTypes[typeKeyIfNew].createDefault();
    STATE._questionModalIsNew = true;
  }
  STATE._questionDraft._tagsRaw = (STATE._questionDraft.tags||[]).join(', ');
  renderQuestionModal();
}
function closeQuestionModal(){
  if(_maskCleanup){ _maskCleanup(); _maskCleanup=null; }
  STATE._questionDraft = null;
  document.getElementById('modal-root').innerHTML = '';
}
function renderQuestionModal(){
  const q = STATE._questionDraft;
  if(!q) return;
  const type = QuestionTypes[q.type];
  const isNew = STATE._questionModalIsNew;
  const answersHTML = ['guess_character','open_answer'].includes(q.type) ? '' : q.type==='ranking' ? `<div class="ranking-editor-list" id="ranking-editor-list">${q.answers.map((a,idx)=>`<div class="ranking-edit-item" draggable="true" data-aid="${a.id}"><span class="ranking-grip">${Icons.grip(16)}</span><span class="ranking-index">${idx+1}</span><input type="text" value="${escapeHTML(a.text)}" placeholder="${tr('field_answer_ph')} ${idx+1}" data-action="ranking-answer-text-input" data-aid="${a.id}"></div>`).join('')}</div>` : q.type==='number' ? `<p class="hint">${tr('number_hint')}</p>` : q.answers.map((a,idx)=>`
    <div class="answer-edit-row" data-aid="${a.id}">
      <button type="button" class="correct-radio ${q.correctAnswerId===a.id?'checked':''}" data-action="set-correct" data-aid="${a.id}" aria-label="Définir la réponse ${idx+1} comme correcte" aria-pressed="${q.correctAnswerId===a.id}"></button>
      <input type="text" value="${escapeHTML(a.text)}" ${q.type==='true_false'?'readonly':''} placeholder="${tr('field_answer_ph')} ${idx+1}" data-action="answer-text-input" data-aid="${a.id}">
      ${q.type!=='true_false' && q.answers.length>2 ? `<button type="button" class="btn btn-icon btn-outline" data-action="remove-answer" data-aid="${a.id}" title="${tr('remove_answer')}">${Icons.x(14)}</button>` : ''}
    </div>`).join('');
  const html = `
  <div class="modal-overlay open" id="question-modal-overlay">
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(type.modalTitle(isNew))}">
      <div class="modal-header"><h3>${type.modalTitle(isNew)}</h3><div class="modal-close" data-action="close-question-modal">${Icons.x(18)}</div></div>
      <div class="modal-body">
        <div class="field">
          <label class="field-label">${tr('field_question_text')}</label>
          <textarea placeholder="${tr('field_question_text_ph')}" data-action="q-text-input">${escapeHTML(q.text)}</textarea>
        </div>
        ${type.renderEditorExtra(q)}
        ${q.type==='number'||['guess_character','open_answer'].includes(q.type)?'':`<div class="field">
          <label class="field-label">${q.type==='ranking'?tr('ranking_items'):tr('field_answers')}</label>
          <div>${answersHTML}</div>
          ${q.type==='ranking'?'':`<p class="hint">${tr('mark_correct_hint')}</p>${q.type!=='true_false' && q.answers.length<6 ? `<button type="button" class="btn btn-outline btn-sm" data-action="add-answer" style="margin-top:6px;">${Icons.plus(13)} ${tr('add_answer')}</button>` : ''}`}
        </div>`}
        <div class="field">
          <label class="field-label">${tr('field_explanation')}</label>
          <textarea placeholder="${tr('field_explanation_ph')}" data-action="q-explanation-input">${escapeHTML(q.explanation||'')}</textarea>
        </div>
        <div class="two-col">
          <div class="field">
            <label class="field-label">${tr('field_duration')}</label>
            <select data-action="q-duration-input">${[5,10,15,20,30].map(d=>`<option value="${d}" ${q.duration===d?'selected':''}>${d}${tr('duration_short')}</option>`).join('')}</select>
          </div>
          <div class="field">
            <label class="field-label">${tr('field_difficulty_q')}</label>
            <select data-action="q-difficulty-input">
              <option value="facile" ${q.difficulty==='facile'?'selected':''}>${tr('diff_facile')}</option>
              <option value="moyen" ${q.difficulty==='moyen'?'selected':''}>${tr('diff_moyen')}</option>
              <option value="difficile" ${q.difficulty==='difficile'?'selected':''}>${tr('diff_difficile')}</option>
            </select>
          </div>
        </div>
        ${renderQuestionPresentationFields(q)}
        <div class="field">
          <label class="field-label">${tr('field_tags')}</label>
          <input type="text" value="${escapeHTML(q._tagsRaw||'')}" placeholder="mario, nintendo…" data-action="q-tags-input">
        </div>
      </div>
      <div class="modal-footer">
        <div>${!isNew? `<button type="button" class="btn btn-danger btn-sm" data-action="delete-question-from-modal">${Icons.trash(14)} ${tr('delete')}</button>` : '<span></span>'}</div>
        <div style="display:flex;gap:8px;">
          <button type="button" class="btn btn-outline" data-action="close-question-modal">${tr('cancel')}</button>
          <button type="button" class="btn btn-primary" data-action="save-question-from-modal">${Icons.check(14)} ${tr('save')}</button>
        </div>
      </div>
    </div>
  </div>`;
  document.getElementById('modal-root').innerHTML = html;
  setupRankingEditorDnD();
  flushPendingModeImages();
}
function updateGuessEditorPreview(){
  const q=STATE._questionDraft;
  const box=document.getElementById('guess-editor-preview');
  if(!q || !box || !q.image || q.imageMode==='masked') return;
  pendingModeImages=[];
  box.innerHTML=modeImageHTML(q,'qedit-preview-img','max-height:190px;width:auto;object-fit:contain;');
  flushPendingModeImages();
}

function setupRankingEditorDnD(){
  const list=document.getElementById('ranking-editor-list');
  const q=STATE._questionDraft;
  if(!list || !q || q.type!=='ranking') return;
  let drag=null;
  list.querySelectorAll('.ranking-edit-item').forEach(row=>{
    row.addEventListener('dragstart',e=>{drag=row;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    row.addEventListener('dragend',()=>{row.classList.remove('dragging');drag=null;syncRankingDraftFromDOM(list,q);});
    row.addEventListener('dragover',e=>{e.preventDefault();if(!drag||drag===row)return;const r=row.getBoundingClientRect();list.insertBefore(drag,(e.clientY-r.top)>r.height/2?row.nextSibling:row);refreshRankingIndexes(list);});
  });
}
function refreshRankingIndexes(list){list.querySelectorAll('.ranking-edit-item').forEach((row,i)=>{const n=row.querySelector('.ranking-index');if(n)n.textContent=i+1;});}
function syncRankingDraftFromDOM(list,q){const ids=[...list.querySelectorAll('.ranking-edit-item')].map(x=>x.dataset.aid);q.answers.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));}
function setupRankingPlayDnD(){
  const list=document.getElementById('ranking-play-list');
  if(!list) return;
  let drag=null;
  list.querySelectorAll('.ranking-play-item').forEach(row=>{
    row.addEventListener('dragstart',e=>{drag=row;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    row.addEventListener('dragend',()=>{row.classList.remove('dragging');drag=null;});
    row.addEventListener('dragover',e=>{e.preventDefault();if(!drag||drag===row)return;const r=row.getBoundingClientRect();list.insertBefore(drag,(e.clientY-r.top)>r.height/2?row.nextSibling:row);refreshRankingIndexes(list);});
  });
}
function rankingOrderFromDOM(){const list=document.getElementById('ranking-play-list');return list?[...list.querySelectorAll('.ranking-play-item')].map(x=>x.dataset.aid):[];}

function saveQuestionFromModal(){
  const draft = STATE._questionDraft;
  const quiz = getQuiz(STATE._questionModalQuizId);
  if(!quiz || !draft) return;
  if(!draft.text || !draft.text.trim()){ showToast(tr('field_question_text'),'err'); return; }
  if(draft.type!=='number' && !['guess_character','open_answer'].includes(draft.type)) draft.answers = draft.answers.filter(a=>a.text && a.text.trim());
  if(['guess_character','open_answer'].includes(draft.type)){
    if(!draft.answerText || !draft.answerText.trim()){ showToast(tr('field_expected_answer'),'err'); return; }
    draft.answerText=draft.answerText.trim();
    draft.answers=[]; draft.correctAnswerId=null;
  }
  if(['qcm','true_false','zoom'].includes(draft.type)){
    if(draft.answers.length<2){ showToast(tr('field_answers'),'err'); return; }
    if(!draft.answers.find(a=>a.id===draft.correctAnswerId)){ showToast(tr('mark_correct_hint'),'err'); return; }
  }
  if(draft.type==='ranking'){
    if(draft.answers.length<2){ showToast(tr('ranking_items'),'err'); return; }
    if(!draft.criterion || !draft.criterion.trim()){ showToast(tr('ranking_criterion'),'err'); return; }
  }
  if(['guess_character','zoom'].includes(draft.type) && !draft.image){ showToast(tr('field_character_image'),'err'); return; }
  if(draft.type==='number'){
    draft.value=Number(draft.value); draft.min=Number(draft.min); draft.max=Number(draft.max); draft.step=Number(draft.step);
    if(!Number.isFinite(draft.value)||!Number.isFinite(draft.min)||!Number.isFinite(draft.max)||!Number.isFinite(draft.step)||draft.step<=0||draft.max<=draft.min){ showToast(tr('field_number_value'),'err'); return; }
    if(draft.value<draft.min || draft.value>draft.max){ showToast(tr('field_number_value'),'err'); return; }
  }
  if(draft.type==='open_answer') draft.acceptedAnswers=(draft._acceptedRaw??(draft.acceptedAnswers||[]).join(';')).split(';').map(x=>x.trim()).filter(Boolean);
  delete draft._acceptedRaw;
  draft.tags = (draft._tagsRaw||'').split(',').map(t=>t.trim()).filter(Boolean);
  delete draft._tagsRaw;
  const idx = quiz.questions.findIndex(qq=>qq.id===draft.id);
  if(idx>=0) quiz.questions[idx]=draft; else quiz.questions.push(draft);
  saveQuiz(quiz);
  closeQuestionModal();
  render();
  flashSavedIndicator();
}
function deleteQuestionFromModal(){
  const draft = STATE._questionDraft;
  const quiz = getQuiz(STATE._questionModalQuizId);
  if(!quiz || !draft) return;
  quiz.questions = quiz.questions.filter(q=>q.id!==draft.id);
  saveQuiz(quiz);
  closeQuestionModal();
  showToast(tr('toast_question_deleted'));
  render();
}

/* ============================================================
   BULK IMPORT — Guess the Character
   ============================================================ */
function guessCharacterNameFromFilename(filename){
  let name=(filename||'').replace(/\.[^.]+$/,'');
  name=name.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
  name=name.replace(/\b\d+\b/g,'').replace(/\s+/g,' ').trim();
  return name.split(' ').map(w=>w ? w.charAt(0).toUpperCase()+w.slice(1) : w).join(' ') || 'Nouveau personnage';
}
function openGuessBulkImport(){
  STATE._guessBulkImport=[];
  renderGuessBulkImportModal();
}
function closeGuessBulkImport(){ STATE._guessBulkImport=null; const root=document.getElementById('modal-root'); if(root) root.innerHTML=''; }
function renderGuessBulkImportModal(){
  const items=STATE._guessBulkImport||[];
  const rows=items.length ? items.map((it,i)=>`<div class="guess-bulk-row" data-index="${i}">
    <div class="guess-bulk-thumb"><img src="${it.image}" alt=""></div>
    <div class="guess-bulk-name"><input type="text" value="${escapeHTML(it.name)}" data-action="guess-bulk-name" data-index="${i}"><small>${escapeHTML(it.fileName)}</small></div>
    <button type="button" class="btn btn-icon btn-danger" data-action="guess-bulk-remove" data-index="${i}" title="Supprimer">${Icons.trash(14)}</button>
  </div>`).join('') : `<div class="guess-bulk-empty">${Icons.upload(28)}<strong>Aucun personnage importé</strong><span>Sélectionne plusieurs images ou un dossier pour commencer.</span></div>`;
  const html=`<div class="modal-overlay open" id="guess-bulk-overlay"><div class="modal guess-bulk-modal">
    <div class="modal-header"><div><h3>Importer des personnages</h3><div class="sub">Le nom du fichier est utilisé automatiquement comme réponse.</div></div><div class="modal-close" data-action="close-guess-bulk">${Icons.x(18)}</div></div>
    <div class="modal-body">
      <div class="guess-bulk-actions">
        <input type="file" id="guess-bulk-files" accept="image/*" multiple style="display:none" data-action="guess-bulk-files">
        <input type="file" id="guess-bulk-folder" accept="image/*" multiple webkitdirectory directory style="display:none" data-action="guess-bulk-folder">
        <button type="button" class="btn btn-outline" data-action="guess-bulk-pick-files">${Icons.upload(14)} Choisir des images</button>
        <button type="button" class="btn btn-outline" data-action="guess-bulk-pick-folder">${Icons.library(14)} Importer un dossier</button>
        <span class="guess-bulk-count">${items.length} personnage${items.length>1?'s':''}</span>
      </div>
      <div class="guess-bulk-list">${rows}</div>
    </div>
    <div class="modal-footer"><button type="button" class="btn btn-outline" data-action="close-guess-bulk">Annuler</button><button type="button" class="btn btn-primary" data-action="confirm-guess-bulk" ${items.length?'':'disabled'}>${Icons.plus(14)} Ajouter ${items.length||''} personnage${items.length>1?'s':''}</button></div>
  </div></div>`;
  document.getElementById('modal-root').innerHTML=html;
}
async function handleGuessBulkFiles(fileList){
  const files=[...fileList].filter(f=>f.type.startsWith('image/'));
  if(!files.length) return;
  const existing=STATE._guessBulkImport||[];
  const existingNames=new Set(existing.map(x=>x.fileName.toLowerCase()));
  for(const file of files){
    if(existingNames.has(file.name.toLowerCase())) continue;
    try{
      const image=await ImageUtil.fileToDataURLPreserveAlpha(file,900);
      existing.push({fileName:file.name,name:guessCharacterNameFromFilename(file.name),image});
      existingNames.add(file.name.toLowerCase());
    }catch(err){ console.warn('Impossible d’importer',file.name,err); }
  }
  STATE._guessBulkImport=existing;
  renderGuessBulkImportModal();
}
function confirmGuessBulkImport(){
  const quiz=currentQuiz(); const items=STATE._guessBulkImport||[];
  if(!quiz || !items.length) return;
  items.forEach(it=>{
    quiz.questions.push({id:uid(),type:'guess_character',text:'Guess the character',image:it.image,imageMode:'normal',answerText:(it.name||'').trim(),acceptedAnswers:[],answers:[],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]});
  });
  saveQuiz(quiz); flashSavedIndicator();
  closeGuessBulkImport();
  render();
  showToast(`${items.length} personnage${items.length>1?'s':''} ajouté${items.length>1?'s':''}`);
}
