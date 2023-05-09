import {gsap} from 'gsap';

interface TimelineData {
	timeline: gsap.core.Timeline;
	stoppable: boolean;
}

type GsapCoreTimeline = gsap.core.Timeline;
type GsapTweenVars = gsap.TweenVars;

function gsapTimeline(vars?: gsap.TimelineVars | undefined) {
	return gsap.timeline(vars);
}

export {gsap, gsapTimeline, TimelineData, GsapCoreTimeline, GsapTweenVars};
