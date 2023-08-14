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
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = MaterialPropertiesSopOperation.DEFAULT_PARAMS;
class MaterialPropertiesSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group, {
		objectMask: true,
	});

	/** @param toggle on to allow updating the side properties of the materials */
	tside = ParamConfig.BOOLEAN(DEFAULT.tside);
	/** @param defines if the material is double sided or not */
	doubleSided = ParamConfig.BOOLEAN(0, {
		visibleIf: {tside: true},
	});
	/** @param if the material is not double sided, it can be front sided, or back sided */
	front = ParamConfig.BOOLEAN(1, {visibleIf: {tside: true, doubleSided: false}});
	/** @param override the default shadowSide behavior */
	overrideShadowSide = ParamConfig.BOOLEAN(DEFAULT.overrideShadowSide, {visibleIf: {tside: true}});
	/** @param defines which side(s) are used when rendering shadows */
	shadowDoubleSided = ParamConfig.BOOLEAN(DEFAULT.shadowDoubleSided, {
		visibleIf: {tside: true, overrideShadowSide: true},
	});
	/** @param if the material is not double sided, it can be front sided, or back sided, when computing shadows */
	shadowFront = ParamConfig.BOOLEAN(1, {
		visibleIf: {tside: true, overrideShadowSide: true, shadowDoubleSided: false},
	});

	/** @param toggle on to allow updating the wireframe properties of the materials */
	twireframe = ParamConfig.BOOLEAN(DEFAULT.twireframe);
	/** @param defines if the material is double sided or not */
	wireframe = ParamConfig.BOOLEAN(DEFAULT.wireframe, {
		visibleIf: {twireframe: true},
	});
}
const ParamsConfig = new MaterialPropertiesSopParamsConfig();

export class MaterialPropertiesSopNode extends TypedSopNode<MaterialPropertiesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.MATERIAL_PROPERTIES;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MaterialPropertiesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MaterialPropertiesSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new MaterialPropertiesSopOperation(this.scene(), this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}
