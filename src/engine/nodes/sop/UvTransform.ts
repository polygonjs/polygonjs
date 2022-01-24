/**
 * Transforms UVs
 *
 *
 */
import {TypedSopNode} from './_Base';
import {UvTransformSopOperation} from '../../operations/sop/UvTransform';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = UvTransformSopOperation.DEFAULT_PARAMS;
class UvTransformSopParamsConfig extends NodeParamsConfig {
	/** @param attribName */
	attribName = ParamConfig.STRING(DEFAULT.attribName);
	/** @param translate */
	t = ParamConfig.VECTOR2(DEFAULT.t.toArray());
	/** @param scale */
	s = ParamConfig.VECTOR2(DEFAULT.s.toArray());
	/** @param pivot */
	pivot = ParamConfig.VECTOR2(DEFAULT.pivot.toArray());
}
const ParamsConfig = new UvTransformSopParamsConfig();

export class UvTransformSopNode extends TypedSopNode<UvTransformSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.UV_TRANSFORM;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(UvTransformSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: UvTransformSopOperation | undefined;
	override async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new UvTransformSopOperation(this.scene(), this.states, this);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
