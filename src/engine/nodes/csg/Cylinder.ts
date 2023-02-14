/**
 * Creates a cylinder.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {primitives, maths} from '@jscad/modeling';
import {vector3ToCsgVec3} from '../../../core/geometry/csg/CsgVecToVector';
import {CoreMath} from '../../../core/math/_Module';
const {cylinder, roundedCylinder} = primitives;

class CylinderCsgParamsConfig extends NodeParamsConfig {
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param height */
	height = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param radius */
	radius = ParamConfig.FLOAT(1, {range: [0, 10]});
	/** @param segments */
	segments = ParamConfig.INTEGER(32, {
		range: [4, 128],
		rangeLocked: [true, false],
	});
	/** @param rounded */
	rounded = ParamConfig.BOOLEAN(0);
	/** @param rounded radius */
	roundedRadius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
}
const ParamsConfig = new CylinderCsgParamsConfig();

export class CylinderCsgNode extends TypedCsgNode<CylinderCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cylinder';
	}

	private _center: maths.vec3.Vec3 = [0, 0, 0];
	override cook(inputCoreGroups: CsgCoreGroup[]) {
		try {
			vector3ToCsgVec3(this.pv.center, this._center);
			const {height, radius, segments} = this.pv;
			const cylinderOptions: primitives.CylinderOptions = {
				center: this._center,
				height,
				radius,
				segments,
			};
			const createRoundedCylinder = () => {
				const maxSize = Math.min(height * 0.5 - 2 * maths.constants.EPS, radius - 2 * maths.constants.EPS);
				const minSize = 2 * maths.constants.EPS;
				const roundRadius = CoreMath.clamp(this.pv.roundedRadius, minSize, maxSize);
				const roundedCylinderOptions: primitives.RoundedCylinderOptions = {
					...cylinderOptions,
					roundRadius,
				};
				return roundedCylinder(roundedCylinderOptions);
			};

			const geo = this.pv.rounded ? createRoundedCylinder() : cylinder(cylinderOptions);
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
