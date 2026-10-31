import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCENARIOS,scenarioCase} from '../dist/mission-scenarios.js';
import {initialMission,commitChoice,availability,frameAt,missionOutcome,LIMITS} from '../dist/mission-engine.js';
const base=JSON.parse(readFileSync(new URL('../dist/mission-case.json',import.meta.url))),original=JSON.stringify(base);
let total=0;
for(const scenario of SCENARIOS){
 const c=scenarioCase(base,scenario.id);let states=0,ends=0,success=0;
 function walk(s){states++;assert.equal(s.scenarioId,scenario.id);assert.equal(s.authority,'advisory');assert.equal(s.scope,1);for(const p of s.samples)for(const[k,min]of Object.entries(LIMITS))assert(p[k]>=min,`${scenario.id} ${k} at ${p.time}`);
  if(s.ended){ends++;if(missionOutcome(s).kind==='success')success++;return}
  const choices=c.stages[s.stage].choices.filter(o=>!availability(c,s,o));assert(choices.length,`${scenario.id} stranded at ${s.time}`);for(const o of choices)walk(commitChoice(c,s,o.id));
 }
 walk(initialMission(c));assert(success>0);total+=ends;
 const reference=scenario.route.reduce((s,id)=>commitChoice(c,s,id),initialMission(c));assert.equal(missionOutcome(reference).kind,'success');assert.equal(reference.time,96);
 console.log(`${scenario.id}: ${states} reachable states, ${ends} complete paths, ${success} assured continuations. Guided route ends with ${reference.battery.toFixed(2)}% battery and ${reference.operatorMinutes} attention minutes.`);
}
assert.equal(JSON.stringify(base),original,'Scenario editing must not mutate the shared base case');
const late=scenarioCase(base,'latency');let s=['shadow','qualified','alternate','reassess'].reduce((s,id)=>commitChoice(late,s,id),initialMission(late));
assert.equal(s.time,70);assert(!s.evidence.includes('E5'));assert.match(availability(late,s,late.stages[4].choices[0]),/E5/);
s=commitChoice(late,s,'hold-release');assert(!frameAt(s,77).evidence.includes('E5'));assert(frameAt(s,78).evidence.includes('E5'));assert(s.flags.includes('releaseHeld'));
s=commitChoice(late,s,'integrated');assert.equal(missionOutcome(s).kind,'hold');assert.equal(s.events.filter(e=>e.time===78).length,1);
const power=scenarioCase(base,'power'),start=commitChoice(power,initialMission(power),'shadow');assert.match(availability(power,start,power.stages[1].choices.find(o=>o.id==='repeat')),/70/);
// Catch a transient dip even if subsequent sunlight would recover above the floor.
const transient=structuredClone(base);transient.stages[0].choices[0].delayed=[{at:1,effects:{battery:-52.5},text:'Synthetic test draw'}];
assert.match(availability(transient,initialMission(transient),transient.stages[0].choices[0]),/T\+1/);
assert.equal(scenarioCase(base,'unknown').scenario.id,'standard');
console.log(`PASS: ${total} complete scenario paths, current-time evidence, delayed-event uniqueness, floor crossings and baseline isolation.`);
