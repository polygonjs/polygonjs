import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectPropertiesSopOperation} from '../../../core/operations/sop/ObjectProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
	apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
	separator = ParamConfig.SEPARATOR();
	tname = ParamConfig.BOOLEAN(DEFAULT.tname);
	name = ParamConfig.STRING(DEFAULT.name, {visible_if: {tname: true}});
	trender_order = ParamConfig.BOOLEAN(DEFAULT.trender_order);
	render_order = ParamConfig.INTEGER(DEFAULT.render_order, {
		visible_if: {trender_order: true},
		range: [0, 10],
		range_locked: [false, false],
	});
	frustrum_culled = ParamConfig.BOOLEAN(DEFAULT.frustrum_culled);
	matrix_auto_update = ParamConfig.BOOLEAN(DEFAULT.matrix_auto_update);
	visible = ParamConfig.BOOLEAN(DEFAULT.visible);
	cast_shadow = ParamConfig.BOOLEAN(DEFAULT.cast_shadow);
	receive_shadow = ParamConfig.BOOLEAN(DEFAULT.receive_shadow);
}
const ParamsConfig = new ObjectPropertiesSopParamsConfig();

export class ObjectPropertiesSopNode extends TypedSopNode<ObjectPropertiesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'object_properties';
	}

	static displayed_input_names(): string[] {
		return ['objects to change properties of'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(ObjectPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ObjectPropertiesSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ObjectPropertiesSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
