/**
 * Normalizes an attribute.
 *
 * @remarks
 * Finds the min and max of an attribute and normalizes its value between 0 and 1.
 * For vector attributes, it can also set them to a length of 1.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {
	AttribNormalizeSopOperation,
	NORMALIZE_MODES,
	NormalizeMode,
} from '../../../core/operations/sop/AttribNormalize';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribNormalizeSopOperation.DEFAULT_PARAMS;
class AttribNormalizeSopParamsConfig extends NodeParamsConfig {
	/** @param defines if the value should be normalized between 0 and 1, or for vectors if the length should be 1 */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: NORMALIZE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param attribute to normalize */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param toggle to change the name of the attribute */
	changeName = ParamConfig.BOOLEAN(DEFAULT.changeName);
	/** @param new attribute name */
	newName = ParamConfig.STRING(DEFAULT.newName, {visibleIf: {changeName: 1}});
}
const ParamsConfig = new AttribNormalizeSopParamsConfig();

export class AttribNormalizeSopNode extends TypedSopNode<AttribNormalizeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribNormalize';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribNormalizeSopOperation.INPUT_CLONED_STATE);

		this.scene().dispatchController.onAddListener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name]);
			});
		});
	}

	set_mode(mode: NormalizeMode) {
		this.p.mode.set(NORMALIZE_MODES.indexOf(mode));
	}

	private _operation: AttribNormalizeSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribNormalizeSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
