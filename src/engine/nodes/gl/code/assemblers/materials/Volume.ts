import {UniformsUtils} from 'three';
import {ShaderMaterial} from 'three';
import {BaseShaderAssemblerVolume} from './_BaseVolume';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
import {FrontSide} from 'three';
import {addUserDataRenderHook} from '../../../../../../core/geometry/Material';
import {VolumeController} from '../../../../mat/utils/VolumeController';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {GlobalsGlNode} from '../../../Globals';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {BaseGLDefinition, UniformGLDefinition} from '../../../utils/GLDefinition';
import {MapUtils} from '../../../../../../core/MapUtils';

import VERTEX from '../../../gl/volume/vert.glsl';
import FRAGMENT from '../../../gl/volume/frag.glsl';
import {VOLUME_UNIFORMS} from '../../../gl/volume/uniforms';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '// start builder body code'],
	[ShaderName.FRAGMENT, '// start builder body code'],
]);
const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([[ShaderName.FRAGMENT, []]]);

export class ShaderAssemblerVolume extends BaseShaderAssemblerVolume {
	override templateShader() {
		return {
			vertexShader: VERTEX,
			fragmentShader: FRAGMENT,
			uniforms: UniformsUtils.clone(VOLUME_UNIFORMS),
		};
	}
	override createMaterial() {
		const template_shader = this.templateShader();
		const material = new ShaderMaterial({
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
			side: FrontSide,
			transparent: true,
			depthTest: true,
			uniforms: UniformsUtils.clone(template_shader.uniforms),
		});

		addUserDataRenderHook(material, VolumeController.renderHook.bind(VolumeController));

		this._addCustomMaterials(material);
		return material;
	}

	// static add_output_inputs(output_child: OutputGlNode) {
	// 	// adding the color here would require to understand how to have the color affect the light in raymarch_light
	// 	// output_child.params.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
	// 	// output_child.params.add_param(ParamType.VECTOR3, 'position', [0, 0, 0], {hidden: true});
	// 	// output_child.params.add_param(ParamType.FLOAT, 'density', 1, {hidden: true});
	// }
	override add_output_inputs(output_child: OutputGlNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			new GlConnectionPoint('density', GlConnectionPointType.FLOAT, 1),
		]);
	}
	static override create_globals_node_output_connections() {
		return [
			new GlConnectionPoint('position', GlConnectionPointType.VEC3),
			new GlConnectionPoint('pos_normalized', GlConnectionPointType.VEC3),
			new GlConnectionPoint('time', GlConnectionPointType.FLOAT),
		];
	}
	override create_globals_node_output_connections() {
		return ShaderAssemblerVolume.create_globals_node_output_connections();
	}

	protected override insertBodyAfter(shader_name: ShaderName): string | undefined {
		return INSERT_BODY_AFTER_MAP.get(shader_name);
	}
	protected override linesToRemove(shader_name: ShaderName): string[] | undefined {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
	override create_shader_configs(): ShaderConfig[] {
		return [
			new ShaderConfig(ShaderName.VERTEX, [], []),
			new ShaderConfig(ShaderName.FRAGMENT, [/*'color', */ 'density'], [ShaderName.VERTEX]),
		];
	}
	static override create_variable_configs() {
		return [
			new VariableConfig('position', {
				// default_from_attribute: true,
				// prefix: 'vec3 transformed = ',
			}),
			// new VariableConfig('color', {
			// 	prefix: 'BUILDER_color.xyz = ',
			// }),
			new VariableConfig('density', {
				prefix: 'density *= ',
			}),
		];
	}
	override create_variable_configs(): VariableConfig[] {
		return ShaderAssemblerVolume.create_variable_configs();
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
						MapUtils.pushOnArrayAtEntry(definitions_by_shader_name, globals_shader_name, definition);
					}

					body_line = `float ${var_name} = ${output_name}`;
					for (const dependency of dependencies) {
						MapUtils.pushOnArrayAtEntry(definitions_by_shader_name, dependency, definition);
						MapUtils.pushOnArrayAtEntry(body_lines_by_shader_name, dependency, body_line);
					}

					body_lines.push(body_line);
					this.setUniformsTimeDependent();
					break;
				// case 'gl_FragCoord':
				// 	this.handle_gl_FragCoord(body_lines, shader_name, var_name);
				// 	break;

				case 'position':
					if (shader_name == ShaderName.FRAGMENT) {
						body_lines.push(`vec3 ${var_name} = position_for_step`);
					}
					break;
				case 'pos_normalized':
					if (shader_name == ShaderName.FRAGMENT) {
						body_lines.push(
							`vec3 ${var_name} = (position_for_step - u_BoundingBoxMax) / (u_BoundingBoxMax - u_BoundingBoxMin)`
						);
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
