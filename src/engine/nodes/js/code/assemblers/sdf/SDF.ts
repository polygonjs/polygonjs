import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	SingleBodyFunctionData,
	SpareParamOptions,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
// import {IUniforms} from '../../../../../../core/geometry/Material';
import {ThreeToGl} from '../../../../../../core/ThreeToGl';
// import TemplateDefault from '../../templates/textures/Default.frag.glsl';
import {JsShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../../Output';
import {GlobalsJsNode} from '../../../Globals';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
// import {UniformJsDefinition} from '../../../utils/JsDefinition';
import {Vector3} from 'three';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
// import {Vector3} from 'three';
// import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';
// import {handleCopBuilderDependencies} from '../../../../cop/utils/BuilderUtils';
// import { JSSDFSopNode } from '../../../../sop/JSSDF';

enum SDFVariable {
	D = 'd',
}

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}

${INSERT_BODY_AFTER}
`;

export class JsAssemblerSDF extends BaseJsShaderAssembler {
	// private _function: Function | undefined;
	// private _uniforms: IUniforms | undefined;
	// private _functionsByName: Map<string, Function> = new Map();
	makeFunctionNodeDirtyOnChange() {
		return true;
	}
	defaultObjectVariable(): string {
		return 'null';
	}
	defaultObject3DMaterialVariable(): string {
		return 'null';
	}
	defaultPrimitiveGraph(): string {
		return 'null';
	}

	override templateShader() {
		return {
			main: TEMPLATE,
		};
	}

	override spareParamsOptions(options: SpareParamOptions) {
		const _options: ParamOptions = {
			spare: true,
			// computeOnDirty: true, // not needed if cook option is not set
			// cook: false, // for SDFBuilder, the node needs to recook
			// important for texture nodes
			// that compute after being found by the nodepath param
			dependentOnFoundNode: true,
		};
		return _options;
	}

	functionData(): SingleBodyFunctionData | undefined {
		const functionBody = this._shaders_by_name.get(JsFunctionName.MAIN);
		if (!functionBody) {
			return;
		}
		const variableNames: string[] = [];
		const functionNames: Array<keyof NamedFunctionMap> = [];
		const variablesByName: Record<string, RegisterableVariable> = {};
		const functionsByName: Record<string, Function> = {};
		this.traverseRegisteredVariables((variable, varName) => {
			variableNames.push(varName);
			variablesByName[varName] = variable;
		});
		this.traverseRegisteredFunctions((namedFunction) => {
			functionNames.push(namedFunction.type() as keyof NamedFunctionMap);
			functionsByName[namedFunction.type()] = namedFunction.func.bind(namedFunction);
		});
		// const paramConfigs = this.param_configs();
		const paramConfigs = this.param_configs();
		return {
			functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: [...paramConfigs],
		};
	}

	// uniforms() {
	// 	return this._uniforms;
	// }

	// evalFunction(position: Vector3) {
	// 	if (this._function) {
	// 		return this._function(position);
	// 	}
	// }

	override updateFunction() {
		super.updateFunction();
		this._lines = new Map();
		this._shaders_by_name = new Map();
		// this._functionsByName.clear();
		const shaderNames = this.shaderNames();
		// for (let shader_name of shaderNames) {
		// 	if (shader_name == ShaderName.FRAGMENT) {
		// 		const template = this.templateShader().fragmentShader;
		// 		this._lines.set(shader_name, template.split('\n'));
		// 	}
		// }
		if (this._root_nodes.length > 0) {
			this.buildCodeFromNodes(this._root_nodes);
			this._buildLines();
		}

		// this._uniforms = this._uniforms || {};
		// this._gl_parent_node.scene().uniformsController.addUniforms(this._uniforms, {
		// 	paramConfigs: this.param_configs(),
		// 	additionalTextureUniforms: {},
		// 	timeDependent: this.uniformsTimeDependent(),
		// 	resolutionDependent: this.uniformsResolutionDependent(),
		// 	raymarchingLightsWorldCoordsDependent: this._raymarchingLightsWorldCoordsDependent(),
		// });

		for (const shaderName of shaderNames) {
			const lines = this._lines.get(shaderName);
			if (lines) {
				// const body = lines.join('\n');
				// // if (this.function_main_string) {
				// try {
				// 	this._function = new Function(
				// 		'position',
				// 		// 'Core',
				// 		// 'CoreType',
				// 		// 'param',
				// 		// 'methods',
				// 		// '_set_error_from_error',
				// 		`
				// 		try {
				// 			${body}
				// 		} catch(e) {
				// 			_set_error_from_error(e)
				// 			return 0;
				// 		}`
				// 	);
				// } catch (e) {
				// 	console.warn(e);
				// 	// this.set_error('cannot generate function');
				// }
				//} //else {
				// this.set_error('cannot generate function body');
				// }

				this._shaders_by_name.set(shaderName, lines.join('\n'));
			}
		}

		// ShadersCollectionController;

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
			new JsConnectionPoint(SDFVariable.D, JsConnectionPointType.FLOAT),
			// new JsConnectionPoint('alpha', JsConnectionPointType.FLOAT),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint('position', JsConnectionPointType.VECTOR3),
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
		return [new JsShaderConfig(JsFunctionName.MAIN, [SDFVariable.D], [])];
	}
	override create_variable_configs() {
		return [
			new VariableConfig(SDFVariable.D, {
				prefix: 'return ',
			}),
			// new VariableConfig('alpha', {
			// 	prefix: 'diffuseColor.a = ',
			// 	default: '1.0',
			// }),
		];
	}

	//
	//
	// TEMPLATE HOOKS
	//
	//
	// protected override insertDefineAfter(shader_name: ShaderName) {
	// 	return '// INSERT DEFINE';
	// }
	// protected override insertBodyAfter(shader_name: ShaderName) {
	// 	return '// INSERT BODY';
	// }
	// protected override linesToRemove(shader_name: ShaderName) {
	// 	return ['// INSERT DEFINE', '// INSERT BODY'];
	// }

	// private _handle_gl_FragCoord(body_lines: string[], shaderName: ShaderName, var_name: string) {
	// 	if (shaderName == ShaderName.FRAGMENT) {
	// 		body_lines.push(`vec4 ${var_name} = gl_FragCoord`);
	// 	}
	// }
	// private _handle_resolution(bodyLines: string[], shaderName: ShaderName, var_name: string) {
	// 	if (shaderName == ShaderName.FRAGMENT) {
	// 		bodyLines.push(`vec2 ${var_name} = resolution`);
	// 	}
	// }
	// private _handleUV(bodyLines: string[], shaderName: ShaderName, var_name: string) {
	// 	if (shaderName == ShaderName.FRAGMENT) {
	// 		bodyLines.push(
	// 			`vec2 ${var_name} = vec2(gl_FragCoord.x / (resolution.x-1.), gl_FragCoord.y / (resolution.y-1.))`
	// 		);
	// 	}
	// }

	override setNodeLinesOutput(outputNode: OutputJsNode, shadersCollectionController: JsLinesCollectionController) {
		const inputNames = this.inputNamesForShaderName(outputNode, shadersCollectionController.currentShaderName());
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);

				if (input) {
					const gl_var = outputNode.variableForInput(shadersCollectionController, inputName);

					let bodyLine: string | undefined;
					if (inputName == SDFVariable.D) {
						bodyLine = `return ${ThreeToGl.any(gl_var)}`;
					}
					// if (input_name == 'alpha') {
					// 	body_line = `diffuseColor.a = ${ThreeToGl.any(gl_var)}`;
					// }
					if (bodyLine) {
						shadersCollectionController._addBodyLines(outputNode, [bodyLine]);
					}
				}
			}
		}
	}

	override setNodeLinesGlobals(globalsNode: GlobalsJsNode, shadersCollectionController: JsLinesCollectionController) {
		const shaderName = shadersCollectionController.currentShaderName();
		const shaderConfig = this.shader_config(shaderName);
		if (!shaderConfig) {
			return;
		}
		const bodyLines: string[] = [];
		// const definitions: UniformJsDefinition[] = [];

		const usedOutputNames = globalsNode.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = globalsNode.jsVarName(outputName);

			switch (outputName) {
				case 'position':
					// definitions.push(new UniformJsDefinition(globals_node, JsConnectionPointType.FLOAT, output_name));
					shadersCollectionController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${outputName})`);

					// this.setUniformsTimeDependent();
					break;

				// case 'uv':
				// 	this._handleUV(body_lines, shader_name, var_name);
				// 	break;
				// case 'gl_FragCoord':
				// 	this._handle_gl_FragCoord(body_lines, shader_name, var_name);
				// 	break;
				// case 'resolution':
				// 	this._handle_resolution(body_lines, shader_name, var_name);
				// 	break;
			}
		}
		// shadersCollectionController.addDefinitions(globalsNode, definitions, shaderName);
		shadersCollectionController._addBodyLines(globalsNode, bodyLines);
	}
}
