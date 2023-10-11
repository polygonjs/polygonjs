import {Vector3} from 'three';
import {JsAssemblerBaseEntityBuilder} from './_BaseEntityBuilderAssembler';
import {JsShaderConfig} from '../../configs/ShaderConfig';
// import {VariableConfig} from '../../configs/VariableConfig';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {EntityBuilderAssemblerConstant, EntityVariable} from './EntityBuilderAssemblerCommon';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import type {OutputJsNode} from '../../../Output';
import type {GlobalsJsNode} from '../../../Globals';
import {AttributeJsNodeInput} from '../../../Attribute';

export class JsAssemblerEntityBuilder extends JsAssemblerBaseEntityBuilder {
	protected override _evaluatorName(): string {
		return 'CustomEntityBuilderEvaluator';
	}

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	override add_output_inputs(output_child: OutputJsNode) {
		output_child.io.inputs.setNamedInputConnectionPoints([
			// new JsConnectionPoint(EntityVariable.POSITION, JsConnectionPointType.VECTOR3),
			// new JsConnectionPoint(EntityVariable.NORMAL, JsConnectionPointType.VECTOR3),
		]);
	}
	override add_globals_outputs(globals_node: GlobalsJsNode) {
		globals_node.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(EntityVariable.POSITION, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(EntityVariable.NORMAL, JsConnectionPointType.VECTOR3),
			new JsConnectionPoint(EntityVariable.INDEX, JsConnectionPointType.INT),
			new JsConnectionPoint(EntityVariable.OBJNUM, JsConnectionPointType.INT),
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
					EntityVariable.POSITION,
					EntityVariable.NORMAL,
					// attribute
					AttributeJsNodeInput.EXPORT,
				],
				[]
			),
		];
	}
	override create_variable_configs() {
		return [
			// new VariableConfig(EntityVariable.POSITION, {
			// 	prefix: 'return ',
			// }),
			// new VariableConfig(EntityVariable.NORMAL, {
			// 	prefix: 'return ',
			// }),
		];
	}

	//
	//
	// NODE LINES
	//
	//
	override setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {
		// const inputNames = this.inputNamesForShaderName(outputNode, linesController.currentShaderName());
		// const bodyLines: string[] = [];
		// if (inputNames) {
		// 	for (const inputName of inputNames) {
		// 		const input = outputNode.io.inputs.named_input(inputName);
		// 		if (input) {
		// 			const varName = outputNode.variableForInput(linesController, inputName);
		// 			switch (inputName) {
		// 				case EntityVariable.POSITION: {
		// 					bodyLines.push(`${EntityBuilderAssemblerConstant.POSITION}.copy(${varName})`);
		// 					break;
		// 				}
		// 				case EntityVariable.NORMAL: {
		// 					bodyLines.push(`${EntityBuilderAssemblerConstant.NORMAL}.copy(${varName})`);
		// 					bodyLines.push(`${EntityBuilderAssemblerConstant.NORMALS_UPDATED} = true`);
		// 					break;
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		// linesController._addBodyLines(outputNode, bodyLines);
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
				case EntityVariable.POSITION:
				case EntityVariable.NORMAL: {
					linesController.addVariable(globalsNode, new Vector3(), varName);
					bodyLines.push(`${varName}.copy(${EntityBuilderAssemblerConstant.ENTITY_CONTAINER}.${outputName})`);
					break;
				}
				case EntityVariable.OBJNUM:
				case EntityVariable.INDEX: {
					bodyLines.push(`${varName}= ${EntityBuilderAssemblerConstant.ENTITY_CONTAINER}.${outputName}`);
				}
			}
		}
		linesController._addBodyLines(globalsNode, bodyLines);
	}
}
