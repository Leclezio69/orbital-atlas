import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialMission,commitChoice,frameAt,missionOutcome} from '../dist/mission-engine.js';
import {flightNarrative,REFERENCE_FLIGHT} from '../dist/mission-direction.js';
const c=JSON.parse(readFileSync(new URL('../dist/mission-case.json',import.meta.url)));
const run=choices=>choices.reduce((s,id)=>commitChoice(c,s,id),initialMission(c));
const good=run(REFERENCE_FLIGHT);
assert.equal(missionOutcome(good).kind,'success');
assert.equal(good.history.length,6);
// Arrival at a decision is not a commitment to its default choice.
assert.match(flightNarrative(frameAt(run(['shadow']),14)).title,/Cloud over/);
assert.match(flightNarrative(frameAt(run(['shadow','defer']),20)).title,/deferred/);
assert.match(flightNarrative(frameAt(run(['shadow','repeat']),20)).title,/second chance/);
assert.match(flightNarrative(frameAt(good,20)).title,/useful image/);
// Narrative and visuals must not reveal evidence from a future frame.
assert.match(flightNarrative(frameAt(good,53)).detail,/under review/);
assert.match(flightNarrative(frameAt(good,64)).title,/updated record/);
assert(!frameAt(good,53).evidence.includes('E5'));
assert(frameAt(good,64).evidence.includes('E5'));
assert.match(flightNarrative(frameAt(run(['shadow','qualified','safehold','reassess']),53)).title,/quiet/);
assert.match(flightNarrative(frameAt(run(['shadow','qualified','alternate','manual-burn']),50.5)).phase,/MANOEUVRE/);
console.log('PASS: reference flight, pending decisions, observation branches, record-timed evidence, ground loss and burn direction.');
