import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const browser={};
vm.runInNewContext(fs.readFileSync('dist/progress.js','utf8'),{window:browser});
const info=browser.FitProgress.info;
const program=[{exercises:[
  {name:'Seated Row · trekantgreb',unit:'kg',hint:''},
  {name:'Flat DB Press',unit:'kg',hint:'Vægt pr. hånd'},
  {name:'Military Push-ups',unit:'kropsvægt',hint:''},
  {name:'Pull-up',unit:'ekstravægt',hint:'Ekstra vægt på kroppen'}
]}];
const state={program,profile:{bodyWeightKg:82,age:19},baselines:{},logs:[]};
const exactPullup={program,profile:{bodyWeightKg:80,age:25},baselines:{'pull-up':[{weight:'33',reps:'1'}]},logs:[]};
assert.equal(info(exactPullup).lifts[0].score,50,'male 80 kg +33 kg pull-up 1RM matches source median');
exactPullup.profile.age=19;
assert.ok(info(exactPullup).lifts[0].score>50,'a 19-year-old is compared against an age-adjusted benchmark');
const exactPushup={program,profile:{bodyWeightKg:80,age:25},baselines:{'military push-ups':[{weight:'0',reps:'38'}]},logs:[]};
assert.equal(info(exactPushup).lifts[0].score,50,'male 80 kg 38 pushups matches source median');
assert.equal(info(state).hasData,false,'unlogged user is not given a bronze rank');
state.baselines['seated row · trekantgreb']=[{weight:'50',reps:'8'}];
const initial=info(state);
assert.equal(initial.hasData,true);
assert.equal(initial.lifts.length,1);
assert.equal(initial.provisional,true);
assert.equal(initial.lifts[0].best,50);

const rowLog={exercises:[{name:'Seated Row · trekantgreb',unit:'kg',sets:[{done:true,weight:'50',reps:'8'}]}]};
state.logs=[rowLog,rowLog,rowLog];
assert.equal(info(state).score,initial.score,'repeating workouts does not grant points');
state.logs.unshift({exercises:[{name:'Seated Row · trekantgreb',unit:'kg',sets:[{done:true,weight:'55',reps:'8'}]}]});
assert.ok(info(state).score>initial.score,'current strength changes with higher estimated lift');
state.logs.unshift({exercises:[{name:'Seated Row · trekantgreb',unit:'kg',sets:[{done:true,weight:'45',reps:'8'}]}]});
assert.ok(info(state).score<initial.score,'the latest weaker workout can lower the strength rank');
state.logs.unshift({exercises:[{name:'Military Push-ups',unit:'kropsvægt',sets:[{done:true,weight:'0',reps:'40'}]},
  {name:'Pull-up',unit:'ekstravægt',sets:[{done:true,weight:'15',reps:'8'}]}]});
assert.equal(info(state).lifts.length,3,'bodyweight and externally weighted pull-ups both count');
assert.ok(info(state).lifts.find(x=>x.name==='Military Push-ups').score>=50,'40 pushups is near the 50th percentile in reference lifters');
const weighted15=info(state).lifts.find(x=>x.name==='Pull-up').score;
state.logs.unshift({exercises:[{name:'Pull-up',unit:'ekstravægt',sets:[{done:true,weight:'40',reps:'8'}]}]});
assert.ok(info(state).lifts.find(x=>x.name==='Pull-up').score>weighted15,'more external load is a stronger weighted pull-up');
assert.equal(info(state).lifts.find(x=>x.name==='Pull-up').best,40,'pull-up weight is stored as added load');
state.logs.unshift({exercises:[{name:'Pull-up',unit:'ekstravægt',sets:[{done:true,weight:'0',reps:'8'}]}]});
assert.ok(info(state).lifts.find(x=>x.name==='Pull-up').score<weighted15,'bodyweight-only pull-ups rank below weighted sets');
assert.equal(info(state).lifts.find(x=>x.name==='Pull-up').best,0,'zero means bodyweight only');
state.logs.unshift({exercises:[{name:'Flat DB Press',unit:'kg',sets:[{done:true,weight:'22.5',reps:'8'}]}]});
const combined=info(state);
assert.equal(combined.lifts.length,4);
assert.equal(combined.score,Math.round(combined.lifts.reduce((a,l)=>a+l.score,0)/4),'rank is mean percentile, not repeated-workout points');
assert.match(browser.FitProgress.page(state),/Ranks/);
assert.match(browser.FitProgress.page(state),/Din styrke over tid/,'weekly strength chart is shown');
assert.match(browser.FitProgress.page(state),/Hvordan sammenlignes min styrke/);
assert.match(browser.FitProgress.page(state),/ikke<\/em> verdens samlede befolkning/);
const pullupReps=reps=>info({program,profile:{bodyWeightKg:82,age:19},baselines:{'pull-up':[{weight:'0',reps:String(reps)}]},logs:[]}).lifts[0].score;
assert.ok(pullupReps(25)>pullupReps(15),'bodyweight pull-ups above 15 reps still count');
console.log('Strength ranking tests passed');
