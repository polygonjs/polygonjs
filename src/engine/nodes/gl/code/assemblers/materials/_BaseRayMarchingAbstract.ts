import {GlobalsGlNode} from '../../../Globals';
import {pushOnArrayAtEntry} from '../../../../../../core/MapUtils';
import {GlConnectionPointType} from '../../../../utils/io/connections/Gl';
import {BaseGLDefinition, UniformGLDefinition} from '../../../utils/GLDefinition';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {ShaderAssemblerMaterial, CustomAssemblerMap} from './_BaseMaterial';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([]);

export abstract class BaseShaderAssemblerRayMarchingAbstract extends ShaderAssemblerMaterial {
	override customAssemblerClassByCustomName(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
	}
	override set_node_lines_globals(
		globals_node: GlobalsGlNode,
		shaders_collection_controller: ShadersCollectionController
	) {
		const body_lines = [];
		const shader_name = shaders_collection_controller.currentShaderName();
		const shader_config = this.shader_config(shader_name);
		if (!shader_config) {
			return;
		}
		const dependencies = shader_config.dependencies();

		const definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]> = new Map();

		const body_lines_by_shader_name: Map<ShaderName, string[]> = new Map();

		let definition;
		let body_line;
		for (const output_name of globals_node.io.outputs.used_output_names()) {
			const var_name = globals_node.glVarName(output_name);
			const globals_shader_name = shaders_collection_controller.currentShaderName();

			switch (output_name) {
				case 'time':
					definition = new UniformGLDefinition(globals_node, GlConnectionPointType.FLOAT, output_name);
					if (globals_shader_name) {
						pushOnArrayAtEntry(definitions_by_shader_name, globals_shader_name, definition);
					}

					body_line = `float ${var_name} = ${output_name}`;
					for (const dependency of dependencies) {
						pushOnArrayAtEntry(definitions_by_shader_name, dependency, definition);
						pushOnArrayAtEntry(body_lines_by_shader_name, dependency, body_line);
					}

					body_lines.push(body_line);
					this.setUniformsTimeDependent();
					break;
				// case 'gl_FragCoord':
				// 	this.handle_gl_FragCoord(body_lines, shader_name, var_name);
				// 	break;

				case 'position':
					if (shader_name == ShaderName.FRAGMENT) {
						body_lines.push(`vec3 ${var_name} = p`);
					}
					break;
				case 'cameraPosition':
					if (shader_name == ShaderName.FRAGMENT) {
						body_lines.push(`vec3 ${var_name} = cameraPosition`);
					}
					break;
			}
		}
		definitions_by_shader_name.forEach((definitions, shader_name) => {
			shaders_collection_controller.addDefinitions(globals_node, definitions, shader_name);
		});
		body_lines_by_shader_name.forEach((body_lines, shader_name) => {
			shaders_collection_controller.addBodyLines(globals_node, body_lines, shader_name);
		});
		shaders_collection_controller.addBodyLines(globals_node, body_lines);
	}
}
