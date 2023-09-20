type GsapCoreTimeline = gsap.core.Timeline;
type GsapCoreTimelineVars = gsap.TimelineVars;
type GsapTweenVars = gsap.TweenVars;

export interface GsapFactory {
	timeline: (vars?: GsapCoreTimelineVars | undefined) => GsapCoreTimeline | undefined;
}
export const GSAP_FACTORY: GsapFactory = {
	timeline: (vars?: GsapCoreTimelineVars | undefined) => {
		return undefined;
	},
};
function gsapTimeline(vars?: GsapCoreTimelineVars | undefined) {
	return GSAP_FACTORY.timeline(vars);
	// return gsap.timeline(vars);
}

export {gsapTimeline, GsapCoreTimeline, GsapCoreTimelineVars, GsapTweenVars};
