/**
 * Creates id and idn attributes.
 *
 * @remarks
 *
 * This is more optimized than [sop/attribCreate](/docs/nodes/sop/attribCreate) to create id and idn attributes, although the attribCreate node can create them similarly using the following expressions:
 *
 * `@ptnum` for the id attribute
 * `@ptnum / (pointsCount(0)-1)` for the idn attribute
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {AttribIdSopOperation} from '../../operations/sop/AttribId';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribIdSopOperation.DEFAULT_PARAMS;
class AttribIdSopParamsConfig extends NodeParamsConfig {
	/** @param sets to true to create the id attribute */
	id = ParamConfig.BOOLEAN(DEFAULT.id);
	/** @param name of id attribute */
	idName = ParamConfig.STRING(DEFAULT.idName, {
		visibleIf: {id: 1},
	});
	/** @param sets to true to create the id attribute */
	idn = ParamConfig.BOOLEAN(DEFAULT.idn);
	/** @param name of the position attribute */
	/** @param name of idn attribute */
	idnName = ParamConfig.STRING(DEFAULT.idnName, {
		visibleIf: {idn: 1},
	});
}
const ParamsConfig = new AttribIdSopParamsConfig();

export class AttribIdSopNode extends TypedSopNode<AttribIdSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribId';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	private _operation: AttribIdSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribIdSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
