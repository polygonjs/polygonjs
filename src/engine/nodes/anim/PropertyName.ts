/**
 * Name of the property the animation will be applied to
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PropertyNameAnimParamsConfig extends NodeParamsConfig {
	/** @param name */
	name = ParamConfig.STRING('position');
}
const ParamsConfig = new PropertyNameAnimParamsConfig();

export class PropertyNameAnimNode extends TypedAnimNode<PropertyNameAnimParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'propertyName';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	cook(inputContents: TimelineBuilder[]) {
		const timelineBuilder = inputContents[0] || new TimelineBuilder();

		timelineBuilder.setPropertyName(this.pv.name);

		this.setTimelineBuilder(timelineBuilder);
	}
}
