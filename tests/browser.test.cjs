const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),origin='http://127.0.0.1:8765';
let browser,server;
before(async()=>{
 server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
 for(let i=0;i<30;i++){try{if((await fetch(origin)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
});
after(async()=>{await browser?.close();server?.kill();});
async function session(viewport={width:1440,height:1000}){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===origin)errors.push('HTTP '+r.status()+' '+r.url());});
 return {context,page,errors};
}
async function go(page,route){await page.goto(origin+route);await page.waitForFunction(()=>STATE.ready&&document.querySelector('#app').textContent.trim().length>0);}

test('shipped catalogue: ready catalogue has valid playable content; incomplete storyboards stay drafts and stable unique IDs',async()=>{
 const {context,page,errors}=await session();await go(page,'/');
 assert.equal(await page.evaluate(()=>STATE.quizzes.length),39);
 const issues=await page.evaluate(()=>STATE.quizzes.filter(q=>q.status!=='draft').flatMap(q=>quizIssues(q).map(i=>q.id+': '+i)));assert.deepEqual(issues,[]);
 const data=JSON.parse(readFileSync(path.join(root,'data/catalog.json'),'utf8'));
 const questions=data.quizzes.flatMap(q=>q.questions);assert.equal(questions.length,640);assert.equal(new Set(questions.map(q=>q.id)).size,640);
 assert.equal(data.quizzes.filter(q=>q.status==='draft').length,2);
 assert.equal(data.quizzes.filter(q=>q.status!=='draft').flatMap(q=>q.questions).length,600);
 assert.deepEqual(errors,[]);await context.close();
});

test('public routes, editor, profile and studio render; catalogue available in a fresh independent browser',async()=>{
 const {context,page,errors}=await session();
 for(const route of ['/','/quizcast.html','/quizzes/','/categories/','/profile/','/admin/','/quizzes/quiz.html?id=catalog-capitales','/admin/editor.html?id=catalog-capitales','/admin/autoplay.html?id=catalog-capitales'])await go(page,route);
 assert.equal(await page.locator('#studio-preview .stage-qtext').innerText(),'Quelle est la capitale du Canada ?');
 assert.equal(await page.locator('#studio-preview .stage-qtext').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.click('[data-action="studio-preview-reveal"]');assert.match(await page.locator('#studio-preview').innerText(),/Ottawa/);
 const other=await session();await go(other.page,'/quizzes/quiz.html?id=catalog-capitales');assert.match(await other.page.locator('#app').innerText(),/Le tour du monde/);
 assert.deepEqual([...errors,...other.errors],[]);await other.context.close();await context.close();
});

test('create a free response through the editor, save aliases, play it and persist after reload',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 await page.locator('.studio-heading [data-action="new-quiz"]').click();await page.click('[data-template="open_answer"]');
 await page.fill('[data-action="q-text-input"]','Quelle ville est surnommée la Ville lumière ?');
 await page.fill('[data-action="guess-answer-input"]','Paris');await page.fill('[data-action="accepted-answers-input"]','la capitale française;Paname');
 await page.click('[data-action="save-question-from-modal"]');
 await page.fill('[data-action="qz-name-input"]','Test de création');await page.waitForTimeout(650);
 const id=await page.evaluate(()=>STATE.currentQuizId);
 await go(page,'/play/?id='+id);await page.fill('#play-guess-input','PANAME');await page.press('#play-guess-input','Enter');
 assert.equal(await page.evaluate(()=>STATE.play.correctCount),1);await page.click('[data-action="next-play-question"]');assert.match(await page.locator('#app').innerText(),/1\/1/);
 await go(page,'/admin/editor.html?id='+id);assert.equal(await page.inputValue('[data-action="qz-name-input"]'),'Test de création');
 assert.equal(await page.evaluate(()=>currentQuiz().questions[0].acceptedAnswers.length),2);assert.deepEqual(errors,[]);await context.close();
});

test('studio settings persist by quiz, sample selection and all presets are usable',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-capitales');
 await page.fill('[data-key="responseTime"]','15');await page.click('[data-tab="style"]');await page.click('[data-preset="paper"]');
 await page.selectOption('[data-key="layout"]','stacked');await page.waitForFunction(()=>getQuiz('catalog-capitales').videoSettings.layout==='stacked');
 await page.reload();await page.waitForFunction(()=>STATE.ready&&STATE.autoplaySetup);
 assert.equal(await page.evaluate(()=>STATE.autoplaySetup.responseTime),15);assert.equal(await page.evaluate(()=>STATE.autoplaySetup.preset),'paper');
 await page.click('[data-tab="style"]');
 for(const preset of ['pop','show','paper','nintendo','cartoon','arcade','horror','cinematic']){await page.click(`[data-action="studio-preset"][data-preset="${preset}"]`);assert.equal(await page.locator('#studio-preview .stage-tile').count(),4);}
 await page.click('[data-action="studio-sample-next"]');assert.match(await page.locator('#studio-preview .stage-qtext').innerText(),/Australie/);
 assert.deepEqual(errors,[]);await context.close();
});

test('broadcast: real phase scheduling, pause/resume, checkpoints, skip, end and cancellation',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-capitales');await page.clock.install();
 await page.evaluate(()=>{const s=STATE.autoplaySetup;s.introDuration=0;s.responseTime=3;s.revealDuration=1;s.nextDelay=0;s.checkpointEvery=1;launchAutoplayStage();});
 await page.clock.runFor(500);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.phase),'counting');
 await page.evaluate(()=>studioPause());const pos=await page.evaluate(()=>STATE.autoplayEngine.pos);await page.clock.runFor(10000);
 assert.equal(await page.evaluate(()=>STATE.autoplayEngine.phase),'counting');assert.equal(await page.evaluate(()=>STATE.autoplayEngine.pos),pos);
 await page.evaluate(()=>studioPause());await page.clock.runFor(3000);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.phase),'revealing');
 assert.equal(await page.locator('#stage-content .correct-pulse').count(),1);assert.match(await page.locator('#stage-content .scene-explanation').innerText(),/Ottawa/);
 await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.phase),'checkpoint');
 await page.clock.runFor(3300);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.pos),1);
 await page.evaluate(()=>studioSkip(1));await page.clock.runFor(300);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.pos),2);
 await page.evaluate(()=>studioSkip(-1));await page.clock.runFor(300);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.pos),1);
 await page.evaluate(()=>{clearApTimers();STATE.autoplayEngine.pos=STATE.autoplayEngine.order.length-1;renderQuestionIntoStage(runAutoplayPhaseTimer);});
 await page.clock.runFor(4500);assert.equal(await page.evaluate(()=>STATE.autoplayEngine.phase),'finished');assert.match(await page.locator('#stage-content').innerText(),/combien de points/);
 await page.evaluate(()=>exitAutoplayStage());await page.clock.runFor(20000);assert.equal(await page.locator('#stage-content').count(),0);assert.equal(await page.evaluate(()=>STATE.autoplayEngine),null);
 assert.deepEqual(errors,[]);await context.close();
});

test('all seven question formats work in interactive play and broadcast reveal',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 for(const type of ['qcm','true_false','open_answer','number','ranking','guess_character','zoom']){
  await page.evaluate(async type=>{
   const q=QuestionTypes[type].createDefault();q.text='Question de test '+type;q.explanation='Explication de la réponse.';
   if(q.answers?.length){q.answers.forEach((a,i)=>a.text='Option '+i);q.correctAnswerId=q.answers[0].id;}
   if(type==='ranking')q.criterion='Ordre de création';if(['guess_character','zoom'].includes(type))q.image='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="orange"/></svg>');
   if(['guess_character','open_answer'].includes(type))q.answerText='Éléphant';
   const quiz={id:'format-test',name:'Format '+type,questions:[q],language:'fr',categoryIds:[]};STATE.quizzes=STATE.quizzes.filter(q=>q.id!==quiz.id);STATE.quizzes.push(quiz);await saveQuiz(quiz);startPlay(quiz.id,'quizEditor');
  },type);
  if(['qcm','true_false','zoom'].includes(type))await page.locator('[data-action="select-answer"]').first().click();
  if(['guess_character','open_answer'].includes(type)){await page.fill('#play-guess-input','elephant');await page.click('[data-action="submit-guess"]');}
  if(type==='number'){
   await page.click('[data-action="submit-number"]');assert.equal(await page.evaluate(()=>STATE.play.revealed),false);
   await page.fill('#play-number-input','50');await page.click('[data-action="submit-number"]');
  }
  if(type==='ranking'){await page.evaluate(()=>{const q=getQuiz('format-test').questions[0],list=document.getElementById('ranking-play-list');q.answers.forEach(a=>list.appendChild(list.querySelector(`[data-aid="${a.id}"]`)));});await page.click('[data-action="submit-ranking"]');}
  assert.equal(await page.evaluate(()=>STATE.play.correctCount),1,type);
  await page.evaluate(()=>{openAutoplaySetup('format-test');STATE.autoplaySetup.introDuration=0;launchAutoplayStage();clearApTimers();STATE.autoplayEngine.phase='counting';populateStageContent(STATE.autoplayEngine,getQuiz('format-test'),document.getElementById('stage-content'));STATE.autoplayEngine.phase='revealing';updateRevealVisuals();});
  assert.match(await page.locator('#stage-content').innerText(),/Explication de la réponse/,type);await page.evaluate(()=>exitAutoplayStage());
 }
 assert.deepEqual(errors,[]);await context.close();
});

test('catalogue edits/deletions stay local, deletion survives reload, malformed import is rejected atomically',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 await page.evaluate(async()=>{const q=getQuiz('catalog-capitales');q.name='Mon titre local';await saveQuiz(q);await doDeleteQuiz('catalog-animaux');});
 await page.reload();await page.waitForFunction(()=>STATE.ready);
 assert.equal(await page.evaluate(()=>getQuiz('catalog-capitales').name),'Mon titre local');assert.equal(await page.evaluate(()=>!!getQuiz('catalog-animaux')),false);
 const other=await session();await go(other.page,'/');assert.equal(await other.page.evaluate(()=>!!getQuiz('catalog-animaux')),true);assert.notEqual(await other.page.evaluate(()=>getQuiz('catalog-capitales').name),'Mon titre local');
 const result=await page.evaluate(async()=>{const n=STATE.quizzes.length,c=STATE.categories.length;await handleImportFile(new File([JSON.stringify({categories:[{id:'bad',name:'Intrus'}],quizzes:[{name:'Invalide',questions:[{id:'bad',type:'unsupported',text:'?'}]}]})],'bad.json'));return {same:STATE.quizzes.length===n&&STATE.categories.length===c,message:document.getElementById('toast-wrap').textContent};});
 assert.equal(result.same,true);assert.match(result.message,/Type de question inconnu/);assert.deepEqual([...errors,...other.errors],[]);
 await context.close();await other.context.close();
});

test('mobile public, admin, editor and studio have no horizontal overflow',async()=>{
 const {context,page,errors}=await session({width:390,height:844});
 for(const route of ['/','/quizzes/','/admin/','/admin/editor.html?id=catalog-capitales','/admin/autoplay.html?id=catalog-capitales']){
  await go(page,route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),route);
 }
 assert.deepEqual(errors,[]);await context.close();
});

test('bulk questions validate the entire batch before saving; ordering and JSON round-trip preserve answers',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 await page.evaluate(()=>{createNewQuiz();currentQuiz().name='Import en lot';render();});
 await page.click('[data-action="open-bulk-questions"]');
 await page.fill('[data-action="bulk-question-text"]','Capitale du Canada ? | Ottawa | Toronto\nLigne invalide');await page.click('[data-action="confirm-bulk-questions"]');
 assert.match(await page.locator('#bulk-question-errors').innerText(),/Ligne 2/);assert.equal(await page.evaluate(()=>currentQuiz().questions.length),0);
 await page.fill('[data-action="bulk-question-text"]','Capitale du Canada ? | Ottawa | Toronto\nCapitale de la France ? | Paris | Lyon');await page.click('[data-action="confirm-bulk-questions"]');
 await page.waitForFunction(()=>currentQuiz().questions.length===2&&!document.querySelector('[data-action="bulk-question-text"]'));
 await page.locator('[data-action="question-down"]').first().click();await page.waitForFunction(()=>currentQuiz().questions[0].text.includes('France'));
 const result=await page.evaluate(async()=>{const original=currentQuiz(),before=STATE.quizzes.length;await handleImportFile(new File([JSON.stringify({categories:[],quizzes:[original]})],'roundtrip.json'));const copy=STATE.quizzes.at(-1);return {count:STATE.quizzes.length-before,fresh:copy.id!==original.id&&copy.questions[0].id!==original.questions[0].id,answer:copy.questions[0].answers.find(a=>a.id===copy.questions[0].correctAnswerId).text};});
 assert.deepEqual(result,{count:1,fresh:true,answer:'Paris'});assert.deepEqual(errors,[]);await context.close();
});

test('production sheet downloads, optional synthesized audio starts on click, empty quiz never leaves a blank page',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-capitales');
 await page.click('[data-tab="advanced"]');
 const downloading=page.waitForEvent('download');await page.click('[data-action="studio-production-kit"]');const download=await downloading;
 assert.match(download.suggestedFilename(),/production-/);const file=await download.path();assert.match(readFileSync(file,'utf8'),/Ottawa/);assert.match(readFileSync(file,'utf8'),/DÉROULÉ/);
 await page.selectOption('[data-key="sound"]','true');await page.click('[data-action="launch-autoplay-stage"]');
 await page.waitForFunction(()=>studioAudio?.state==='running');assert.equal(await page.evaluate(()=>STATE.autoplayEngine.sound),true);await page.evaluate(()=>exitAutoplayStage());
 const id=await page.evaluate(async()=>{createNewQuiz();currentQuiz().name='Quiz vide';await saveQuiz(currentQuiz());return STATE.currentQuizId;});
 await go(page,'/admin/autoplay.html?id='+id);assert.match(await page.locator('#studio-preview').innerText(),/première question/);
 assert.equal(await page.locator('[data-action="launch-autoplay-stage"]').isDisabled(),true);
 await page.evaluate(()=>launchAutoplayStage());assert.equal(await page.evaluate(()=>!!STATE.autoplayEngine),false);
 await go(page,'/admin/autoplay.html?id=missing');assert.equal(await page.evaluate(()=>STATE.view),'library');
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: mixed packs are discoverable, ten question types exist, drafts are excluded from public routes',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 await page.click('[data-view="collection"]');assert.equal(await page.locator('.quiz-card').count(),3);
 await page.click('[data-filter="storyboards"]');assert.equal(await page.locator('.quiz-card').count(),2);assert.match(await page.locator('.quiz-grid').innerText(),/À illustrer/);
 await page.click('[data-filter="all"]');assert.equal(await page.locator('.quiz-card').count(),39);
 assert.equal(await page.evaluate(()=>QUESTION_TYPE_ORDER.length),10);
 assert.ok(await page.evaluate(()=>new Set(getQuiz('catalog-nintendo-remix').questions.map(q=>q.type)).size>=6));
 assert.ok(await page.evaluate(()=>new Set(getQuiz('catalog-grand-mix-visuel').questions.map(q=>q.type)).size>=8));
 assert.equal(await page.evaluate(()=>new Set(getQuiz('catalog-personnages-mysteres').questions.map(q=>q.visualMode)).size),4);
 assert.equal(await page.evaluate(()=>publicQuizList().length),37);
 await go(page,'/quizzes/quiz.html?id=catalog-films-3-captures');assert.match(await page.locator('#app').innerText(),/Quiz introuvable/);
 await go(page,'/play/?id=catalog-films-3-captures');assert.equal(await page.evaluate(()=>STATE.view),'publicQuizzes');
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: import three captures, preserve them through save and JSON import, keep unfinished storyboard as draft',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-films-3-captures');
 assert.equal(await page.locator('[data-action="launch-autoplay-stage"]').isDisabled(),true);
 assert.equal(await page.locator('img[src=""]').count(),0);
 await page.click('[data-action="complete-storyboard"]');assert.match(await page.locator('.modal-body').innerText(),/paquebot/);
 for(let index=0;index<3;index++)await page.setInputFiles(`[data-action="visual-clue-file"][data-index="${index}"]`,{name:`capture-${index}.svg`,mimeType:'image/svg+xml',buffer:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${['red','green','blue'][index]}"/></svg>`)});
 await page.waitForFunction(()=>STATE._questionDraft.clues.every(c=>c.image.startsWith('data:image/png')));
 await page.click('[data-action="save-question-from-modal"]');await page.waitForFunction(()=>!STATE._questionDraft);
 const result=await page.evaluate(async()=>{const q=currentQuiz(),original=q.questions[0];await handleImportFile(new File([JSON.stringify({categories:[],quizzes:[{...q,id:'copy-test',questions:[original]}]})],'visual.json'));const copy=STATE.quizzes.at(-1);return {draft:q.status,answer:copy.questions[0].answerText,images:copy.questions[0].clues.map(c=>c.image),fresh:copy.questions[0].id!==original.id};});
 assert.equal(result.draft,'draft');assert.equal(result.answer,'Titanic');assert.ok(result.fresh);assert.equal(new Set(result.images).size,3);
 await go(page,'/admin/editor.html?id=catalog-films-3-captures');assert.equal(await page.evaluate(()=>getQuiz('catalog-films-3-captures').questions[0].clues.every(c=>c.image.startsWith('data:'))),true);
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: progressive clues unlock at their scheduled times and reveal the answer without choice tiles',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');await page.clock.install();
 await page.evaluate(()=>{const source=getQuiz('catalog-nintendo-remix'),q=source.questions.find(q=>q.type==='image_clues');const quiz={...source,id:'clue-timeline',questions:[q]};STATE.quizzes.push(quiz);openAutoplaySetup(quiz.id);Object.assign(STATE.autoplaySetup,{introDuration:0,responseTime:3,timingMode:'fixed',revealDuration:1,checkpointEvery:0});launchAutoplayStage();});
 await page.waitForFunction(()=>STATE.autoplayEngine.phase==='intro');await page.clock.runFor(400);
 assert.equal(await page.locator('#stage-content .clue-locked').count(),2);assert.equal(await page.locator('#stage-content .stage-tile').count(),0);
 await page.clock.runFor(1000);assert.equal(await page.locator('#stage-content .clue-locked').count(),1);
 await page.clock.runFor(1000);assert.equal(await page.locator('#stage-content .clue-locked').count(),0);
 await page.clock.runFor(1000);assert.match(await page.locator('#stage-content .studio-answer-card strong').innerText(),/Super Mario/);
 assert.equal(await page.locator('#stage-content .clue-locked').count(),0);assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: silhouette, zoom, hidden tiles and blur remain independent per question and fully reveal',async()=>{
 const {context,page,errors}=await session({width:1920,height:1080});await go(page,'/admin/autoplay.html?id=catalog-nintendo-remix');
 await page.click('[data-action="launch-autoplay-stage"]');await page.waitForFunction(()=>STATE.autoplayEngine.phase==='intro');
 for(const [pos,mode]of [[0,'silhouette'],[3,'zoom'],[6,'hidden'],[8,'blurred']]){
  await page.evaluate(pos=>{clearApTimers();const e=STATE.autoplayEngine;e.phase='counting';e.pos=pos;populateStageContent(e,getQuiz(e.quizId),document.getElementById('stage-content'));},pos);
  assert.equal(await page.locator('#stage-content .mystery-picture').getAttribute('data-mystery'),mode);
  if(mode==='silhouette')assert.match(await page.locator('#stage-content .mystery-picture > img').evaluate(el=>getComputedStyle(el).filter),/brightness\(0\)/);
  const before=mode==='zoom'?await page.locator('#stage-content .mystery-picture').evaluate(el=>parseFloat(el.style.getPropertyValue('--mystery-zoom'))):0;
  await page.evaluate(()=>updateCountdownDOM(1,.85));
  if(mode==='zoom')assert.ok(await page.locator('#stage-content .mystery-picture').evaluate(el=>parseFloat(el.style.getPropertyValue('--mystery-zoom')))<before);
  if(mode==='hidden')assert.equal(await page.locator('#stage-content .mystery-covers .uncovered').count(),9);
  if(mode==='blurred')assert.ok(await page.locator('#stage-content .mystery-picture').evaluate(el=>parseFloat(el.style.getPropertyValue('--mystery-blur')))<5);
  await page.evaluate(()=>{STATE.autoplayEngine.phase='revealing';updateRevealVisuals();});
  assert.equal(await page.locator('#stage-content .mystery-picture').count(),0);assert.equal(await page.locator('#stage-content .studio-answer-card > img').count(),1);
 }
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: free visual answers and image intruders score in public play; hint reveals are usable',async()=>{
 const {context,page,errors}=await session();await go(page,'/play/?id=catalog-nintendo-remix');
 await page.fill('#play-guess-input','LINK');await page.click('[data-action="submit-guess"]');assert.equal(await page.evaluate(()=>STATE.play.correctCount),1);
 await page.click('[data-action="next-play-question"]');assert.equal(await page.locator('.clue-card').count(),3);await page.fill('#play-guess-input','super mario');await page.click('[data-action="submit-guess"]');assert.equal(await page.evaluate(()=>STATE.play.correctCount),2);
 await page.evaluate(()=>{STATE.play.pos=4;STATE.play.revealed=false;render();});
 const aid=await page.evaluate(()=>getQuiz(STATE.play.quizId).questions[4].correctAnswerId);await page.locator(`[data-action="select-answer"][data-aid="${aid}"]`).click();assert.equal(await page.evaluate(()=>STATE.play.correctCount),3);
 await page.evaluate(()=>{STATE.play.pos=6;STATE.play.revealed=false;render();});const before=await page.locator('.mystery-covers .uncovered').count();await page.click('[data-action="visual-hint"]');assert.ok(await page.locator('.mystery-covers .uncovered').count()>before);
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: every theme uses readable fonts and high contrast at 1080p; clue composition fits its capture frame',async()=>{
 const {context,page,errors}=await session({width:1920,height:1080});await go(page,'/admin/autoplay.html?id=catalog-nintendo-remix');
 await page.click('[data-action="launch-autoplay-stage"]');await page.waitForFunction(()=>STATE.autoplayEngine.phase==='intro');
 const results=await page.evaluate(()=>{
  function lum(hex){const values=hex.trim().replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
  const e=STATE.autoplayEngine,scene=document.getElementById('stage-16x9'),quiz=getQuiz(e.quizId);clearApTimers();e.phase='counting';e.pos=1;
  return ['pop','show','paper','nintendo','cartoon','arcade','horror','cinematic'].map(preset=>{
   scene.className=`stage-16x9 studio-scene broadcast-v2 autoplay-preset-${preset} autoplay-text-style-bold`;populateStageContent(e,quiz,document.getElementById('stage-content'));
   const style=getComputedStyle(scene),bg=lum(style.getPropertyValue('--b-bg')),ink=lum(style.getPropertyValue('--b-ink')),font=getComputedStyle(scene.querySelector('.round-heading h2')).fontFamily;
   const frame=scene.getBoundingClientRect(),safe=[...scene.querySelectorAll('.round-heading h2,.clue-card,.round-bottom')].every(el=>{const box=el.getBoundingClientRect();return box.top>=frame.top+frame.height*.08&&box.bottom<=frame.bottom-frame.height*.08&&box.left>=frame.left&&box.right<=frame.right;});
   return {preset,contrast:(Math.max(bg,ink)+.05)/(Math.min(bg,ink)+.05),font,safe};
  });
 });
 for(const result of results){assert.ok(result.contrast>=4.5,JSON.stringify(result));assert.doesNotMatch(result.font,/Impact/);assert.ok(result.safe,JSON.stringify(result));}
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: a single illustrated question can be rehearsed while the rest of a storyboard is incomplete',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-films-3-captures');
 await page.evaluate(()=>{const q=getQuiz('catalog-films-3-captures').questions[0],source=getQuiz('catalog-nintendo-remix').questions.find(q=>q.type==='image_clues');q.clues=JSON.parse(JSON.stringify(source.clues));render();});
 assert.equal(await page.locator('[data-action="launch-autoplay-stage"]').isDisabled(),true);
 assert.equal(await page.locator('[data-action="launch-autoplay-sample"]').isDisabled(),false);
 await page.click('[data-action="launch-autoplay-sample"]');await page.waitForFunction(()=>STATE.autoplayEngine.phase==='counting'&&document.getElementById('stage-video-title').textContent.startsWith('TEST'));
 assert.deepEqual(await page.evaluate(()=>STATE.autoplayEngine.order),[0]);assert.match(await page.locator('#stage-video-title').innerText(),/TEST/);
 await page.evaluate(()=>{clearApTimers();STATE.autoplayEngine.phase='revealing';updateRevealVisuals();});assert.equal(await page.locator('.studio-answer-card strong').innerText(),'Titanic');
 assert.equal(await page.evaluate(()=>getQuiz('catalog-films-3-captures').status),'draft');assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: closing while media preload is pending never restarts the broadcast later',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-nintendo-remix');
 let release;const gate=new Promise(resolve=>release=resolve),requests=[];
 await page.route('**/assets/characters/**',async route=>{requests.push(route);await gate;await route.continue();});
 await page.click('[data-action="launch-autoplay-stage"]');await page.waitForFunction(()=>STATE.autoplayEngine.phase==='preparing');
 await page.evaluate(()=>exitAutoplayStage());release();await page.waitForTimeout(300);
 assert.equal(await page.evaluate(()=>STATE.autoplayEngine),null);assert.equal(await page.locator('#stage-content').count(),0);assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: rehearse a text-only round inside a mixed visual pack without stalling preload',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/autoplay.html?id=catalog-nintendo-remix');
 await page.evaluate(()=>{STATE.studioSample=2;render();});await page.click('[data-action="launch-autoplay-sample"]');
 await page.waitForFunction(()=>STATE.autoplayEngine.phase==='counting'&&document.querySelector('#stage-content .stage-tile'));
 assert.deepEqual(await page.evaluate(()=>STATE.autoplayEngine.order),[2]);assert.equal(await page.locator('#stage-content .stage-tile').count(),2);
 assert.deepEqual(errors,[]);await context.close();
});

test('visual v2: opaque images cannot silently turn into a black rectangle in silhouette mode',async()=>{
 const {context,page,errors}=await session();await go(page,'/admin/');
 await page.evaluate(()=>{createNewQuiz();currentQuiz().name='Contrôle alpha';openQuestionModal(currentQuiz().id,null,'visual_guess');});
 await page.fill('[data-action="guess-answer-input"]','Carré');
 await page.setInputFiles('[data-action="visual-main-file"]',{name:'opaque.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>')});
 await page.waitForFunction(()=>STATE._questionDraft.imageHasAlpha===false);await page.click('[data-action="save-question-from-modal"]');
 assert.match(await page.locator('#toast-wrap').innerText(),/fond transparent/);assert.equal(await page.evaluate(()=>currentQuiz().questions.length),0);
 await page.selectOption('[data-action="visual-mode"]','zoom');await page.click('[data-action="save-question-from-modal"]');
 await page.waitForFunction(()=>currentQuiz().questions.length===1&&!STATE._questionDraft);assert.deepEqual(errors,[]);await context.close();
});
