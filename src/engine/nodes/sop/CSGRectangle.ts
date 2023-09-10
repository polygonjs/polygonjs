/**
 * Creates a CSG rectangle.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {primitives, maths} from '@jscad/modeling';
import {vector2ToCsgVec2} from '../../../core/geometry/modules/csg/CsgVecToVector';
import {csgVec2MultScalar} from '../../../core/geometry/modules/csg/math/CsgMathVec2';
import {CoreMath} from '../../../core/math/_Module';
const {rectangle, roundedRectangle} = primitives;

class CSGRectangleSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(1);
	/** @param sizes */
	sizes = ParamConfig.VECTOR2([1, 1]);
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param rounded */
	rounded = ParamConfig.BOOLEAN(0);
	/** @param rounded radius */
	roundedRadius = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
	/** @param rounded segments */
	roundedSegments = ParamConfig.INTEGER(1, {
		range: [1, 10],
		rangeLocked: [true, false],
		visibleIf: {rounded: 1},
	});
}
const ParamsConfig = new CSGRectangleSopParamsConfig();

export class CSGRectangleSopNode extends CSGSopNode<CSGRectangleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_RECTANGLE;
	}

	private _center: maths.vec2.Vec2 = [0, 0];
	private _sizes: maths.vec2.Vec2 = [0, 0];
	override cook(inputCoreGroups: CoreGroup[]) {
		try {
			vector2ToCsgVec2(this.pv.center, this._center);
			vector2ToCsgVec2(this.pv.sizes, this._sizes);
			csgVec2MultScalar(this._sizes, this.pv.size);
			const rectangleOptions: primitives.RectangleOptions = {
				center: this._center,
				size: this._sizes,
			};
			const createRoundedRectangle = () => {
				const maxSize = Math.min(this._sizes[0], this._sizes[1]) * 0.5 - 2 * maths.constants.EPS;
				const minSize = 2 * maths.constants.EPS;
				const roundRadius = CoreMath.clamp(this.pv.roundedRadius, minSize, maxSize);
				const roundedRectangleOptions: primitives.RoundedRectangleOptions = {
					...rectangleOptions,
					roundRadius,
					segments: this.pv.roundedSegments * 4,
				};
				return roundedRectangle(roundedRectangleOptions);
			};
			const geo = this.pv.rounded ? createRoundedRectangle() : rectangle(rectangleOptions);
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
