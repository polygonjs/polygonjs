import {gsap} from 'gsap';

interface TimelineData {
	timeline: gsap.core.Timeline;
	stoppable: boolean;
}

export {gsap, TimelineData};
