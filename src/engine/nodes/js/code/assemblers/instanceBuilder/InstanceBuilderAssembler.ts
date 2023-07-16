import {Vector3, Quaternion} from 'three';
import {JsAssemblerBasePointBuilder} from '../pointBuilder/_BasePointBuilderAssembler';
import {JsShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {InstanceVariable, InstanceBuilderAssemblerConstant} from './InstanceBuilderAssemblerCommon';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import type {OutputJsNode} from '../../../Output';
import type {GlobalsJsNode} from '../../../Globals';
import {AttributeJsNodeInput} from '../../../Attribute';

export class JsAssemblerInstanceBuilder extends JsAssemblerBasePointBuilder {
	protected override _evaluatorName(): string {
		return 'CustomPointBuilderEvaluator';
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	override add_output_inputs(output_child: OutputJsNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(InstanceVariable.INSTANCE_POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(InstanceVariable.INSTANCE_QUATERNION, JsConnectionPointType.QUATERNION),
			new JsConnectionPoint(InstanceVariable.INSTANCE_SCALE, JsConnectionPointType.VECTOR3),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(InstanceVariable.INSTANCE_POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(InstanceVariable.INSTANCE_QUATERNION, JsConnectionPointType.QUATERNION),
			new JsConnectionPoint(InstanceVariable.INSTANCE_SCALE, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(InstanceVariable.PTNUM, JsConnectionPointType.INT),
			new JsConnectionPoint(InstanceVariable.OBJNUM, JsConnectionPointType.INT),
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
					InstanceVariable.INSTANCE_POSITION,
					InstanceVariable.INSTANCE_QUATERNION,
					InstanceVariable.INSTANCE_SCALE,
					// attribute
					AttributeJsNodeInput.EXPORT,
				],
				[]
			),
		];
	}
	override create_variable_configs() {
		return [
			new VariableConfig(InstanceVariable.INSTANCE_POSITION, {
				prefix: 'return ',
			}),
			new VariableConfig(InstanceVariable.INSTANCE_QUATERNION, {
				prefix: 'return ',
			}),
			new VariableConfig(InstanceVariable.INSTANCE_SCALE, {
				prefix: 'return ',
			}),
		];
	}

	//
	//
	// NODE LINES
	//
	//
	override setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {
		const inputNames = this.inputNamesForShaderName(outputNode, linesController.currentShaderName());
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);

				if (input) {
					const varName = outputNode.variableForInput(linesController, inputName);

					let bodyLine: string | undefined;
					switch (inputName) {
						case InstanceVariable.INSTANCE_POSITION: {
							bodyLine = `${InstanceBuilderAssemblerConstant.INSTANCE_POSITION}.copy(${varName})`;
							break;
						}
						case InstanceVariable.INSTANCE_QUATERNION: {
							bodyLine = `${InstanceBuilderAssemblerConstant.INSTANCE_QUATERNION}.copy(${varName})`;
							break;
						}
						case InstanceVariable.INSTANCE_SCALE: {
							bodyLine = `${InstanceBuilderAssemblerConstant.INSTANCE_SCALE}.copy(${varName})`;
							break;
						}
					}

					if (bodyLine) {
						linesController._addBodyLines(outputNode, [bodyLine]);
					}
				}
			}
		}
	}

	override setNodeLinesGlobals(globalsNode: GlobalsJsNode, linesController: JsLinesCollectionController) {
		const shaderName = linesController.currentShaderName();
		const shaderConfig = this.shader_config(shaderName);
		if (!shaderConfig) {
			return;
		}
		const bodyLines: string[] = [];

		const usedOutputNames = globalsNode.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = globalsNode.jsVarName(outputName);

			switch (outputName) {
				case InstanceVariable.INSTANCE_POSITION:
				case InstanceVariable.INSTANCE_SCALE: {
					linesController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(
						`${varName}.copy(${InstanceBuilderAssemblerConstant.POINT_CONTAINER}.${outputName})`
					);
					break;
				}
				case InstanceVariable.INSTANCE_QUATERNION: {
					linesController.addVariable(globalsNode, new Quaternion(), varName);
					bodyLines.push(
						`${varName}.copy(${InstanceBuilderAssemblerConstant.POINT_CONTAINER}.${outputName})`
					);
					break;
				}
				case InstanceVariable.OBJNUM:
				case InstanceVariable.PTNUM: {
					bodyLines.push(`${varName}= ${InstanceBuilderAssemblerConstant.POINT_CONTAINER}.${outputName}`);
				}
			}
		}
		linesController._addBodyLines(globalsNode, bodyLines);
	}
}
