/**
 * Creates a plane.
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PlaneSopOperation} from '../../operations/sop/Plane';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = PlaneSopOperation.DEFAULT_PARAMS;
class PlaneSopParamsConfig extends NodeParamsConfig {
	/** @param size of the plane */
	size = ParamConfig.VECTOR2(DEFAULT.size);
	/** @param defines if the plane resolution is sets via the number of segments or via the step size */
	useSegmentsCount = ParamConfig.BOOLEAN(DEFAULT.useSegmentsCount);
	/** @param step size */
	stepSize = ParamConfig.FLOAT(DEFAULT.stepSize, {
		range: [0.001, 2],
		rangeLocked: [false, false],
		visibleIf: {useSegmentsCount: 0},
	});
	/** @param segments count */
	segments = ParamConfig.VECTOR2(DEFAULT.segments, {visibleIf: {useSegmentsCount: 1}});
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
	/** @param center of the plane */
	center = ParamConfig.VECTOR3(DEFAULT.center);
	/** @param create lines instead of polygons */
	asLines = ParamConfig.BOOLEAN(DEFAULT.asLines);
}
const ParamsConfig = new PlaneSopParamsConfig();

export class PlaneSopNode extends TypedSopNode<PlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PLANE;
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create plane from (optional)'];
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(PlaneSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: PlaneSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new PlaneSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
