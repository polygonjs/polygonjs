/**
 * Allows to edit properties of materials.
 *
 * @remarks
 *
 * Note that if the input node use a material created via a [MAT node](/docs/nodes/mat), and not when loading the geometry via a [File SOP](/docs/nodes/sop/file), it's important to keep in mind that materials are shared.
 * Therefore any other object also using those material will be affected.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {MaterialPropertiesSopOperation} from '../../operations/sop/MaterialProperties';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MaterialPropertiesSopOperation.DEFAULT_PARAMS;
class MaterialPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param sets if this node should search through the materials inside the whole hierarchy */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {separatorAfter: true});

	/** @param toggle on to allow updating the side properties of the materials */
	tside = ParamConfig.BOOLEAN(DEFAULT.tside);
	/** @param defines if the material is double sided or not */
	doubleSided = ParamConfig.BOOLEAN(0, {
		visibleIf: {tside: true},
	});
	/** @param if the material is not double sided, it can be front sided, or back sided */
	front = ParamConfig.BOOLEAN(1, {visibleIf: {tside: true, doubleSided: false}});
	/** @param override the default shadowSide behavior */
	overrideShadowSide = ParamConfig.BOOLEAN(0, {visibleIf: {tside: true}});
	/** @param defines which side(s) are used when rendering shadows */
	shadowDoubleSided = ParamConfig.BOOLEAN(0, {visibleIf: {tside: true, overrideShadowSide: true}});
	/** @param if the material is not double sided, it can be front sided, or back sided, when computing shadows */
	shadowFront = ParamConfig.BOOLEAN(1, {
		visibleIf: {tside: true, overrideShadowSide: true, shadowDoubleSided: false},
	});
}
const ParamsConfig = new MaterialPropertiesSopParamsConfig();

export class MaterialPropertiesSopNode extends TypedSopNode<MaterialPropertiesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'materialProperties';
	}

	static override displayedInputNames(): string[] {
		return ['objects with materials to change properties of'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MaterialPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MaterialPropertiesSopOperation | undefined;
	override async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MaterialPropertiesSopOperation(this.scene(), this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
