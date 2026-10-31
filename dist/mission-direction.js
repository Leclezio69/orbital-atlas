export const REFERENCE_FLIGHT=['shadow','qualified','alternate','reassess','limited','integrated'];
// Descriptions are derived from the replayed record, never future mission state.
export function flightNarrative(f){
 const t=f.time,shadow=t>=32&&t<62;
 const phase=shadow?'ECLIPSE OPERATIONS':'SUNLIT OPERATIONS';
 if(f.burn)return {phase:'CONTINGENCY MANOEUVRE',title:'The human procedure takes control.',detail:'Authorised contingency burn. Manoeuvre reserve and power are being spent.'};
 if(!f.groundContact)return {phase:'GROUND CONTACT LOST',title:'The link has gone quiet.',detail:'Fresh telemetry is unavailable. The ground path determines your next options.'};
 if(t>=84)return {phase:'HANDOVER & ASSURANCE',title:'Leave a record they can trust.',detail:'The next shift inherits your evidence, remaining resources and open obligations.'};
 if(t>=70)return {phase:'RELEASE BOUNDARY',title:f.flags.includes('releaseHeld')?'The release stays on hold.':'Evidence defines the boundary.',detail:f.flags.includes('releaseHeld')?'The existing mission baseline continues. The candidate release remains withheld.':'One spacecraft, advisory use only. No autonomous or fleet authority has been earned.'};
 if(t>=50)return {phase:shadow?'ENCOUNTER / ECLIPSE':'ENCOUNTER / REASSESSMENT',title:f.evidence.includes('E5')?'The updated record is in.':'The encounter needs evidence.',detail:f.evidence.includes('E5')?'The scoped conjunction record is available for a human release decision.':'A synthetic encounter is under review. The visual alone cannot establish collision risk.'};
 if(shadow)return {phase,title:f.safe?'A conservative hold in shadow.':'The battery carries the mission.',detail:f.safe?'The established safe-hold profile preserves the baseline while contact recovers.':'Solar input is absent in this authored interval. Watch the power margin decline.'};
 if(t>=14){
  if(f.flags.includes('collectionDeferred'))return {phase:'EARTH OBSERVATION',title:'Collection is deferred.',detail:'This branch preserves margin and returns a transparent gap notice.'};
  if(f.flags.includes('heavyPayload'))return {phase:'EARTH OBSERVATION',title:'A second chance has a cost.',detail:'Repeated collection spends power and margin. Cloud remains; the output still needs qualification.'};
  if(f.flags.includes('qualifiedProduct'))return {phase:'EARTH OBSERVATION',title:'A useful image. An honest limit.',detail:'The target is 70% obscured in the case. Unobserved ground remains unverified.'};
  return {phase:'EARTH OBSERVATION',title:'Cloud over the target.',detail:'The observation window is open. Choose how to handle a target that is 70% obscured.'};
 }
 return {phase,title:'One spacecraft. A bounded trial.',detail:'Traceable learning begins with an explicit authority boundary.'};
}
