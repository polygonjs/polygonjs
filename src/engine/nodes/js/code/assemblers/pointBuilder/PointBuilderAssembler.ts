import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {OutputJsNode} from '../../../Output';
import {GlobalsJsNode} from '../../../Globals';
import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import {Vector3} from 'three';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {AttributeJsNode} from '../../../Attribute';
import {NodeContext} from '../../../../../poly/NodeContext';
import {JsType} from '../../../../../poly/registers/nodes/types/Js';
import {PointBuilderFunctionData, PointBuilderFunctionDataAttributeDataItem} from './PointBuilderPersistedConfig';
import {PrettierController} from '../../../../../../core/code/PrettierController';

export enum FunctionConstant {
	POINT_CONTAINER = 'pointContainer',
	POSITION = 'pointContainer.position',
	NORMAL = 'pointContainer.normal',
	PTNUM = 'pointContainer.ptnum',
	OBJNUM = 'pointContainer.objnum',
	ATTRIBUTES_DICT = 'attributesDict',
}
export interface PointContainer {
	position: Vector3;
	normal: Vector3;
	ptnum: number;
	objnum: number;
}

export enum PointVariable {
	POSITION = 'position',
	NORMAL = 'normal',
	PTNUM = 'ptnum',
	OBJNUM = 'objnum',
}

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}
${INSERT_CONSTRUCTOR_AFTER}
const CustomPointBuilderEvaluator = function(){
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return CustomPointBuilderEvaluator;`;

export class JsAssemblerPointBuilder extends BaseJsShaderAssembler {
	makeFunctionNodeDirtyOnChange() {
		return true;
	}
	override templateShader() {
		return {
			fragmentShader: TEMPLATE,
			vertexShader: undefined,
			uniforms: undefined,
		};
	}

	override spareParamsOptions() {
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

	functionData(): PointBuilderFunctionData | undefined {
		// const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		const _buildFunctionBody = () => {
			const bodyLines = this._shaders_by_name.get(ShaderName.FRAGMENT) || TEMPLATE;
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

		// gather attribute data
		const attribNodes: AttributeJsNode[] = [];
		this._gl_parent_node.childrenController?.traverseChildren((child) => {
			if (child.context() == NodeContext.JS && child.type() == JsType.ATTRIBUTE) {
				attribNodes.push(child as AttributeJsNode);
			}
		});
		const attributesRead: PointBuilderFunctionDataAttributeDataItem[] = attribNodes
			.filter((n) => n.isImporting())
			.map((attribNode) => attribNode.attribData());
		const attributesWrite: PointBuilderFunctionDataAttributeDataItem[] = attribNodes
			.filter((n) => n.isExporting())
			.map((attribNode) => attribNode.attribData());

		// const paramConfigs = this.param_configs();
		const paramConfigs = this.param_configs();
		return {
			functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: [...paramConfigs],
			attributesData: {
				read: attributesRead,
				write: attributesWrite,
			},
		};
	}

	override updateFunction() {
		super.updateFunction();
		this._lines = new Map();
		this._shaders_by_name = new Map();
		const shaderNames = this.shaderNames();

		if (this._root_nodes.length > 0) {
			this.buildCodeFromNodes(this._root_nodes);
			this._buildLines();
		}

		for (let shaderName of shaderNames) {
			const lines = this._lines.get(shaderName);
			if (lines) {
				this._shaders_by_name.set(shaderName, lines.join('\n'));
			}
		}
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
			new ShaderConfig(
				ShaderName.FRAGMENT,
				[
					PointVariable.POSITION,
					PointVariable.NORMAL,
					// attribute
					AttributeJsNode.INPUT_NAME,
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

	override setNodeLinesOutput(outputNode: OutputJsNode, linesController: JsLinesCollectionController) {
		const inputNames = this.inputNamesForShaderName(outputNode, linesController.currentShaderName());
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = outputNode.io.inputs.named_input(inputName);

				if (input) {
					const varName = outputNode.variableForInput(linesController, inputName);

					let bodyLine: string | undefined;
					if (inputName == PointVariable.POSITION) {
						bodyLine = `${FunctionConstant.POSITION}.copy(${varName})`;
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
					bodyLines.push(`${varName}.copy(${FunctionConstant.POINT_CONTAINER}.${outputName})`);
					break;
				}
				case PointVariable.OBJNUM:
				case PointVariable.PTNUM: {
					bodyLines.push(`${varName}= ${FunctionConstant.POINT_CONTAINER}.${outputName}`);
				}
			}
		}
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
		// const dataType = attributeNode.jsType();

		// export
		if (attributeNode.isExporting()) {
			const exportedValue = attributeNode.variableForInput(linesController, AttributeJsNode.INPUT_NAME);
			const bodyLine = `${FunctionConstant.ATTRIBUTES_DICT}.set('${attribName}', ${exportedValue})`;
			bodyLines.push(bodyLine);
		}

		// output
		const usedOutputNames = attributeNode.io.outputs.used_output_names();

		for (const outputName of usedOutputNames) {
			const varName = attributeNode.jsVarName(outputName);

			const bodyLine = `${varName} = ${FunctionConstant.ATTRIBUTES_DICT}.get('${attribName}')`;
			bodyLines.push(bodyLine);
		}
		linesController._addBodyLines(attributeNode, bodyLines);
	}
}
