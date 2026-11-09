/* Visual rounds share free-text scoring, but keep their own media and reveal rules. */
function isFreeResponseQuestion(q) {
  return ['open_answer', 'guess_character', 'image_clues', 'visual_guess'].includes(q?.type);
}
function visualAnswerFields(q) {
  return `<div class="field"><label class="field-label">Réponse attendue</label><input data-action="guess-answer-input" value="${escapeHTML(q.answerText || '')}"></div>
    <div class="field"><label class="field-label">Réponses également acceptées (séparées par ;)</label><input data-action="accepted-answers-input" value="${escapeHTML(q._acceptedRaw ?? (q.acceptedAnswers || []).join('; '))}"></div>`;
}
function visualMediaInput(image, index, action, label, brief='') {
  return `<label class="visual-media-input"><span>${escapeHTML(label)}</span>${image ? `<img src="${escapeHTML(image)}" alt="Aperçu de l’indice">` : '<div class="media-placeholder">＋<small>Importer une image</small></div>'}
    <input type="file" accept="image/*" data-action="${action}" data-index="${index}">${brief?`<small class="media-brief">Capture suggérée : ${escapeHTML(brief)}</small>`:""}</label>`;
}
QuestionTypes.image_clues = {
  key: 'image_clues', icon: Icons.layers, accent: 'var(--violet)',
  label: () => '3 images, 1 réponse', desc: () => 'Film, jeu, lieu… trois indices visuels',
  createDefault() { return {id:uid(), type:'image_clues', text:'Quel film relie ces trois images ?', clues:[{image:''},{image:''},{image:''}], answerText:'', acceptedAnswers:[], progressiveClues:true, answers:[], duration:15, difficulty:'moyen', explanation:'', tags:[]}; },
  modalTitle: isNew => isNew ? 'Trois images pour trouver' : 'Modifier les trois indices',
  renderEditorExtra(q) {
    return `<div class="visual-editor-grid">${q.clues.map((c,i)=>visualMediaInput(c.image,i,'visual-clue-file','Indice '+(i+1),c.brief)).join('')}</div>
      <label class="visual-check"><input type="checkbox" data-action="progressive-clues" ${q.progressiveClues !== false ? 'checked' : ''}> Révéler les indices un par un en Auto Play</label>${visualAnswerFields(q)}`;
  }, renderPlayTile: defaultTileInner
};
QuestionTypes.visual_guess = {
  key:'visual_guess', icon:Icons.image, accent:'var(--teal)',
  label:()=> 'Image mystère', desc:()=> 'Silhouette, zoom, cases cachées ou flou',
  createDefault() { return {id:uid(),type:'visual_guess',text:'Quel personnage se cache ici ?',image:'',visualMode:'silhouette',zoomStart:4,answerText:'',acceptedAnswers:[],answers:[],duration:12,difficulty:'moyen',explanation:'',tags:[]}; },
  modalTitle: isNew => isNew ? 'Nouvelle image mystère' : 'Modifier l’image mystère',
  renderEditorExtra(q) {
    return `${visualMediaInput(q.image,0,'visual-main-file','Image à deviner')}<div class="field"><label class="field-label">Effet de cette question</label><select data-action="visual-mode">${[['silhouette','Silhouette noire'],['zoom','Zoom qui recule'],['hidden','Cases qui se découvrent'],['blurred','Flou progressif'],['normal','Image originale']].map(([v,t])=>`<option value="${v}" ${q.visualMode===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label class="field-label">Composition de cette manche</label><select data-action="question-layout">${[['auto','Selon le studio'],['split-left','Image à gauche'],['split-right','Image à droite'],['center','Image centrée']].map(([v,t])=>`<option value="${v}" ${(q.videoLayout||'auto')===v?'selected':''}>${t}</option>`).join('')}</select><p class="hint">La silhouette nécessite une image avec fond transparent. Chaque question garde son propre effet, même dans un quiz mixte.</p></div>${visualAnswerFields(q)}`;
  }, renderPlayTile: defaultTileInner
};
QuestionTypes.odd_one_out = {
  key:'odd_one_out',icon:Icons.search,accent:'var(--amber)',label:()=> 'Trouve l’intrus',desc:()=> 'Repérer l’image qui ne va pas avec les autres',
  createDefault() { return {...QuestionTypes.qcm.createDefault(),type:'odd_one_out',text:'Quelle image est l’intrus ?',answers:Array.from({length:4},(_,i)=>({id:uid(),text:'Image '+(i+1),image:''}))}; },
  modalTitle: isNew => isNew ? 'Nouvel intrus visuel' : 'Modifier l’intrus',
  renderEditorExtra(q) { return `<p class="hint">Importe quatre images, puis sélectionne l’intrus avec le bouton de bonne réponse ci-dessous.</p><div class="visual-editor-grid four">${q.answers.map((a,i)=>visualMediaInput(a.image,i,'visual-answer-file','Image '+(i+1))).join('')}</div>`; },
  renderPlayTile(a,letter) { return `<span class="visual-option-letter">${letter.toUpperCase()}</span><img src="${escapeHTML(a.image)}" alt="${escapeHTML(a.text)}">`; }
};
QUESTION_TYPE_ORDER.unshift('image_clues','visual_guess','odd_one_out');

function visualQuestionIssue(q) {
  if(q.type==='image_clues' && (q.clues?.length!==3 || q.clues.some(c=>!c.image))) return 'importe les trois images';
  if(q.type==='visual_guess' && q.visualMode==='silhouette' && q.imageHasAlpha===false)return 'la silhouette nécessite un fond transparent : choisis le zoom ou les cases pour cette image';
  if(q.type==='visual_guess' && !q.image) return 'importe l’image mystère';
  if(q.type==='odd_one_out' && (q.answers?.length!==4 || q.answers.some(a=>!a.image))) return 'importe les quatre images';
  return '';
}
async function handleVisualMedia(file,action,index) {
  const q=STATE._questionDraft;if(!q||!file)return;
  try {
    const image=await ImageUtil.fileToDataURLPreserveAlpha(file,1200);
    if(STATE._questionDraft!==q)return;
    if(action==='visual-clue-file')q.clues[index].image=image;
    if(action==='visual-main-file'){q.image=image;q.imageHasAlpha=await imageHasTransparency(image);}
    if(action==='visual-answer-file')q.answers[index].image=image;
    if(STATE._questionDraft!==q)return;
    const input=document.querySelector(`[data-action="${action}"][data-index="${index}"]`),label=input?.closest('.visual-media-input');
    if(label){label.querySelector('.media-placeholder')?.remove();let preview=label.querySelector('img');if(!preview){preview=document.createElement('img');preview.alt='Aperçu de l’indice';label.insertBefore(preview,input);}preview.src=image;}
  }catch(e){showToast('Impossible de charger cette image.','err');}
}
function renderClueImages(q,stage=false) {
  return `<div class="clue-triptych ${stage?'stage-clues':''}" data-progressive="${q.progressiveClues!==false}">${q.clues.map((c,i)=>`<figure class="clue-card ${stage&&q.progressiveClues!==false&&i>0?'clue-locked':''}" data-clue="${i}" aria-label="Indice ${i+1}"><div class="clue-picture">${c.image?`<img src="${escapeHTML(c.image)}" alt="Indice visuel ${i+1}">`:'<div class="clue-awaiting">Capture à importer</div>'}<div class="clue-cover"><b>?</b><span>INDICE ${i+1}</span></div></div><figcaption><span>0${i+1}</span> ${stage?'INDICE':'Indice'}</figcaption></figure>`).join('')}</div>`;
}
function renderMysteryImage(q,revealed=false,hints=0) {
  const mode=revealed?'normal':q.visualMode||'silhouette';
  return `<div class="mystery-picture mystery-${mode}" data-mystery="${mode}" style="--mystery-blur:${Math.max(0,18-hints*5)}px;--mystery-zoom:${mode==='zoom'?Math.max(1,(q.zoomStart||4)-hints):1}"><img src="${escapeHTML(q.image)}" alt="Image à identifier">${mode==='hidden'?`<div class="mystery-covers">${Array.from({length:12},(_,i)=>`<span data-cover="${i}" class="${[5,2,9,0,7,10,3,8,1,11,4,6].indexOf(i)<2+hints*2?'uncovered':''}">?</span>`).join('')}</div>`:''}<span class="mystery-mode-label">${({silhouette:'SILHOUETTE',zoom:'ZOOM',hidden:'IMAGE CACHÉE',blurred:'FLOU',normal:'IMAGE MYSTÈRE'})[mode]}</span></div>`;
}
function visualRoundLabel(q) {
  if(q.type==='image_clues')return '3 IMAGES · 1 RÉPONSE';
  if(q.type==='visual_guess')return ({silhouette:'LE DÉFI SILHOUETTE',zoom:'LE DÉFI ZOOM',hidden:'L’IMAGE CACHÉE',blurred:'LE DÉFI FLOU'})[q.visualMode]||'IMAGE MYSTÈRE';
  if(q.type==='odd_one_out')return 'TROUVE L’INTRUS';
  return ({qcm:'À TOI DE CHOISIR',open_answer:'À TOI DE TROUVER',true_false:'VRAI OU FAUX',ranking:'DANS LE BON ORDRE',number:'LE JUSTE NOMBRE',guess_character:'QUI SE CACHE ICI ?',zoom:'LE DÉFI ZOOM'})[q.type]||'À TOI DE JOUER';
}
function buildVisualRoundMarkup(eng,quiz,q,timer) {
  const header=`<div class="round-heading"><span>${visualRoundLabel(q)}</span><h2>${escapeHTML(q.text)}</h2></div>`;
  if(q.type==='image_clues')return `<div class="visual-round clues-round">${header}${renderClueImages(q,true)}<div class="round-bottom">${timer}<span class="round-answer-hint">${autoplayRevealLanguage(eng,quiz)==='en'?'Find the answer before the reveal':'Trouve la réponse avant la révélation'}</span></div></div>`;
  if(q.type==='visual_guess')return `<div class="visual-round mystery-round visual-layout-${effectiveAutoplayLayout(eng,q)}">${header}<div class="mystery-composition">${renderMysteryImage(q)}<div class="mystery-side"><span class="mystery-question-mark">?</span>${timer}<span class="round-answer-hint">${autoplayRevealLanguage(eng,quiz)==='en'?'Who is it?':'Tu l’as reconnu ?'}</span></div></div></div>`;
  return '';
}
function updateVisualRoundProgress(pct) {
  document.querySelectorAll('#stage-content .clue-card').forEach((el,i)=>el.classList.toggle('clue-locked',el.closest('.clue-triptych').dataset.progressive==='true' && pct<i*.31));
  const picture=document.querySelector('#stage-content .mystery-picture');if(!picture)return;
  if(picture.dataset.mystery==='zoom'){
    const e=STATE.autoplayEngine,q=getQuiz(e.quizId).questions[e.order[e.pos]];
    picture.style.setProperty('--mystery-zoom',String((q.zoomStart||4)*(1-pct)+pct));
  }
  if(picture.dataset.mystery==='blurred')picture.style.setProperty('--mystery-blur',`${18*(1-pct)}px`);
  const order=[5,2,9,0,7,10,3,8,1,11,4,6];
  picture.querySelectorAll('[data-cover]').forEach(el=>el.classList.toggle('uncovered',order.indexOf(Number(el.dataset.cover))<Math.floor(pct*11)));
}
function migrateStudioSettings(quiz) {
  const s={...studioDefaults(quiz),...(quiz.videoSettings||{})};
  // Old "Impact" typography stays selectable by intent, but is now rendered with a readable face.
  if(!s.sceneVersion){s.sceneVersion=2;s.textStyle='clean';s.preset='show';}
  return s;
}
async function prepareBroadcastMedia(eng,quiz) {
  const urls=[...new Set(quiz.questions.flatMap(q=>[q.image,...(q.clues||[]).map(c=>c.image),...(q.answers||[]).map(a=>a.image)]).filter(Boolean))];
  if(!urls.length)return;
  eng.phase='preparing';
  document.getElementById('stage-content').innerHTML='<div class="media-preparing"><span class="eyebrow">AVANT LA PRISE</span><h2>Préparation des images</h2><p id="media-preparing-status">Chargement des médias…</p><small>Le compte à rebours commencera une fois les images prêtes.</small></div>';
  document.querySelectorAll('.broadcast-controls [data-action^="studio-"]').forEach(el=>el.disabled=true);
  let cursor=0,loaded=0;
  async function worker(){
    while(cursor<urls.length){
      if(STATE.autoplayEngine!==eng)return;
      const url=urls[cursor++];
      await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(Error('Délai de chargement dépassé')),20000);
        ImageUtil.loadEl(url).then(image=>{clearTimeout(timeout);resolve(image);},error=>{clearTimeout(timeout);reject(error);});
      });
      loaded++;const status=document.getElementById('media-preparing-status');if(status&&STATE.autoplayEngine===eng)status.textContent=loaded+' / '+urls.length+' images prêtes';
    }
  }
  await Promise.all(Array.from({length:Math.min(4,urls.length)},worker));
  if(STATE.autoplayEngine===eng)document.querySelectorAll('.broadcast-controls [data-action^="studio-"]').forEach(el=>el.disabled=false);
}
async function imageHasTransparency(url) {
  const image=await ImageUtil.loadEl(url),canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
  const data=context.getImageData(0,0,canvas.width,canvas.height).data;
  for(let i=3;i<data.length;i+=4)if(data[i]<250)return true;
  return false;
}
