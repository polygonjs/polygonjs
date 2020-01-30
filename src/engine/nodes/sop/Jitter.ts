import {Vector3} from 'three/src/math/Vector3';
const THREE = {Vector3};
import {CoreGroup} from 'src/core/geometry/Group';
import {CoreMath} from 'src/core/math/_Module';
import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
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
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		core_group.points().forEach((point, i) => {
			// TODO: replace by a pseudo random
			const offset = new THREE.Vector3(
				2 * (CoreMath.rand(i * 75 + 764 + this.pv.seed) - 0.5),
				2 * (CoreMath.rand(i * 5678 + 3653 + this.pv.seed) - 0.5),
				2 * (CoreMath.rand(i * 657 + 48464 + this.pv.seed) - 0.5)
			);
			offset.normalize();
			offset.multiplyScalar(this.pv.amount);

			const new_position = point
				.position()
				.clone()
				.add(offset);
			point.set_position(new_position);
		});

		this.set_core_group(core_group);
	}
}
