/**
 * Copies a geometry onto every point from the right input.
 *
 * @remarks
 * Creates an instance geometry, but instancing the geometry in the left input onto every point from the right input. This is a great way to display a lot of geometries on screen with little performance penalty.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeContext} from '../../poly/NodeContext';
import {InstanceSopOperation} from '../../../core/operations/sop/Instance';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = InstanceSopOperation.DEFAULT_PARAMS;
class InstanceSopParamsConfig extends NodeParamsConfig {
	/** @param attributes to copy to the instance */
	attributes_to_copy = ParamConfig.STRING(DEFAULT.attributes_to_copy);
	/** @param toggles on to apply a material. This is useful in most cases, but there may be situations where the material would be apply later, such as when you are feeding this node to a particles system */
	apply_material = ParamConfig.BOOLEAN(DEFAULT.apply_material);
	/** @param material to apply */
	material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
		visibleIf: {apply_material: 1},
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new InstanceSopParamsConfig();

export class InstanceSopNode extends TypedSopNode<InstanceSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'instance';
	}

	static displayed_input_names(): string[] {
		return ['geometry to be instanciated', 'points to instance to'];
	}

	initialize_node() {
		super.initialize_node();

		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_cloned_state(InstanceSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: InstanceSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new InstanceSopOperation(this.scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
