/**
 * Creates a line.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/csg/CsgVecToVector';
import {Vector2} from 'three';
const {line} = jscad.primitives;

class LineCsgParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new LineCsgParamsConfig();

export class LineCsgNode extends TypedCsgNode<LineCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'line';
	}

	private _lastPt = new Vector2();
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const pointsCount = this.pv.pointsCount;
		const positions: Vector2[] = new Array(pointsCount);

		this._lastPt.copy(this.pv.direction).normalize().multiplyScalar(this.pv.length);

		for (let i = 0; i < pointsCount; i++) {
			const i_n = i / (pointsCount - 1);
			const vector2 = new Vector2();
			positions[i] = vector2;
			vector2.copy(this._lastPt).multiplyScalar(i_n);
			vector2.add(this.pv.origin);
		}

		const vec2s: jscad.maths.vec2.Vec2[] = positions.map((v) => {
			const v2: jscad.maths.vec2.Vec2 = [3, 2];
			vector2ToCsgVec2(v, v2);
			return v2;
		});

		const geo = line(vec2s);
		this.setCsgCoreObject(geo);
	}
}
