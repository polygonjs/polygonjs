import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import lodash_times from 'lodash/times';

import {TypedSopNode} from './_Base';
import {CoreConstant} from 'src/core/geometry/Constant';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class LineSopParamsConfig extends NodeParamsConfig {
	length = ParamConfig.FLOAT(1, {range: [0, 10]});
	points_count = ParamConfig.INTEGER(1, {
		range: [2, 100],
		range_locked: [true, false],
	});
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	direction = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new LineSopParamsConfig();

export class LineSopNode extends TypedSopNode<LineSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'line';
	}

	initialize_node() {}

	cook() {
		const points_count = Math.max(2, this.pv.points_count);

		const positions: number[] = new Array(points_count * 3);
		const indices: number[] = new Array(points_count);

		const last_pt = this.pv.direction
			.clone()
			.normalize()
			.multiplyScalar(this.pv.length);

		lodash_times(points_count, (i) => {
			const i_n = i / (points_count - 1);
			const point = last_pt.clone().multiplyScalar(i_n);
			point.add(this.pv.origin);
			point.toArray(positions, i * 3);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		});
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		this.set_geometry(geometry, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
	}
}
