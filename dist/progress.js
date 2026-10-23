/* FitNotes — estimated international lifter comparison from recent sets. */
(() => {
  // Anchor percentiles from Strength Level's male lifter logs, around 80 kg.
  // This is a custom composite of exercise percentiles, not a population survey.
  // Age tables are marginal and the combined age/bodyweight correction is an
  // approximation. Exercise variations using proxies are marked explicitly.
  const anchorPercentiles=[5,20,50,80,95];
  // Male bodyweight tables for Pull Ups (1RM extra kg) and Push Ups (reps).
  // Source: strengthlevel.com/strength-standards/pull-ups/kg and /push-ups/kg
  const bodyweightStandards={
    pullup:[[50,-5,7,22,39,56],[55,-4,9,25,42,61],[60,-4,11,27,45,64],[65,-3,12,29,48,68],[70,-2,13,31,50,71],[75,-2,14,32,52,73],[80,-2,14,33,54,75],[85,-2,15,34,56,77],[90,-2,15,35,57,79],[95,-2,15,36,58,81],[100,-3,15,36,59,82],[105,-3,15,37,60,83],[110,-4,15,37,60,84],[115,-5,15,37,60,85],[120,-6,14,36,61,85],[125,-7,13,36,61,86],[130,-8,13,36,61,86],[135,-9,12,35,60,86],[140,-10,11,35,60,86]],
    pushup:[[50,1,18,42,70,102],[55,2,19,42,69,99],[60,4,19,41,67,95],[65,4,20,41,65,92],[70,5,20,40,64,89],[75,6,20,39,62,87],[80,6,20,38,60,84],[85,6,20,38,59,81],[90,6,19,37,57,79],[95,6,19,36,56,77],[100,6,19,35,54,74],[105,6,18,34,53,72],[110,6,18,34,51,70],[115,6,18,33,50,68],[120,6,17,32,49,67],[125,6,17,31,47,65],[130,6,16,30,46,63],[135,6,16,30,45,62],[140,6,16,29,44,60]]
  };
  // Male age benchmarks (15–90 years) for Beginner through Elite, source:
  // https://strengthlevel.com/strength-standards/{exercise}/kg
  // Each row: [age, 5th, 20th, 50th, 80th, 95th percentile].
  const ageStandards={
    flat:[[15,14,22,33,45,59],[20,16,25,37,52,68],[25,17,26,38,53,69],[30,17,26,38,53,69],[35,17,26,38,53,69],[40,17,26,38,53,69],[45,16,25,36,50,66],[50,15,23,34,47,61],[55,14,21,31,43,57],[60,12,20,29,40,52],[65,11,18,26,36,47],[70,10,16,23,32,42],[75,9,14,21,29,38],[80,8,13,19,26,34],[85,7,11,17,23,30],[90,7,10,15,21,27]],
    incline:[[15,37,53,74,97,123],[20,42,61,84,111,140],[25,43,63,86,114,144],[30,43,63,86,114,144],[35,43,63,86,114,144],[40,43,63,86,114,144],[45,41,59,82,108,136],[50,38,55,76,101,127],[55,35,51,71,93,118],[60,32,47,64,85,107],[65,29,42,58,77,97],[70,26,38,52,69,87],[75,24,34,47,62,78],[80,21,31,42,56,70],[85,19,27,38,50,63],[90,17,25,34,45,56]],
    row:[[15,35,52,72,95,121],[20,40,59,82,109,138],[25,41,60,84,112,142],[30,41,60,84,112,142],[35,41,60,84,112,142],[40,41,60,84,112,142],[45,39,57,80,106,134],[50,37,54,75,99,126],[55,34,49,69,91,116],[60,31,45,63,83,106],[65,28,41,57,75,96],[70,25,37,51,68,86],[75,23,33,46,61,77],[80,20,30,41,55,69],[85,18,26,37,49,62],[90,16,24,33,44,56]],
    lateral:[[15,4,8,13,21,29],[20,4,9,15,24,33],[25,4,9,16,24,34],[30,4,9,16,24,34],[35,4,9,16,24,34],[40,4,9,16,24,34],[45,4,9,15,23,32],[50,4,8,14,21,30],[55,4,7,13,20,28],[60,3,7,12,18,25],[65,3,6,11,16,23],[70,3,6,10,15,21],[75,2,5,9,13,18],[80,2,4,8,12,17],[85,2,4,7,11,15],[90,2,4,6,9,13]],
    pullup:[[15,-14,0,16,33,51],[20,-5,11,29,48,69],[25,-3,13,31,52,73],[30,-3,13,31,52,73],[35,-3,13,31,52,73],[40,-3,13,31,52,73],[45,-7,8,26,45,65],[50,-11,3,19,37,56],[55,-16,-3,12,28,46],[60,-22,-9,4,19,35],[65,-27,-16,-3,10,24],[70,-33,-22,-10,2,15],[75,-38,-28,-17,-6,6],[80,-44,-33,-23,-13,-2],[85,-48,-38,-28,-19,-9],[90,-53,-43,-33,-24,-15]],
    pushup:[[15,0,12,29,48,70],[20,4,18,37,59,84],[25,5,19,39,62,87],[30,5,19,39,62,87],[35,5,19,39,62,87],[40,5,19,39,62,87],[45,3,17,35,57,81],[50,1,14,31,51,74],[55,0,10,26,45,66],[60,0,8,21,38,58],[65,0,5,16,32,49],[70,0,1,12,26,42],[75,0,0,8,20,34],[80,0,0,5,15,28],[85,0,0,1,10,22],[90,0,0,0,7,16]],
    lat:[[15,36,51,70,91,114],[20,41,58,80,104,130],[25,42,60,82,107,134],[30,42,60,82,107,134],[35,42,60,82,107,134],[40,42,60,82,107,134],[45,40,57,77,101,127],[50,37,53,72,95,118],[55,35,49,67,87,109],[60,32,45,61,80,100],[65,29,40,55,72,90],[70,26,36,50,65,81],[75,23,33,45,58,73],[80,21,29,40,52,65],[85,19,26,36,47,59],[90,17,24,32,42,53]],
    face:[[15,12,23,39,58,81],[20,13,26,44,67,93],[25,14,27,45,68,95],[30,14,27,45,68,95],[35,14,27,45,68,95],[40,14,27,45,68,95],[45,13,25,43,65,90],[50,12,24,40,61,84],[55,11,22,37,56,78],[60,10,20,34,51,71],[65,9,18,31,46,64],[70,8,16,28,42,58],[75,8,15,25,37,52],[80,7,13,22,33,46],[85,6,12,20,30,42],[90,5,11,18,27,37]],
    hammer:[[15,8,13,19,28,37],[20,9,15,22,31,42],[25,9,15,23,32,43],[30,9,15,23,32,43],[35,9,15,23,32,43],[40,9,15,23,32,43],[45,9,14,22,31,41],[50,8,13,20,29,38],[55,7,12,19,26,35],[60,7,11,17,24,32],[65,6,10,15,22,29],[70,5,9,14,20,26],[75,5,8,12,18,23],[80,4,7,11,16,21],[85,4,7,10,14,19],[90,4,6,9,13,17]],
    curl:[[15,6,11,18,26,36],[20,7,13,20,30,41],[25,7,13,21,31,42],[30,7,13,21,31,42],[35,7,13,21,31,42],[40,7,13,21,31,42],[45,7,12,20,29,40],[50,6,11,19,27,37],[55,6,11,17,25,35],[60,5,10,16,23,32],[65,5,9,14,21,29],[70,4,8,13,19,26],[75,4,7,11,17,23],[80,3,6,10,15,21],[85,3,6,9,14,18],[90,3,5,8,12,17]],
    skull:[[15,14,24,36,50,66],[20,17,27,41,57,76],[25,17,28,42,59,78],[30,17,28,42,59,78],[35,17,28,42,59,78],[40,17,28,42,59,78],[45,16,26,40,56,74],[50,15,25,37,52,69],[55,14,23,34,48,63],[60,13,21,31,44,58],[65,11,19,28,40,52],[70,10,17,25,36,47],[75,9,15,23,32,42],[80,8,14,20,29,38],[85,7,12,18,26,34],[90,7,11,16,23,30]],
    overhead:[[15,10,20,35,53,74],[20,12,23,40,60,84],[25,12,24,41,62,86],[30,12,24,41,62,86],[35,12,24,41,62,86],[40,12,24,41,62,86],[45,11,23,38,59,82],[50,11,21,36,55,77],[55,10,19,33,51,71],[60,9,18,30,46,65],[65,8,16,27,42,58],[70,7,14,25,38,53],[75,6,13,22,34,47],[80,6,12,20,30,42],[85,5,10,18,27,38],[90,5,9,16,24,34]]
  };
  const thresholds=[0,7,14,20,30,40,50,58,66,70,76,82,85,89,92,95,97,99];
  const colors=['#ce9767','#c1d0e2','#efca73','#9ae0e5','#88b9ff','#a99bc9'];
  const tiers=['Bronze','Silver','Gold','Platinum','Diamond','Obsidian'];
  const roman=['I','II','III'];
  // 3D hologram colours per rank: body, glowing edge and neon lines. Each rank
  // is a little richer than the one below; Obsidian is black glass with white
  // lines and a violet edge.
  const holoColors={
    Bronze:{body:'#b85a32',rim:'#d9784a',line:'#f2a070'},
    Silver:{body:'#8796ab',rim:'#d4deeb',line:'#eef3fa'},
    Gold:{body:'#e0902f',rim:'#f0b34e',line:'#ffd772'},
    Platinum:{body:'#3fb8c2',rim:'#8fe6ee',line:'#d4fbff'},
    Diamond:{body:'#4a86f0',rim:'#93bdff',line:'#d8e8ff'},
    Obsidian:{body:'#06050a',rim:'#9a74ee',line:'#ffffff'}};
  const ranks=thresholds.map((start,i)=>({start,name:`${tiers[Math.floor(i/3)]} ${roman[i%3]}`,tier:tiers[Math.floor(i/3)],shade:colors[Math.floor(i/3)]}));
  const fmt=n=>Number(n).toLocaleString('da-DK',{maximumFractionDigits:1});
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  function referenceFor(name){
    const rules=[
      [/pull.?up|chin.?up/i,{kind:'weightedPullup',anchors:[-2,14,33,54,75],bodyweight85:[-2,15,34,56,77],ageKey:'pullup',label:'Pull Ups · ekstra vægt'}],
      [/push.?up/i,{kind:'pushup',anchors:[6,20,38,60,84],bodyweight85:[6,20,38,59,81],ageKey:'pushup',label:'Push Ups · antal reps'}],
      [/flat.*db.*press|dumbbell.*bench|db.*bench/i,{anchors:[19.5,29,40.5,54,69],ageKey:'flat',label:'Dumbbell Bench Press · pr. hånd'}],
      [/incline.*smith|smith.*incline/i,{anchors:[50,66,87,109,134],ageKey:'incline',label:'Incline Bench Press · tilnærmet Smith-reference',proxy:true}],
      [/seated.*row|cable.*row/i,{anchors:[47,65,87,112,140],ageKey:'row',label:'Seated Cable Row'}],
      [/lateral.*raise/i,{anchors:[5,10,16,25,34],ageKey:'lateral',label:'Dumbbell Lateral Raise · pr. hånd'}],
      [/skull.*crusher/i,{anchors:[18,29,43,60,79],ageKey:'skull',label:'Lying Triceps Extension · variation',proxy:true}],
      [/overhead.*tricep/i,{anchors:[17,27,40,57,76],ageKey:'overhead',label:'Triceps Extension · variation',proxy:true}],
      [/single.arm.*lat/i,{anchors:[23.5,32,42.5,54,66.5],ageKey:'lat',label:'Lat Pulldown · pr. arm (estimat)',proxy:true}],
      [/lat.*pulldown|pulldown/i,{anchors:[47,64,85,108,133],ageKey:'lat',label:'Lat Pulldown'}],
      [/face.?pull/i,{anchors:[15,29,47,69,95],ageKey:'face',label:'Face Pull'}],
      [/incline.*db.*hammer.*curl|hammer.*curl/i,{anchors:[11,16,24,33,42],ageKey:'hammer',label:'Hammer Curl · pr. hånd',proxy:true}],
      [/incline.*db.*curl|db.*curl|dumbbell.*curl/i,{anchors:[8,14,22,32,42],ageKey:'curl',label:'Dumbbell Curl · pr. hånd',proxy:true}],
      [/tricep.*extension/i,{anchors:[17,27,40,57,76],ageKey:'overhead',label:'Triceps Extension',proxy:true}],
      [/barbell.*bench|bench.*press/i,{anchors:[44,65,88,115,144],ageKey:'incline',label:'Bench Press',proxy:true}],
    ];
    return rules.find(([pattern])=>pattern.test(name))?.[1]||null;
  }
  function percentileFrom(value,anchors){
    if(value<=anchors[0])return Math.round(clamp(5-(anchors[0]-value)*15/Math.max(anchors[1]-anchors[0],1),0,5));
    for(let i=1;i<anchors.length;i++)if(value<=anchors[i]){
      return Math.round(anchorPercentiles[i-1]+(anchorPercentiles[i]-anchorPercentiles[i-1])*(value-anchors[i-1])/(anchors[i]-anchors[i-1]));
    }
    return Math.round(clamp(95+(value-anchors[4])*4/(anchors[4]-anchors[3]),95,99));
  }
  function interpolation(a,b,t){return a+(b-a)*t;}
  function referenceAnchors(reference,bodyweight,age){
    const bwRows=bodyweightStandards[reference.ageKey];
    let anchors;
    if(bwRows){
      let low=bwRows[0],high=bwRows[bwRows.length-1];
      for(let i=1;i<bwRows.length;i++)if(bodyweight<=bwRows[i][0]){
        low=bwRows[i-1];high=bwRows[i];break;
      }
      const t=clamp((bodyweight-low[0])/Math.max(high[0]-low[0],1),0,1);
      anchors=reference.anchors.map((_,i)=>interpolation(low[i+1],high[i+1],t));
    }else{
      // For machines and dumbbells use the published 80 kg standards with
      // an approximate bodyweight scaling (their tables are not joint data).
      anchors=reference.anchors.map(n=>n*Math.pow(bodyweight/80,.66));
    }
    const ageRows=ageStandards[reference.ageKey];
    if(ageRows){
      const base=ageRows.find(row=>row[0]===25);
      let low=ageRows[0],high=ageRows[ageRows.length-1];
      for(let i=1;i<ageRows.length;i++){
        if(age<=ageRows[i][0]){low=ageRows[i-1];high=ageRows[i];break;}
      }
      const t=clamp((age-low[0])/Math.max(high[0]-low[0],1),0,1);
      anchors=anchors.map((n,i)=>n+interpolation(low[i+1],high[i+1],t)-base[i+1]);
    }
    return anchors;
  }
  // Loaded lifts are capped at 15 reps. Pull-ups allow up to 30, otherwise
  // 25 strict bodyweight reps would rank the same as 15.
  function estimatedOneRepMax(totalKg,reps,maxReps=15){
    const r=clamp(reps,1,maxReps);
    const brzycki=totalKg*36/(37-r),epley=totalKg*(1+r/30);
    if(r<=8)return brzycki;
    if(r>=10)return epley;
    return interpolation(brzycki,epley,r-8);
  }
  function strengthLifts(state){
    const lifts=new Map(),unitByName=new Map();
    for(const day of state.program||[])for(const exercise of day.exercises||[])
      unitByName.set(exercise.name.trim().toLowerCase(),exercise.unit);
    const readWeight=row=>{
      const raw=String(row?.weight??'').trim();
      if(!raw)return null;
      const kg=Number(raw.replace(',','.'));
      return Number.isFinite(kg)&&kg>=0?kg:null;
    };
    const readReps=row=>{const n=Number(row?.reps);return Number.isFinite(n)&&n>=1?Math.round(n):0;};
    const bodyweight=clamp(Number(state.profile?.bodyWeightKg)||82,35,250);
    const age=clamp(Number(state.profile?.age)||19,15,90);
    const addSet=(key,name,unit,kg,reps)=>{
      const reference=referenceFor(name);
      if(!reference||!reps)return;
      const bodyweightExercise=reference.kind==='pushup';
      const pullup=reference.kind==='weightedPullup';
      if(kg===null){if(!bodyweightExercise&&!pullup)return;kg=0;}
      // Pull-up weights are ADDITIONAL weight on top of the athlete's mass.
      // We estimate total lifted mass for a 1RM, then subtract bodyweight.
      // Weighted push-ups use a clearly approximate rep-equivalent model.
      let performance;
      const anchors=referenceAnchors(reference,bodyweight,age);
      if(bodyweightExercise){performance=reps*(1+kg/bodyweight);}
      else if(pullup){
        performance=estimatedOneRepMax(bodyweight+kg,reps,30)-bodyweight;
      }else{
        performance=estimatedOneRepMax(kg,reps);
      }
      const existing=lifts.get(key);
      if(!existing||performance>existing.performance)
        lifts.set(key,{name,unit,best:kg,reps,performance,reference,score:percentileFrom(performance,anchors)});
    };
    const nameForKey=key=>(state.program||[]).flatMap(d=>d.exercises||[]).find(e=>e.name.trim().toLowerCase()===key)?.name||key;
    for(const [key,sets] of Object.entries(state.baselines||{}))for(const set of sets){
      addSet(key,nameForKey(key),unitByName.get(key)||'kg',readWeight(set),readReps(set));
    }
    // The strongest set from the LATEST workout of each exercise is selected.
    const logs=[...(state.logs||[])].sort((a,b)=>(Date.parse(b.finishedAt)||0)-(Date.parse(a.finishedAt)||0));
    const seen=new Set();
    for(const log of logs)for(const exercise of log.exercises||[]){
      const key=exercise.name.trim().toLowerCase();
      if(seen.has(key))continue;
      const done=(exercise.sets||[]).filter(s=>s.done&&readReps(s)>0);
      if(!done.length)continue;
      seen.add(key);
      lifts.delete(key);
      for(const set of done)addSet(key,exercise.name,exercise.unit,readWeight(set),readReps(set));
    }
    return [...lifts.values()].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'da'));
  }
  function info(state){
    const lifts=strengthLifts(state),hasData=lifts.length>0;
    // Mean exercise percentile is a custom composite index — it is NOT a
    // measured combined rank within the global training population.
    const score=hasData?Math.round(lifts.reduce((sum,lift)=>sum+lift.score,0)/lifts.length):0;
    let index=0;for(let i=1;i<ranks.length;i++)if(score>=ranks[i].start)index=i;
    const current=ranks[index],next=ranks[index+1];
    return {score,hasData,provisional:lifts.length<3,lifts,index,current,next,
      remaining:next?next.start-score:0,
      percent:!hasData?0:next?clamp(Math.round((score-current.start)/(next.start-current.start)*100),0,100):100};
  }
  // Rank per muscle group. Each exercise counts only for its primary muscle,
  // so one lift never lifts two groups at once.
  const GROUPS=[['chest','Bryst',['flat','incline','pushup']],['back','Ryg',['pullup','row','lat']],
    ['shoulders','Skuldre',['lateral','face']],['biceps','Biceps',['curl','hammer']],['triceps','Triceps',['skull','overhead']]];
  function placement(score){
    let index=0;for(let i=1;i<ranks.length;i++)if(score>=ranks[i].start)index=i;
    const current=ranks[index],next=ranks[index+1];
    return {index,current,next,percent:next?clamp(Math.round((score-current.start)/(next.start-current.start)*100),0,100):100};
  }
  function groupRanks(state){
    const lifts=strengthLifts(state),sets={};
    for(const log of state.logs||[])for(const exercise of log.exercises||[]){
      const key=referenceFor(exercise.name)?.ageKey,count=(exercise.sets||[]).filter(set=>set.done).length;
      if(key&&count)sets[key]=(sets[key]||0)+count;
    }
    return GROUPS.map(([key,label,refs])=>{
      const own=lifts.filter(lift=>refs.includes(lift.reference.ageKey));
      const setCount=refs.reduce((sum,ref)=>sum+(sets[ref]||0),0);
      if(!own.length)return {key,label,hasData:false,lifts:own,sets:setCount};
      const score=Math.round(own.reduce((sum,lift)=>sum+lift.score,0)/own.length);
      return {key,label,hasData:true,score,lifts:own,sets:setCount,provisional:own.length<2,...placement(score)};
    });
  }
  function groupRankPanel(state){
    const groups=groupRanks(state),core=muscles(state).core;
    const row=g=>{
      const shade=g.hasData?g.current.shade:'#4a5466';
      const meta=g.hasData?`${g.lifts.map(l=>safe(l.name)).join(', ')}`:'Ingen understøttede øvelser endnu';
      return `<div class="group-rank ${g.hasData?'':'empty'}" style="--group-accent:${shade}"><div class="group-rank-emblem">${emblem(shade)}</div><div class="group-rank-main"><div class="group-rank-top"><strong>${g.label}</strong><span class="group-rank-name">${g.hasData?g.current.name:'Ingen rang'}</span></div><div class="group-rank-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${g.hasData?g.percent:0}" aria-label="${g.label}: placering inden for rangniveau"><span style="width:${g.hasData?g.percent:0}%"></span></div><small>${g.hasData?`Pct. ${g.score}${g.provisional?' · <em>Foreløbig</em>':''} · `:''}${meta}${g.sets?` · ${g.sets} sæt`:''}</small></div></div>`;
    };
    const fixed=(label,text)=>`<div class="group-rank empty fixed"><div class="group-rank-emblem">${emblem('#3a4456')}</div><div class="group-rank-main"><div class="group-rank-top"><strong>${label}</strong><span class="group-rank-name">${text}</span></div></div></div>`;
    return `<section class="muscle-panel"><div class="eyebrow">DINE MUSKELGRUPPER</div><h2>Rang pr. muskel</h2><p>Hver muskelgruppe får sin egen rang ud fra sine øvelser. En øvelse tæller kun for sin primære muskel.</p><div class="group-rank-list">${groups.map(row).join('')}${fixed('Core',core?`${core} sæt · ingen rang`:'Ingen rang')}${fixed('Ben','Deaktiveret')}</div><div class="muscle-note">Core har ingen pålidelige styrkestandarder, så den får ingen rang. En gruppe med kun én øvelse er <strong>foreløbig</strong>, indtil du logger mindst to forskellige øvelser for den.</div></section>`;
  }
  function muscles(state){
    const result={chest:0,back:0,shoulders:0,arms:0,core:0};
    for(const log of state.logs||[])for(const exercise of log.exercises||[]){
      const count=(exercise.sets||[]).filter(set=>set.done).length;if(!count)continue;
      const name=exercise.name.toLowerCase(),groups=new Set();
      if(/press|push.?up|dip|chest|bryst|pec|fly/.test(name))['chest','shoulders','arms'].forEach(x=>groups.add(x));
      if(/\brows?\b|pull.?up|pull.?down|chin.?up|\blat\b|\bryg|\bback\b/.test(name))['back','arms'].forEach(x=>groups.add(x));
      if(/curl|tricep|bicep|extension|skull/.test(name))groups.add('arms');
      if(/face.?pull|rear.?delt|reverse.?fly/.test(name))['shoulders','back'].forEach(x=>groups.add(x));
      if(/shoulder|lateral|raise|delt/.test(name))groups.add('shoulders');
      if(/plank|crunch|sit.?up|abdom|core/.test(name))groups.add('core');
      for(const group of groups)result[group]+=count;
    }
    return result;
  }
  function emblem(shade){return `<svg viewBox="0 0 110 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M55 4 99 24 91 81 55 111 19 81 11 24Z" fill="#071322" stroke="${shade}" stroke-width="3"/><path d="M55 14 87 29 81 75 55 97 29 75 23 29Z" fill="${shade}" fill-opacity=".20" stroke="${shade}" stroke-opacity=".45"/><path d="m55 27 10 19 21 3-15 15 4 21-20-10-20 10 4-21-15-15 21-3Z" fill="${shade}"/><path d="m55 39 6 11 12 2-9 9 2 12-11-6-11 6 2-12-9-9 12-2Z" fill="#0c1a2b" opacity=".52"/></svg>`;}
  function profileBar(state){
    const h=Number(state.profile?.heightCm)||184,w=Number(state.profile?.bodyWeightKg)||82,age=Number(state.profile?.age)||19;
    return '<section class="profile-bar"><div><span>DIN PROFIL</span><strong>'+fmt(h)+' cm <em>·</em> '+fmt(w)+' kg <em>·</em> '+fmt(age)+' år</strong></div><div class="profile-description">Reference: mandlige løftere · kropsvægt og alder (ca.).</div><button class="btn btn-secondary btn-tiny" data-action="account">Rediger profil</button></section>';
  }
  function teaser(state){
    const r=info(state);
    return `<section class="home-rank" style="--rank-accent:${r.current.shade}"><div class="home-rank-emblem">${emblem(r.current.shade)}</div><div class="home-rank-info"><div class="eyebrow">DIN STYRKERANG ${r.hasData?'· LEVEL '+String(r.index+1).padStart(2,'0'):''}</div><strong>${r.hasData?r.current.name:'Ikke placeret endnu'}</strong><div class="home-rank-progress"><span style="width:${r.percent}%"></span></div><small>${!r.hasData?'Log dine første sæt for at få en rang':`Gns. løfterpercentil ${r.score} · ${r.lifts.length} ${r.lifts.length===1?'øvelse':'øvelser'}${r.provisional?' · Foreløbig':''}`}</small></div><button class="btn btn-secondary btn-tiny" data-action="view" data-view="progress">Se din rang →</button></section>`;
  }

  // Two hologram styles: the rotatable 3D model from holo3d.js (default)
  // and the recoloured neon picture. Both use the rank colour. A new setting
  // name, so an older saved "Billede" choice does not hide the 3D model.
  function hologramPanel(r,state){
    const style=state.settings?.hologramView==='image'?'image':'neon3d',shade=r.hasData?r.current.shade:'#6f7682';
    const mark=`<div class="hologram-rank-mark"><span>${r.hasData?'LEVEL '+String(r.index+1).padStart(2,'0')+' / 18':'AFVENTER DATA'}</span><strong>${r.hasData?r.current.name:'Ingen rang'}</strong><small>STYRKEENERGI</small></div>`;
    const toggle=`<div class="hologram-style" role="group" aria-label="Hologram-stil">${[['neon3d','3D'],['image','Billede']].map(([value,label])=>`<button type="button" data-action="hologram-style" data-style="${value}" aria-pressed="${style===value}" class="${style===value?'selected':''}">${label}</button>`).join('')}</div>`;
    const stage=style==='image'
      ?`<div id="body-3d-stage" class="body-stage neon-stage" style="--hologram-accent:${shade}" data-tint="${shade}"><canvas id="neon-hologram" role="img" aria-label="Neon-hologramfigur i din rangfarve."></canvas>${mark}</div>`
      :`<div id="body-3d-stage" class="body-stage neon3d-stage" style="--hologram-accent:${shade}"><canvas id="holo-3d" role="img" aria-label="Drejelig 3D-neonfigur i din rangfarve. Træk for at dreje."></canvas>${mark}<div class="body-view-controls">${[[0,'Forfra'],[180,'Bagfra']].map(([deg,label])=>`<button type="button" data-action="holo-view" data-deg="${deg}">${label}</button>`).join('')}</div></div>`;
    return `<section class="body-panel"><div class="body-panel-top"><div><div class="eyebrow">DIT STYRKEHOLOGRAM</div><h2>Din rang. Din energi.</h2></div>${toggle}</div>${stage}<p class="body-caption">${style==='image'?'':'Drej hologrammet med fingeren. '}<span class="body-legend-dot" style="--dot-color:${shade}"></span> Farven viser din FitNotes-rang.</p></section>`;
  }
  function page(state){
    const r=info(state);
    return `<header class="page-hero"><div><div class="eyebrow">DIN STYRKEPROFIL</div><h1>Din udvikling.</h1><p class="lead">Se, hvordan dine løft placerer sig blandt andre styrketrænende — inklusive push-ups og pull-ups med ekstra vægt.</p></div></header>
    <section class="rank-hero" style="--rank-accent:${r.current.shade}"><div class="rank-emblem">${emblem(r.current.shade)}</div><div class="rank-content"><div class="rank-superline"><span>DIN NUVÆRENDE RANG</span><span>${r.hasData?'LEVEL '+String(r.index+1).padStart(2,'0')+' / 18':'AFVENTER LØFT'}</span></div><h2>${r.hasData?r.current.name:'Ikke placeret'}</h2><div class="rank-description">${!r.hasData?'Registrér dine første sæt for at få en rang':r.provisional?'Foreløbig rang · Registrér mindst 3 forskellige øvelser':`Gns. øvelsespercentil ${r.score} · ${r.next?'Næste rang fra '+r.next.start:'Højeste rang'}`}</div><div class="rank-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.percent}" aria-label="Placering inden for rangniveau"><span style="width:${r.percent}%"></span></div><div class="rank-meter-meta"><span>Gns. løfterpercentil: ${r.hasData?r.score:'—'}</span><span>${r.hasData?r.lifts.length+' øvelser i gennemsnittet':'Ingen registrerede øvelser'}</span></div></div></section>
    <div class="rank-stat-grid"><div><span class="rank-stat-value">${r.lifts.length}</span><span class="rank-stat-label">Øvelser i beregningen</span></div><div><span class="rank-stat-value">${r.hasData?r.score+' %':'—'}</span><span class="rank-stat-label">Gns. øvelsespercentil</span></div><div><span class="rank-stat-value">${fmt(Number(state.profile?.bodyWeightKg)||82)}</span><span class="rank-stat-label">Kropsvægt (kg)</span></div></div>
    ${profileBar(state)}${progressChart(state)}<div class="progress-layout">${hologramPanel(r,state)}
    ${groupRankPanel(state)}</div>
    <section class="rank-ladder-panel"><div class="rank-ladder-heading"><div><div class="eyebrow">INTERNATIONALE STYRKENIVEAUER</div><h2>Ranks</h2></div><span>3 niveauer pr. rang</span></div><div class="rank-ladder">${tiers.map((name,i)=>{const first=i*3,shade=colors[i],current=r.hasData&&Math.floor(r.index/3)===i,below=r.hasData&&Math.floor(r.index/3)>i;return `<div class="rank-tile ${current||below?'unlocked':'locked'} ${current?'current':''}" style="--tile-accent:${shade}"><div class="rank-tile-symbol">${emblem(shade)}</div><strong>${name}</strong><div class="rank-tile-dots">${[0,1,2].map(k=>`<span class="${r.hasData&&r.index>=first+k?'filled':''}"></span>`).join('')}</div><small>${['Under top 80 %','Top 80 %','Top 50 %','Top 30 %','Top 15 %','Top 5 %'][i]}</small></div>`;}).join('')}</div><details class="rank-rules"><summary>Hvordan sammenlignes min styrke?</summary><p>Hver understøttet øvelse får en <strong>estimeret percentil</strong> ud fra dit stærkeste sæt i den seneste registrerede træning. For vægtøvelser bruges et estimeret maksløft ud fra kg og højst 15 reps (pull-ups højst 30 reps). <strong>Pull-ups:</strong> indtast kun <strong>ekstra vægt</strong> (fx 20 for kropsvægt + 20 kg; 0 for kun kropsvægt). Både kropsvægt og ekstra vægt tæller med i beregningen. Push-ups sammenlignes primært på gentagelser. Din rang bygger på <strong>gennemsnittet af øvelsernes percentiler</strong> — ikke antallet af workouts eller personlige rekorder. Referenceværdierne kommer fra <a href="https://strengthlevel.com/strength-standards" target="_blank" rel="noopener noreferrer">Strength Levels internationale træningslogs</a> for mænd med en tilnærmet justering for kropsvægt og, hvor der findes aldersdata, alder. Maskiner, variationer og ekstra vægt ved push-ups er mere usikre estimater. <strong>Obs:</strong> Rangeringen gælder sammenlignelige registrerede løftere, <em>ikke</em> verdens samlede befolkning. Gennemsnittet og niveauer over den 95. percentil er FitNotes-estimater, ikke officielle verdensrangeringer.</p></details></section>`;
  }

  // Overall strength per week: the rank score (mean exercise percentile) as it
  // stood at the end of each week that has logged workouts.
  const shortDate=value=>new Date(value).toLocaleDateString('da-DK',{day:'numeric',month:'short'});
  function weekStart(value){const d=new Date(value);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}
  function weekNumber(date){
    const t=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
    t.setUTCDate(t.getUTCDate()+4-(t.getUTCDay()||7));
    return Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7);
  }
  function strengthHistory(state){
    const logs=(state.logs||[]).filter(log=>Date.parse(log.finishedAt));
    const weeks=[...new Set(logs.map(log=>weekStart(log.finishedAt).getTime()))].sort((a,b)=>a-b);
    return weeks.map(start=>{
      const end=start+7*864e5,r=info({...state,logs:logs.filter(log=>Date.parse(log.finishedAt)<end)});
      if(!r.hasData)return null;
      const week=weekNumber(new Date(start));
      return {date:new Date(start).toISOString(),value:r.score,label:`${r.score} %`,axis:`uge ${week}`,tip:`Uge ${week} · ${r.score} % · ${r.current.name}`,rank:r.current.name,week};
    }).filter(Boolean);
  }
  function chartSVG(item){
    const W=340,H=180,L=38,R=14,T=18,B=26,points=item.points;
    const values=points.map(p=>p.value),times=points.map(p=>Date.parse(p.date)||0);
    let lo=Math.min(...values),hi=Math.max(...values);
    if(lo===hi){lo=Math.max(0,lo-5);hi=Math.min(100,hi+5);}
    const pad=(hi-lo)*.12;lo=Math.max(0,lo-pad);hi=Math.min(100,hi+pad);
    const t0=Math.min(...times),t1=Math.max(...times);
    const x=t=>points.length===1||t1===t0?L+(W-L-R)/2:L+(t-t0)/(t1-t0)*(W-L-R);
    const y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);
    const ticks=[lo,(lo+hi)/2,hi].map(v=>Math.round(v));
    const coords=points.map((p,i)=>[x(times[i]),y(p.value)]);
    const line=coords.map(([a,b],i)=>`${i?'L':'M'}${a.toFixed(1)} ${b.toFixed(1)}`).join(' ');
    const area=coords.length>1?`${line} L${coords.at(-1)[0].toFixed(1)} ${H-B} L${coords[0][0].toFixed(1)} ${H-B} Z`:'';
    const last=coords.at(-1);
    return `<svg class="progress-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${safe(item.name)}: ${safe(item.metric.toLowerCase())} pr. træning, ${points.length} træninger, seneste ${safe(points.at(-1).label)}">
      <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#90b6ff" stop-opacity=".28"/><stop offset="1" stop-color="#90b6ff" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="chart-grid"/><text x="${L-7}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" class="chart-axis">${fmt(v)}</text>`).join('')}
      ${area?`<path d="${area}" fill="url(#chart-fill)"/>`:''}
      ${coords.length>1?`<path d="${line}" class="chart-line"/>`:''}
      ${coords.map(([a,b],i)=>`<circle cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r="${i===coords.length-1?5:4}" class="chart-dot${i===coords.length-1?' last':''}"/>`).join('')}
      <text x="${Math.min(last[0],W-R-4).toFixed(1)}" y="${Math.max(last[1]-11,11).toFixed(1)}" text-anchor="${last[0]>W-60?'end':'middle'}" class="chart-value">${safe(points.at(-1).label)}</text>
      <text x="${L}" y="${H-7}" class="chart-axis">${safe(points[0].axis)}</text>
      ${points.length>1?`<text x="${W-R}" y="${H-7}" text-anchor="end" class="chart-axis">${safe(points.at(-1).axis)}</text>`:''}
      ${coords.map(([a,b],i)=>`<circle cx="${a.toFixed(1)}" cy="${b.toFixed(1)}" r="15" class="chart-hit" tabindex="0" data-tip="${safe(points[i].tip)}" aria-label="${safe(points[i].tip)}"/>`).join('')}
    </svg>`;
  }
  function progressChart(state){
    const points=strengthHistory(state);
    const head='<div class="strength-heading"><div><div class="eyebrow">SAMLET STYRKE</div><h2>Din styrke over tid</h2></div><span>Pr. uge</span></div>';
    if(!points.length)return `<section class="strength-panel chart-panel">${head}<div class="strength-empty">Log dine første workouts, så vises din samlede styrke uge for uge her.</div></section>`;
    const first=points[0],last=points.at(-1),change=last.value-first.value;
    const summary=points.length<2?`Uge ${last.week}: ${last.label} (${last.rank}). Grafen vokser uge for uge.`:
      `Styrke: ${first.label} → ${last.label}${change?` (${change>0?'+':''}${change})`:''} over ${points.length} uger.`;
    const item={name:'Din samlede styrke',metric:'Styrke',points};
    return `<section class="strength-panel chart-panel">${head}
      <p class="chart-summary">${safe(summary)}</p>
      <div class="chart-box">${chartSVG(item)}<div class="chart-tip" hidden></div></div>
      <p class="chart-note">Styrke er din rang i procent: gennemsnittet af dine øvelsers percentiler, som det stod ved slutningen af hver uge.</p>
      <details class="chart-table"><summary>Vis som tabel</summary><table><thead><tr><th>Uge</th><th>Styrke</th><th>Rang</th></tr></thead><tbody>${[...points].reverse().map(p=>`<tr><td>${p.week}</td><td>${safe(p.label)}</td><td>${safe(p.rank)}</td></tr>`).join('')}</tbody></table></details>
    </section>`;
  }

  // Neon hologram: the picture is recoloured pixel by pixel in the rank colour.
  // Brightness becomes the colour, and the brightest glow turns towards white.
  // Recolouring takes a moment on a phone, so each rank colour is painted once and reused.
  let neonImage=null;const neonPainted=new Map();
  function toHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;
    if(mx===mn)return [0,0,l];const dd=mx-mn,s=l>.5?dd/(2-mx-mn):dd/(mx+mn);
    const hue=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;return [hue/6,s,l];}
  function fromHsl(hh,s,l){if(!s){const v=Math.round(l*255);return [v,v,v];}
    const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t<0&&(t+=1);t>1&&(t-=1);return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
    return [f(hh+1/3),f(hh),f(hh-1/3)].map(v=>Math.round(v*255));}
  function paintHologram(){
    const canvas=document.getElementById('neon-hologram'),stage=document.getElementById('body-3d-stage');
    if(!canvas||!stage)return;
    const hex=(stage.dataset.tint||'#6f7682').replace('#',''),tint=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)),tintHsl=toHsl(...tint);
    const draw=()=>{
      const w=neonImage.naturalWidth,h=neonImage.naturalHeight,ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx||!w)return;
      if(neonPainted.has(hex)){const done=neonPainted.get(hex);canvas.width=done.width;canvas.height=done.height;ctx.putImageData(done,0,0);return;}
      canvas.width=w;canvas.height=h;ctx.drawImage(neonImage,0,0);
      let pixels;try{pixels=ctx.getImageData(0,0,w,h);}catch(e){return;}
      const d=pixels.data,smooth=(a,b,v)=>{const x=Math.min(1,Math.max(0,(v-a)/(b-a)));return x*x*(3-2*x);};
      // Light-bar columns: bright above the head (top 14 %), where only bars and HUD sit.
      const barCols=new Float32Array(w),top=Math.floor(h*.14);
      // Neighbour distance for the bar test scales with the picture size (4 px at 384 wide).
      const reach=Math.max(2,Math.round(w/96));
      for(let x=0;x<w;x++){let sum=0;for(let y=0;y<top;y++){const k=(y*w+x)*4;sum+=Math.max(d[k],d[k+1],d[k+2]);}barCols[x]=smooth(70,110,sum/top);}
      // Even out the large bright glow in the chest and belly: a blurred copy finds big bright
      // areas, which are scaled down so fine muscle lines keep their relative contrast.
      const lum=new Float32Array(w*h);for(let p=0;p<w*h;p++)lum[p]=Math.max(d[p*4],d[p*4+1],d[p*4+2])/255;
      const sum=new Float64Array((w+1)*(h+1));
      for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=lum[y*w+x];sum[(y+1)*(w+1)+x+1]=sum[y*(w+1)+x+1]+row;}}
      const box=(x,y,r)=>{const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1),y0=Math.max(0,y-r),y1=Math.min(h,y+r+1);
        return (sum[y1*(w+1)+x1]-sum[y0*(w+1)+x1]-sum[y1*(w+1)+x0]+sum[y0*(w+1)+x0])/((x1-x0)*(y1-y0));};
      // Line detail: brightness above the immediate surroundings (a few pixels around). The flat
      // glow between lines (e.g. on the chest) has no detail and turns black like the belly.
      const near=Math.max(2,Math.round(w/90)),LINES=2.6,FILL=.32;
      // Areas brighter on average than the arms are scaled down to the arms' level.
      const LEVEL=.70;
      const out=new Float32Array(w*h);
      for(let i=0;i<d.length;i+=4){
        // The dark-blue background goes black; light bars are dimmed (purple ones by colour,
        // the rest by their column, so they no longer cross the figure); the lit floor below
        // the feet (~84 % down) fades out; and a steeper curve keeps muscle lines crisp.
        const p=i/4,px=p%w,x=px/w,y=Math.floor(p/w)/h;
        const purple=d[i]>60&&d[i]>d[i+1]*1.6,side=smooth(.19,.24,Math.abs(x-.5));
        // A bar pixel is thin: dark a few pixels to the left and right. Inside the figure the
        // neighbours are lit too, so the figure itself is never cut by the bar dimming.
        const side3=k=>{const q=(Math.floor(p/w)*w+Math.min(w-1,Math.max(0,px+k)))*4;return Math.max(d[q],d[q+1],d[q+2]);};
        const thin=barCols[px]>0&&side3(-reach)<90&&side3(reach)<90?barCols[px]:0;
        const keep=(purple?.12:1)*(1-.9*side)*(1-.97*thin)*(1-smooth(.835,.88,y));
        // Pure rank colour with no white added, so the brightest spots (centre of the chest)
        // reach full colour instead of burning to white, while line contrast is kept.
        const py=Math.floor(p/w),local=box(px,py,Math.max(4,Math.round(w/26))),scaled=lum[p]*(local>LEVEL?LEVEL/local:1);
        // Detail from a lightly smoothed copy, with a small gate, so JPEG grain is not amplified.
        const detail=Math.max(0,box(px,py,1)-.85*box(px,py,near)-.02)/.98*LINES;
        // Isolated specks, thin lines and smoke remnants sit in dark surroundings; the body does not.
        // (The picture's 'dark' background is navy, about 0.25 bright, hence the thresholds.)
        const clean=smooth(.36,.50,box(px,py,near*3));
        const raw=Math.min(1,(detail+FILL*scaled)*clean),t=Math.min(1,Math.max(0,(raw-.12)/.88)),light=Math.pow(t*t*(3-2*t),1.25)*keep;
        // Rank colour with brightness as opacity (slightly see-through): black parts turn
        // transparent, so the stage's soft glow shows through behind the figure.
        // Visible colour: the original pixel with only its hue swapped for the rank colour,
        // keeping the picture's own lightness and saturation so its crisp lines stay intact.
        // Perceived brightness is matched too: yellow looks far lighter than blue at the same
        // HSL lightness, so the new colour is scaled to the original pixel's luminance.
        const [ph,ps,pl]=toHsl(d[i],d[i+1],d[i+2]),[r2,g2,b2]=fromHsl(tintHsl[0],Math.min(1,ps*tintHsl[1]/.9),pl);
        const yOld=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2],yNew=.2126*r2+.7152*g2+.0722*b2||1,f=Math.min(1.6,yOld/yNew);
        d[i]=Math.min(255,r2*f);d[i+1]=Math.min(255,g2*f);d[i+2]=Math.min(255,b2*f);out[p]=light*.95;
      }
      // Keep only the figure: what remains after the steps above is the body plus faint
      // leftovers (bar traces, smoke, specks). Averaged over a wide area only the body stays lit.
      const osum=new Float64Array((w+1)*(h+1));
      for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=out[y*w+x];osum[(y+1)*(w+1)+x+1]=osum[y*(w+1)+x+1]+row;}}
      const mr=Math.max(4,Math.round(w/32)),obox=(x,y)=>{const x0=Math.max(0,x-mr),x1=Math.min(w,x+mr+1),y0=Math.max(0,y-mr),y1=Math.min(h,y+mr+1);
        return (osum[y1*(w+1)+x1]-osum[y0*(w+1)+x1]-osum[y1*(w+1)+x0]+osum[y0*(w+1)+x0])/((x1-x0)*(y1-y0));};
      let minX=w,maxX=0,minY=h,maxY=0;
      for(let p=0;p<w*h;p++){
        // Opacity: inside the figure the original brightness decides (dark navy fill goes
        // see-through); everything away from the figure is removed.
        const x=p%w,y=(p-x)/w,a=Math.min(255,255*smooth(.05,.12,obox(x,y))*smooth(.30,.52,lum[p])*(1-smooth(.835,.88,y/h)));
        d[p*4+3]=a;
        if(a>10){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
      }
      ctx.putImageData(pixels,0,0);
      // Crop to the figure (plus a small margin) so it fills more of the stage on a phone.
      if(maxX>minX&&maxY>minY){
        const m=Math.round(w*.04),cx=Math.max(0,minX-m),cy=Math.max(0,minY-m),cw=Math.min(w,maxX+m)-cx,ch=Math.min(h,maxY+m)-cy;
        const cropped=ctx.getImageData(cx,cy,cw,ch);canvas.width=cw;canvas.height=ch;ctx.putImageData(cropped,0,0);neonPainted.set(hex,cropped);
      }else neonPainted.set(hex,pixels);
    };
    if(neonImage?.complete&&neonImage.naturalWidth)return draw();
    if(!neonImage){neonImage=new Image();neonImage.src=window.FITNOTES_NEON_SRC||'./neon-hologram.jpg';}
    neonImage.addEventListener('load',draw,{once:true});
  }
  // Hover/tap on a point shows its date and set; called after each render.
  function bindChart(){
    const box=document.querySelector('.chart-box');if(!box)return;
    const tip=box.querySelector('.chart-tip');
    const show=target=>{
      const rect=box.getBoundingClientRect(),dot=target.getBoundingClientRect();
      tip.textContent=target.dataset.tip;tip.hidden=false;
      const left=Math.min(Math.max(dot.left+dot.width/2-rect.left,60),rect.width-60);
      tip.style.left=left+'px';tip.style.top=(dot.top-rect.top-8)+'px';
    };
    box.querySelectorAll('.chart-hit').forEach(hit=>{
      hit.addEventListener('pointerenter',()=>show(hit));hit.addEventListener('focus',()=>show(hit));hit.addEventListener('click',()=>show(hit));
      hit.addEventListener('pointerleave',()=>{tip.hidden=true;});hit.addEventListener('blur',()=>{tip.hidden=true;});
    });
  }
  // Colours for the 3D hologram. Without a rank it stays unlit and colourless.
  function holoPalette(r){return r.hasData?{color:r.current.shade,...holoColors[r.current.tier]}:{color:'#4a4d52',line:'#6b6e73'};}
  window.FitProgress={info,muscles,groupRanks,page,teaser,bindChart,paintHologram,holoPalette};
})();
