/**
 * Creates a line
 *
 */
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import lodash_times from 'lodash/times';
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LineSopParamsConfig extends NodeParamsConfig {
	/** @param length of the line */
	length = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param number of points */
	points_count = ParamConfig.INTEGER(1, {
		range: [2, 100],
		range_locked: [true, false],
	});
	/** @param start position of the line */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction of the line */
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

		const last_pt = this.pv.direction.clone().normalize().multiplyScalar(this.pv.length);

		lodash_times(points_count, (i) => {
			const i_n = i / (points_count - 1);
			const point = last_pt.clone().multiplyScalar(i_n);
			point.add(this.pv.origin);
			point.toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		});
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		this.set_geometry(geometry, ObjectType.LINE_SEGMENTS);
	}
}
