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

const PromoteModeMenuEntries = [
	{name: 'min', value: AttribPromoteMode.MIN},
	{name: 'max', value: AttribPromoteMode.MAX},
	{name: 'first_found', value: AttribPromoteMode.FIRST_FOUND},
];

import {AttribPromoteSopOperation, AttribPromoteMode} from '../../../core/operations/sop/AttribPromote';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribPromoteSopOperation.DEFAULT_PARAMS;
class AttribPromoteSopParamsConfig extends NodeParamsConfig {
	/** @param class the attribute is from (object or geometry) */
	class_from = ParamConfig.INTEGER(DEFAULT.class_from, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param class the attribute should be promoted to (object or geometry) */
	class_to = ParamConfig.INTEGER(DEFAULT.class_to, {
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
	params_config = ParamsConfig;
	static type() {
		return 'attribPromote';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(AttribPromoteSopOperation.INPUT_CLONED_STATE);
		// this.uiData.set_icon('sort-amount-up');

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.name, this.p.class_from, this.p.class_to], () => {
					if (this.pv.name != '') {
						const from_s = AttribClassMenuEntries.filter((entry) => entry.value == this.pv.class_from)[0]
							.name;
						const to_s = AttribClassMenuEntries.filter((entry) => entry.value == this.pv.class_to)[0].name;
						return `${this.pv.name} (${from_s} -> ${to_s})`;
					} else {
						return '';
					}
				});
			});
		});
	}

	private _operation: AttribPromoteSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribPromoteSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
