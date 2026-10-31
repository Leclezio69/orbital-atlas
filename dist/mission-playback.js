// UI transport is separate from the immutable mission record.
export function playbackControls(state, time, playing) {
  if (playing) return {action:'pause', label:'Ⅱ Pause flight', status:'FLIGHT RUNNING', help:`Flying to T+${state.time}. ${state.ended?"The clock stops at the final handover.":"The clock pauses at the next decision."}`};
  if (time < state.time) return {action:'resume', label:'▶ Resume flight', status:'PLAYBACK PAUSED', help:`Resume the recorded flight, or jump to the latest decision.`};
  if (state.ended) return {action:'replay', label:'↻ Replay mission', status:'MISSION COMPLETE', help:'Review the debrief, replay your flight, or start another run.'};
  if (state.time === 0) return {action:'decision', label:'▶ Start mission', status:'READY TO LAUNCH', help:'Choose your first action, then run the flight. ORI will guide you through six decision holds.'};
  return {action:'decision', label:`Make decision ${state.stage + 1} →`, status:'AWAITING YOUR DECISION', help:'Flight has reached a decision hold. Choose an action to continue the orbit.'};
}

// Use elapsed time rather than a capped frame delta: rendering load must not stall the clock.
export function advancePlayback(time, target, elapsedSeconds, rate = 3) {
  return Math.min(target, time + Math.max(0, elapsedSeconds) * rate);
}
