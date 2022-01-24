/**
 * Promotes an attribute from object to geometry or vice-versa.
 *
 * @remarks
 * The attribute can also be promoted with different modes, such as only the min, max or first found.
 *
 */
import {TypedSopNode} from './_Base';
import {AttribClassMenuEntries} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribPromoteSopOperation, AttribPromoteMode} from '../../operations/sop/AttribPromote';

const PromoteModeMenuEntries = [
	{name: 'min', value: AttribPromoteMode.MIN},
	{name: 'max', value: AttribPromoteMode.MAX},
	{name: 'first_found', value: AttribPromoteMode.FIRST_FOUND},
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribPromoteSopOperation.DEFAULT_PARAMS;
class AttribPromoteSopParamsConfig extends NodeParamsConfig {
	/** @param class the attribute is from (object or geometry) */
	classFrom = ParamConfig.INTEGER(DEFAULT.classFrom, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param class the attribute should be promoted to (object or geometry) */
	classTo = ParamConfig.INTEGER(DEFAULT.classTo, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param mode used to promote the attribute (min, max or first_found) */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: PromoteModeMenuEntries,
		},
	});
	/** @param name of the attribute to promote */
	name = ParamConfig.STRING(DEFAULT.name);
}
const ParamsConfig = new AttribPromoteSopParamsConfig();

export class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribPromote';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribPromoteSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribPromoteSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribPromoteSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
