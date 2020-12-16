/**
 * Adds or remove parents from the object hierarchy.
 *
 * @remarks
 * This can be useful after importing a geometry from a File SOP, where the part we want to manipulate is under one or several parents. This allows to extract it to make it available for other nodes.
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {HierarchySopOperation, HIERARCHY_MODES} from '../../../core/operations/sop/Hierarchy';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = HierarchySopOperation.DEFAULT_PARAMS;
class HierarchySopParamsConfig extends NodeParamsConfig {
	/** @param defines if parent objects will be added or removed */
	mode = ParamConfig.INTEGER(DEFAULT.mode, {
		menu: {
			entries: HIERARCHY_MODES.map((m, i) => {
				return {name: m, value: i};
			}),
		},
	});
	/** @param defines how many parent objects will be added or removed */
	levels = ParamConfig.INTEGER(DEFAULT.levels, {range: [0, 5]});
}
const ParamsConfig = new HierarchySopParamsConfig();

export class HierarchySopNode extends TypedSopNode<HierarchySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hierarchy';
	}

	static displayed_input_names(): string[] {
		return ['geometry to add or remove parents to/from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(HierarchySopOperation.INPUT_CLONED_STATE);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.mode, this.p.levels], () => {
					return `${HIERARCHY_MODES[this.pv.mode]} ${this.pv.levels}`;
				});
			});
		});
	}

	private _operation: HierarchySopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new HierarchySopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
