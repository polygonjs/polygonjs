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
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren);
	separator = ParamConfig.SEPARATOR();
	/** @param toggle on to set a new name */
	tname = ParamConfig.BOOLEAN(DEFAULT.tname);
	/** @param new name */
	name = ParamConfig.STRING(DEFAULT.name, {visibleIf: {tname: true}});
	/** @param toggle on to set a new render order */
	trenderOrder = ParamConfig.BOOLEAN(DEFAULT.trenderOrder);
	/** @param render order */
	renderOrder = ParamConfig.INTEGER(DEFAULT.renderOrder, {
		visibleIf: {trenderOrder: true},
		range: [0, 10],
		rangeLocked: [false, false],
	});
	/** @param sets frustrumCulled */
	frustumCulled = ParamConfig.BOOLEAN(DEFAULT.frustumCulled);
	/** @param sets matrixAutoUpdate */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
	/** @param sets visible */
	visible = ParamConfig.BOOLEAN(DEFAULT.visible);
	/** @param sets castShadow */
	castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow);
	/** @param sets receiveShadow */
	receiveShadow = ParamConfig.BOOLEAN(DEFAULT.receiveShadow);
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
		this._operation = this._operation || new ObjectPropertiesSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
