/**
 * Creates a spline from input points
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CurveGetPointSopOperation} from '../../operations/sop/CurveGetPoint';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SplineCurveType, SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';
const DEFAULT = CurveGetPointSopOperation.DEFAULT_PARAMS;
class CurveGetPointSopParamsConfig extends NodeParamsConfig {
	/** @param t */
	t = ParamConfig.FLOAT(DEFAULT.t, {
		range: [0, 1],
		rangeLocked: [false, false],
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
}
const ParamsConfig = new CurveGetPointSopParamsConfig();

export class CurveGetPointSopNode extends TypedSopNode<CurveGetPointSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'curveGetPoint';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(CurveGetPointSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: CurveGetPointSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CurveGetPointSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
