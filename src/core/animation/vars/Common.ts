import {AnimNodeEasing} from '../Constant';
import {TimelineBuilder} from '../TimelineBuilder';

export function animBuilderCommonVars(timelineBuilder: TimelineBuilder) {
	const duration = timelineBuilder.duration();
	const vars: gsap.TweenVars = {duration: duration};

	// easing
	const easing = timelineBuilder.easing() || AnimNodeEasing.NONE;
	if (easing) {
		vars.ease = easing;
	}

	// delay
	const delay = timelineBuilder.delay();
	if (delay != null) {
		vars.delay = delay;
	}

	// repeat
	const repeatParams = timelineBuilder.repeatParams();
	if (repeatParams) {
		vars.repeat = repeatParams.count;
		vars.repeatDelay = repeatParams.delay;
		vars.yoyo = repeatParams.yoyo;
	}

	return vars;
}
