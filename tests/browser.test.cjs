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

test('shipped catalogue: all 540 questions have valid playable content and stable unique IDs',async()=>{
 const {context,page,errors}=await session();await go(page,'/');
 assert.equal(await page.evaluate(()=>STATE.quizzes.length),34);
 const issues=await page.evaluate(()=>STATE.quizzes.flatMap(q=>quizIssues(q).map(i=>q.id+': '+i)));assert.deepEqual(issues,[]);
 const data=JSON.parse(readFileSync(path.join(root,'data/catalog.json'),'utf8'));
 const questions=data.quizzes.flatMap(q=>q.questions);assert.equal(questions.length,540);assert.equal(new Set(questions.map(q=>q.id)).size,540);
 for(const q of data.quizzes){assert.equal(q.questions.length,new Set(q.questions.map(x=>x.text)).size,q.name);}
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
 await page.click('[data-action="launch-autoplay-stage"]');assert.equal(await page.evaluate(()=>!!STATE.autoplayEngine),false);
 await go(page,'/admin/autoplay.html?id=missing');assert.equal(await page.evaluate(()=>STATE.view),'library');
 assert.deepEqual(errors,[]);await context.close();
});
