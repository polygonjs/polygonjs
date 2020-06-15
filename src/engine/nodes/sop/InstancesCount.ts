import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class InstancesCountSopParamsConfig extends NodeParamsConfig {
	use_max = ParamConfig.BOOLEAN(0);
	max = ParamConfig.INTEGER(1, {
		range: [0, 100],
		range_locked: [true, false],
		visible_if: {use_max: 1},
	});
}
const ParamsConfig = new InstancesCountSopParamsConfig();

export class InstancesCountSopNode extends TypedSopNode<InstancesCountSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'instances_count';
	}
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = core_group.objects_with_geo();
		for (let object of objects) {
			const geometry = object.geometry;
			if (geometry) {
				if (geometry instanceof InstancedBufferGeometry) {
					if (this.pv.use_max) {
						geometry.instanceCount = this.pv.max;
					} else {
						geometry.instanceCount = Infinity;
					}
				}
			}
		}
		this.set_core_group(core_group);
	}
}
