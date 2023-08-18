/**
 * Unwraps UVs of each input geometries one by one
 *
 * @remarks
 *
 * This node can use 2 methods to unwrap UVs:
 *
 * - potpack: this uses a very basic unwrap algorithm, and works much better preceded with a sop/Face node that will make every face separate from its neighbours
 * - xatlast: this gives better results on light geometries, but can run for a very long time on larger models.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {UvUnwrapSopOperation, UV_UNWRAP_METHODS, UvUnwrapMethod} from '../../operations/sop/UvUnwrap';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = UvUnwrapSopOperation.DEFAULT_PARAMS;
class UvUnwrapSopParamConfig extends NodeParamsConfig {
	/** @param method */
	method = ParamConfig.INTEGER(DEFAULT.method, {
		menu: {
			entries: UV_UNWRAP_METHODS.map((name, value) => ({name, value})),
		},
	});
	/** @param attribute to unwrap */
	uv = ParamConfig.STRING(DEFAULT.uv);
	/** @param target texture resolution */
	resolution = ParamConfig.INTEGER(DEFAULT.resolution, {
		range: [16, 4096],
		rangeLocked: [true, false],
		visibleIf: {
			method: UV_UNWRAP_METHODS.indexOf(UvUnwrapMethod.XATLAS),
		},
	});
	/** @param padding */
	padding = ParamConfig.INTEGER(DEFAULT.padding, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {
			method: UV_UNWRAP_METHODS.indexOf(UvUnwrapMethod.XATLAS),
		},
	});
}
const ParamsConfig = new UvUnwrapSopParamConfig();

export class UvUnwrapSopNode extends TypedSopNode<UvUnwrapSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.UV_UNWRAP;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(UvUnwrapSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: UvUnwrapSopOperation | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new UvUnwrapSopOperation(this.scene(), this.states, this);
		const coreGroup = await this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
	setMethod(method: UvUnwrapMethod) {
		this.p.method.set(UV_UNWRAP_METHODS.indexOf(method));
	}
}
