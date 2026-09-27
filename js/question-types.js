/* ============================================================
   9. QUESTION TYPE REGISTRY  (modular — add new types here only)
   ============================================================ */
const QUESTION_TYPE_ORDER = ['qcm','guess_character','true_false','ranking','zoom','number'];
const QuestionTypes = {
  qcm:{
    key:'qcm', icon:Icons.checkSquare, accent:'var(--violet)',
    label:()=>tr('qtype_qcm'), desc:()=>tr('qtype_qcm_desc'),
    createDefault(){ return {id:uid(),type:'qcm',text:'',image:null,imageMode:'normal',answers:[{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''}],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]}; },
    modalTitle(isNew){return isNew?tr('modal_new_qcm'):tr('modal_edit_qcm');},
    renderEditorExtra(q){return `<div class="field"><label class="field-label">${tr('field_illustration')}</label>${renderImageUploadBox(q,'qedit-illustration')}</div>`;},
    renderPlayTile(answer,letter){return defaultTileInner(answer,letter);}
  },
  guess_character:{
    key:'guess_character', icon:Icons.user, accent:'var(--teal)',
    label:()=>tr('qtype_character'), desc:()=>tr('qtype_character_desc'),
    createDefault(){return {id:uid(),type:'guess_character',text:'Guess the character',image:null,imageMode:'normal',pixelSize:16,blurPx:14,maskRect:null,answerText:'',answers:[],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]};},
    modalTitle(isNew){return isNew?tr('modal_new_character'):tr('modal_edit_character');},
    renderEditorExtra(q){
      return `<div class="field"><label class="field-label">${tr('field_character_image')}</label>${renderImageUploadBox(q,'qedit-character-image',true)}<p class="hint">L’effet visuel est choisi au lancement du quiz par le visiteur. Il n’est pas configuré personnage par personnage.</p></div><div class="field"><label class="field-label">${tr('field_expected_answer')}</label><input type="text" value="${escapeHTML(q.answerText||'')}" placeholder="Mario, Homer Simpson…" data-action="guess-answer-input"><p class="hint">Le visiteur saisira le nom du personnage au lieu de choisir une réponse.</p></div>${q.image?`<div class="field"><label class="field-label">Aperçu original</label><div class="guess-admin-original-preview"><img src="${q.image}" alt="" style="max-width:100%;max-height:220px;object-fit:contain;border-radius:12px;"></div></div>`:''}`;
    },
    renderPlayTile(answer,letter){return defaultTileInner(answer,letter);}
  },
  true_false:{
    key:'true_false', icon:Icons.check, accent:'var(--green)', label:()=>tr('qtype_true_false'), desc:()=>tr('qtype_true_false_desc'),
    createDefault(){const a=[{id:uid(),text:tr('true_label')||'Vrai'},{id:uid(),text:tr('false_label')||'Faux'}];return {id:uid(),type:'true_false',text:'',image:null,answers:a,correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]};},
    modalTitle(isNew){return isNew?tr('modal_new_true_false'):tr('modal_edit_true_false');},
    renderEditorExtra(){return `<p class="hint">${tr('true_false_hint')}</p>`;},
    renderPlayTile(answer,letter){return defaultTileInner(answer,letter);}
  },
  ranking:{
    key:'ranking', icon:Icons.barChart, accent:'var(--amber)', label:()=>tr('qtype_ranking'), desc:()=>tr('qtype_ranking_desc'),
    createDefault(){return {id:uid(),type:'ranking',text:'',criterion:'',answers:[{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''}],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]};},
    modalTitle(isNew){return isNew?tr('modal_new_ranking'):tr('modal_edit_ranking');},
    renderEditorExtra(q){return `<div class="field"><label class="field-label">${tr('ranking_criterion')}</label><input type="text" value="${escapeHTML(q.criterion||'')}" placeholder="${tr('ranking_criterion_ph')}" data-action="ranking-criterion-input"></div><p class="hint">${tr('ranking_drag_hint')}</p>`;},
    renderPlayTile(answer,letter){return `<span class="ranking-index">${letter}</span><span>${escapeHTML(answer.text)}</span>`;}
  },
  zoom:{
    key:'zoom', icon:Icons.image, accent:'var(--violet)', label:()=>tr('qtype_zoom'), desc:()=>tr('qtype_zoom_desc'),
    createDefault(){return {id:uid(),type:'zoom',text:'',image:null,zoomStart:3,answers:[{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''},{id:uid(),text:''}],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]};},
    modalTitle(isNew){return isNew?tr('modal_new_zoom'):tr('modal_edit_zoom');},
    renderEditorExtra(q){return `<div class="field"><label class="field-label">${tr('field_illustration')}</label>${renderImageUploadBox(q,'qedit-zoom-image',true)}</div><div class="field"><label class="field-label">${tr('zoom_start')}</label><div class="range-row"><input type="range" min="1.5" max="5" step="0.1" value="${q.zoomStart||3}" data-action="set-zoom-start"><span class="val">${q.zoomStart||3}×</span></div><p class="hint">${tr('zoom_start_hint')}</p></div>`;},
    renderPlayTile(answer,letter){return defaultTileInner(answer,letter);}
  },
  number:{
    key:'number', icon:Icons.barChart, accent:'var(--teal)', label:()=>tr('qtype_number'), desc:()=>tr('qtype_number_desc'),
    createDefault(){return {id:uid(),type:'number',text:'',value:50,min:0,max:100,step:1,unit:'',answers:[],correctAnswerId:null,explanation:'',duration:10,difficulty:'moyen',tags:[]};},
    modalTitle(isNew){return isNew?tr('modal_new_number'):tr('modal_edit_number');},
    renderEditorExtra(q){return `<div class="two-col"><div class="field"><label class="field-label">${tr('field_number_value')}</label><input type="number" value="${q.value??50}" data-action="number-value-input"></div><div class="field"><label class="field-label">${tr('field_number_unit')}</label><input type="text" value="${escapeHTML(q.unit||'')}" placeholder="kg, %, km…" data-action="number-unit-input"></div><div class="field"><label class="field-label">${tr('field_number_min')}</label><input type="number" value="${q.min??0}" data-action="number-min-input"></div><div class="field"><label class="field-label">${tr('field_number_max')}</label><input type="number" value="${q.max??100}" data-action="number-max-input"></div><div class="field"><label class="field-label">${tr('field_number_step')}</label><input type="number" value="${q.step??1}" min="0.0001" step="any" data-action="number-step-input"></div></div><p class="hint">${tr('number_hint')}</p>`;},
    renderPlayTile(){return '';}
  }
};
function defaultTileInner(answer, letter){
  const shapes = {
    a:'<polygon points="12 2 22 12 12 22 2 12"/>',
    b:'<polygon points="12 3 21 20 3 20"/>',
    c:'<circle cx="12" cy="12" r="9"/>',
    d:'<rect x="4" y="4" width="16" height="16" rx="3"/>',
    e:'<polygon points="12 2 22 9 18 21 6 21 2 9"/>',
    f:'<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/>'
  };
  return `<svg class="shape" viewBox="0 0 24 24" fill="currentColor">${shapes[letter]}</svg><span>${escapeHTML(answer.text)}</span>`;
}
function letterFor(idx){ return ['a','b','c','d','e','f'][idx] || 'a'; }
