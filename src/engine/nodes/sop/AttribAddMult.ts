/**
 * Simple math operation of a numeric attribute
 *
 * @remarks
 * This allows you to quickly add and multiply a numeric attribute of the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AttribAddMultSopOperation} from '../../operations/sop/AttribAddMult';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = AttribAddMultSopOperation.DEFAULT_PARAMS;
class AttribAddMultSopParamsConfig extends NodeParamsConfig {
	/** @param attribute name */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param value to add before the multiplication */
	preAdd = ParamConfig.FLOAT(DEFAULT.preAdd, {range: [-1, 1]});
	/** @param value to multiply */
	mult = ParamConfig.FLOAT(DEFAULT.mult, {range: [-1, 1]});
	/** @param value to add after the multiplication */
	postAdd = ParamConfig.FLOAT(DEFAULT.postAdd, {range: [-1, 1]});
}
const ParamsConfig = new AttribAddMultSopParamsConfig();

export class AttribAddMultSopNode extends TypedSopNode<AttribAddMultSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_ADD_MULT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribAddMultSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribAddMultSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribAddMultSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
