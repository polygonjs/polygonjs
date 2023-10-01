/**
 * Creates a CSG line.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {primitives} from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/modules/csg/CsgVecToVector';
import {Vector2} from 'three';
const {line} = primitives;

const _lastPt = new Vector2();
const _pos = new Vector2();

class CSGLineSopParamsConfig extends NodeParamsConfig {
	/** @param length */
	length = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param points count */
	pointsCount = ParamConfig.INTEGER(2, {
		range: [2, 128],
		rangeLocked: [true, false],
	});
	/** @param origin */
	origin = ParamConfig.VECTOR2([0, 0]);
	/** @param direction */
	direction = ParamConfig.VECTOR2([1, 0]);
}
const ParamsConfig = new CSGLineSopParamsConfig();

export class CSGLineSopNode extends CSGSopNode<CSGLineSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_LINE;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const pointsCount = this.pv.pointsCount;
		const vec2s: maths.vec2.Vec2[] = new Array(pointsCount);

		_lastPt.copy(this.pv.direction).normalize().multiplyScalar(this.pv.length);

		for (let i = 0; i < pointsCount; i++) {
			const i_n = i / (pointsCount - 1);
			_pos.copy(_lastPt).multiplyScalar(i_n);
			_pos.add(this.pv.origin);
			const vec2: maths.vec2.Vec2 = [0, 0];
			vec2s[i] = vec2;
			vector2ToCsgVec2(_pos, vec2);
		}

		const geo = line(vec2s);
		this.setCSGGeometry(geo);
	}
}
