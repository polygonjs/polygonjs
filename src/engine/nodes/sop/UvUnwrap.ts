/**
 * Unwraps UVs
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {UvUnwrapSopOperation} from '../../operations/sop/UvUnwrap';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
class UvUnwrapSopParamConfig extends NodeParamsConfig {
	uv = ParamConfig.STRING('uv');
}
const ParamsConfig = new UvUnwrapSopParamConfig();

export class UvUnwrapSopNode extends TypedSopNode<UvUnwrapSopParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return SopType.UV_UNWRAP;
	}

	static displayedInputNames(): string[] {
		return ['geometries to unwrap UVs'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(UvUnwrapSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: UvUnwrapSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new UvUnwrapSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
