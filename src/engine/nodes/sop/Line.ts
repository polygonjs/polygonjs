/**
 * Creates a line
 *
 */
import {Float32BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class LineSopParamsConfig extends NodeParamsConfig {
	/** @param length of the line */
	length = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param number of points */
	pointsCount = ParamConfig.INTEGER(1, {
		range: [2, 100],
		rangeLocked: [true, false],
	});
	/** @param start position of the line */
	origin = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction of the line */
	direction = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new LineSopParamsConfig();

export class LineSopNode extends TypedSopNode<LineSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'line';
	}

	override initializeNode() {}

	override cook() {
		const pointsCount = Math.max(2, this.pv.pointsCount);

		const positions: number[] = new Array(pointsCount * 3);
		const indices: number[] = new Array(pointsCount);

		const last_pt = this.pv.direction.clone().normalize().multiplyScalar(this.pv.length);

		for (let i = 0; i < pointsCount; i++) {
			const i_n = i / (pointsCount - 1);
			const point = last_pt.clone().multiplyScalar(i_n);
			point.add(this.pv.origin);
			point.toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		this.setGeometry(geometry, ObjectType.LINE_SEGMENTS);
	}
}
