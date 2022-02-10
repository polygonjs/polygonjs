/**
 * Add keyframes to an animation
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {RampParam} from '../../params/Ramp';

class KeyframesParamsConfig extends NodeParamsConfig {
	/** @param keyframes */
	keyframes = ParamConfig.RAMP(RampParam.DEFAULT_VALUE, {
		hideLabel: true,
	});
}
const ParamsConfig = new KeyframesParamsConfig();

export class KeyframesAnimNode extends TypedAnimNode<KeyframesParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'keyframes';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0] || new TimelineBuilder();
		timelineBuilder.setKeyframes(this.pv.keyframes);
		this.setTimelineBuilder(timelineBuilder);
	}
}
