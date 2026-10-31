# Orbital Atlas

An evidence-led AI Space & Orbital Operations academy built from ten supplied playbooks.

## Run

Serve `dist/` as a static website. There is no build step, API key or server dependency. The Sites manifest points to `dist`.

## Experience

- Ten modules, 60 evidence gates, 10 decision exercises and 30 editable artefact fields.
- 40 original playbook visuals plus a custom satellite hero and ORI cartoon flight director.
- Three orbital laboratory modes with time playback, scrubbing, inclination, altitude, viewpoint and speed controls.
- GPU Three.js rendering with perspective software 3D fallback when WebGL is unavailable.
- A connected six-decision mission with a 96-minute replay, state-dependent options, battery/thermal/propellant/attention budgets, evidence locker, event ledger, previous-run comparison and exports.
- Inspectable perspective 3D spacecraft with solar cells, thermal surfaces, antenna, imaging payload, exploded component view, eclipse lighting and an event-driven manoeuvre plume.
- Seven evidence-to-claim checks match structured arguments to actual decisions; free-text reasoning remains for human review. The original structural capstone is also retained.
- Local browser progress and JSON flight-log export. No data is sent to an AI service.

## Model and provenance

The circular two-body model uses R = 6371 km and mu = 398600.4418 km^3/s^2. T = 2*pi*sqrt(a^3/mu). The fixed Sun and cylindrical Earth shadow do not model battery, drag, perturbations or uncertainty. Spacecraft are enlarged. Constellation and encounter states are synthetic, not live telemetry. These are learning activities, not mission authorisations.

The ten original PDFs are in `dist/playbooks`. Extracted images and their PDF page numbers are indexed in `dist/assets/source-images.json`. Curriculum source-page references are in `dist/curriculum.json`.

Earth texture: NASA Blue Marble, https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg . Orbital reference: https://science.nasa.gov/solar-system/orbits-and-keplers-laws/ .

Three.js 0.170.0 is bundled, with its MIT license in `dist/THREE-LICENSE.txt`. Typefaces load from Google Fonts with system fallbacks.

## Custom generated assets

Built-in image generation was used for `dist/assets/hero.webp` (a physically plausible gold satellite over Earth, cinematic light and title-safe negative space) and `dist/assets/ori.webp` (an original friendly pearl-white cartoon robot flight director, navy face, cyan eyes, copper antenna, transparent background). Source PNGs were converted to WebP for the site.

## Verification

JavaScript syntax checks passed. Content validation confirmed ten PDFs, 40 source visuals, 60 gates, ten exercises with exactly one correct answer each, and all linked local assets. Browser checks covered home composition, module navigation, exercise feedback, three-field completion gating, local draft persistence, resource filtering, image enlargement, capstone failure and passing paths, and all software-rendered laboratory modes. GPU rendering could not be exercised because the test browser lacks WebGL. A separate embedded mobile preview was blocked by the browser environment; responsive styles were reviewed in source, not validated on a physical mobile device.

## Connected mission upgrade

The R8.1 scenario is deliberately synthetic. It is distinct from the circular-orbit laboratory: its 96-minute clock and 32–62 minute eclipse are authored training timings, not propagated spacecraft telemetry. Action costs, resource floors, ground contact, evidence arrival, and source constraints are documented in `dist/mission-case.json`. The candidate planner never gains autonomous command or fleet authority.

`mission-engine.js` contains the pure state transition and argument-review logic. `mission-scene.js` projects explicit 3D geometry using canvas; `mission-ui.js` connects decisions, replay, records, ORI and exports. Replay reads saved samples without modifying the run. Local state is versioned and existing playbook progress is preserved.

ORI now has three custom transparent poses (thinking, alert and pleased) in `dist/assets/ori-states.png`, created using built-in image generation. Expressions and text reflect decisions, evidence arrivals, resource margins and assessment outcomes; they are rule-based coaching, not an online language model. Reduced-motion settings disable decorative animation and automatic replay.

Upgrade validation: `node tests/mission.test.mjs` enumerates 206 reachable states and 116 complete paths, checking authority boundaries, resource floors, delayed effects, contact dependencies, replay immutability, emergency transfer and argument contradictions. Browser validation completed a six-stage mission and a supported argument, with direct checks of evidence arrival, contact recovery, budgets, the ledger and persistent structured drafts. The browser download event timed out, so export download completion was not independently confirmed. Mobile and GPU limitations listed above remain.

## Visual rebuild

Both scenes now share the explicit spacecraft geometry and material atlas in `dist/space-visuals.js`: a bevelled thermal bus, triple-panel articulated wings, optical instrument and nested lens baffles, radiator louvers, avionics deck, propellant tanks, high-gain dish with feed supports, navigation antenna and thrusters. The software path projects textured subdivided faces and shades them with surface normals; it is an interactive mesh rather than a flattened spacecraft picture. The WebGL laboratory consumes the same model.

The mission view retains exploded assembly, viewpoint controls and state-driven eclipse/burn effects. The laboratory adds a close tracking camera, historical orbital trail, bilinearly filtered surface texture, a separate cloud composite, ocean specular glint and atmospheric limb shading. Spacecraft attitude in the tracking camera is illustrative; the circular-orbit geometry and eclipse calculation remain the existing learning model. Night-side appearance is visual presentation, not a spacecraft thermal model.

Cloud texture: NASA Goddard Space Flight Center, Reto Stöckli / Robert Simmon Blue Marble composite, `https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg`. Context and credits: `https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/`. These are historical composites, not live weather.

The built-in image-generation tool created `design/space-materials.png`; the application loads the 590 KB WebP derivative. Prompt: square, exact four-quadrant aerospace UV atlas; crinkled gold Kapton MLI, midnight-blue photovoltaic cells with fine busbars, silver radiator channels, graphite carbon-fibre weave; perpendicular macro views, no perspective, labels or logos, diffuse studio lighting. The original generated material texture is retained for editing.

Validation: all three laboratory modes render in the software browser; the tracking camera and time slider were exercised through sunlight and eclipse, playback advances the clock, and encounter mode retains its separation readout. The mission model still passes all 116 complete decision paths. Visual QA included the new full-width spacecraft and Earth presentations. GPU rendering and physical mobile devices remain untested in this environment.

## Mission launch and playback repair

The initial mission previously exposed only a disabled Replay button, with the decisions far below the flight viewport. A visible Start mission control now opens ORI’s decision console. Committing closes the console, returns focus and scroll position to the running flight, and stops the clock at the next decision. Pause/resume, a 1/3/6 mission-minutes-per-second speed selector, record access, debrief and restart are available through the flight controls. Existing saved mission and curriculum progress remain compatible.

Playback uses elapsed time without the previous 0.1-second frame clamp, so slow rendering does not slow simulated time. Visibility changes reset the elapsed-time anchor. The textured planet uses a smaller raster during flight and restores full detail when paused. Explicit playback remains available with reduced motion; automatic playback still respects that preference.

Validation: both `node tests/mission.test.mjs` and `node tests/playback.test.mjs` pass. Browser QA exercised a fresh launch, all six decision commits to T+96, automatic holds, pause/resume, speed selection, final debrief, record access and reload persistence. The playback tests include equivalent progress at 60 and 2 frames per second.

## Integrated flight deck (v5)

Rebuilt the simulator as an integrated orbital flight deck. The live scene and inline command console share a clock, with a branching pre-commit resource forecast, recorded budget traces, an eclipse band, selectable timeline milestones, and an expanded desktop view. ORI remains a compact contextual companion beside the controls; only the deeper record, sources and final argument use a dialog.

The new software scene renders a moving textured spacecraft around a lit, cloud-covered Earth, an occluded orbital path and fading history trail. Orbital, spacecraft-tracking and ground-link views are inspectable by pointer and keyboard. Collection footprints, contact paths, authored eclipse lighting, the contingency burn and an explicitly schematic encounter overlay respond to the replayed record. Orbital radius and craft scale are enlarged; the scenario clock is authored, not a numerical orbit propagator. These overlays cannot establish real coverage, ground visibility, covariance or collision risk.

Guided flight runs the six-choice reference path with phase-specific cameras and short decision holds. It uses separate in-memory mission state and does not persist demo decisions or replace the user's saved mission. Exiting restores the exact prior run. Manual playback and choice paths remain available, and the original structured argument review is retained.

Evidence-locker availability, coaching, scene narrative and budget-trace clipping follow the displayed clock. Resource forecasts are explicitly labelled; later evidence must not leak into an earlier frame. The narrative distinguishes an uncommitted observation hold, deferral, repeated collection and a qualified product.

Validation: the original 206-state / 116-path model checks, transport tests and new mission-direction regression tests pass. Browser QA completed the guided reference flight and restored the saved initial run after reload; completed a manual contingency-burn branch to T+96; exercised forecasts, pause/resume, milestone seeking, camera changes, final debrief, expansion and DOM overflow/duplicate-ID checks. Physical mobile devices remain untested.

## Scenario and visual quality pass (v6)

Three deterministic variants share the original six-stage authority model. The proving orbit retains all original costs. The energy-squeeze case begins at 52% battery and 11°C thermal margin, charges at +0.06 points/minute and draws −0.38 in eclipse; repeat collection requires 70%, and the alternate station requires 50% to reserve enough energy through the rest of eclipse. The late-evidence case moves tracking E5 to T+78 and raises alternate-station attention to 18 minutes. At the T+70 gate, missing evidence locks continuation; an eventual E5 arrival cannot retrospectively remove a recorded hold. A separate verified human contingency can supply an earlier E5 at a reserve cost.

Each scenario has an executable guided route. Changing scenario retains the previous resource totals for labelled comparison; scenario identity persists in existing schema-2 saves. Saves without scenario identity map to the original case. Demo state remains temporary. Forecast availability also rejects transient floor crossings, even when subsequent charging could recover before the next decision.

The shared software spacecraft renderer now uses shallow triangulated foil folds, warm directional illumination, cool Earth fill, view-dependent metallic reflections, and an analytic central-body shadow. These are illustrative visual approximations, not radiometric predictions or a full ray tracer. Both software views use wider small-screen tracking framing. Enlarged labels, 44px camera controls, visible reasons for locked actions, focus outlines, keyboard commit/focus restoration, on-screen zoom/reset and responsive tablet navigation improve operation. Existing reduced-motion behavior is retained; no new automatic animation runs before an action.

Validation: all four Node test scripts pass. Scenario traversal covers 482 reachable states and 263 complete paths, with at least one assured continuation per scenario. Browser QA completed a manual delayed-evidence hold through T+96 and verified its persistence after reload; completed the reduced-power guided flight at phone width (36.6% final battery), paused/resumed, restored the saved T+0 mission, and selected/committed an action by keyboard. 390px and 768px embedded browser viewport checks show no horizontal document overflow; a small-screen spacecraft clipping defect was found and corrected. The laboratory's orbit, fleet and encounter modes, clock progression and software rendering were exercised at phone width. Physical touch devices, a screen-reader audit, sustained thermal/performance testing and the WebGL path remain unverified. No frame-rate guarantee is claimed.
