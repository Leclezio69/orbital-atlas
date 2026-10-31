// Authored variants of the same training case, not operational forecasts.
export const SCENARIOS = [
  {id:'standard',name:'01 / The proving orbit',tag:'Balanced resources',brief:'82% battery. Full shift capacity. Updated tracking arrives at T+64.',lesson:'Build a current evidence trail while preserving your operating margins.',route:['shadow','qualified','alternate','reassess','limited','integrated']},
  {id:'power',name:'02 / The energy squeeze',tag:'Conserve through eclipse',brief:'52% battery. Slower charging (+0.06/min) and higher eclipse draw (−0.38/min).',lesson:'A repeat collection is outside the energy envelope. Protect battery through eclipse; a standard-station hold can preserve more margin than an alternate route.',route:['shadow','qualified','safehold','reassess','limited','integrated']},
  {id:'latency',name:'03 / The late evidence',tag:'Evidence versus reserve',brief:'Tracking arrives at T+78, after the T+70 release gate. The alternate ground route needs 18 attention minutes.',lesson:'Waiting for tracking means holding the release at T+70. A verified human contingency can supply an earlier record, but consumes manoeuvre reserve and requires current ground contact.',route:['shadow','qualified','alternate','manual-burn','limited','integrated']}
];
export function scenarioFor(id){return SCENARIOS.find(s=>s.id===id)||SCENARIOS[0]}
export function scenarioCase(base,id='standard'){
 const c=structuredClone(base),s=scenarioFor(id);c.scenario=structuredClone(s);
 const choice=(stage,id)=>c.stages[stage].choices.find(o=>o.id===id);
 if(s.id==='power'){
  Object.assign(c.initial,{battery:52,thermalMargin:11});
  Object.assign(c.baseline.perElapsedMinute,{batterySun:.06,batteryEclipse:-.38});
  choice(1,'repeat').requires.batteryAtLeast=70;
  choice(2,'alternate').requires.batteryAtLeast=50;
  choice(2,'alternate').coaching+=' This reduced-power envelope requires 50% battery before acquiring the alternate route, to cover the rest of eclipse.';
  c.stages[1].brief+=' This shift begins with reduced battery and thermal margins; the repeat-collection envelope requires at least 70% battery.';
  c.stages[2].brief+=' Weigh the alternate-route energy cost against waiting for the standard station at T+64.';
 }
 if(s.id==='latency'){
  const route=choice(2,'alternate');route.effects.operatorMinutes=-18;route.requires.operatorMinutesAtLeast=18;
  route.coaching+=' The alternate station needs six extra attention minutes for this shift’s verification.';
  const tracking=choice(3,'reassess');tracking.delayed[0].at=78;
  tracking.delayed[0].text='At T+78 the delayed tracking and coordination record arrives. It cannot retrospectively authorise the T+70 release decision.';
  tracking.coaching='Retain the current orbit and wait for the human tracking review. E5 arrives at T+78, so the T+70 candidate release must remain held.';
  c.stages[3].brief+=' The tracking desk cannot deliver E5 before T+78. A verified human contingency remains a separate option; late evidence cannot backdate release authority.';
 }
 c.name='ATLAS / '+s.name;
 return c;
}
