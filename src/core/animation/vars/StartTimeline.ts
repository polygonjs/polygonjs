import {AnimatedPropertiesRegister} from '../AnimatedPropertiesRegister';
import {StartOptions} from './AnimBuilderTypes';

export function animBuilderStartTimeline(options: StartOptions) {
	const {timelineBuilder, timeline, vars, target, registerableProp, registerproperties} = options;

	const position = timelineBuilder.position();
	const positionParam = position ? position.toParameter() : undefined;
	const existingTimeline = AnimatedPropertiesRegister.registeredTimelineForProperty(registerableProp);
	const newTimeline = timeline.to(target, vars, positionParam);

	const onStart = () => {
		if (existingTimeline) {
			if (existingTimeline.stoppable) {
				existingTimeline.timeline.kill();
				AnimatedPropertiesRegister.deRegisterProp(registerableProp);
			} else {
				newTimeline.kill();
				return;
			}
		}
		if (registerproperties) {
			AnimatedPropertiesRegister.registerProp(registerableProp, {
				timeline: newTimeline,
				stoppable: timelineBuilder.stoppable(),
			});
		}
	};
	const onComplete = () => {
		AnimatedPropertiesRegister.deRegisterProp(registerableProp);
	};

	if (vars.onStart) {
		const prevOnStart = vars.onStart;
		vars.onStart = () => {
			onStart();
			prevOnStart();
		};
	} else {
		vars.onStart = onStart;
	}

	if (vars.onComplete) {
		const prevOnComplete = vars.onComplete;
		vars.onComplete = () => {
			onComplete();
			prevOnComplete();
		};
	} else {
		vars.onComplete = onComplete;
	}
}
