/**
 * Layout UVs of multiple objects so that they have no overlap
 *
 * @remarks
 *
 * lays out the UVs of input geometries so that they fit in a 1x1 square and do not overlap.
 *
 * @remarks
 *
 * This node can be very useful to prepare geometries to use a lightmap in their materials. A typical setup would be:
 *
 * input geometry -> sop/Face -> sop/UvUnwrap -> sop/UvLayout
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {UvLayoutSopOperation} from '../../operations/sop/UvLayout';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = UvLayoutSopOperation.DEFAULT_PARAMS;
class UvLayoutSopParamConfig extends NodeParamsConfig {
	/** @param expected map resolution */
	res = ParamConfig.INTEGER(DEFAULT.res);
	/** @param padding between uv islands, in pixels */
	padding = ParamConfig.INTEGER(DEFAULT.padding);
	/** @param uv attribute to layout */
	uv = ParamConfig.STRING(DEFAULT.uv);
	/** @param new uv attribute that will be set or created */
	uv2 = ParamConfig.STRING(DEFAULT.uv2);
}
const ParamsConfig = new UvLayoutSopParamConfig();

export class UvLayoutSopNode extends TypedSopNode<UvLayoutSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.UV_LAYOUT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(UvLayoutSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: UvLayoutSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new UvLayoutSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
