/**
 * Creates hexagons on a plane.
 *
 * @remarks
 * This is very similar to the plane SOP, but with hexagonal patterns, which can be more visually pleasing.
 */
import {CoreGroup} from './../../../core/geometry/Group';
import {TypedSopNode} from './_Base';
import {HexagonsSopOperation} from '../../operations/sop/Hexagons';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = HexagonsSopOperation.DEFAULT_PARAMS;
class HexagonsSopParamsConfig extends NodeParamsConfig {
	/** @param plane size */
	size = ParamConfig.VECTOR2(DEFAULT.size);
	/** @param hexagons size */
	hexagonRadius = ParamConfig.FLOAT(DEFAULT.hexagonRadius, {
		range: [0.001, 1],
		rangeLocked: [false, false],
	});
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
	/** @param do not create polygons, only points */
	pointsOnly = ParamConfig.BOOLEAN(DEFAULT.pointsOnly);
	// no need to have centers, as all points are centers anyway
	//this.add_param( ParamType.TOGGLE, 'centers_only', 0, {visibleIf: {pointsOnly: 1}})
}
const ParamsConfig = new HexagonsSopParamsConfig();

export class HexagonsSopNode extends TypedSopNode<HexagonsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'hexagons';
	}
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(HexagonsSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: HexagonsSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new HexagonsSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
