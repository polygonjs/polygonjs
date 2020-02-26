import {ShaderAssemblerRender, CustomAssemblerMap, CustomMaterialName} from './_BaseRender';

import {ShaderAssemblerCustomMeshDistance} from './CustomMeshDistance';
import {ShaderAssemblerCustomMeshDepth} from './CustomMeshDepth';
import {ShaderAssemblerCustomMeshDepthDOF} from './CustomMeshDepthDOF';
import {GlNodeFinder} from '../utils/NodeFinder';
import {ShaderMaterialWithCustomMaterials} from '../../../../../core/geometry/Material';
import {ShaderName} from '../../../utils/shaders/ShaderName';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([
	// [CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance],
	// [CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth],
	// [CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF],
]);
ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF);

export abstract class ShaderAssemblerMesh extends ShaderAssemblerRender {
	// TODO: I've noticed a case where instances would not display when those shadow shaders were exported
	// But the objects display fine if those are not assigned
	// so it could be a bug at render time (not sure if my code, threejs or hardware)
	custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
	}

	async compile_material(material: ShaderMaterialWithCustomMaterials) {
		// no need to compile if the globals handler has not been declared
		if (!this.compile_allowed()) {
			return;
		}

		const output_nodes = GlNodeFinder.find_output_nodes(this._gl_parent_node);
		if (output_nodes.length > 1) {
			this._gl_parent_node.states.error.set('only one output node allowed');
		}
		this.set_root_nodes(output_nodes);
		await this._update_shaders();

		const new_vertex_shader = this._shaders_by_name.get(ShaderName.VERTEX);
		const new_fragment_shader = this._shaders_by_name.get(ShaderName.FRAGMENT);
		if (new_vertex_shader && new_fragment_shader) {
			material.vertexShader = new_vertex_shader;
			material.fragmentShader = new_fragment_shader;
			// console.log(material.fragmentShader);
			material.uniforms = this.build_uniforms(this._template_shader?.uniforms);
			material.needsUpdate = true;
		}

		// const material = await this._assembler.get_material();
		// if (material) {
		// this._shaders_by_name.set(ShaderName.VERTEX, this._template_shader!.vertexShader!);
		// this._shaders_by_name.set(ShaderName.FRAGMENT, this._template_shader!.fragmentShader!);

		// assign custom materials
		await this.compile_custom_materials(material);
		// const custom_materials = await this.get_custom_materials();
		// const material_with_custom_materials = material as ShaderMaterialWithCustomMaterials;
		// material_with_custom_materials.custom_materials = {};
		// custom_materials.forEach((custom_material, shader_name) => {
		// 	material_with_custom_materials.custom_materials[shader_name] = custom_material;
		// });

		// material.needsUpdate = true;
		// }

		// this.create_spare_parameters();
	}
	private async _update_shaders() {
		this._shaders_by_name = new Map();
		this._lines = new Map();
		for (let shader_name of this.shader_names) {
			const template = this._template_shader_for_shader_name(shader_name);
			if (template) {
				this._lines.set(shader_name, template.split('\n'));
			}
		}
		if (this._root_nodes.length > 0) {
			// this._output_node.set_assembler(this)
			await this.build_code_from_nodes(this._root_nodes);

			this._build_lines();
		}
		// this._material.uniforms = this.build_uniforms(template_shader)
		for (let shader_name of this.shader_names) {
			const lines = this._lines.get(shader_name);
			if (lines) {
				this._shaders_by_name.set(shader_name, lines.join('\n'));
			}
		}
	}
}
