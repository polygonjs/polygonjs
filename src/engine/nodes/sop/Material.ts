/**
 * Applies a material to objects
 *
 * @remarks
 * This can assign the material to the top level objects, but also to their children.
 *
 * This node can also be used to process input materials, without assigning a new one. This can be useful when processing a geometry imported from a File SOP. You may want to swap textures, in which case you could swap the emission texture to the color one. This would allow you to use a mesh basic material, which would be faster to render.
 */
import {TypedSopNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
import {MaterialSopOperation} from '../../operations/sop/Material';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MaterialSopOperation.DEFAULT_PARAMS;
class MaterialSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group);
	/** @param toggle on to assign the new material */
	assignMat = ParamConfig.BOOLEAN(DEFAULT.assignMat);
	/** @param the material node */
	material = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		visibleIf: {assignMat: 1},
	});
	/** @param toggle on to also assign the material to children */
	applyToChildren = ParamConfig.BOOLEAN(DEFAULT.applyToChildren, {visibleIf: {assignMat: 1}});
	// cloneMat is mostly useful when swapping tex for multiple objects which have different textures
	// but can also be used when requiring a unique material per object, when using a copy SOP
	/** @param Cloning the material would prevent the material node to have any effect on the processed geometries. But it would allow to have multiple materials, if this was used with a Copy SOP for instance */
	cloneMat = ParamConfig.BOOLEAN(DEFAULT.cloneMat, {visibleIf: {assignMat: 1}});
	/** @param while cloning the material, you may only want to change basic properties (such as depthWrite or transparent), but you would want to still use the same uniforms */
	shareUniforms = ParamConfig.BOOLEAN(DEFAULT.shareUniforms, {visibleIf: {assignMat: 1, cloneMat: 1}});
	/** @param swap one texture with another */
	swapCurrentTex = ParamConfig.BOOLEAN(DEFAULT.swapCurrentTex);
	/** @param texture to swap */
	texSrc0 = ParamConfig.STRING(DEFAULT.texSrc0, {visibleIf: {swapCurrentTex: 1}});
	/** @param texture to swap */
	texDest0 = ParamConfig.STRING(DEFAULT.texDest0, {visibleIf: {swapCurrentTex: 1}});
}
const ParamsConfig = new MaterialSopParamsConfig();

export class MaterialSopNode extends TypedSopNode<MaterialSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'material';
	}

	static displayedInputNames(): string[] {
		return ['objects to assign material to'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(MaterialSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MaterialSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MaterialSopOperation(this._scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
