/**
 * Update properties from the THREE OBJECT3D from the input
 *
 * @remarks
 * This can update properties such as name, visible, renderOrder.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectPropertiesSopOperation} from '../../operations/sop/ObjectProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = ObjectPropertiesSopOperation.DEFAULT_PARAMS;
class ObjectPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to apply recursively to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});

	/** @param toggle on to set a new name */
	tname = ParamConfig.BOOLEAN(DEFAULT.tname);
	/** @param new name */
	name = ParamConfig.STRING(DEFAULT.name, {
		visibleIf: {tname: true},
		separatorAfter: true,
	});

	/** @param toggle on to set a new render order */
	trenderOrder = ParamConfig.BOOLEAN(DEFAULT.trenderOrder);
	/** @param render order */
	renderOrder = ParamConfig.INTEGER(DEFAULT.renderOrder, {
		visibleIf: {trenderOrder: true},
		range: [0, 10],
		rangeLocked: [false, false],
		separatorAfter: true,
	});

	/** @param toggle on to allow to set frustrumCulled */
	tfrustumCulled = ParamConfig.BOOLEAN(DEFAULT.tfrustumCulled);
	/** @param sets frustrumCulled */
	frustumCulled = ParamConfig.BOOLEAN(DEFAULT.frustumCulled, {
		visibleIf: {tfrustumCulled: true},
		separatorAfter: true,
	});

	/** @param toggle on to allow to set matrixAutoUpdate */
	tmatrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.tmatrixAutoUpdate);
	/** @param sets matrixAutoUpdate */
	matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate, {
		visibleIf: {tmatrixAutoUpdate: true},
		separatorAfter: true,
	});

	/** @param toggle on to allow to set visible */
	tvisible = ParamConfig.BOOLEAN(DEFAULT.tvisible);
	/** @param sets visible */
	visible = ParamConfig.BOOLEAN(DEFAULT.visible, {
		visibleIf: {tvisible: true},
		separatorAfter: true,
	});

	/** @param toggle on to allow to set castShadow */
	tcastShadow = ParamConfig.BOOLEAN(DEFAULT.tcastShadow);
	/** @param sets castShadow */
	castShadow = ParamConfig.BOOLEAN(DEFAULT.castShadow, {
		visibleIf: {tcastShadow: true},
		separatorAfter: true,
	});

	/** @param toggle on to allow to set receiveShadow */
	treceiveShadow = ParamConfig.BOOLEAN(DEFAULT.treceiveShadow);
	/** @param sets receiveShadow */
	receiveShadow = ParamConfig.BOOLEAN(DEFAULT.receiveShadow, {visibleIf: {treceiveShadow: true}});
}
const ParamsConfig = new ObjectPropertiesSopParamsConfig();

export class ObjectPropertiesSopNode extends TypedSopNode<ObjectPropertiesSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'objectProperties';
	}

	static displayedInputNames(): string[] {
		return ['objects to change properties of'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(ObjectPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: ObjectPropertiesSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new ObjectPropertiesSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
