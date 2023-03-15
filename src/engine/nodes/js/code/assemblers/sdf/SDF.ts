import {BaseJsShaderAssembler} from '../_Base';
import {IUniforms} from '../../../../../../core/geometry/Material';
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
// import TemplateDefault from '../../templates/textures/Default.frag.glsl';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../../Output';
import {GlobalsJsNode} from '../../../Globals';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {UniformJsDefinition} from '../../../utils/JsDefinition';
// import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';
// import {handleCopBuilderDependencies} from '../../../../cop/utils/BuilderUtils';
// import { JSSDFSopNode } from '../../../../sop/JSSDF';

export class JsAssemblerSDF extends BaseJsShaderAssembler {
	private _uniforms: IUniforms | undefined;

	override templateShader() {
		return {
			fragmentShader: 'TemplateDefault',
			vertexShader: undefined,
			uniforms: undefined,
		};
	}

	fragment_shader() {
		return this._shaders_by_name.get(ShaderName.FRAGMENT);
	}

	uniforms() {
		return this._uniforms;
	}

	updateFragmentShader() {
		this._lines = new Map();
		this._shaders_by_name = new Map();
		for (let shader_name of this.shaderNames()) {
			if (shader_name == ShaderName.FRAGMENT) {
				const template = this.templateShader().fragmentShader;
				this._lines.set(shader_name, template.split('\n'));
			}
		}
		if (this._root_nodes.length > 0) {
			this.buildCodeFromNodes(this._root_nodes);
			this._buildLines();
		}

		this._uniforms = this._uniforms || {};
		// this._gl_parent_node.scene().uniformsController.addUniforms(this._uniforms, {
		// 	paramConfigs: this.param_configs(),
		// 	additionalTextureUniforms: {},
		// 	timeDependent: this.uniformsTimeDependent(),
		// 	resolutionDependent: this.uniformsResolutionDependent(),
		// 	raymarchingLightsWorldCoordsDependent: this._raymarchingLightsWorldCoordsDependent(),
		// });

		for (let shader_name of this.shaderNames()) {
			const lines = this._lines.get(shader_name);
			if (lines) {
				this._shaders_by_name.set(shader_name, lines.join('\n'));
			}
		}

		// handleCopBuilderDependencies({
		// 	node: this.currentGlParentNode() as JSSDFSopNode,
		// 	timeDependent: this.uniformsTimeDependent(),
		// 	uniforms: this._uniforms as IUniformsWithTime,
		// });
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	override add_output_inputs(output_child: OutputJsNode) {
		// output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
		// output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
		output_child.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint('d', JsConnectionPointType.FLOAT),
			// new JsConnectionPoint('alpha', JsConnectionPointType.FLOAT),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint('position', JsConnectionPointType.VEC3),
			// new JsConnectionPoint('gl_FragCoord', JsConnectionPointType.VEC4),
			// new JsConnectionPoint('resolution', JsConnectionPointType.VEC2),
			// new JsConnectionPoint('time', JsConnectionPointType.FLOAT),
			// new Connection.Vec2('resolution'),
		]);
	}

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return [new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [])];
	}
	override create_variable_configs() {
		return [
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = ',
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.a = ',
				default: '1.0',
			}),
		];
	}

	//
	//
	// TEMPLATE HOOKS
	//
	//
	protected override insertDefineAfter(shader_name: ShaderName) {
		return '// INSERT DEFINE';
	}
	protected override insertBodyAfter(shader_name: ShaderName) {
		return '// INSERT BODY';
	}
	protected override linesToRemove(shader_name: ShaderName) {
		return ['// INSERT DEFINE', '// INSERT BODY'];
	}

	private _handle_gl_FragCoord(body_lines: string[], shaderName: ShaderName, var_name: string) {
		if (shaderName == ShaderName.FRAGMENT) {
			body_lines.push(`vec4 ${var_name} = gl_FragCoord`);
		}
	}
	private _handle_resolution(bodyLines: string[], shaderName: ShaderName, var_name: string) {
		if (shaderName == ShaderName.FRAGMENT) {
			bodyLines.push(`vec2 ${var_name} = resolution`);
		}
	}
	private _handleUV(bodyLines: string[], shaderName: ShaderName, var_name: string) {
		if (shaderName == ShaderName.FRAGMENT) {
			bodyLines.push(
				`vec2 ${var_name} = vec2(gl_FragCoord.x / (resolution.x-1.), gl_FragCoord.y / (resolution.y-1.))`
			);
		}
	}

	override set_node_lines_output(
		output_node: OutputJsNode,
		shaders_collection_controller: ShadersCollectionController
	) {
		const input_names = this.inputNamesForShaderName(
			output_node,
			shaders_collection_controller.currentShaderName()
		);
		if (input_names) {
			for (let input_name of input_names) {
				const input = output_node.io.inputs.named_input(input_name);

				if (input) {
					const gl_var = output_node.variableForInput(input_name);

					let body_line: string | undefined;
					if (input_name == 'color') {
						body_line = `diffuseColor.xyz = ${ThreeToGl.any(gl_var)}`;
					}
					if (input_name == 'alpha') {
						body_line = `diffuseColor.a = ${ThreeToGl.any(gl_var)}`;
					}
					if (body_line) {
						shaders_collection_controller.addBodyLines(output_node, [body_line]);
					}
				}
			}
		}
	}

	override set_node_lines_globals(
		globals_node: GlobalsJsNode,
		shaders_collection_controller: ShadersCollectionController
	) {
		const shader_name = shaders_collection_controller.currentShaderName();
		const shader_config = this.shader_config(shader_name);
		if (!shader_config) {
			return;
		}
		const body_lines: string[] = [];
		const definitions: UniformJsDefinition[] = [];

		for (let output_name of globals_node.io.outputs.used_output_names()) {
			const var_name = globals_node.jsVarName(output_name);

			switch (output_name) {
				case 'time':
					definitions.push(new UniformJsDefinition(globals_node, JsConnectionPointType.FLOAT, output_name));

					body_lines.push(`float ${var_name} = ${output_name}`);

					this.setUniformsTimeDependent();
					break;

				case 'uv':
					this._handleUV(body_lines, shader_name, var_name);
					break;
				case 'gl_FragCoord':
					this._handle_gl_FragCoord(body_lines, shader_name, var_name);
					break;
				case 'resolution':
					this._handle_resolution(body_lines, shader_name, var_name);
					break;
			}
		}

		shaders_collection_controller.addDefinitions(globals_node, definitions, shader_name);
		shaders_collection_controller.addBodyLines(globals_node, body_lines);
	}
}
