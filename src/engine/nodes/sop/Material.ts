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
import {MaterialSopOperation} from '../../../core/operations/sop/Material';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = MaterialSopOperation.DEFAULT_PARAMS;
class MaterialSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING(DEFAULT.group);
	/** @param toggle on to assign the new material */
	assign_mat = ParamConfig.BOOLEAN(DEFAULT.assign_mat);
	/** @param the material node */
	material = ParamConfig.NODE_PATH(DEFAULT.material.path(), {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		visibleIf: {assign_mat: 1},
	});
	/** @param toggle on to also assign the material to children */
	apply_to_children = ParamConfig.BOOLEAN(DEFAULT.apply_to_children, {visibleIf: {assign_mat: 1}});
	// clone_mat is mostly useful when swapping tex for multiple objects which have different textures
	// but can also be used when requiring a unique material per object, when using a copy SOP
	/** @param Cloning the material would prevent the material node to have any effect on the processed geometries. But it would allow to have multiple materials, if this was used with a Copy SOP for instance */
	clone_mat = ParamConfig.BOOLEAN(DEFAULT.clone_mat, {visibleIf: {assign_mat: 1}});
	/** @param while cloning the material, you may only want to change basic properties (such as depthWrite or trasparent), but you would want to still use the same uniforms */
	share_uniforms = ParamConfig.BOOLEAN(DEFAULT.share_uniforms, {visibleIf: {assign_mat: 1, clone_mat: 1}});
	/** @param swap one texture with another */
	swap_current_tex = ParamConfig.BOOLEAN(DEFAULT.swap_current_tex);
	/** @param texture to swap */
	tex_src0 = ParamConfig.STRING(DEFAULT.tex_src0, {visibleIf: {swap_current_tex: 1}});
	/** @param texture to swap */
	tex_dest0 = ParamConfig.STRING(DEFAULT.tex_dest0, {visibleIf: {swap_current_tex: 1}});
}
const ParamsConfig = new MaterialSopParamsConfig();

export class MaterialSopNode extends TypedSopNode<MaterialSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'material';
	}

	static displayed_input_names(): string[] {
		return ['objects to assign material to'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(MaterialSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: MaterialSopOperation | undefined;
	async cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new MaterialSopOperation(this._scene, this.states);
		const core_group = await this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
