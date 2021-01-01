/**
 * Update properties from the THREE OBJECT3D from the input
 *
 * @remarks
 * This can update properties such as name, visible, renderOrder.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectPropertiesSopOperation} from '../../../core/operations/sop/ObjectProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to apply recursively to children */
	apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children);
	separator = ParamConfig.SEPARATOR();
	/** @param toggle on to set a new name */
	tname = ParamConfig.BOOLEAN(DEFAULT.tname);
	/** @param new name */
	name = ParamConfig.STRING(DEFAULT.name, {visibleIf: {tname: true}});
	/** @param toggle on to set a new render order */
	trender_order = ParamConfig.BOOLEAN(DEFAULT.trender_order);
	/** @param render order */
	render_order = ParamConfig.INTEGER(DEFAULT.render_order, {
		visibleIf: {trender_order: true},
		range: [0, 10],
		rangeLocked: [false, false],
	});
	/** @param sets frustrumCulled */
	frustrum_culled = ParamConfig.BOOLEAN(DEFAULT.frustrum_culled);
	/** @param sets matrixAutoUpdate */
	matrix_auto_update = ParamConfig.BOOLEAN(DEFAULT.matrix_auto_update);
	/** @param sets visible */
	visible = ParamConfig.BOOLEAN(DEFAULT.visible);
	/** @param sets castShadow */
	cast_shadow = ParamConfig.BOOLEAN(DEFAULT.cast_shadow);
	/** @param sets receiveShadow */
	receive_shadow = ParamConfig.BOOLEAN(DEFAULT.receive_shadow);
}
const ParamsConfig = new ObjectPropertiesSopParamsConfig();

export class ObjectPropertiesSopNode extends TypedSopNode<ObjectPropertiesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'objectProperties';
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
		this.setCoreGroup(core_group);
	}
}
