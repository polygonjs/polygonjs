import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DrawRangeSopParamsConfig extends NodeParamsConfig {
	start = ParamConfig.INTEGER(0, {
		range: [0, 100],
		range_locked: [true, false],
	});
	use_count = ParamConfig.BOOLEAN(0);
	count = ParamConfig.INTEGER(0, {
		range: [0, 100],
		range_locked: [true, false],
		visible_if: {use_count: 1},
	});
}
const ParamsConfig = new DrawRangeSopParamsConfig();

export class DrawRangeSopNode extends TypedSopNode<DrawRangeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'draw_range';
	}
	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const objects = core_group.objects();
		for (let object of objects) {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				const draw_range = geometry.drawRange;
				draw_range.start = this.pv.start;
				if (this.pv.use_count) {
					draw_range.count = this.pv.count;
				} else {
					draw_range.count = Infinity;
				}
			}
		}
		this.set_core_group(core_group);
	}
}
