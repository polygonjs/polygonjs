/**
 * a subnet can contain many nodes and is very useful to organise other nodes
 *
 *
 *
 */
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedJsNode, BaseJsNodeType} from './_Base';
import {JsConnectionPointType, JS_CONNECTION_POINT_TYPES} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NetworkChildNodeType, NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {SubnetInputJsNode} from './SubnetInput';
import {SubnetOutputJsNode} from './SubnetOutput';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {rangeStartEnd} from '../../../core/ArrayUtils';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';
import type {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {LineType} from './code/utils/LineType';
import {TypedNodeTraverser} from '../utils/shaders/NodeTraverser';
import {JsCodeBuilder} from './code/utils/CodeBuilder';
import {BaseJsDefinition} from './utils/JsDefinition';
import {AddBodyLinesOptions} from './code/utils/LinesController';

export const ADD_BODY_LINES_OPTIONS: AddBodyLinesOptions = {
	makeUniq: false,
};

function visibleIfInputsCountAtLeast(index: number) {
	return {
		visibleIf: rangeStartEnd(index + 1, 10).map((i) => ({inputsCount: i})),
	};
}

function inputTypeParam(index: number) {
	return ParamConfig.INTEGER(JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
		separatorBefore: true,
		...visibleIfInputsCountAtLeast(index),
	});
}

function inputNameParam(index: number) {
	return ParamConfig.STRING(`input${index}`, {
		...visibleIfInputsCountAtLeast(index),
	});
}

export function TypedSubnetJsParamsConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		main = ParamConfig.FOLDER();
		time = ParamConfig.FLOAT(0, {
			step: 0.001,
		});
		inputs = ParamConfig.FOLDER();
		inputsCount = ParamConfig.INTEGER(1, {
			range: [0, 10],
			rangeLocked: [true, true],
		});
		inputType0 = inputTypeParam(0);
		inputName0 = inputNameParam(0);
		inputType1 = inputTypeParam(1);
		inputName1 = inputNameParam(1);
		inputType2 = inputTypeParam(2);
		inputName2 = inputNameParam(2);
		inputType3 = inputTypeParam(3);
		inputName3 = inputNameParam(3);
		inputType4 = inputTypeParam(4);
		inputName4 = inputNameParam(4);
		inputType5 = inputTypeParam(5);
		inputName5 = inputNameParam(5);
		inputType6 = inputTypeParam(6);
		inputName6 = inputNameParam(6);
		inputType7 = inputTypeParam(7);
		inputName7 = inputNameParam(7);
		inputType8 = inputTypeParam(8);
		inputName8 = inputNameParam(8);
		inputType9 = inputTypeParam(9);
		inputName9 = inputNameParam(9);
		spare = ParamConfig.FOLDER();
	};
}
class TypedSubnetJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {}
export class AbstractTypedSubnetJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	protected override _childrenControllerContext = NodeContext.JS;

	override initializeNode() {
		this.childrenController?.setOutputNodeFindMethod(() => {
			return this.nodesByType(SubnetOutputJsNode.type())[0];
		});

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	protected _expectedInputTypes(): JsConnectionPointType[] {
		return [];
	}
	protected _expectedInputName(index: number) {
		return 'default';
	}

	protected _expectedOutputTypes() {
		return this._expectedInputTypes();
	}

	protected _expectedOutputName(index: number) {
		return this._expectedInputName(index);
	}
	//
	//
	// defines the outputs for the child subnet input
	//
	//
	childExpectedInputConnectionPointTypes() {
		return this._expectedInputTypes();
	}
	childExpectedOutputConnectionPointTypes() {
		return this._expectedOutputTypes();
	}
	childExpectedInputConnectionPointName(index: number) {
		return this._expectedInputName(index);
	}
	childExpectedOutputConnectionPointName(index: number) {
		return this._expectedOutputName(index);
	}

	//
	//
	// CHILDREN
	//
	//
	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}
}

export class TypedSubnetJsNode<K extends TypedSubnetJsParamsConfig> extends AbstractTypedSubnetJsNode<K> {
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	protected _inputTypeParams(): IntegerParam[] {
		return [
			this.p.inputType0,
			this.p.inputType1,
			this.p.inputType2,
			this.p.inputType3,
			this.p.inputType4,
			this.p.inputType5,
			this.p.inputType6,
			this.p.inputType7,
			this.p.inputType8,
			this.p.inputType9,
		];
	}
	protected _inputNameParams(): StringParam[] {
		return [
			this.p.inputName0,
			this.p.inputName1,
			this.p.inputName2,
			this.p.inputName3,
			this.p.inputName4,
			this.p.inputName5,
			this.p.inputName6,
			this.p.inputName7,
			this.p.inputName8,
			this.p.inputName9,
		];
	}

	setInputType(index: number, type: JsConnectionPointType) {
		const param = this._inputTypeParams()[index];
		if (!param) {
			return;
		}
		param.set(JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setInputName(index: number, inputName: string) {
		const param = this._inputNameParams()[index];
		if (!param) {
			return;
		}
		param.set(inputName);
	}

	protected _expectedInputsCount(): number {
		return this.pv.inputsCount;
	}

	protected override _expectedInputTypes(): JsConnectionPointType[] {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return rangeStartEnd(0, count).map((value, i) => JS_CONNECTION_POINT_TYPES[params[i].value]);
	}
	protected override _expectedInputName(index: number) {
		const params: StringParam[] = this._inputNameParams();
		const param = params[index];
		return param ? param.value : JsConnectionPointType.FLOAT;
	}

	protected override _expectedOutputTypes() {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return rangeStartEnd(0, count).map((value, i) => JS_CONNECTION_POINT_TYPES[params[i].value]);
	}

	protected override _expectedOutputName(index: number) {
		// return this._expected_input_name(index);
		const params: StringParam[] = this._inputNameParams();
		return params[index].value;
	}
	override setLines(linesController: JsLinesCollectionController) {
		this._setLinesPreBlock(linesController);
		this.setLinesBlockStart(linesController);
		this._setLinesBlockContent(linesController);
		this.setLinesBlockEnd(linesController);
	}
	protected linesBlockContent(linesController: JsLinesCollectionController) {
		const codeBuilder = this._runCodeBuilder(linesController);
		if (!codeBuilder) {
			return;
		}
		const shadername = linesController.currentShaderName();
		const bodyLines = codeBuilder.lines(shadername, LineType.BODY);
		return this._sanitizeBodyLines(bodyLines);
	}
	protected _setLinesPreBlock(linesController: JsLinesCollectionController) {
		if (this._traverseChildren(linesController)) {
			return;
		}
		const bodyLines: string[] = [];
		const connection_points = this.io.inputs.namedInputConnectionPoints();
		if (!connection_points) {
			return;
		}
		for (let i = 0; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			// const gl_type = connection_point.type();
			const out = this.jsVarName(connection_point.name());
			const in_value = this.variableForInput(linesController, connection_point.name());
			const body_line = `let ${out} = ${in_value}`;
			bodyLines.push(body_line);
		}

		linesController._addBodyLines(this, bodyLines);
	}
	protected setLinesBlockStart(linesController: JsLinesCollectionController) {
		if (this._traverseChildren(linesController)) {
			return;
		}
		linesController._addBodyLines(this, [`if(true){`]);
	}
	protected _setLinesBlockContent(linesController: JsLinesCollectionController) {
		const bodyLines = this.linesBlockContent(linesController);
		if (!bodyLines) {
			return;
		}
		linesController._addBodyLines(this, bodyLines, undefined, ADD_BODY_LINES_OPTIONS);
	}
	protected setLinesBlockEnd(linesController: JsLinesCollectionController) {
		if (this._traverseChildren(linesController)) {
			return;
		}
		linesController._addBodyLines(this, [`}`]);
	}

	protected _runCodeBuilder(linesController: JsLinesCollectionController) {
		// I potentially could look for attribute nodes to use as output,
		// but for now, I'll enforce a rule that attribute nodes must be at the top level
		const outputNodes: SubnetOutputJsNode[] = this.nodesByType(NetworkChildNodeType.OUTPUT);
		const functionNode = this.functionNode();
		if (!functionNode) {
			return;
		}
		if (outputNodes.length == 0) {
			functionNode.states.error.set(`${this.path()}:one output node is required`);
		}
		if (outputNodes.length > 1) {
			functionNode.states.error.set(`${this.path()}:only one output node allowed`);
		}
		const subnetOutput = outputNodes[0];
		const subnetOutputInputConnectionPoints = subnetOutput.io.inputs.namedInputConnectionPoints();

		const subnetOutputInputNames = subnetOutputInputConnectionPoints
			? subnetOutputInputConnectionPoints.map((cp) => cp.name())
			: [];

		const assembler = linesController.assembler();

		const nodeTraverser = new TypedNodeTraverser<NodeContext.JS>(
			this,
			linesController.shaderNames(),
			(rootNode, shaderName) => {
				return subnetOutputInputNames;
			}
		);
		const codeBuilder = new JsCodeBuilder(
			nodeTraverser,
			(shaderName, rootNodes) => {
				// return [subnetOutput];
				return assembler.rootNodesByShaderName(shaderName, rootNodes);
			},
			assembler
		);
		const paramNodes: BaseJsNodeType[] = [];
		codeBuilder.buildFromNodes(outputNodes, paramNodes);
		this._addCodeBuilderDefinition(codeBuilder, linesController);
		return codeBuilder;
	}
	private _addCodeBuilderDefinition(codeBuilder: JsCodeBuilder, linesController: JsLinesCollectionController) {
		const internalShadersCollectionController = codeBuilder.shadersCollectionController();
		if (!internalShadersCollectionController) {
			return;
		}
		const currentShaderName = linesController.currentShaderName();
		internalShadersCollectionController.setCurrentShaderName(currentShaderName);

		// 1- add all definitions for each shaderName
		const shaderNames = linesController.shaderNames();
		for (const shaderName of shaderNames) {
			const definitions: BaseJsDefinition[] = [];
			internalShadersCollectionController.traverseDefinitions(shaderName, (definition) => {
				// only add function if it is for the current shader
				const isNotFunction = true; //!(definition instanceof FunctionGLDefinition);
				const isCurrentShader = shaderName == currentShaderName;
				if (isNotFunction || isCurrentShader) {
					definitions.push(definition);
				}
			});
			linesController.addDefinitions(this, definitions, shaderName);
		}
		// 2- add vertex body lines if current shader name is fragment
		// if (currentShaderName != JsFunctionName.VERTEX) {
		// 	const attribNodes = this.nodesByType(GlType.ATTRIBUTE);
		// 	const bodyLines: string[] = [];
		// 	for (const attribNode of attribNodes) {
		// 		const linesForNode = internalShadersCollectionController.bodyLines(ShaderName.VERTEX, attribNode);
		// 		if (linesForNode) {
		// 			bodyLines.push(...linesForNode);
		// 		}
		// 	}
		// 	linesController.addBodyLines(this, bodyLines, ShaderName.VERTEX, ADD_BODY_LINES_OPTIONS);
		// }
	}
	setSubnetInputLines(linesController: JsLinesCollectionController, childNode: SubnetInputJsNode) {
		const outputTypes = childNode.expectedOutputTypes();
		let i = 0;

		for (const _ of outputTypes) {
			const inputName = this.inputNameForSubnetInput(i);
			const inputValue = this.variableForInput(linesController, inputName);
			const dataType = outputTypes[0];
			const varName = childNode.jsVarName(inputName);
			linesController.addBodyOrComputed(childNode, [
				{
					dataType,
					varName,
					value: inputValue,
				},
			]);
			i++;
		}
	}
	setSubnetOutputLines(linesController: JsLinesCollectionController, childNode: SubnetOutputJsNode) {
		// const bodyLines: string[] = this.subnetOutputLines(childNode);
		// shadersCollectionController.addBodyLines(childNode, bodyLines, undefined, ADD_BODY_LINES_OPTIONS);
		const inputTypes = childNode.expectedInputTypes();
		let i = 0;

		const addLineIfNotConnected = this._traverseChildren(linesController);

		for (const _ of inputTypes) {
			const inputName = childNode.expectedInputName(i);
			const inputValue = childNode.variableForInput(linesController, inputName);
			const dataType = inputTypes[0];
			const varName = this.jsVarName(this.outputNameForSubnetOutput(i) || '');

			const isInputConnected = childNode.io.inputs.named_input(inputName);
			const addLine = isInputConnected || addLineIfNotConnected;

			if (addLine) {
				linesController.addBodyOrComputed(
					childNode,
					[
						{
							dataType,
							varName,
							value: inputValue,
						},
					],
					{
						constPrefix: false,
					}
				);
			}

			i++;
		}
	}
	private _traverseChildren(linesController: JsLinesCollectionController) {
		return linesController.assembler().computedVariablesAllowed();
	}
	inputNameForSubnetInput(index: number) {
		return this._expectedInputName(index);
	}
	outputNameForSubnetOutput(index: number) {
		return this._expectedOutputName(index);
	}

	// align with the right number of tabs
	protected _sanitizeBodyLines(lines: string[]): string[] {
		return lines;
		// const level = CodeFormatter.nodeDistanceToMaterial(this);
		// const prefix = `\t`.repeat(level);

		// return lines.map((line) => {
		// 	const trimmed = line.trim();
		// 	if (trimmed.length == 0) {
		// 		return '';
		// 	} else {
		// 		return `${prefix}${trimmed}`;
		// 	}
		// });
	}
}

class SubnetJsParamsConfig extends TypedSubnetJsParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new SubnetJsParamsConfig();

export class SubnetJsNode extends TypedSubnetJsNode<SubnetJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SUBNET;
	}

	// public override outputValue(context: JsNodeTriggerContext, outputName: string) {
	// 	const subnetOutput = this.nodesByType(NetworkChildNodeType.OUTPUT)[0];
	// 	if (subnetOutput) {
	// 		return subnetOutput.outputValue(context, outputName);
	// 	} else {
	// 		return 0;
	// 	}
	// }
	// inputValueForSubnetInput(context: JsNodeTriggerContext, outputName: string) {
	// 	return this._inputValue<JsConnectionPointType>(outputName, context) || 0;
	// }
	// override inputNameForSubnetInput(index: number) {
	// 	return this._expectedInputName(index);
	// }
	// override outputNameForSubnetOutput(index: number) {
	// 	return this._expectedOutputName(index);
	// }
}
