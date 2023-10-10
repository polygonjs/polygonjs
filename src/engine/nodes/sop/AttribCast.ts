/**
 * Cast the BufferAttribute of the index geometry property
 *

 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribCastSopOperation, ATTRIB_TYPES} from '../../operations/sop/AttribCast';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribCastSopOperation.DEFAULT_PARAMS;
class IndexCastSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to cast attributes */
	castAttributes = ParamConfig.BOOLEAN(DEFAULT.castAttributes);
	/** @param attrib mask */
	mask = ParamConfig.STRING(DEFAULT.mask, {
		visibleIf: {castAttributes: 1},
	});
	/** @param toggle on to cast index */
	castIndex = ParamConfig.BOOLEAN(DEFAULT.castIndex);
	/** @param type of attribute to cast to */
	type = ParamConfig.INTEGER(DEFAULT.type, {
		menu: {
			entries: ATTRIB_TYPES.map((name, value) => {
				return {
					name: name as string,
					value: value,
				};
			}),
		},
	});
}
const ParamsConfig = new IndexCastSopParamsConfig();

export class AttribCastSopNode extends TypedSopNode<IndexCastSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribCast';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribCastSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribCastSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribCastSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
