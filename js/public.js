/* ============================================================
   10. DATA GETTERS
   ============================================================ */
function getQuiz(id){ return STATE.quizzes.find(q=>q.id===id); }
function getCategory(id){ return STATE.categories.find(c=>c.id===id); }
function getFilteredQuizzes(){
  let list = STATE.quizzes.slice();
  const {search,category,difficulty,language,sort} = STATE.library;
  if(search){ const s=search.toLowerCase(); list=list.filter(q=>(q.name||'').toLowerCase().includes(s)||(q.description||'').toLowerCase().includes(s)); }
  if(category) list=list.filter(q=>(q.categoryIds||[]).includes(category));
  if(difficulty) list=list.filter(q=>q.difficulty===difficulty);
  if(language) list=list.filter(q=>q.language===language);
  if(sort==='updatedDesc') list.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));
  else if(sort==='createdDesc') list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  else if(sort==='nameAsc') list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  else if(sort==='qcount') list.sort((a,b)=>b.questions.length-a.questions.length);
  return list;
}

/* ============================================================
   11. SHARED WIDGETS: image upload box + mask editor
   ============================================================ */
function renderImageUploadBox(q, idPrefix, big){
  const h = big?170:130;
  if(q.image){
    return `<div class="img-upload-box" style="padding:8px;">
      <img src="${q.image}" style="max-height:${h}px;">
      <input type="file" id="${idPrefix}-file" accept="image/*" style="display:none;" data-action="file-image-change">
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px;">
        <button type="button" class="btn btn-ghost btn-sm" data-action="pick-image" data-target="${idPrefix}">${tr('replace_image')}</button>
        <button type="button" class="btn btn-danger btn-sm" data-action="remove-image">${tr('remove_image')}</button>
      </div>
    </div>`;
  }
  return `<div class="img-upload-box" data-action="pick-image" data-target="${idPrefix}" style="min-height:${h}px;display:flex;align-items:center;justify-content:center;">
    <input type="file" id="${idPrefix}-file" accept="image/*" style="display:none;" data-action="file-image-change">
    <div class="ph">${Icons.upload(22)}<br>${tr('upload_image_hint')}</div>
  </div>`;
}
function renderMaskEditor(q){
  const r = q.maskRect || {x:25,y:25,w:50,h:50};
  return `<div class="mask-editor" id="qedit-mask-editor">
    <img src="${q.image}">
    <div class="mask-rect" id="qedit-mask-rect" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;"></div>
  </div>`;
}
let _maskCleanup = null;
function setupMaskEditorEvents(){
  const wrap = document.getElementById('qedit-mask-editor');
  if(!wrap) return;
  if(_maskCleanup){ _maskCleanup(); _maskCleanup=null; }
  const rectEl = document.getElementById('qedit-mask-rect');
  let dragging=false, startX=0, startY=0;
  function pct(e){
    const b = wrap.getBoundingClientRect();
    const cx = e.touches? e.touches[0].clientX : e.clientX;
    const cy = e.touches? e.touches[0].clientY : e.clientY;
    return { x:clamp(((cx-b.left)/b.width)*100,0,100), y:clamp(((cy-b.top)/b.height)*100,0,100) };
  }
  function down(e){ dragging=true; const p=pct(e); startX=p.x; startY=p.y;
    rectEl.style.left=startX+'%'; rectEl.style.top=startY+'%'; rectEl.style.width='0%'; rectEl.style.height='0%'; e.preventDefault(); }
  function move(e){ if(!dragging) return; const p=pct(e);
    const x=Math.min(startX,p.x), y=Math.min(startY,p.y), w=Math.abs(p.x-startX), h=Math.abs(p.y-startY);
    rectEl.style.left=x+'%'; rectEl.style.top=y+'%'; rectEl.style.width=w+'%'; rectEl.style.height=h+'%'; e.preventDefault(); }
  function up(){ if(!dragging) return; dragging=false;
    let x=parseFloat(rectEl.style.left), y=parseFloat(rectEl.style.top), w=parseFloat(rectEl.style.width), h=parseFloat(rectEl.style.height);
    if(w<8||h<8){ w=Math.max(w,20); h=Math.max(h,20); rectEl.style.width=w+'%'; rectEl.style.height=h+'%'; }
    if(STATE._questionDraft) STATE._questionDraft.maskRect = {x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)};
  }
  wrap.addEventListener('mousedown',down); window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
  wrap.addEventListener('touchstart',down,{passive:false}); wrap.addEventListener('touchmove',move,{passive:false}); wrap.addEventListener('touchend',up);
  _maskCleanup = ()=>{ window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
}

/* ============================================================
   PUBLIC SITE RENDERING
   ============================================================ */
function publicQuizList(){
  return STATE.quizzes.filter(q=>q && q.questions && q.questions.length>0);
}
function publicDiff(q){ return tr('diff_'+(q.difficulty||'moyen')); }
function renderYouTubeEpisode(quiz,placement='detail'){
  const id=youtubeVideoId(quiz?.youtubeUrl); if(!id)return '';
  const title=placement==='home'?tr('youtube_home_title'):placement==='score'?tr('youtube_score_title'):tr('youtube_linked_title');
  const copy=placement==='home'?tr('youtube_home_copy'):placement==='score'?tr('youtube_score_copy'):tr('youtube_linked_copy');
  const videoTitle=escapeHTML(quiz.name||'QuizCast');
  return `<section class="youtube-episode youtube-episode-${placement}"><div class="youtube-episode-copy"><span class="youtube-episode-kicker">${placement==='home'?'QuizCast × YouTube':'Épisode associé'}</span><h2>${title}</h2><p>${copy}</p><a class="youtube-episode-link" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">${tr('youtube_watch')} →</a></div><div class="youtube-player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${videoTitle}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></section>`;
}
function publicCatIcon(name){
  const n=(name||'').toLowerCase();
  if(/game|gaming|jeu|nintendo|pokemon|mario/.test(n)) return '🎮';
  if(/movie|film|cinema|cinéma|tv|disney|simpson|anime/.test(n)) return '🎬';
  if(/science|tech|technology|science/.test(n)) return '🔬';
  if(/music|musique/.test(n)) return '🎵';
  if(/sport/.test(n)) return '🏆';
  if(/meme|internet|web/.test(n)) return '😂';
  if(/history|histoire|geography|géographie/.test(n)) return '🌍';
  return '🧠';
}
function publicQuizCard(q){
  const cats=(q.categoryIds||[]).map(getCategory).filter(Boolean);
  const category=cats[0]?.name||publicCatIcon(q.name);
  const duration=Math.max(1,Math.ceil(q.questions.reduce((sum,item)=>sum+(Number(item.duration)||10),0)/60));
  const thumb=q.thumbnail?`background-image:url(&quot;${escapeHTML(q.thumbnail)}&quot;);`:`background:linear-gradient(145deg,#e8bb8c,#d77d4d);`;
  return `<a href="${qcRoute('quizzes/quiz.html')}?id=${encodeURIComponent(q.id)}" class="public-card" aria-label="${escapeHTML(q.name)||'QuizCast Quiz'} — ${tr('public_play')}">
    <div class="public-card-thumb ${q.thumbnail?'has-thumb':'no-thumb'}" style="${thumb}">${q.thumbnail?'':`<span class="public-card-emoji">${publicCatIcon(cats[0]?.name||q.name)}</span>`}
      <div class="public-card-badges"><span class="public-badge">${(q.language||'fr').toUpperCase()}</span>${q.difficulty?`<span class="public-badge">${escapeHTML(publicDiff(q))}</span>`:''}</div>
      <span class="public-card-count">${duration} min</span>
    </div>
    <div class="public-card-body"><span class="public-card-category">${escapeHTML(category)}</span><h3>${escapeHTML(q.name)||'QuizCast Quiz'}</h3>
      <div class="public-card-desc">${escapeHTML(q.description)||tr('public_hero_sub')}</div>
      <div class="public-card-meta"><span>${q.questions.length} ${tr(q.questions.length===1?'public_question':'public_questions')}</span><span class="public-card-duration">${duration} min</span><span class="public-card-play">${tr('public_play')} <b>→</b></span></div>
    </div>
  </a>`;
}
const PUBLIC_THEMES = [
  {id:'warm', name:'Warm Arcade', desc:'Chaleureux et convivial', swatches:['#fff7ed','#d87538','#332820']},
  {id:'retro', name:'Retro Console', desc:'Arcade rétro et coloré', swatches:['#f3efe3','#f2c94c','#10233f']},
  {id:'pop', name:'Playful Pop', desc:'Coloré et dynamique', swatches:['#fffaf7','#ff6b5f','#4d7cff']},
  {id:'midnight', name:'Midnight', desc:'Sombre et gaming', swatches:['#0f1420','#8b6cff','#46d6c5']}
];
function publicThemePicker(){
  const current=STATE.settings.publicTheme||'warm';
  return `<div class="public-theme-wrap">
    <button class="public-theme-toggle" type="button" data-action="public-theme-toggle" aria-expanded="false" title="Choisir le thème">◐ <span>Thème</span></button>
    <div class="public-theme-menu" data-public-theme-menu>
      <div class="public-theme-menu-title">Apparence du site</div>
      <div class="public-theme-options">
        ${PUBLIC_THEMES.map(t=>`<button type="button" class="public-theme-option ${t.id===current?'selected':''}" data-action="public-theme-select" data-theme="${t.id}">
          <span class="public-theme-swatch">${t.swatches.map(c=>`<i style="background:${c}"></i>`).join('')}</span>
          <span class="public-theme-option-copy"><strong>${t.name}</strong><small>${t.desc}</small></span>
          ${t.id===current?'<span class="public-theme-check">✓</span>':''}
        </button>`).join('')}
      </div>
    </div>
  </div>`;
}
function publicHeader(){
  const home=STATE.view==='publicHome', quizzes=STATE.view==='publicQuizzes', cats=STATE.view==='publicCategories';
  return `<header class="public-header">
    <div class="public-brand"><div class="brand-mark"><span></span></div><span>QUIZ<em style="font-style:normal;color:var(--teal)">CAST</em></span></div>
    <nav class="public-nav" aria-label="Navigation principale">
      <button class="${home?'active':''}" data-action="public-home">${tr('public_nav_home')}</button>
      <button class="${quizzes?'active':''}" data-action="public-quizzes">${tr('public_nav_quizzes')}</button>
      <button class="${cats?'active':''}" data-action="public-categories">${tr('public_nav_categories')}</button>
      <button class="public-nav-random" data-action="public-random">${Icons.shuffle(13)}<span>${tr('public_nav_random')}</span></button>
    </nav>
    <div class="public-header-search">${Icons.search(15)}<input type="search" placeholder="${escapeHTML(tr('search_ph'))}" value="${escapeHTML(STATE.publicSearch||'')}" data-action="public-search"></div>
    ${publicThemePicker()}
    <button class="btn btn-ghost btn-sm public-profile-btn" data-action="public-profile">Profil</button><button class="btn btn-ghost btn-sm public-admin-btn" data-action="enter-admin">${Icons.user(13)} ${tr('public_admin')}</button>
  </header>`;
}
function renderPublicHome(){
  const quizzes=publicQuizList();
  const popular=[...quizzes].sort((a,b)=>(b.questions?.length||0)-(a.questions?.length||0)).slice(0,4);
  const newest=[...quizzes].sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0)).slice(0,4);
  const cats=STATE.categories.slice(0,8);
  const totalQuestions=quizzes.reduce((n,q)=>n+(q.questions?.length||0),0);
  const featured=popular[0]||newest[0]||null;
  const sideQuizzes=(popular.length>1?popular.slice(1,3):newest.slice(0,2));
  const channelVideo=quizzes.filter(q=>youtubeVideoId(q.youtubeUrl)).sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0))[0]||null;
  return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content">
    ${(()=>{const d=dailyQuiz(); return d?`<button class="public-daily-card" data-action="public-daily-play" data-id="${d.id}"><span class="daily-icon">✦</span><span class="daily-copy"><span class="daily-eyebrow">Le défi du jour</span><strong>${escapeHTML(d.name)}</strong><small>${d.questions.length} questions · un nouveau quiz chaque jour</small></span><span class="daily-cta">${Icons.play(14)} Jouer</span></button>`:''})()}
    <section class="public-hero landing-hero"><div class="public-hero-copy landing-copy">
      <div class="public-kicker"><span class="live-dot"></span> ${tr('public_kicker')}</div>
      <h1>Une question.<br><span>Et si tu savais ?</span></h1>
      <p>Culture pop, jeux vidéo, cinéma… Lance un quiz, teste tes connaissances et découvre ton prochain sujet préféré.</p>
      <div class="public-hero-actions"><button class="btn btn-primary" data-action="public-random">${Icons.play(15)} ${tr('public_play_random')}</button><button class="btn btn-ghost" data-action="public-quizzes">Explorer les quiz →</button></div>
      <div class="landing-trust"><span>${Icons.check(14)} Gratuit et sans inscription</span><span>Résultat immédiat</span></div>
    </div>
    ${featured?`<div class="landing-showcase"><button class="landing-featured" data-action="public-open-quiz" data-id="${featured.id}" style="--feature-image:${featured.thumbnail?`url(&quot;${escapeHTML(featured.thumbnail)}&quot;)`:'linear-gradient(145deg,#694bd8,#ef8d48)'}"><span class="feature-shade"></span><span class="feature-topline"><span class="feature-tag">À LA UNE</span><span>${featured.questions.length} questions</span></span><span class="feature-bottom"><span class="feature-category">${escapeHTML((featured.categoryIds||[]).map(getCategory).filter(Boolean)[0]?.name||'À découvrir')}</span><strong>${escapeHTML(featured.name)}</strong><span class="feature-play">Découvrir le quiz →</span></span></button>${sideQuizzes.map((q,i)=>`<button class="landing-mini-card mini-card-${i+1}" data-action="public-open-quiz" data-id="${q.id}" style="--mini-image:${q.thumbnail?`url(&quot;${escapeHTML(q.thumbnail)}&quot;)`:'linear-gradient(145deg,#438c83,#6e64bd)'}"><span>${escapeHTML(q.name)}</span><i>${q.questions.length} questions →</i></button>`).join('')}</div>`:`<div class="landing-showcase landing-empty"><span>?</span><strong>Ton prochain quiz t’attend</strong><button class="btn btn-primary" data-action="public-quizzes">Voir les quiz</button></div>`}
    </section>
    ${channelVideo?renderYouTubeEpisode(channelVideo,'home'):''}
    <div class="landing-stats"><div><strong>${quizzes.length}</strong><span>quiz à explorer</span></div><i></i><div><strong>${totalQuestions}</strong><span>questions pour te challenger</span></div><i></i><div><strong>0</strong><span>inscription nécessaire</span></div></div>
    ${popular.length?`<section class="public-section"><div class="public-section-head"><div><span class="section-eyebrow">On commence par quoi ?</span><h2>${tr('public_popular')}</h2><p>Des quiz pour te lancer tout de suite.</p></div><button class="public-see-all" data-action="public-quizzes">Tout explorer →</button></div><div class="public-quiz-grid">${popular.map(publicQuizCard).join('')}</div></section>`:''}
    ${cats.length?`<section class="public-section landing-categories"><div class="public-section-head"><div><span class="section-eyebrow">À chacun son terrain de jeu</span><h2>Choisis ton univers</h2><p>Retrouve tes passions ou découvre-en une nouvelle.</p></div><button class="public-see-all" data-action="public-categories">Toutes les catégories →</button></div><div class="public-category-grid">${cats.map(c=>`<button class="public-category" data-action="public-category" data-id="${c.id}"><span class="cat-icon">${publicCatIcon(c.name)}</span><strong>${escapeHTML(c.name)}</strong><span>${publicQuizList().filter(q=>(q.categoryIds||[]).includes(c.id)).length} ${tr('public_category_count')}</span><i>→</i></button>`).join('')}</div></section>`:''}
    ${newest.length?`<section class="public-section"><div class="public-section-head"><div><span class="section-eyebrow">Tout juste ajoutés</span><h2>${tr('public_new')}</h2><p>De nouvelles occasions de te surprendre.</p></div><button class="public-see-all" data-action="public-quizzes">Voir tous les quiz →</button></div><div class="public-quiz-grid">${newest.map(publicQuizCard).join('')}</div></section>`:''}
    ${!quizzes.length?`<div class="public-section public-empty">${tr('public_no_quizzes')}</div>`:''}
    <footer class="public-footer"><span>${tr('public_footer')}</span><span>QuizCast</span></footer>
  </main></div>`;
}
function renderPublicQuizzes(){
  let list=publicQuizList(); const term=(STATE.publicSearch||'').trim().toLowerCase();
  if(term) list=list.filter(q=>(q.name+' '+q.description).toLowerCase().includes(term));
  const cat=STATE.publicCategoryFilter||''; if(cat) list=list.filter(q=>(q.categoryIds||[]).includes(cat));
  return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content browse-page">
    <div class="public-page-title browse-title"><div><span class="section-eyebrow">Trouve ton prochain défi</span><h1>${tr('public_nav_quizzes')}</h1><p>${list.length} quiz à lancer, seul ou entre amis.</p></div><button class="btn btn-primary" data-action="public-random">${Icons.shuffle(14)} Surprends-moi</button></div>
    <div class="public-browse-toolbar"><div class="public-browse-search">${Icons.search(15)}<input type="search" placeholder="${escapeHTML(tr('search_ph'))}" value="${escapeHTML(STATE.publicSearch||'')}" data-action="public-search"></div>
      <select data-action="public-category-filter"><option value="">${tr('filter_all_cat')}</option>${STATE.categories.map(c=>`<option value="${c.id}" ${cat===c.id?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select>
    </div>
    ${list.length?`<div class="public-quiz-grid">${list.map(publicQuizCard).join('')}</div>`:`<div class="public-empty">${tr('public_no_quizzes')}</div>`}
    <footer class="public-footer"><span>${tr('public_footer')}</span><span>QuizCast</span></footer>
  </main></div>`;
}
function renderPublicCategories(){
  const cats=STATE.categories;
  return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content browse-page"><div class="public-page-title"><span class="section-eyebrow">Il y en a pour toutes les curiosités</span><h1>${tr('public_nav_categories')}</h1><p>Choisis un univers et vois jusqu’où vont tes connaissances.</p></div>
    ${cats.length?`<div class="public-category-grid">${cats.map(c=>`<button class="public-category" data-action="public-category" data-id="${c.id}"><span class="cat-icon">${publicCatIcon(c.name)}</span><strong>${escapeHTML(c.name)}</strong><span>${publicQuizList().filter(q=>(q.categoryIds||[]).includes(c.id)).length} quiz à jouer</span><i>→</i></button>`).join('')}</div>`:`<div class="public-empty">${tr('public_no_quizzes')}</div>`}
    <footer class="public-footer"><span>${tr('public_footer')}</span><span>QuizCast</span></footer></main></div>`;
}
function renderPublicQuizDetail(){
  const q=getQuiz(STATE.publicQuizId);
  if(!q){
    return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content"><div class="public-empty"><h2>Quiz introuvable</h2><p>Ce quiz n'est pas disponible dans les données enregistrées sur cet appareil.</p><button class="btn btn-primary" data-action="public-quizzes">Voir les quiz</button></div></main></div>`;
  }
  const cats=(q.categoryIds||[]).map(getCategory).filter(Boolean); const related=publicQuizList().filter(x=>x.id!==q.id && (x.categoryIds||[]).some(id=>(q.categoryIds||[]).includes(id))).slice(0,4);
  return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content"><div class="public-detail"><div class="public-back" data-action="public-back">← ${tr('public_back')}</div>
    <section class="public-detail-hero"><div class="public-detail-image" style="${q.thumbnail?`background-image:url(&quot;${escapeHTML(q.thumbnail)}&quot;);`:''}">${q.thumbnail?'':'🎯'}</div><div class="public-detail-copy">
      <div class="chips"><span class="public-badge">${(q.language||'fr').toUpperCase()}</span><span class="public-badge">${escapeHTML(publicDiff(q))}</span>${cats.slice(0,3).map(c=>`<span class="public-badge">${escapeHTML(c.name)}</span>`).join('')}</div>
      <h1>${escapeHTML(q.name)||'QuizCast Quiz'}</h1><p>${escapeHTML(q.description)||tr('public_hero_sub')}</p>
      <div class="public-detail-stats"><div class="public-detail-stat"><strong>${q.questions.length}</strong><span>${tr('public_questions')}</span></div><div class="public-detail-stat"><strong>${Math.max(1,Math.ceil(q.questions.reduce((s,x)=>s+(Number(x.duration)||10),0)/60))} min</strong><span>Durée estimée</span></div></div>
      <button class="btn btn-primary" data-action="public-play-quiz" data-id="${q.id}">${Icons.play(16)} ${tr('public_start')}</button>
    </div></section>
    ${renderYouTubeEpisode(q,'detail')}
    ${related.length?`<section class="public-section"><div class="public-section-head"><div><h2>${tr('public_related')}</h2></div></div><div class="public-quiz-grid">${related.map(publicQuizCard).join('')}</div></section>`:''}
    <footer class="public-footer"><span>${tr('public_footer')}</span><span>QuizCast</span></footer></div></main></div>`;
}
function renderPublicProfile(){
  const p=STATE.publicProfile||{...DEFAULT_PROFILE,history:[],achievements:[]};
  const level=profileLevelFromXP(p.xp||0), progress=profileLevelProgress(p.xp||0);
  const recent=(p.history||[]).slice(0,6);
  const unlocked=new Set(p.achievements||[]);
  return `<div class="public-shell" data-public-theme="${STATE.settings.publicTheme||'warm'}">${publicHeader()}<main class="public-content">
    <div class="public-page-title"><h1>Ton profil</h1><p>Ta progression QuizCast, conservée sur cet appareil.</p></div>
    <section class="profile-overview"><div class="profile-level"><div class="profile-level-badge">${level}</div><div><strong>Niveau ${level}</strong><div class="profile-xp">${p.xp||0} XP</div><div class="profile-progress"><span style="width:${progress}%"></span></div></div></div><div class="profile-stats"><div><strong>${p.totalPlays||0}</strong><span>Quiz joués</span></div><div><strong>${p.totalQuestions||0}</strong><span>Questions</span></div><div><strong>${p.totalQuestions?Math.round((p.correctAnswers||0)/p.totalQuestions*100):0}%</strong><span>Précision</span></div><div><strong>🔥 ${p.streak||0}</strong><span>Série actuelle</span></div></div></section>
    <section class="public-section"><div class="public-section-head"><div><h2>Succès</h2><p>${unlocked.size}/${ACHIEVEMENTS.length} débloqués</p></div></div><div class="achievement-grid">${ACHIEVEMENTS.map(a=>`<div class="achievement ${unlocked.has(a[0])?'unlocked':''}"><div class="achievement-icon">${unlocked.has(a[0])?'✓':'?'}</div><strong>${a[1]}</strong><span>${a[2]}</span></div>`).join('')}</div></section>
    ${recent.length?`<section class="public-section"><div class="public-section-head"><div><h2>Historique récent</h2></div></div><div class="profile-history">${recent.map(x=>`<div class="profile-history-row"><div><strong>${escapeHTML(x.quizName)}</strong><span>${new Date(x.date).toLocaleDateString('fr-FR')}</span></div><strong>${x.correct}/${x.total}</strong><span>+${x.xp} XP</span></div>`).join('')}</div></section>`:''}
  </main></div>`;
}
function enterAdmin(){ location.href=qcRoute('admin/'); }

