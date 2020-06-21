import {Vector3} from 'three/src/math/Vector3';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreMath} from '../../../core/math/_Module';
import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CorePoint} from '../../../core/geometry/Point';
class JitterSopParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(1);
	seed = ParamConfig.INTEGER(1, {range: [0, 100]});
}
const ParamsConfig = new JitterSopParamsConfig();

export class JitterSopNode extends TypedSopNode<JitterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'jitter';
	}

	static displayed_input_names(): string[] {
		return ['geometry to jitter points of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		const points = core_group.points();
		let point: CorePoint;

		for (let i = 0; i < points.length; i++) {
			point = points[i];
			// TODO: replace by a pseudo random
			const offset = new Vector3(
				2 * (CoreMath.rand_float(i * 75 + 764 + this.pv.seed) - 0.5),
				2 * (CoreMath.rand_float(i * 5678 + 3653 + this.pv.seed) - 0.5),
				2 * (CoreMath.rand_float(i * 657 + 48464 + this.pv.seed) - 0.5)
			);
			offset.normalize();
			offset.multiplyScalar(this.pv.amount * CoreMath.rand_float(i * 78 + 54 + this.pv.seed));

			const new_position = point.position().clone().add(offset);
			point.set_position(new_position);
		}

		this.set_core_group(core_group);
	}
}
