/**
 * Creates a quad plane.
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadGeometry} from '../../../core/geometry/quad/QuadGeometry';
import {Vector3} from 'three';
import {QuadPointAttribute} from '../../../core/geometry/quad/QuadPointAttribute';
import {Attribute} from '../../../core/geometry/Attribute';

const _v3 = new Vector3();

class QuadPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param sizes */
	// sizes = ParamConfig.VECTOR2([1, 1]);
}
const ParamsConfig = new QuadPlaneSopParamsConfig();

export class QuadPlaneSopNode extends QuadSopNode<QuadPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_PLANE;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geometry = new QuadGeometry();
		const size = this.pv.size;

		const positions = new Array(4 * 3);
		const indices = new Array(4);
		_v3.set(1 * size, 0, 1 * size).toArray(positions, 0);
		_v3.set(1 * size, 0, -1 * size).toArray(positions, 3);
		_v3.set(-1 * size, 0, -1 * size).toArray(positions, 6);
		_v3.set(-1 * size, 0, 1 * size).toArray(positions, 9);
		indices[0] = 0;
		indices[1] = 1;
		indices[2] = 2;
		indices[3] = 3;
		const position = new QuadPointAttribute(positions, 3);
		geometry.addPointAttribute(Attribute.POSITION, position);
		geometry.setIndex(indices);

		this.setQuadGeometry(geometry);
	}
}
