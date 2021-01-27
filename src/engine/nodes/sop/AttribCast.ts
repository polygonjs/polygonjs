/**
 * Cast the BufferAttribute of the index geometry property
 *

 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribCastSopOperation, ATTRIB_TYPES} from '../../../core/operations/sop/AttribCast';

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
	params_config = ParamsConfig;
	static type() {
		return 'attribCast';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AttribCastSopOperation.INPUT_CLONED_STATE);

		// this.uiData.set_icon('compress-arrows-alt');
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.type], () => {
					return ATTRIB_TYPES[this.pv.type];
				});
			});
		});
	}

	private _operation: AttribCastSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribCastSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
