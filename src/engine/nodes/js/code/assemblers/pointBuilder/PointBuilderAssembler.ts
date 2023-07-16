import {Vector3} from 'three';
import {JsAssemblerBasePointBuilder} from './_BasePointBuilderAssembler';
import {JsShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {PointBuilderAssemblerConstant, PointVariable} from './PointBuilderAssemblerCommon';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import type {OutputJsNode} from '../../../Output';
import type {GlobalsJsNode} from '../../../Globals';
import {AttributeJsNodeInput} from '../../../Attribute';

export class JsAssemblerPointBuilder extends JsAssemblerBasePointBuilder {
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
			new JsConnectionPoint(PointVariable.POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(PointVariable.NORMAL, JsConnectionPointType.VECTOR3),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(PointVariable.POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(PointVariable.NORMAL, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(PointVariable.PTNUM, JsConnectionPointType.INT),
			new JsConnectionPoint(PointVariable.OBJNUM, JsConnectionPointType.INT),
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
					PointVariable.POSITION,
					PointVariable.NORMAL,
					// attribute
					AttributeJsNodeInput.EXPORT,
				],
				[]
			),
		];
	}
	override create_variable_configs() {
		return [
			new VariableConfig(PointVariable.POSITION, {
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
					if (inputName == PointVariable.POSITION) {
						bodyLine = `${PointBuilderAssemblerConstant.POSITION}.copy(${varName})`;
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
				case PointVariable.POSITION:
				case PointVariable.NORMAL: {
					linesController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${PointBuilderAssemblerConstant.POINT_CONTAINER}.${outputName})`);
					break;
				}
				case PointVariable.OBJNUM:
				case PointVariable.PTNUM: {
					bodyLines.push(`${varName}= ${PointBuilderAssemblerConstant.POINT_CONTAINER}.${outputName}`);
				}
			}
		}
		linesController._addBodyLines(globalsNode, bodyLines);
	}
}
