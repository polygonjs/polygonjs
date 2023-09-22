import {PolyEngine} from '../../../engine/Poly';
import {GSAP_FACTORY} from './gsapFactory';
import type {GsapCoreTimelineVars} from './gsapFactory';
import {gsap} from './gsap';

export function onGsapModuleRegister(poly: PolyEngine) {
	GSAP_FACTORY.gsap = gsap;
	GSAP_FACTORY.timeline = (vars?: GsapCoreTimelineVars | undefined) => {
		return gsap.timeline(vars);
	};
}
