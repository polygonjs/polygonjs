type GsapCoreTimeline = gsap.core.Timeline;
type GsapCoreTimelineVars = gsap.TimelineVars;
type GsapTweenVars = gsap.TweenVars;

export interface GsapFactory {
	gsap: typeof gsap | undefined;
	timeline: (vars?: GsapCoreTimelineVars | undefined) => GsapCoreTimeline | undefined;
}
export const GSAP_FACTORY: GsapFactory = {
	gsap: undefined,
	timeline: (vars?: GsapCoreTimelineVars | undefined) => {
		return undefined;
	},
};
function gsapTimeline(vars?: GsapCoreTimelineVars | undefined) {
	return GSAP_FACTORY.timeline(vars);
	// return gsap.timeline(vars);
}
function gsapLib() {
	return GSAP_FACTORY.gsap;
}

export {gsapTimeline, gsapLib, GsapCoreTimeline, GsapCoreTimelineVars, GsapTweenVars};
