/**
 * Creates a spline from input points
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CurveFromPointsSopOperation} from '../../operations/sop/CurveFromPoints';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SplineCurveType, SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';
const DEFAULT = CurveFromPointsSopOperation.DEFAULT_PARAMS;
class CurveFromPointsSopParamsConfig extends NodeParamsConfig {
	/** @param points Count */
	pointsCount = ParamConfig.INTEGER(DEFAULT.pointsCount, {
		range: [2, 1000],
		rangeLocked: [true, false],
	});
	/** @param closed */
	closed = ParamConfig.BOOLEAN(DEFAULT.closed);
	/** @param curve type */
	curveType = ParamConfig.INTEGER(DEFAULT.curveType, {
		menu: {
			entries: SPLINE_CURVE_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param tension */
	tension = ParamConfig.FLOAT(DEFAULT.tension, {
		range: [0, 1],
		rangeLocked: [false, false],
		visibleIf: {curveType: SPLINE_CURVE_TYPES.indexOf(SplineCurveType.CATMULLROM)},
	});
	/** @param add tangent attribute */
	tTangent = ParamConfig.BOOLEAN(DEFAULT.tTangent);
	/** @param tangent attribute name */
	tangentName = ParamConfig.STRING(DEFAULT.tangentName, {
		visibleIf: {tTangent: true},
	});
	/** @param attributes */
	// attributesToInterpolate = ParamConfig.STRING(DEFAULT.attributesToInterpolate);
}
const ParamsConfig = new CurveFromPointsSopParamsConfig();

export class CurveFromPointsSopNode extends TypedSopNode<CurveFromPointsSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'curveFromPoints';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(CurveFromPointsSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CurveFromPointsSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new CurveFromPointsSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
