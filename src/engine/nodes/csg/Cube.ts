/**
 * Creates a cube.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {csgVec3MultScalar} from '../../../core/geometry/csg/math/CsgMathVec3';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import {CoreMath} from '../../../core/math/_Module';
const {cuboid, roundedCuboid} = jscad.primitives;

class CubeCsgParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		step,
	}); /** @param sizes */
	sizes = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param bevel */
	rounded = ParamConfig.BOOLEAN(0);
	/** @param bevel radius */
	roundedRadius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
	/** @param bevel segments */
	roundedSegments = ParamConfig.INTEGER(4, {
		range: [1, 8],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
}
const ParamsConfig = new CubeCsgParamsConfig();

export class CubeCsgNode extends TypedCsgNode<CubeCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cube';
	}

	private _center: jscad.maths.vec3.Vec3 = [0, 0, 0];
	private _sizes: jscad.maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		vector3ToCsgVec3(this.pv.center, this._center);
		vector3ToCsgVec3(this.pv.sizes, this._sizes);
		csgVec3MultScalar(this._sizes, this.pv.size);
		try {
			const cuboidOptions: jscad.primitives.CuboidOptions = {
				center: this._center,
				size: this._sizes,
			};
			const createRoundedCuboid = () => {
				const maxSize =
					Math.min(this._sizes[0], this._sizes[1], this._sizes[2]) * 0.5 - 2 * jscad.maths.constants.EPS;
				const minSize = 2 * jscad.maths.constants.EPS;
				const roundRadius = CoreMath.clamp(this.pv.roundedRadius, minSize, maxSize);
				const roundedCuboidOptions: jscad.primitives.RoundedCuboidOptions = {
					...cuboidOptions,
					roundRadius,
					segments: this.pv.roundedSegments * 4,
				};
				return roundedCuboid(roundedCuboidOptions);
			};
			const geo = this.pv.rounded ? createRoundedCuboid() : cuboid(cuboidOptions);
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
