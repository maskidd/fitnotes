/* FitNotes — local-first personal workout tracker. */
const STORAGE_KEY = 'fitnesslog.maskidd.v1';
const WEEKDAYS = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
const SHORT_DAYS = ['Søn','Man','Tir','Ons','Tor','Fre','Lør'];
const ICONS = {
  lift:'<path d="M3 9v6m4-9v12m10-12v12m4-9v6M7 12h10"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 13V9m-3-7h6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  play:'<path d="m8 5 11 7-11 7z"/>',
  arrow:'<path d="m9 18 6-6-6-6"/>',
  trend:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.91 1.91-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21h-2.7v-.1a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06-1.91-1.91.06-.06A1.7 1.7 0 0 0 7.84 15a1.7 1.7 0 0 0-1.55-1H6v-2.7h.1a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06 1.91-1.91.06.06a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1-1.55V5h2.7v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06 1.91 1.91-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.55 1H21v2.7h-.1a1.7 1.7 0 0 0-1.5 1.21z"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18m-2 0-.8 14H5.8L5 6m3-3h8l1 3M10 10v7m4-7v7"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  upload:'<path d="M12 17V5m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  pause:'<path d="M8 5v14m8-14v14"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};
function icon(name, extra=''){return `<svg ${extra} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.lift}</svg>`;}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function uid(){return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,9)}`;}
function ex(name,sets=2,target='6–8',unit='kg',hint=''){return {id:uid(),name,sets,target,unit,hint};}
// The exact exercise records from the FitNotes backup exported 21 October 2026.
// No completed workouts or progression baselines were present in that backup.
const INCLUDED_BACKUP = {
  version:1,
  program:[
    {id:'day1',weekday:0,name:'PUSH · Styrke',focus:'Tungere sæt',range:'6–8',exercises:[
      {id:'mvir1gs9zt3g44a',name:'Flat DB Press',sets:2,target:'6–8',unit:'kg',hint:'Vægt pr. hånd'},
      {id:'mvir1gs9lii5kgq',name:'Incline Smith Press',sets:2,target:'6–8',unit:'kg',hint:''},
      {id:'mvir1gs9tlu1lmw',name:'Military Push-ups',sets:2,target:'AMRAP',unit:'kropsvægt',hint:''}
    ]},
    {id:'day2',weekday:1,name:'PULL · Styrke',focus:'Tungere sæt',range:'6–8',exercises:[
      {id:'mvir1gs98b6fag3',name:'Seated Row · trekantgreb',sets:2,target:'6–8',unit:'kg',hint:''}
    ]},
    {id:'day3',weekday:3,name:'PUSH · Muskelvækst',focus:'Flere gentagelser',range:'10–12',exercises:[
      {id:'mvir1gs9o8q8npj',name:'Flat DB Press',sets:2,target:'10–12',unit:'kg',hint:'Vægt pr. hånd'},
      {id:'mvir1gs9kin5zx8',name:'Incline Smith Press',sets:2,target:'10–12',unit:'kg',hint:''},
      {id:'mvir1gs9o81xu4y',name:'Military Push-ups',sets:2,target:'AMRAP',unit:'kropsvægt',hint:''}
    ]},
    {id:'day4',weekday:4,name:'PULL · Muskelvækst',focus:'Flere gentagelser',range:'10–12',exercises:[
      {id:'mvir1gs9mhd7dh8',name:'Seated Row · trekantgreb',sets:2,target:'10–12',unit:'kg',hint:''}
    ]}
  ],
  logs:[],baselines:{},profile:{heightCm:184,bodyWeightKg:82,age:19}
};
// Expanded four-day PUSH/PULL plan from the user's two workout screenshots.
// Triceps belong to PUSH and biceps/face pulls to PULL. Dips remain replaced
// by pain-free Military Push-ups, as previously requested.
const PROGRAM_REVISION = 4;
function extraExercise(dayId,key,name,target,hint=''){
  return {id:`v2-${dayId}-${key}`,name,sets:2,target,unit:'kg',hint};
}
function currentProgram(){
  return INCLUDED_BACKUP.program.map(source=>{
    const day=structuredClone(source),r=day.range;
    if(day.id==='day1'||day.id==='day3'){
      day.exercises.push(
        extraExercise(day.id,'lateral-raise','Lateral Raise',r,'Håndvægte'),
        extraExercise(day.id,'skull-crushers','Skull Crushers',r),
        extraExercise(day.id,'overhead-extension','Overhead Triceps Extension',r)
      );
    }else{
      day.exercises=[
        {...extraExercise(day.id,'pull-up','Pull-up',r,'0 kg = kun kropsvægt'),unit:'ekstravægt'},
        ...day.exercises,
        extraExercise(day.id,'single-arm-lat','Single-arm Lat Pulldown',r),
        extraExercise(day.id,'face-pulls','Face Pulls',r),
        extraExercise(day.id,'incline-curl','Incline DB Curl',r,'Vægt pr. hånd'),
        extraExercise(day.id,'hammer-curl','Incline DB Hammer Curl',r,'Vægt pr. hånd')
      ];
    }
    return day;
  });
}
function initialData(){return {
  version:1,
  program:currentProgram(),
  programRevision:PROGRAM_REVISION,
  logs:[],session:null,rest:null,baselines:{},profile:{heightCm:184,bodyWeightKg:82,age:19},settings:{restSeconds:180,restAlert:true}
};}
function applyDayNames(program){
  return program.map(day=>{
    const backupDay=INCLUDED_BACKUP.program.find(d=>d.id===day.id);
    if(!backupDay||!/^Dag [1-4] · Overkrop$/.test(day.name))return day;
    return {...day,name:backupDay.name};
  });
}
function addNewExercises(existingProgram){
  const result=applyDayNames(structuredClone(existingProgram));
  for(const dayTemplate of currentProgram()){
    let day=result.find(d=>d.id===dayTemplate.id);
    if(!day){result.push(dayTemplate);continue;}
    if(!Array.isArray(day.exercises))day.exercises=[];
    const extra=day.exercises.filter(e=>!dayTemplate.exercises.some(t=>t.name.toLowerCase()===e.name.toLowerCase()));
    const ordered=dayTemplate.exercises.map(t=>{
      const previous=day.exercises.find(e=>e.name.toLowerCase()===t.name.toLowerCase());
      if(!previous)return structuredClone(t);
      if(t.name==='Pull-up')return {...previous,unit:'ekstravægt',hint:t.hint};
      return previous;
    });
    day.exercises=[...ordered,...extra];
  }
  return result;
}
function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(raw&&Array.isArray(raw.program)&&Array.isArray(raw.logs)){
      const defaults=initialData();
      const needsUpgrade=(Number(raw.programRevision)||0)<PROGRAM_REVISION;
      const data={...defaults,...raw,
        program:needsUpgrade?addNewExercises(raw.program):applyDayNames(raw.program),
        programRevision:PROGRAM_REVISION,
        profile:{...defaults.profile,...raw.profile},
        settings:{...defaults.settings,...raw.settings}};
      if(needsUpgrade&&data.session?.exercises)for(const exercise of data.session.exercises){
        if(/^pull.?up$/i.test(exercise.name)){
          exercise.unit='ekstravægt';
          exercise.hint='0 kg = kun kropsvægt';
        }
      }
      if(needsUpgrade)localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
      return data;
    }
  }catch(e){}
  return initialData();
}
let state=loadState(),tab='home',modal=null,draft=null,confirmDraft=null,logDraft=null,baselineDraft=null,baselineName=null,historyOpen=null,toastTimer=null;
let lastRenderedTab=null,lastRenderedModal=null,modalOpener=null,sessionReturnTab='home';
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast('Kunne ikke gemme på denne enhed');}window.FitSync?.queue();}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
function fullDate(value=new Date()){return new Date(value).toLocaleDateString('da-DK',{day:'numeric',month:'long',year:'numeric'});}
function shortDate(value){return new Date(value).toLocaleDateString('da-DK',{day:'numeric',month:'short'});}
function dayFromDate(date){return state.program.find(x=>x.weekday===date.getDay());}
function doneToday(dayId){const today=new Date().toDateString();return state.logs.some(l=>l.dayId===dayId&&new Date(l.finishedAt).toDateString()===today);}
// Today's workout is skipped once it has been saved, so the hero shows the next one.
function nextDay(){const now=new Date();for(let i=0;i<8;i++){let d=new Date(now);d.setDate(now.getDate()+i);const p=dayFromDate(d);if(p&&!(i===0&&doneToday(p.id)))return {...p,offset:i};}return {...state.program[0],offset:0};}
function weekStart(date=new Date()){let d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
function weekLogs(){const monday=weekStart();return state.logs.filter(x=>new Date(x.finishedAt)>=monday);}
function finishedSets(log){return log.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);}
function getRecent(name){for(const log of state.logs){let ex=log.exercises.find(x=>x.name.toLowerCase()===name.toLowerCase());if(ex&&ex.sets.some(s=>s.done))return ex;}const values=state.baselines?.[name.trim().toLowerCase()];return values?.length?{name,sets:values.map(s=>({...s,done:true}))}:null;}
function hasLoggedHistory(name){return state.logs.some(log=>log.exercises.some(ex=>ex.name.toLowerCase()===name.toLowerCase()&&ex.sets.some(s=>s.done)));}
function kgText(value){return String(value??'').replace('.',',');}
function formatPreviousSet(row,unit){return unit==='kropsvægt'||unit==='ekstravægt'||unit==='assisteret'? (Number(row.weight)>0?'Kropsvægt + '+esc(kgText(row.weight))+' kg':'Kropsvægt')+' × '+esc(row.reps||'–'):esc(kgText(row.weight)||'–')+' kg × '+esc(row.reps||'–');}
function previousControl(name,unit,index){
  const recent=getRecent(name);
  const summary=recent?'Sidst: '+recent.sets.filter(s=>s.done).map(s=>formatPreviousSet(s,unit)).join(' · '):'Ingen tidligere registrering';
  const edit=!hasLoggedHistory(name)?`<button class="link-button baseline-link" data-action="baseline" data-ex="${index}">${recent?'Ret sidste gang':'Angiv sidste gang'}</button>`:'';
  return `<span>${summary}</span>${edit}`;
}
function progressionSource(exercise){
  const key=exercise.name.toLowerCase();
  const eligible=state.logs.flatMap(log=>log.exercises.filter(e=>e.name.toLowerCase()===key&&e.target===exercise.target&&e.sets.some(s=>s.done)).map(e=>({dayId:log.dayId,exercise:e})));
  const previous=eligible.find(x=>x.dayId===state.session?.dayId)||eligible[0];
  if(previous)return previous.exercise;
  const baseline=state.baselines?.[key];
  return baseline?.length?{name:exercise.name,sets:baseline.map(s=>({...s,done:true}))}:null;
}
function progressionSuggestion(exercise){
  const previous=progressionSource(exercise);
  if(!previous)return null;
  const last=previous.sets.filter(s=>s.done);
  if(!last.length)return null;
  const range=String(exercise.target).match(/(\d+)\s*[–-]\s*(\d+)/);
  const upper=range?Number(range[2]):null;
  const bodyweight=exercise.unit==='kropsvægt';
  const allTargetsReached=!bodyweight&&upper!==null&&last.length>=exercise.sets.length&&
    last.slice(0,exercise.sets.length).every(s=>Number(s.reps)>=upper&&s.weight!==''&&Number.isFinite(Number(s.weight)));
  const proposedWeights=allTargetsReached?exercise.sets.map((_,i)=>Number(last[i].weight)+2.5):null;
  return {
    kind:allTargetsReached?'weight':'reps',
    heading:allTargetsReached?'Øg med 2,5 kg':bodyweight?'Prøv 1–2 ekstra reps':'Samme vægt · +1–2 reps',
    detail:allTargetsReached?`Du nåede toppen af ${esc(exercise.target)} i alle sæt. Vægten kan nu hæves, hvis teknikken er god.`:
      bodyweight?'Sigt efter lidt flere kontrollerede gentagelser.':
      'Arbejd op mod toppen af rep-intervallet, før du øger vægten.',
    proposedWeights
  };
}
function progressionCard(exercise,index){
  const plan=progressionSuggestion(exercise);
  if(!plan)return '';
  return `<div class="progression-card"><div><div class="progression-eyebrow">PROGRESSIVE OVERLOAD · NÆSTE MÅL</div><strong>${plan.heading}</strong><p>${plan.detail}</p></div>${plan.proposedWeights?`<button class="btn btn-secondary btn-tiny" data-action="apply-progress" data-ex="${index}">Brug ny vægt ${icon('arrow')}</button>`:''}</div>`;
}
function applyProgression(index){
  const exercise=state.session?.exercises?.[index];
  if(!exercise)return;
  const plan=progressionSuggestion(exercise);
  if(!plan?.proposedWeights)return;
  exercise.sets.forEach((row,i)=>{if(!row.done&&plan.proposedWeights[i]!==undefined){row.weight=String(plan.proposedWeights[i]);row.reps='';}});
  save();render();toast('Vægtmålet er sat — registrér dine faktiske reps efter hvert sæt');
}
function openBaseline(index){const exercise=state.session?.exercises?.[index];if(!exercise)return;baselineName=exercise.name;const key=baselineName.trim().toLowerCase();const saved=state.baselines?.[key]||[];baselineDraft=Array.from({length:exercise.sets.length},(_,i)=>({weight:saved[i]?.weight??exercise.sets[i]?.weight??'',reps:saved[i]?.reps??exercise.sets[i]?.reps??''}));modal='baseline';render();}
function saveBaseline(){if(!baselineName||!baselineDraft)return;state.baselines??={};state.baselines[baselineName.trim().toLowerCase()]=baselineDraft.map(s=>({weight:String(s.weight??''),reps:String(s.reps??'')}));const active=state.session?.exercises.find(e=>e.name===baselineName);if(active){active.sets.forEach((row,i)=>{if(!row.done){row.weight=baselineDraft[i]?.weight??row.weight;row.reps=baselineDraft[i]?.reps??row.reps;}});}baselineDraft=null;baselineName=null;modal=null;save();render();toast('Sidste gang er gemt og udfyldt');}
function baselineModalHTML(){
  const current=state.session?.exercises.find(e=>e.name===baselineName);
  const unit=current?.unit==='kropsvægt'?'+ kg':current?.unit==='ekstravægt'||current?.unit==='assisteret'?'ekstra kg':'kg';
  return `<div class="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><div class="eyebrow">DIN TIDLIGERE TRÆNING</div><div class="modal-title" id="modal-title">Sidste gang</div><p class="description">${esc(baselineName)} · Udfyld dine sidste løft én gang. Så står de klar ved næste workout.</p></div><button class="icon-only" data-action="close-modal" aria-label="Luk">${icon('x')}</button></div><div class="baseline-labels"><span>Sæt</span><span>Vægt (${unit})</span><span>Reps</span></div>${baselineDraft.map((row,i)=>`<div class="baseline-row"><strong>${i+1}</strong><input class="field" type="text" inputmode="decimal" autocomplete="off" aria-label="Sidste gang sæt ${i+1} vægt" data-baseline-index="${i}" data-prop="weight" value="${esc(row.weight)}" placeholder="kg"><input class="field" type="number" inputmode="numeric" min="0" step="1" aria-label="Sidste gang sæt ${i+1} reps" data-baseline-index="${i}" data-prop="reps" value="${esc(row.reps)}" placeholder="reps"></div>`).join('')}<div class="note-card" style="margin-top:18px">Tallene er kun en startregistrering. Fremover opdaterer FitNotes automatisk “Sidst” fra dine gemte workouts.</div><div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Annuller</button><button class="btn btn-primary" data-action="save-baseline">${icon('check')} Gem sidste gang</button></div></div></div>`;
}
function allPRs(){const prs=new Map();for(const log of state.logs){for(const ex of log.exercises){for(const s of ex.sets){if(!s.done)continue;const weight=Number(s.weight)||0;if(weight>0&&(!prs.has(ex.name)||weight>prs.get(ex.name)))prs.set(ex.name,weight);}}}return [...prs].sort((a,b)=>a[0].localeCompare(b[0])).slice(0,4);}
function navButton(view,label,glyph){const active=tab===view||(view==='home'&&tab==='session');return `<button class="nav-btn ${active?'active':''}" data-action="view" data-view="${view}">${icon(glyph)}<span>${label}</span></button>`;}
function frame(content,animate=false){return `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-logo">${icon('lift')}</div><div><div class="brand-name">fitnotes<span style="color:#87aeff">.</span></div><div class="brand-subtitle">BY MASKIDD</div></div></div><nav class="nav" aria-label="Hovedmenu">${navButton('home','Overblik','home')}${navButton('program','Mit program','grid')}${navButton('progress','Udvikling','trend')}${navButton('history','Historik','history')}${navButton('settings','Indstillinger','settings')}</nav><div class="sidebar-bottom"><div class="small">TRAIN. TRACK. GROW.</div><div class="note">Et sæt ad gangen.</div></div></aside><main class="main"><div class="content"><div class="topline"><div class="mobile-brand"><div class="brand-logo">${icon('lift')}</div><div class="brand-name">fitnotes<span style="color:#87aeff">.</span></div></div><div class="top-date">${icon('calendar')} ${fullDate()}</div>${accountButton()}</div><div class="page-view ${animate?'page-enter':''}">${content}</div></div></main></div><nav class="mobile-nav" aria-label="Mobilmenu"><button class="${tab==='home'||tab==='session'?'active':''}" data-action="view" data-view="home">${icon('home')}Overblik</button><button class="${tab==='program'?'active':''}" data-action="view" data-view="program">${icon('grid')}Program</button><button class="${tab==='progress'?'active':''}" data-action="view" data-view="progress">${icon('trend')}Udvikling</button><button class="${tab==='history'?'active':''}" data-action="view" data-view="history">${icon('history')}Historik</button><button class="${tab==='settings'?'active':''}" data-action="view" data-view="settings">${icon('settings')}Indstillinger</button></nav>${modalHTML()}`;}
// Top-right account button: avatar or person icon, with a dot for the save status.
function accountButton(){const b=window.FitSync?.badge()||{label:'Konto',state:'off'};return `<button class="account-btn ${tab==='account'?'active':''}" data-action="account" aria-label="${esc(b.label)}" title="${esc(b.label)}">${b.avatar?`<img src="${esc(b.avatar)}" alt="">`:icon('user')}${b.state!=='off'?`<span class="account-dot ${b.state}"></span>`:''}</button>`;}
function weekStrip(){const monday=weekStart();return `<div class="week-grid">${Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const today=d.toDateString()===new Date().toDateString();const program=dayFromDate(d);const completed=state.logs.some(l=>new Date(l.finishedAt).toDateString()===d.toDateString());return `<div class="day-chip ${program?'scheduled':''} ${today?'today':''} ${completed?'completed':''}" title="${program?esc(program.name):'Hviledag'}"><strong>${SHORT_DAYS[d.getDay()]}</strong><span>${d.getDate()}</span><span class="week-status"></span></div>`;}).join('')}</div>`;}
function home(){const chosen=nextDay();const logs=weekLogs();const last=state.logs[0];let exCount=chosen.exercises.length;return `<header class="page-hero"><div><div class="eyebrow">DIT PERSONLIGE TRÆNINGSRUM</div><h1>Din træning. Dit tempo.</h1><p class="lead">Hold fokus på løftene. Vi holder styr på resten.</p></div></header>${state.session?`<section class="session-banner"><div><div class="eyebrow" style="margin:0 0 8px">IGANGVÆRENDE SESSION</div><div class="session-headline">${esc(state.session.title)}</div><p class="session-sub">Fortsæt hvor du slap.</p></div><button class="btn btn-primary" data-action="continue">Fortsæt ${icon('arrow')}</button></section>`:`<section class="hero-workout"><div class="hero-top"><span class="pill blue"><span class="dot"></span>${chosen.offset===0?'PLANLAGT I DAG':chosen.offset===1?'I MORGEN':'NÆSTE TRÆNING'}</span><span class="pill">${WEEKDAYS[chosen.weekday]}</span></div><div class="hero-title">${esc(chosen.name)}</div><p class="hero-desc">${esc(chosen.focus)} · ${esc(chosen.range)} reps som udgangspunkt. Hele din træning samlet ét sted.</p><div class="hero-bottom"><div class="hero-facts"><span class="fact">${icon('lift')}${exCount} ${exCount===1?'øvelse':'øvelser'}</span><span class="fact">${icon('timer')}${restLabel(restSeconds())} pause</span></div><button class="btn btn-primary" data-action="start" data-day="${chosen.id}">${icon('play')} Start workout</button></div></section>`}<div class="grid-stats"><div class="stat-card"><div class="stat-label">${icon('calendar')} Denne uge</div><div class="big-number">${logs.length}<span style="font-size:14px;color:#8199ba"> / 4</span></div><div class="stat-bottom">Workouts logget</div></div><div class="stat-card"><div class="stat-label">${icon('check')} Total</div><div class="big-number">${state.logs.length}</div><div class="stat-bottom">Gennemførte</div></div><div class="stat-card"><div class="stat-label">${icon('trend')} Sidste gang</div><div class="big-number" style="font-size:clamp(18px,2.8vw,29px)">${last?shortDate(last.finishedAt):'—'}</div><div class="stat-bottom">Seneste workout</div></div></div>${window.FitProgress.teaser(state)}<div class="section-title"><h2>Din træningsuge</h2><small>4 træningsdage</small></div>${weekStrip()}<div class="two-col"><div><div class="section-title"><h2>Seneste træninger</h2><button data-action="view" data-view="history">Se alle ${icon('arrow','style="width:13px;height:13px;vertical-align:middle"')}</button></div><div class="panel">${state.logs.length?state.logs.slice(0,3).map(log=>`<div class="mini-activity"><div class="activity-icon">${icon('check')}</div><div><div class="activity-name">${esc(log.title)}</div><div class="activity-date">${fullDate(log.finishedAt)}</div></div><div class="activity-right">${finishedSets(log)} sæt</div></div>`).join(''):`<div class="empty-state">${icon('history')}<span>Din historik starter, når du gemmer dit første workout.</span></div>`}</div></div><div><div class="section-title"><h2>Personlige rekorder</h2><small>Højeste vægt</small></div><div class="panel">${allPRs().length?allPRs().map(([name,weight])=>`<div class="progress-item"><div><div class="progress-item-title">${esc(name)}</div><div class="progress-item-sub">Bedste registrerede vægt</div></div><div class="progress-item-value">${weight.toLocaleString('da-DK')} kg</div></div>`).join(''):`<div class="empty-state">${icon('trend')}<span>Dine rekorder vises her, når du begynder at logge vægte.</span></div>`}</div></div></div>`;}
function program(){return `<header class="page-hero"><div><div class="eyebrow">STRUKTUR & PROGRESSION</div><h1>Mit program</h1><p class="lead">Fire dage. Samme overblik. Tilpas altid øvelserne efter din plan.</p></div></header><div class="note-card" style="margin-bottom:21px">${icon('info','style="height:16px;width:16px;vertical-align:middle;margin-right:7px"')}Tilpas øvelser, antal sæt og reps for hver dag via <strong>Rediger</strong>.</div><section class="program-list">${state.program.map((d,i)=>`<article class="program-card"><div class="program-card-head"><div><div class="mini-num">WORKOUT 0${i+1} · ${WEEKDAYS[d.weekday].toUpperCase()}</div><h3>${esc(d.name)}</h3><p class="sub">${esc(d.focus)} · ${esc(d.range)} reps</p></div><span class="pill">${d.exercises.length} ${d.exercises.length===1?'øvelse':'øvelser'}</span></div><div class="program-exercises">${d.exercises.length?d.exercises.map(e=>`<div class="program-ex"><span>${esc(e.name)}</span><span class="count">${e.sets} × ${esc(e.target)}</span></div>`).join(''):'<span class="muted" style="font-size:12px">Ingen øvelser endnu.</span>'}</div><div class="program-actions"><button class="btn btn-primary" data-action="start" data-day="${d.id}">${icon('play')} Start</button><button class="btn btn-secondary" data-action="edit" data-day="${d.id}">${icon('edit')} Rediger</button></div></article>`).join('')}</section>`;}
function history(){return `<header class="page-hero"><div><div class="eyebrow">SE HVOR LANGT DU ER KOMMET</div><h1>Træningshistorik</h1><p class="lead">Alle dine workouts og løft samlet i én tidslinje.</p></div></header><div class="history-list">${state.logs.length?state.logs.map(log=>`<article class="history-card"><button class="history-main" data-action="toggle-history" data-log="${log.id}" aria-expanded="${historyOpen===log.id}"><div class="history-icon">${icon('check')}</div><div><div class="history-label">${esc(log.title)}</div><div class="history-meta">${fullDate(log.finishedAt)} · ${finishedSets(log)} sæt · ${Math.max(1,Math.round((new Date(log.finishedAt)-new Date(log.startedAt))/60000))} min</div></div><div class="history-arrow">${icon('arrow','style="width:18px;height:18px;transform:rotate('+ (historyOpen===log.id?'90':'0')+'deg)"')}</div></button>${historyOpen===log.id?`<div class="history-detail">${log.exercises.filter(e=>e.sets.some(s=>s.done)).map(e=>`<div class="history-ex"><strong>${esc(e.name)}</strong><span>${e.sets.filter(s=>s.done).map(s=>`${formatPreviousSet(s,e.unit)}`).join(' · ')}</span></div>`).join('')}<div class="history-footer"><button class="btn btn-secondary btn-tiny" data-action="edit-history" data-log="${log.id}">${icon('edit')} Ret workout</button><button class="btn btn-danger btn-tiny" data-action="delete-history" data-log="${log.id}">${icon('trash')} Slet workout</button></div></div>`:''}</article>`).join(''):`<div class="panel"><div class="empty-state" style="padding:60px 20px">${icon('history')}<strong style="color:#e6edfb">Ingen workouts endnu</strong><span>Start din første træning, og se den her bagefter.</span><button class="btn btn-primary" data-action="view" data-view="program">Se mit program</button></div></div>`}</div>`;}
function sessionPage(){const s=state.session;if(!s){tab='home';return home();}let count=s.exercises.reduce((n,e)=>n+e.sets.filter(x=>x.done).length,0),all=s.exercises.reduce((n,e)=>n+e.sets.length,0);return `<div class="session-head"><div><div class="eyebrow">DIN AKTIVE TRÆNING</div><h1>${esc(s.title)}</h1></div><span class="pill green"><span class="dot"></span>LIVE</span></div><div class="session-banner"><div><div class="session-headline">Ét sæt ad gangen.</div><p class="session-sub">Udfyld belastning og reps. Ved pull-ups indtaster du kun den ekstra vægt på kroppen (0 = kun kropsvægt). Sættet markeres automatisk, når du forlader feltet. Workoutet gemmes efter sidste sæt.</p></div><div class="session-count">${count} / ${all} sæt</div></div>${s.exercises.map((e,index)=>{const recent=getRecent(e.name);return `<section class="exercise-card"><div class="exercise-card-header"><div class="exercise-number">${String(index+1).padStart(2,'0')}</div><div class="exercise-details"><h3>${esc(e.name)}</h3><div class="exercise-caption">${esc(e.target)} reps · ${e.unit==='kropsvægt'?'Kropsvægt':e.unit==='ekstravægt'||e.unit==='assisteret'?'Kropsvægt + ekstra vægt':'Vægt i kg'}${e.hint?' · '+esc(e.hint):''}</div></div>${e.sets.every(x=>x.done)?`<span class="exercise-complete">${icon('check','style="width:21px;height:21px"')}</span>`:''}</div><div class="exercise-table"><div class="exercise-labels"><span>Sæt</span><span>Vægt ${e.unit==='kropsvægt'?'(+ kg)':e.unit==='ekstravægt'||e.unit==='assisteret'?'(ekstra kg)':'(kg)'}</span><span>Reps</span><span>Færdig</span></div>${e.sets.map((r,j)=>`<div class="set-row ${r.done?'done':''}"><span class="set-index">${j+1}</span><input class="set-field" inputmode="decimal" type="text" autocomplete="off" value="${esc(r.weight)}" placeholder="—" data-action="set-input" data-ex="${index}" data-set="${j}" data-field="weight" aria-label="${esc(e.name)} sæt ${j+1} vægt"><input class="set-field" inputmode="numeric" type="number" min="0" step="1" value="${esc(r.reps)}" placeholder="—" data-action="set-input" data-ex="${index}" data-set="${j}" data-field="reps" aria-label="${esc(e.name)} sæt ${j+1} reps"><button class="set-check" data-action="check-set" data-ex="${index}" data-set="${j}" aria-label="${r.done?'Fjern markering':'Markér sæt færdigt'}">${icon('check')}</button></div>`).join('')}</div><div class="exercise-bottom"><span class="previous">${previousControl(e.name,e.unit,index)}</span><button class="link-button" data-action="add-set" data-ex="${index}">+ Tilføj sæt</button></div>${progressionCard(e,index)}</section>`;}).join('')}${!s.exercises.length?`<div class="panel"><div class="empty-state">Ingen øvelser endnu. Afslut og tilføj dem under Program.</div></div>`:''}<div class="session-actions"><button class="btn btn-ghost" data-action="discard">Afslut uden at gemme</button><button class="btn btn-primary" data-action="finish">${icon('check')} Gem workout</button></div>${restHTML()}`;}
// Rest timer: default length from Settings, adjustable while it runs, and an
// alert (sound, plus vibration where the phone allows it) when it ends.
// Any rest from 15 seconds to 10 minutes; typed in Settings as minutes + seconds.
const REST_MIN=15,REST_MAX=600;
function restSeconds(){const value=Math.round(Number(state.settings?.restSeconds));return value>=REST_MIN&&value<=REST_MAX?value:180;}
function restLabel(seconds){const m=Math.floor(seconds/60),r=seconds%60;return m&&r?`${m} min ${r} sek`:m?`${m} min`:`${r} sek`;}
function saveRestFields(){
  const minutes=Number(document.getElementById('rest-min')?.value)||0,seconds=Number(document.getElementById('rest-sec')?.value)||0;
  const total=Math.round(minutes*60+seconds);
  if(total<REST_MIN||total>REST_MAX){toast('Pausen skal være mellem 15 sekunder og 10 minutter');render();return;}
  state.settings={...state.settings,restSeconds:total};save();render();toast(`Standardpause: ${restLabel(total)}`);
}
function startRest(){state.rest={end:Date.now()+restSeconds()*1000,remaining:restSeconds(),paused:false};}
function adjustRest(delta){
  if(!state.rest)return;
  if(state.rest.paused)state.rest.remaining=Math.max(0,state.rest.remaining+delta);
  else state.rest.end=Math.max(Date.now(),state.rest.end+delta*1000);
  save();render();
}
let audio=null;
// Browsers only allow sound after a tap, so this runs when a set is completed.
function primeAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}catch(e){}}
function restAlert(){
  if(state.settings?.restAlert===false)return;
  try{navigator.vibrate?.([220,120,220]);}catch(e){}
  try{
    if(!audio)return;
    [0,.28,.56].forEach(offset=>{
      const tone=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+offset;
      tone.frequency.value=offset<.5?880:1175;tone.connect(gain);gain.connect(audio.destination);
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.25,at+.02);gain.gain.exponentialRampToValueAtTime(.0001,at+.22);
      tone.start(at);tone.stop(at+.24);
    });
  }catch(e){}
}
function restHTML(){if(!state.rest)return '';const seconds=restRemaining();const min=Math.floor(seconds/60),sec=String(seconds%60).padStart(2,'0');return `<div class="restbar"><div><div class="rest-title">${state.rest.paused?'PAUSE SAT PÅ PAUSE':'PAUSETIMER'}</div><div class="rest-time" id="rest-time">${min}:${sec}</div></div><div class="restbar-actions"><button class="rest-adjust" data-action="rest-minus" aria-label="15 sekunder kortere">−15 s</button><button class="rest-adjust" data-action="rest-plus" aria-label="15 sekunder længere">+15 s</button><button data-action="rest-toggle">${state.rest.paused?'Fortsæt':'Pause'}</button><button data-action="rest-stop">Luk</button></div></div>`;}
function restRemaining(){if(!state.rest)return 0;return state.rest.paused?state.rest.remaining:Math.max(0,Math.ceil((state.rest.end-Date.now())/1000));}
// The account page the top-right button opens: who you are, your details,
// and the login actions that sync.js offers for this host.
function accountPage(){return `<header class="page-hero"><div><div class="eyebrow">DIN KONTO</div><h1>Min konto</h1><p class="lead">Dine oplysninger, og hvor dine træninger gemmes.</p></div></header><section class="settings-page">
    ${window.FitSync?.accountPageHTML()||`<div class="manage-row account-row"><p>Login er ikke sat op på denne side endnu. Dine træninger gemmes på denne enhed.</p></div>`}
    <div class="manage-row"><strong>Mine oplysninger</strong><p>Bruges som reference til din styrkerang i Udvikling.</p>
      <div class="profile-edit-fields"><label>Højde (cm)<input class="field" id="profile-height" type="number" min="130" max="230" value="${esc(state.profile?.heightCm??184)}"></label><label>Vægt (kg)<input class="field" id="profile-weight" type="number" min="35" max="250" step="0.1" value="${esc(state.profile?.bodyWeightKg??82)}"></label><label>Alder (år)<input class="field" id="profile-age" type="number" min="15" max="90" step="1" value="${esc(state.profile?.age??19)}"></label></div>
      <button class="btn btn-secondary btn-tiny" data-action="save-profile">Gem profil</button>
    </div>
    <div class="manage-row settings-account-link"><div><strong>Indstillinger</strong><p>Program, standardøvelser og sikkerhedskopi.</p></div><button class="btn btn-secondary btn-tiny" data-action="view" data-view="settings">${icon('settings')} Åbn</button></div>
</section>`;}
function settingsPage(){return `<header class="page-hero"><div><div class="eyebrow">DIN TRÆNING, DINE DATA</div><h1>Indstillinger</h1><p class="lead">Pausetimer, bekræftelser, program og sikkerhedskopi samlet ét sted.</p></div></header><section class="settings-page">
    <div class="manage-row settings-account-link"><div><strong>Din konto og profil</strong><p>Login, dine oplysninger og hvor dine træninger gemmes.</p></div><button class="btn btn-secondary btn-tiny" data-action="account">${icon('user')} Min konto</button></div>
    <div class="manage-row"><strong>Dit program</strong><p>Du kan rette øvelser, antal sæt og gentagelser direkte under Program.</p></div>
    <div class="manage-row"><strong>Pausetimer</strong><p>Skriv hvor lang pausen skal være efter hvert sæt (mellem 15 sekunder og 10 minutter). Under træningen kan du justere med −15 s og +15 s.</p>
      <div class="rest-fields" role="group" aria-label="Standardpause"><label>Minutter<input class="field" id="rest-min" type="number" inputmode="numeric" min="0" max="10" step="1" value="${Math.floor(restSeconds()/60)}"></label><label>Sekunder<input class="field" id="rest-sec" type="number" inputmode="numeric" min="0" max="59" step="5" value="${restSeconds()%60}"></label></div>
      <button class="toggle-row" data-action="rest-alert" aria-pressed="${state.settings?.restAlert!==false}"><span class="toggle ${state.settings?.restAlert!==false?'on':''}" aria-hidden="true"></span>Lyd og vibration, når pausen er slut</button>
    </div>
    <div class="manage-row settings-account-link"><div><strong>Bekræftelser</strong><p>${Object.keys(state.settings?.skipConfirm||{}).length?`Du har slået ${Object.keys(state.settings.skipConfirm).length===1?'én bekræftelse':Object.keys(state.settings.skipConfirm).length+' bekræftelser'} fra med "Spørg ikke igen".`:'Appen spørger, før den sletter eller afslutter noget. Sæt flueben i "Spørg ikke igen", hvis du ikke vil se et spørgsmål.'}</p></div>${Object.keys(state.settings?.skipConfirm||{}).length?'<button class="btn btn-secondary btn-tiny" data-action="confirm-reset">Vis dem igen</button>':''}</div>
    <div class="manage-row"><strong>Standardprogram</strong>
      <p>Tilføj manglende øvelser fra standardprogrammet uden at slette dine nuværende træninger.</p>
      <button class="btn btn-secondary btn-tiny" data-action="restore-included">${icon('upload')} Gendan øvelser</button>
    </div>
    <div class="manage-row"><strong>Gem og flyt dine data</strong><p>Dine workouts gemmes lokalt i denne browser. Eksportér en sikkerhedskopi, hvis du vil bevare dem eller flytte dem til en anden enhed.</p>
      <div class="settings-buttons"><button class="btn btn-secondary btn-tiny" data-action="export">${icon('download')} Eksportér data</button><button class="btn btn-secondary btn-tiny" data-action="import">${icon('upload')} Importér data</button><input id="import-input" class="hide" type="file" accept="application/json,.json" aria-label="Vælg sikkerhedskopi"></div>
    </div>
    <div class="note-card">${icon('info','style="width:16px;height:16px;vertical-align:middle;margin-right:7px"')}${window.FitSync?.isActive()?'Dine træninger gemmes både på denne enhed og på din konto.':'Uden login gemmes dine træninger kun på denne enhed. Undgå privat browsing, hvis du vil beholde dine registreringer.'}</div>
</section>`;}
function weightLabel(unit){return unit==='kropsvægt'?'+ kg':unit==='ekstravægt'||unit==='assisteret'?'Ekstra kg':'Kg';}
// Saves corrections to a finished workout; reps must be whole numbers above 0.
function saveLogEdit(){
  if(!logDraft)return;
  let invalid=false,count=0;
  for(const e of logDraft.exercises)for(const r of e.sets){
    if(!r.done)continue;count++;
    const reps=Number(r.reps),weight=String(r.weight??'').trim();
    if(!Number.isInteger(reps)||reps<1)invalid=true;
    if(e.unit==='kg'&&(weight===''||!Number.isFinite(Number(weight))))invalid=true;
    if(e.unit!=='kg'&&weight==='')r.weight='0';
  }
  if(!count){toast('Workouten har ingen sæt tilbage. Slet den i stedet.');return;}
  if(invalid){toast('Udfyld vægt og reps i alle sæt');return;}
  const index=state.logs.findIndex(x=>x.id===logDraft.id);
  if(index>=0)state.logs[index]=logDraft;
  logDraft=null;modal=null;save();render();toast('Workout rettet');
}
function modalHTML(){
if(!modal)return '';
if(modal==='baseline'&&baselineDraft)return baselineModalHTML();
if(modal==='confirm'&&confirmDraft){const c=confirmDraft;return `<div class="modal-backdrop" data-action="backdrop"><div class="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="confirm-text"><div class="modal-title" id="modal-title">${esc(c.title)}</div><p class="description" id="confirm-text">${esc(c.text)}</p><label class="confirm-skip"><input type="checkbox" id="confirm-skip"> Spørg ikke igen</label><div class="modal-actions"><button class="btn btn-ghost" data-action="confirm-no">Annuller</button><button class="btn ${c.danger?'btn-danger':'btn-primary'}" data-action="confirm-yes">${esc(c.yes)}</button></div></div></div>`;}
if(modal==='log-edit'&&logDraft){return `<div class="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><div class="eyebrow">RET GEMT WORKOUT</div><div class="modal-title" id="modal-title">${esc(logDraft.title)}</div><p class="description">${fullDate(logDraft.finishedAt)} · Ret vægt og reps, eller fjern et sæt.</p></div><button class="icon-only" data-action="close-modal" aria-label="Luk">${icon('x')}</button></div>${logDraft.exercises.map((e,i)=>{let n=0;const rows=e.sets.map((r,j)=>r.done?`<div class="log-edit-row"><strong>${++n}</strong><input class="field" type="text" inputmode="decimal" autocomplete="off" data-logedit-ex="${i}" data-logedit-set="${j}" data-prop="weight" value="${esc(r.weight)}" placeholder="${e.unit==='kg'?'kg':'0'}" aria-label="${esc(e.name)} sæt ${n} vægt"><input class="field" type="number" inputmode="numeric" min="1" step="1" data-logedit-ex="${i}" data-logedit-set="${j}" data-prop="reps" value="${esc(r.reps)}" aria-label="${esc(e.name)} sæt ${n} reps"><button class="icon-only" data-action="remove-log-set" data-ex="${i}" data-set="${j}" aria-label="Fjern ${esc(e.name)} sæt ${n}">${icon('x')}</button></div>`:'').join('');return n?`<div class="log-edit-ex"><strong>${esc(e.name)}</strong><div class="log-edit-row log-edit-labels"><span>Sæt</span><span>${weightLabel(e.unit)}</span><span>Reps</span><span></span></div>${rows}</div>`:'';}).join('')}<div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Annuller</button><button class="btn btn-primary" data-action="save-log-edit">${icon('check')} Gem ændringer</button></div></div></div>`;}
if(modal==='edit'&&draft){return `<div class="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><div class="eyebrow">TILPAS PROGRAM</div><div class="modal-title" id="modal-title">Rediger workout</div><p class="description">Gem dit faste program, så det er klar næste gang.</p></div><button class="icon-only" data-action="close-modal" aria-label="Luk">${icon('x')}</button></div><div class="form-group"><label class="form-label" for="edit-name">Navn på workout</label><input id="edit-name" class="field" data-draft-field="name" maxlength="70" value="${esc(draft.name)}"></div><div class="form-group"><label class="form-label" for="edit-focus">Fokus</label><input id="edit-focus" class="field" data-draft-field="focus" maxlength="70" value="${esc(draft.focus)}"></div><div class="form-group"><label class="form-label" for="edit-weekday">Ugedag</label><select id="edit-weekday" class="field" data-draft-field="weekday">${[1,2,3,4,5,6,0].map(d=>`<option value="${d}" ${Number(draft.weekday)===d?'selected':''}>${WEEKDAYS[d]}${state.program.some(p=>p.id!==draft.id&&p.weekday===d)?' (byt med '+esc(state.program.find(p=>p.id!==draft.id&&p.weekday===d).name)+')':''}</option>`).join('')}</select></div><div class="form-label">Øvelser <span class="muted" style="font-weight:400">· navn / sæt / reps</span></div><div id="edit-exercises">${draft.exercises.map((e,i)=>`<div class="edit-ex"><div class="edit-ex-row"><input class="field" data-draft-ex="${i}" data-prop="name" value="${esc(e.name)}" placeholder="Øvelse" aria-label="Øvelse ${i+1} navn" maxlength="90"><input class="field" data-draft-ex="${i}" data-prop="sets" type="number" inputmode="numeric" min="1" max="10" value="${e.sets}" aria-label="Øvelse ${i+1} sæt"><input class="field" data-draft-ex="${i}" data-prop="target" value="${esc(e.target)}" aria-label="Øvelse ${i+1} reps" maxlength="20"><button class="icon-only" data-action="remove-ex" data-index="${i}" aria-label="Fjern øvelse">${icon('x')}</button></div><div class="edit-ex-meta"><select class="field" data-draft-ex="${i}" data-prop="unit" aria-label="Øvelse ${i+1} type">${[['kg','Vægt (kg)'],['kropsvægt','Kropsvægt'],['ekstravægt','Kropsvægt + ekstra vægt']].map(([value,label])=>`<option value="${value}" ${(e.unit==='assisteret'?'ekstravægt':e.unit||'kg')===value?'selected':''}>${label}</option>`).join('')}</select>${e.hint?`<span class="hint">${esc(e.hint)}</span>`:''}</div></div>`).join('')}</div><button class="btn btn-secondary btn-tiny" data-action="new-ex">${icon('plus')} Tilføj øvelse</button><div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Annuller</button><button class="btn btn-primary" data-action="save-edit">${icon('check')} Gem ændringer</button></div></div></div>`;}return '';}
function sessionBackNavigation(){
  const label=sessionReturnTab==='program'?'Mit program':'Overblik';
  return `<div class="session-back-row"><button type="button" class="session-back-button" data-action="back-session" aria-label="Tilbage til ${label}">${icon('arrow')}<span>Tilbage til ${label}</span></button><span class="session-back-note">Din træning bliver gemt, mens du er væk</span></div>`;
}
function programResumeNavigation(){
  if(!state.session)return '';
  return `<section class="program-resume"><div><span class="program-resume-label"><span class="dot"></span> IGANGVÆRENDE WORKOUT</span><strong>${esc(state.session.title)}</strong><small>Du kan fortsætte, hvor du slap.</small></div><button class="btn btn-primary" data-action="continue">Fortsæt ${icon('arrow')}</button></section>`;
}
function render(){
  window.__fitBodyCleanup?.();
  const root=document.getElementById('app');
  const focused=document.activeElement?.dataset?.action==='set-input'?document.activeElement:null;
  const refocus=focused?{ex:focused.dataset.ex,set:focused.dataset.set,field:focused.dataset.field}:null;
  const body=tab==='program'?program():tab==='history'?history():tab==='session'?sessionPage():tab==='progress'?window.FitProgress.page(state):tab==='settings'?settingsPage():tab==='account'?accountPage():home();
  const content=tab==='session'?sessionBackNavigation()+body:tab==='program'?programResumeNavigation()+body:body;
  root.innerHTML=frame(content,lastRenderedTab!==null&&tab!==lastRenderedTab);
  document.body.classList.toggle('modal-open',Boolean(modal));
  if(modal&&modal!==lastRenderedModal){
    const dialog=root.querySelector('.modal');
    dialog?.setAttribute('tabindex','-1');
    (dialog?.querySelector('input:not([type="file"]):not([type="checkbox"])')||dialog)?.focus({preventScroll:true});
  }
  lastRenderedTab=tab;lastRenderedModal=modal;
  if(refocus&&!modal&&tab==='session'){const el=root.querySelector(`[data-action="set-input"][data-ex="${refocus.ex}"][data-set="${refocus.set}"][data-field="${refocus.field}"]`);if(el){el.focus({preventScroll:true});const end=el.value.length;try{el.setSelectionRange(end,end);}catch{}}}
  if(tab==='progress'){window.FitProgress.bindChart();window.FitProgress.paintHologram();const rank=window.FitProgress.info(state);window.__holo?.destroy();window.__holo=null;const holo=document.getElementById('holo-3d');if(holo&&window.initHolo3D)window.initHolo3D(holo,window.FitProgress.holoPalette(rank)).then(h=>{if(holo.isConnected)window.__holo=h;else h.destroy();}).catch(()=>{holo.closest('.body-stage')?.classList.add('holo-failed');});}else{window.__holo?.destroy();window.__holo=null;}
}
// Used by sync.js: replace local data with a synced copy without pushing it back.
function replaceState(data){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}catch(e){}
  state=loadState();
  if(data?.updatedAt)state.updatedAt=data.updatedAt;
  render();
}
window.FitApp={getState:()=>state,replaceState,toast,resetLocal:()=>{try{localStorage.removeItem(STORAGE_KEY);}catch(e){}state=initialData();tab='account';render();},refreshAccount:()=>{if(tab==='account'){render();return;}const button=document.querySelector('.account-btn');if(button)button.outerHTML=accountButton();}};
// In-app confirmation: the Claude viewer never shows browser dialogs. Ticking
// "Spørg ikke igen" remembers a yes for that kind of question.
function askConfirm({key,title,text,yes,danger=true}){
  if(state.settings?.skipConfirm?.[key])return Promise.resolve(true);
  return new Promise(resolve=>{confirmDraft={key,title,text,yes,danger,resolve};modal='confirm';render();});
}
function answerConfirm(yes){
  const pending=confirmDraft;if(!pending)return;
  const skip=yes&&document.getElementById('confirm-skip')?.checked;
  confirmDraft=null;modal=null;
  if(skip){state.settings={...state.settings,skipConfirm:{...state.settings?.skipConfirm,[pending.key]:true}};save();}
  render();pending.resolve(yes);
}
function closeModal(){
  if(confirmDraft){answerConfirm(false);return;}
  modal=null;draft=null;logDraft=null;baselineDraft=null;baselineName=null;
  render();
  if(modalOpener){
    const {action,day,ex}=modalOpener;
    const selector=`[data-action="${action}"]${day?`[data-day="${day}"]`:''}${ex!==undefined?`[data-ex="${ex}"]`:''}`;
    document.querySelector(selector)?.focus({preventScroll:true});
    modalOpener=null;
  }
}
async function startSession(dayId){const day=state.program.find(x=>x.id===dayId);if(!day)return;if(state.session&&!(await askConfirm({key:'replace-session',title:'Erstat igangværende træning?',text:'Du har allerede en træning i gang. Starter du en ny, forsvinder den igangværende.',yes:'Start ny træning'})))return;state.session={id:uid(),dayId:day.id,title:day.name,startedAt:new Date().toISOString(),exercises:day.exercises.map(e=>{const recent=getRecent(e.name);return {...structuredClone(e),sets:Array.from({length:e.sets},(_,i)=>({weight:recent?.sets[i]?.weight??'',reps:'',done:false}))};})};state.rest=null;tab='session';save();render();window.scrollTo(0,0);}
function saveProfile(){
  const heightCm=Number(document.getElementById('profile-height')?.value);
  const bodyWeightKg=Number(document.getElementById('profile-weight')?.value);
  const age=Number(document.getElementById('profile-age')?.value);
  if(!Number.isFinite(heightCm)||heightCm<130||heightCm>230||!Number.isFinite(bodyWeightKg)||bodyWeightKg<35||bodyWeightKg>250||!Number.isInteger(age)||age<15||age>90){
    toast('Indtast en gyldig højde, vægt og alder');return;
  }
  state.profile={heightCm,bodyWeightKg,age};save();modal=null;render();toast('Profil opdateret');
}
function setIsValid(exercise,row){
  const reps=Number(row.reps);
  const validReps=String(row.reps??'').trim()!==''&&Number.isInteger(reps)&&reps>0;
  const validWeight=exercise.unit==='kropsvægt'||(exercise.unit==='ekstravægt'&&String(row.weight??'').trim()==='')||(String(row.weight??'').trim()!==''&&Number.isFinite(Number(row.weight))&&Number(row.weight)>=0);
  return validReps&&validWeight;
}
function completeSet(exIndex,setIndex,automatic=false){
  const exercise=state.session?.exercises?.[exIndex];
  const row=exercise?.sets?.[setIndex];
  if(!row||row.done)return;
  if(!setIsValid(exercise,row)){if(!automatic)toast(exercise.unit==='kropsvægt'?'Indtast antal reps først':'Indtast både vægt og reps først');return;}
  if(exercise.unit==='ekstravægt'&&String(row.weight??'').trim()==='')row.weight='0';
  row.done=true;
  const allSets=state.session.exercises.flatMap(e=>e.sets);
  if(allSets.length&&allSets.every(s=>s.done)){save();finishSession();return;}
  primeAudio();startRest();
  save();render();
  if(automatic)toast('Sæt markeret automatisk');
}
function toggleSet(exIndex,setIndex){
  const row=state.session?.exercises?.[exIndex]?.sets?.[setIndex];
  if(!row)return;
  if(row.done){row.done=false;save();render();return;}
  completeSet(exIndex,setIndex);
}
async function finishSession(){const s=state.session;if(!s)return;const done=s.exercises.reduce((n,e)=>n+e.sets.filter(x=>x.done).length,0);if(!done){toast('Markér mindst ét sæt som færdigt');return;}const total=s.exercises.reduce((n,e)=>n+e.sets.length,0);if(done<total&&!(await askConfirm({key:'finish-partial',title:'Gem workout?',text:`Du har markeret ${done} ud af ${total} sæt. De umarkerede sæt bliver ikke gemt.`,yes:'Gem workout',danger:false})))return;state.logs.unshift({...s,finishedAt:new Date().toISOString()});state.session=null;state.rest=null;tab='history';historyOpen=state.logs[0].id;save();render();toast('Workout gemt. Godt arbejde!');window.scrollTo(0,0);}
function openEdit(dayId){const day=state.program.find(x=>x.id===dayId);if(!day)return;draft=structuredClone(day);modal='edit';render();}
function saveEdit(){if(!draft)return;draft.name=draft.name.trim()||'Mit workout';draft.focus=draft.focus.trim()||'Træning';draft.exercises=draft.exercises.filter(x=>x.name.trim()).map(x=>({...x,name:x.name.trim(),sets:Math.max(1,Math.min(10,Number(x.sets)||2)),target:String(x.target||'8–12').trim()}));const index=state.program.findIndex(x=>x.id===draft.id);if(index<0)return;
  // Two days never share a weekday: the day that had it swaps to the old one.
  draft.weekday=Number(draft.weekday);const previous=state.program[index].weekday;
  const clash=state.program.find(x=>x.id!==draft.id&&x.weekday===draft.weekday);if(clash)clash.weekday=previous;
  state.program[index]=draft;draft=null;modal=null;save();render();toast(clash?`Program opdateret. ${clash.name} er flyttet til ${WEEKDAYS[previous].toLowerCase()}.`:'Program opdateret');}
// On a Claude artifact link the page may not start downloads itself; the
// viewer's own save dialog handles it there.
async function exportData(){const json=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),filename=`fitnotes-backup-${new Date().toISOString().slice(0,10)}.json`;const downloads=typeof window.claude?.use==='function'?await window.claude.use('downloads'):null;if(downloads){try{const result=await downloads.save({filename,data:json});if(result?.status==='saved')toast('Sikkerhedskopi gemt');}catch(e){if(e?.code!=='declined')toast('Sikkerhedskopien kunne ikke gemmes');}return;}const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`fitnotes-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Sikkerhedskopi hentet');}
function mergeBackup(parsed){
  if(!parsed||!Array.isArray(parsed.program)||parsed.program.length!==4||!Array.isArray(parsed.logs)||
    parsed.program.some(d=>!Array.isArray(d.exercises)||typeof d.name!=='string'||
      d.exercises.some(e=>typeof e.name!=='string'||!Number.isInteger(Number(e.sets))||Number(e.sets)<1))||
    parsed.logs.some(log=>!log||typeof log.id!=='string'||!Array.isArray(log.exercises)||
      log.exercises.some(e=>!Array.isArray(e.sets))))throw Error('Ugyldig fil');
  const merged=structuredClone(state);
  let addedExercises=0,addedWorkouts=0;
  for(const incomingDay of parsed.program){
    const existingDay=merged.program.find(d=>d.id===incomingDay.id);
    if(!existingDay){merged.program.push(structuredClone(incomingDay));addedExercises+=incomingDay.exercises.length;continue;}
    for(const incomingEx of incomingDay.exercises){
      if(existingDay.exercises.some(e=>e.name.trim().toLowerCase()===incomingEx.name.trim().toLowerCase()))continue;
      existingDay.exercises.push(structuredClone(incomingEx));
      addedExercises++;
    }
  }
  const knownLogIds=new Set(merged.logs.map(log=>log.id));
  for(const log of parsed.logs){
    if(knownLogIds.has(log.id))continue;
    merged.logs.push(structuredClone(log));
    knownLogIds.add(log.id);
    addedWorkouts++;
  }
  merged.logs.sort((a,b)=>new Date(b.finishedAt)-new Date(a.finishedAt));
  for(const [name,sets] of Object.entries(parsed.baselines||{})){
    if(!merged.baselines[name]&&Array.isArray(sets))merged.baselines[name]=structuredClone(sets);
  }
  merged.program=applyDayNames(merged.program);
  // Existing profile values, workouts, timers and in-progress session always win.
  state=merged;
  save();
  modal=null;
  render();
  toast(addedExercises||addedWorkouts
    ? `Tilføjet: ${addedExercises} øvelser og ${addedWorkouts} workouts`
    : 'Backup indlæst — alle øvelser findes allerede');
}
async function importData(file){
  if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());
    mergeBackup(parsed);
  }catch(e){
    toast('Filen kunne ikke læses som en FitNotes-sikkerhedskopi');
  }
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;if(action==='backdrop'&&event.target!==button)return;
switch(action){
  case 'view': tab=button.dataset.view;modal=null;modalOpener=null;render();window.scrollTo(0,0);break;
  case 'hologram-style':state.settings={...state.settings,hologramView:button.dataset.style};save();render();break;
  case 'holo-view':window.__holo?.setView(Number(button.dataset.deg));break;
  case 'continue':sessionReturnTab=tab==='program'?'program':'home';tab='session';render();window.scrollTo(0,0);break;
  case 'start':sessionReturnTab=tab==='program'?'program':'home';startSession(button.dataset.day);break;
  case 'back-session':tab=sessionReturnTab==='program'?'program':'home';render();window.scrollTo(0,0);break;
  case 'edit':modalOpener={action,day:button.dataset.day};openEdit(button.dataset.day);break;
  case 'baseline':modalOpener={action,ex:button.dataset.ex};openBaseline(Number(button.dataset.ex));break;
  case 'save-baseline':saveBaseline();break;
  case 'apply-progress':applyProgression(Number(button.dataset.ex));break;
  case 'settings':tab='settings';modal=null;render();window.scrollTo(0,0);break;
  case 'account':tab='account';modal=null;render();window.scrollTo(0,0);break;
  case 'save-profile':saveProfile();break;
  case 'close-modal':case 'backdrop':closeModal();break;
  case 'new-ex':draft.exercises.push(ex('',2,draft.range||'8–12'));render();document.querySelector(`[data-draft-ex="${draft.exercises.length-1}"][data-prop="name"]`)?.focus({preventScroll:true});break;
  case 'remove-ex':draft.exercises.splice(Number(button.dataset.index),1);render();break;
  case 'save-edit':saveEdit();break;
  case 'check-set':toggleSet(Number(button.dataset.ex),Number(button.dataset.set));break;
  case 'add-set':{const e=state.session?.exercises?.[Number(button.dataset.ex)];if(e){e.sets.push({weight:'',reps:'',done:false});save();render();}break;}
  case 'finish':finishSession();break;
  case 'discard':askConfirm({key:'discard-session',title:'Afslut uden at gemme?',text:'Træningen og de sæt, du har tastet, bliver slettet.',yes:'Afslut uden at gemme'}).then(ok=>{if(ok){state.session=null;state.rest=null;tab='home';save();render();}});break;
  case 'toggle-history':historyOpen=historyOpen===button.dataset.log?null:button.dataset.log;render();break;
  case 'delete-history':{const id=button.dataset.log;askConfirm({key:'delete-workout',title:'Slet workout?',text:'Workouten slettes permanent fra din historik og tæller ikke længere med i din rang.',yes:'Slet workout'}).then(ok=>{if(ok){state.logs=state.logs.filter(x=>x.id!==id);historyOpen=null;save();render();toast('Workout slettet');}});break;}
  case 'confirm-yes':answerConfirm(true);break;
  case 'confirm-no':answerConfirm(false);break;
  case 'confirm-reset':state.settings={...state.settings,skipConfirm:{}};save();render();toast('Appen spørger igen, før den sletter eller afslutter noget');break;
  case 'edit-history':{const log=state.logs.find(x=>x.id===button.dataset.log);if(log){modalOpener={action,log:log.id};logDraft=structuredClone(log);modal='log-edit';render();}break;}
  case 'remove-log-set':logDraft?.exercises[Number(button.dataset.ex)]?.sets.splice(Number(button.dataset.set),1);render();break;
  case 'save-log-edit':saveLogEdit();break;
  case 'rest-toggle':if(state.rest){if(state.rest.paused){state.rest.end=Date.now()+state.rest.remaining*1000;state.rest.paused=false;}else{state.rest.remaining=restRemaining();state.rest.paused=true;}save();render();}break;
  case 'rest-reset':startRest();save();render();break;
  case 'rest-minus':adjustRest(-15);break;
  case 'rest-plus':adjustRest(15);break;
  case 'rest-alert':state.settings={...state.settings,restAlert:state.settings?.restAlert===false};if(state.settings.restAlert){primeAudio();restAlert();}save();render();break;
  case 'rest-stop':state.rest=null;save();render();break;
  case 'export':exportData();break;
  case 'restore-included':mergeBackup(INCLUDED_BACKUP);break;
  case 'import':document.getElementById('import-input')?.click();break;
  default:window.FitSync?.handleAction(action,button);
}});
// Danish keyboards type a comma (22,5); a number field would silently drop it and store 225.
function normalizeDecimal(el){const clean=el.value.replace(',','.').replace(/[^0-9.]/g,'').replace(/(\..*)\./g,'$1');if(clean!==el.value)el.value=clean;}
document.addEventListener('input',event=>{const el=event.target;if((el.dataset.action==='set-input'&&el.dataset.field==='weight')||(el.dataset.baselineIndex!==undefined&&el.dataset.prop==='weight'))normalizeDecimal(el);if(el.dataset.action==='set-input'&&state.session){const r=state.session.exercises?.[Number(el.dataset.ex)]?.sets?.[Number(el.dataset.set)];if(r){r[el.dataset.field]=el.value;if(el.dataset.field==='reps')r.touchedReps=true;save();}}if(logDraft&&el.dataset.logeditEx!==undefined){if(el.dataset.prop==='weight')normalizeDecimal(el);const row=logDraft.exercises[Number(el.dataset.logeditEx)]?.sets[Number(el.dataset.logeditSet)];if(row)row[el.dataset.prop]=el.value;}if(baselineDraft&&el.dataset.baselineIndex!==undefined){const row=baselineDraft[Number(el.dataset.baselineIndex)];if(row)row[el.dataset.prop]=el.value;}if(draft){if(el.dataset.draftField)draft[el.dataset.draftField]=el.value;if(el.dataset.draftEx!==undefined){const entry=draft.exercises[Number(el.dataset.draftEx)];if(entry)entry[el.dataset.prop]=el.value;}}});
const pendingAutoCompletion=new Map();
function scheduleAutoComplete(exIndex,setIndex){
  const key=`${exIndex}:${setIndex}`;
  clearTimeout(pendingAutoCompletion.get(key));
  pendingAutoCompletion.set(key,setTimeout(()=>{
    pendingAutoCompletion.delete(key);
    const exercise=state.session?.exercises?.[exIndex],row=exercise?.sets?.[setIndex];
    if(row&&!row.done&&row.touchedReps&&setIsValid(exercise,row))completeSet(exIndex,setIndex,true);
  },120));
}
document.addEventListener('change',event=>{const el=event.target;if(el?.id==='import-input'){importData(el.files?.[0]);return;}if(el?.id==='rest-min'||el?.id==='rest-sec'){saveRestFields();return;}if(el?.dataset?.action==='set-input'&&state.session){const exIndex=Number(el.dataset.ex),setIndex=Number(el.dataset.set);const exercise=state.session.exercises?.[exIndex];const row=exercise?.sets?.[setIndex];if(row&&!row.done&&row.touchedReps&&setIsValid(exercise,row))scheduleAutoComplete(exIndex,setIndex);}});
// Mobile keyboards do not always send `change` when a reps field loses focus.
// Focusout makes automatic completion reliable across touch and desktop input.
document.addEventListener('focusout',event=>{
  const el=event.target;
  if(el?.dataset?.action!=='set-input'||!state.session)return;
  const exIndex=Number(el.dataset.ex),setIndex=Number(el.dataset.set);
  const exercise=state.session.exercises?.[exIndex],row=exercise?.sets?.[setIndex];
  if(row&&!row.done&&row.touchedReps&&setIsValid(exercise,row))scheduleAutoComplete(exIndex,setIndex);
});
document.addEventListener('keydown',event=>{
  if(!modal)return;
  if(event.key==='Escape'){event.preventDefault();closeModal();return;}
  if(event.key!=='Tab')return;
  const focusables=[...document.querySelectorAll('.modal button,.modal input,.modal select,.modal textarea')]
    .filter(el=>!el.disabled&&el.getClientRects().length);
  if(!focusables.length)return;
  const first=focusables[0],last=focusables[focusables.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
// The rest timer also ends (and alerts) while you look at another page.
setInterval(()=>{
  if(!state.rest||state.rest.paused)return;
  const sec=restRemaining(),el=document.getElementById('rest-time');
  if(el)el.textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  if(sec===0){state.rest=null;save();if(tab==='session')render();restAlert();toast('Pausen er slut — klar til næste sæt');}
},500);
render();
