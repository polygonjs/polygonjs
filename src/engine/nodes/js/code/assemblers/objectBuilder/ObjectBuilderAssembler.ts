import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	SingleBodyFunctionData,
	INSERT_MEMBERS_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
	SpareParamOptions,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
import {JsShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../../Output';
import {GlobalsJsNode} from '../../../Globals';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import {Euler, Matrix4, Quaternion, Vector3} from 'three';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {Poly} from '../../../../../Poly';
import {PrettierController} from '../../../../../../core/code/PrettierController';
import {ObjectBuilderAssemblerConstant, ObjectVariable} from './ObjectBuilderAssemblerCommon';
import {AttributeJsNodeInput} from '../../../Attribute';
import type {AttributeJsNode} from '../../../Attribute';

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}
${INSERT_CONSTRUCTOR_AFTER}
const CustomObjectBuilderEvaluator = function(){
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return CustomObjectBuilderEvaluator;`;
export class JsAssemblerObjectBuilder extends BaseJsShaderAssembler {
	// private _function: Function | undefined;
	// private _uniforms: IUniforms | undefined;
	// private _functionsByName: Map<string, Function> = new Map();
	makeFunctionNodeDirtyOnChange() {
		return true;
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
		// const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		const _buildFunctionBody = () => {
			const bodyLines = this._shaders_by_name.get(JsFunctionName.MAIN) || TEMPLATE;
			const functionBodyElements = [
				bodyLines,
				// triggerableFunctionLines.join('\n'),
				// triggerFunctionLines.join('\n'),
				CLOSE_CLASS_DEFINITION,
			];
			const functionBody = PrettierController.formatJs(functionBodyElements.join('\n'));
			return functionBody;
		};
		const functionBody = _buildFunctionBody();
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
	defaultObject3DVariable(): string {
		return ObjectBuilderAssemblerConstant.OBJECT_3D;
	}
	defaultObject3DMaterialVariable(): string {
		return ObjectBuilderAssemblerConstant.MATERIAL;
	}
	defaultPointIndexVariable(): string {
		return ObjectBuilderAssemblerConstant.PTNUM;
	}

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
	override add_output_inputs(outputNode: OutputJsNode) {
		outputNode.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariable.POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(ObjectVariable.ROTATION, JsConnectionPointType.EULER),
			new JsConnectionPoint(ObjectVariable.QUATERNION, JsConnectionPointType.QUATERNION),
			new JsConnectionPoint(ObjectVariable.SCALE, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(ObjectVariable.MATRIX, JsConnectionPointType.MATRIX4),
			new JsConnectionPoint(ObjectVariable.VISIBLE, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.MATRIX_AUTO_UPDATE, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.CAST_SHADOW, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.RECEIVE_SHADOW, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.FRUSTUM_CULLED, JsConnectionPointType.BOOLEAN),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(ObjectVariable.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(ObjectVariable.POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(ObjectVariable.ROTATION, JsConnectionPointType.EULER),
			new JsConnectionPoint(ObjectVariable.QUATERNION, JsConnectionPointType.QUATERNION),
			new JsConnectionPoint(ObjectVariable.SCALE, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(ObjectVariable.MATRIX, JsConnectionPointType.MATRIX4),
			new JsConnectionPoint(ObjectVariable.VISIBLE, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.MATRIX_AUTO_UPDATE, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.CAST_SHADOW, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.RECEIVE_SHADOW, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.FRUSTUM_CULLED, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(ObjectVariable.OBJ_NUM, JsConnectionPointType.INT),
		]);
	}

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return [
			new JsShaderConfig(
				JsFunctionName.MAIN,
				[
					ObjectVariable.POSITION,
					ObjectVariable.ROTATION,
					ObjectVariable.QUATERNION,
					ObjectVariable.SCALE,
					ObjectVariable.MATRIX,
					ObjectVariable.VISIBLE,
					// attribute
					AttributeJsNodeInput.EXPORT,
				],
				[]
			),
		];
	}
	override create_variable_configs() {
		return [
			new VariableConfig(ObjectVariable.POSITION, {
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

	override setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {
		const inputNames = this.inputNamesForShaderName(outputNode, linesController.currentShaderName());
		const bodyLines: string[] = [];
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);

				if (input) {
					const varName = outputNode.variableForInput(linesController, inputName);

					switch (inputName) {
						case ObjectVariable.POSITION:
						case ObjectVariable.ROTATION:
						case ObjectVariable.QUATERNION:
						case ObjectVariable.SCALE: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName}.copy(${varName})`);
							break;
						}
						case ObjectVariable.MATRIX: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName}.copy(${varName})`);
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName}.decompose(
								${ObjectBuilderAssemblerConstant.OBJECT_3D}.position,
								${ObjectBuilderAssemblerConstant.OBJECT_3D}.quaternion,
								${ObjectBuilderAssemblerConstant.OBJECT_3D}.scale
							)`);
							break;
						}

						case ObjectVariable.VISIBLE:
						case ObjectVariable.MATRIX_AUTO_UPDATE:
						case ObjectVariable.CAST_SHADOW:
						case ObjectVariable.RECEIVE_SHADOW:
						case ObjectVariable.FRUSTUM_CULLED: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
					}
				}
			}
		}
		linesController._addBodyLines(outputNode, bodyLines);
	}

	override setNodeLinesGlobals(globalsNode: GlobalsJsNode, linesController: JsLinesCollectionController) {
		const shaderName = linesController.currentShaderName();
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
				case ObjectVariable.OBJECT_3D: {
					bodyLines.push(`${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}`);
					break;
				}
				case ObjectVariable.POSITION:
				case ObjectVariable.SCALE: {
					linesController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})`);
					break;
				}
				case ObjectVariable.ROTATION: {
					linesController.addVariable(globalsNode, new Euler(), varName);
					bodyLines.push(`${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})`);
					break;
				}
				case ObjectVariable.QUATERNION: {
					linesController.addVariable(globalsNode, new Quaternion(), varName);
					bodyLines.push(`${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})`);
					break;
				}
				case ObjectVariable.MATRIX: {
					linesController.addVariable(globalsNode, new Matrix4(), varName);
					bodyLines.push(`${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})`);
					break;
				}
				case ObjectVariable.VISIBLE:
				case ObjectVariable.MATRIX_AUTO_UPDATE:
				case ObjectVariable.CAST_SHADOW:
				case ObjectVariable.RECEIVE_SHADOW:
				case ObjectVariable.FRUSTUM_CULLED: {
					linesController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName}`);
					break;
				}
				case ObjectVariable.OBJ_NUM: {
					bodyLines.push(`${varName} = ${ObjectBuilderAssemblerConstant.OBJ_NUM}`);
					break;
				}

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
		linesController._addBodyLines(globalsNode, bodyLines);
	}
	override setNodeLinesAttribute(attributeNode: AttributeJsNode, linesController: JsLinesCollectionController) {
		const shaderName = linesController.currentShaderName();
		const shaderConfig = this.shader_config(shaderName);
		if (!shaderConfig) {
			return;
		}
		const bodyLines: string[] = [];
		const attribName = attributeNode.attributeName();
		const dataType = attributeNode.jsType();

		// export
		if (attributeNode.isExporting()) {
			const func = Poly.namedFunctionsRegister.getFunction('setObjectAttribute', attributeNode, linesController);
			const exportedValue = attributeNode.variableForInput(linesController, AttributeJsNodeInput.EXPORT);
			const bodyLine = func.asString(
				ObjectBuilderAssemblerConstant.OBJECT_3D,
				`'${attribName}'`,
				`1`,
				exportedValue,
				`'${dataType}'`
			);
			bodyLines.push(bodyLine);
		}

		// output
		const usedOutputNames = attributeNode.io.outputs.used_output_names();

		for (const outputName of usedOutputNames) {
			const varName = attributeNode.jsVarName(outputName);

			const func = Poly.namedFunctionsRegister.getFunction(
				'getObjectAttributeAutoDefault',
				attributeNode,
				linesController
			);
			const bodyLine =
				`${varName} = ` +
				func.asString(ObjectBuilderAssemblerConstant.OBJECT_3D, `'${attribName}'`, `'${dataType}'`);
			bodyLines.push(bodyLine);
		}
		linesController._addBodyLines(attributeNode, bodyLines);
	}
}
