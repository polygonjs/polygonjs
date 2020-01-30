import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import lodash_range from 'lodash/range';
import {TypedSopNode} from './_Base';
import {CoreConstant} from 'src/core/geometry/Constant';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {CoreGroup} from 'src/core/geometry/Group';
class BboxScatterSopParamsConfig extends NodeParamsConfig {
	step_size = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new BboxScatterSopParamsConfig();

export class BboxScatterSopNode extends TypedSopNode<BboxScatterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'bbox_scatter';
	}

	static displayed_input_names(): string[] {
		return ['geometry to create points from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const container = input_contents[0];
		// const group = container.group();

		const step_size = this.pv.step_size;
		// jitter = @_param_jitter

		const bbox = container.bounding_box();

		const range = {
			x: lodash_range(bbox.min.x, bbox.max.x, step_size),
			y: lodash_range(bbox.min.y, bbox.max.y, step_size),
			z: lodash_range(bbox.min.z, bbox.max.z, step_size),
		};

		// create buffer geometry
		// const vertices_count = range.x * range.y * range.z;
		const positions: number[] = [];
		range.x.forEach((x) => {
			range.y.forEach((y) => {
				range.z.forEach((z) => {
					positions.push(x);
					positions.push(y);
					positions.push(z);
				});
			});
		});

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));

		this.set_geometry(geometry, CoreConstant.OBJECT_TYPE.POINTS);
	}
}
