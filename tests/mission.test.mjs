import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialMission,commitChoice,availability,frameAt,missionOutcome,reviewArgument,emergencyHandover,LIMITS} from '../dist/mission-engine.js';
const c=JSON.parse(readFileSync(new URL('../dist/mission-case.json',import.meta.url)));
const run=ids=>ids.reduce((s,id)=>commitChoice(c,s,id),initialMission(c));
const good=run(['shadow','qualified','alternate','reassess','limited','integrated']);
assert.equal(good.time,96);assert.equal(good.ended,true);assert.equal(missionOutcome(good).kind,'success');assert.equal(good.authority,'advisory');assert.equal(good.scope,1);assert.equal(good.history.length,6);
// The engine is immutable; repeated rendering/replay cannot spend resources.
const start=initialMission(c),unchanged=JSON.stringify(start);commitChoice(c,start,'shadow');assert.equal(JSON.stringify(start),unchanged);
const record=JSON.stringify(good);for(let t=0;t<=96;t+=.5)frameAt(good,t);assert.equal(JSON.stringify(good),record);
assert.throws(()=>commitChoice(c,start,'fleet-auto'),/excludes/);assert.throws(()=>commitChoice(c,good,'integrated'));
// A lost contact route removes the human burn option while allowing reassessment.
const loss=run(['shadow','qualified','safehold']);assert.equal(loss.time,50);assert.equal(loss.groundContact,false);assert.match(availability(c,loss,c.stages[3].choices.find(x=>x.id==='manual-burn')),/ground contact/);
const recovered=commitChoice(c,loss,'reassess');assert.equal(recovered.time,70);assert.equal(recovered.groundContact,true);assert(recovered.evidence.includes('E4')&&recovered.evidence.includes('E5'));
// The high-output choice carries exactly one delayed resource penalty.
const heavy=run(['shadow','repeat','alternate']);const heavyEvents=heavy.events.filter(e=>e.text.includes('storage and thermal'));assert.equal(heavyEvents.length,1);assert.equal(heavyEvents[0].time,50);assert.equal(heavyEvents[0].effects.battery,-12);
// No short trial can confer autonomous/fleet authority on any reachable path.
let terminal=0,states=0;function walk(s){states++;assert.equal(s.authority,'advisory');assert.equal(s.scope,1);for(let p of s.samples)for(let[k,floor]of Object.entries(LIMITS))assert(p[k]>=floor,`${k} ${p[k]} below ${floor} at ${p.time}`);if(s.ended){terminal++;return}let available=c.stages[s.stage].choices.filter(o=>!availability(c,s,o));assert(available.length>0,'No finishable path');for(let o of available)walk(commitChoice(c,s,o.id))}walk(initialMission(c));assert(terminal>30);
// An argument must cite earned evidence and an event that actually caused the resource change.
const a={recommendation:'continue',evidence:['E0','E2','E4','E5','E6'],tradeoff:'operatorMinutes',event:'3',stopMetric:'battery',threshold:'35',owner:'flight',next:'transfer',expiry:'nextpass'};
assert(reviewArgument(good,a).every(r=>r.status==='supported'));
assert(reviewArgument(good,{...a,evidence:['X1']}).some(r=>r.status==='contradicted'&&r.title==='Evidence applicability'));
assert(reviewArgument(good,{...a,tradeoff:'deltaV'}).some(r=>r.status==='contradicted'&&r.title==='Causal trade-off'));
assert(reviewArgument(good,{...a,threshold:'20'}).some(r=>r.status==='contradicted'&&r.title==='Measurable stop'));
const stop=emergencyHandover(c,loss);assert.equal(stop.ended,true);assert.equal(stop.time,50);assert(frameAt(stop,50).flags.includes('releaseHeld'));
console.log(`PASS: ${states} reachable states, ${terminal} complete paths; authority, resource floors, replay, delayed effects, contact dependencies, emergency handover and argument contradictions verified.`);
