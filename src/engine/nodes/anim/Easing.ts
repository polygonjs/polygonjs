/**
 * Sets easing of animation property
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {AnimNodeEasing, EASINGS, InOutMode, IN_OUT_MODES} from '../../../core/animation/Constant';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AnimType} from '../../poly/registers/nodes/types/Anim';
class EasingAnimParamsConfig extends NodeParamsConfig {
	/** @param name of easing */
	name = ParamConfig.INTEGER(EASINGS.indexOf(AnimNodeEasing.POWER4), {
		menu: {
			entries: EASINGS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param defines if the easing is 'in', 'out' or 'in-out' */
	inOut = ParamConfig.INTEGER(IN_OUT_MODES.indexOf(InOutMode.OUT), {
		menu: {
			entries: IN_OUT_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new EasingAnimParamsConfig();

export class EasingAnimNode extends TypedAnimNode<EasingAnimParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return AnimType.EASING;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}
	setEasing(mode: AnimNodeEasing) {
		this.p.name.set(EASINGS.indexOf(mode));
	}
	setInOut(inOut: InOutMode) {
		this.p.inOut.set(IN_OUT_MODES.indexOf(inOut));
	}

	static easingFullName(node: EasingAnimNode) {
		const easing = EASINGS[node.pv.name];
		if (easing == AnimNodeEasing.NONE) {
			return easing;
		}
		const in_out = IN_OUT_MODES[node.pv.inOut];
		const easing_full_name = `${easing}.${in_out}`;
		return easing_full_name;
	}

	override cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const easingFullName = EasingAnimNode.easingFullName(this);
		timeline_builder.setEasing(easingFullName);

		this.setTimelineBuilder(timeline_builder);
	}
}
