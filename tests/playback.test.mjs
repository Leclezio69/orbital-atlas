import assert from 'node:assert/strict';
import {playbackControls, advancePlayback} from '../dist/mission-playback.js';
const fresh={time:0,stage:0,ended:false};
assert.equal(playbackControls(fresh,0,false).action,'decision');
assert.equal(playbackControls(fresh,0,false).label,'▶ Start mission');
const committed={time:14,stage:1,ended:false};
assert.equal(playbackControls(committed,0,true).action,'pause');
assert.equal(playbackControls(committed,4,false).action,'resume');
assert.equal(playbackControls(committed,14,false).label,'Make decision 2 →');
assert.equal(playbackControls({time:96,stage:6,ended:true},96,false).action,'replay');
// Rendering at 60 fps or two frames per second must advance the same mission time.
const step=(frames,seconds)=>Array.from({length:frames}).reduce(t=>advancePlayback(t,96,seconds/frames),0);
assert(Math.abs(step(600,10)-step(20,10))<1e-9);
assert.equal(advancePlayback(8,14,3),14); // stops at the decision, never passes it
assert.equal(advancePlayback(8,14,0),8); // pause / first frame
assert.equal(advancePlayback(8,14,-1),8);
assert.equal(advancePlayback(0,96,2,6),12);
console.log('PASS: first launch, decision holds, pause/resume, complete-run replay and frame-independent playback.');
