import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {OutlinePass} from '../../../../modules/three/examples/jsm/postprocessing/OutlinePass';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OutlinePostParamsConfig extends NodeParamsConfig {
	edge_strength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		range_locked: [true, false],
		...PostParamOptions,
	});
	// no edge glow, since I haven't found a way to make it pretty
	// edge_glow = ParamConfig.FLOAT(0, {
	// 	range: [0, 1],
	// 	range_locked: [true, false],
	// 	...PostParamOptions,
	// });
	pulse_period = ParamConfig.FLOAT(0, {
		range: [0, 5],
		range_locked: [true, false],
		...PostParamOptions,
	});
	visible_edge_color = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	hidden_edge_color = ParamConfig.COLOR([0, 0, 0], {
		...PostParamOptions,
	});
}
const ParamsConfig = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode<OutlinePass, OutlinePostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'outline';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new OutlinePass(
			new Vector2(context.resolution.x, context.resolution.y),
			context.scene,
			context.camera,
			context.scene.children
		);
		return pass;
	}
	update_pass(pass: OutlinePass) {
		pass.edgeStrength = this.pv.edge_strength;
		pass.pulsePeriod = this.pv.pulse_period;
		pass.visibleEdgeColor = this.pv.visible_edge_color;
		pass.hiddenEdgeColor = this.pv.hidden_edge_color;
	}
}
