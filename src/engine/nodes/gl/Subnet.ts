/**
 * a subnet can contain many nodes and is very useful to organise your shaders
 *
 *
 *
 */

import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedGlNode, BaseGlNodeType} from './_Base';
import {GlConnectionPointType, GL_CONNECTION_POINT_TYPES} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlNodeType, NetworkChildNodeType, NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {SubnetOutputGlNode} from './SubnetOutput';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';
import {TypedNodeTraverser} from '../utils/shaders/NodeTraverser';
import {CodeBuilder} from './code/utils/CodeBuilder';
import {LineType} from './code/utils/LineType';
import {BaseGLDefinition, FunctionGLDefinition} from './utils/GLDefinition';
import {CodeFormatter} from './code/utils/CodeFormatter';
import {ShaderName} from '../utils/shaders/ShaderName';

function visibleIfInputsCountAtLeast(index: number) {
	return {
		visibleIf: ArrayUtils.range(index + 1, 10).map((i) => ({inputsCount: i})),
	};
}

function inputTypeParam(index: number) {
	return ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
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

export function TypedSubnetGlParamsConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
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
class TypedSubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
export class TypedSubnetGlNode<K extends TypedSubnetGlParamsConfig> extends TypedGlNode<K> {
	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		this.childrenController?.setOutputNodeFindMethod(() => {
			return this.nodesByType(SubnetOutputGlNode.type())[0];
		});

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
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

	setInputType(index: number, type: GlConnectionPointType) {
		const param = this._inputTypeParams()[index];
		if (!param) {
			return;
		}
		param.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
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

	protected _expectedInputTypes(): GlConnectionPointType[] {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => GL_CONNECTION_POINT_TYPES[params[i].value]);
	}
	protected _expectedInputName(index: number) {
		const params: StringParam[] = this._inputNameParams();
		return params[index].value;
	}

	protected _expectedOutputTypes() {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => GL_CONNECTION_POINT_TYPES[params[i].value]);
	}

	protected _expectedOutputName(index: number) {
		// return this._expected_input_name(index);
		const params: StringParam[] = this._inputNameParams();
		return params[index].value;
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
	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}

	//
	//
	// set_lines
	//
	//
	protected _setLinesPreBlock(shadersCollectionController: ShadersCollectionController) {
		const body_lines: string[] = [];
		const connection_points = this.io.inputs.namedInputConnectionPoints();
		for (let i = 0; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			const gl_type = connection_point.type();
			const out = this.glVarName(connection_point.name());
			const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
			const body_line = `${gl_type} ${out} = ${in_value}`;
			body_lines.push(body_line);
		}

		shadersCollectionController.addBodyLines(this, body_lines);
	}
	protected setLinesBlockStart(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addBodyLines(this, [`if(true){`]);
	}
	setSubnetInputLines(shadersCollectionController: ShadersCollectionController, childNode: SubnetInputGlNode) {
		const connections = this.io.connections.inputConnections();
		if (!connections) {
			return;
		}
		const body_lines: string[] = [];
		for (let connection of connections) {
			if (connection) {
				const connection_point = connection.dest_connection_point();
				const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
				const gl_type = connection_point.type();
				const out = childNode.glVarName(connection_point.name());
				const body_line = `	${gl_type} ${out} = ${in_value}`;
				body_lines.push(body_line);
			}
		}
		shadersCollectionController.addBodyLines(childNode, body_lines);
	}
	setSubnetOutputLines(shadersCollectionController: ShadersCollectionController, childNode: SubnetOutputGlNode) {
		const connections = childNode.io.connections.inputConnections();
		if (!connections) {
			return;
		}
		const body_lines: string[] = [];

		for (let connection of connections) {
			if (connection) {
				const connection_point = connection.dest_connection_point();

				const in_value = ThreeToGl.any(childNode.variableForInput(connection_point.name()));
				const out = this.glVarName(connection_point.name());
				// const body_line = `${gl_type} ${out} = ${in_value}`;
				// do not use the type, to avoid re-defining a variable that should be defined in the parent node
				const body_line = `	${out} = ${in_value}`;
				body_lines.push(body_line);
			}
		}

		shadersCollectionController.addBodyLines(childNode, body_lines);
	}

	// set_lines_block_end(shadersCollectionController: ShadersCollectionController, childNode: SubnetOutputGlNode) {
	// 	shadersCollectionController.addBodyLines(childNode, ['}']);
	// }

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const codeBuilder = this._runCodeBuilder(shadersCollectionController);
		if (!codeBuilder) {
			return;
		}
		const shadername = shadersCollectionController.currentShaderName();
		const bodyLines = codeBuilder.lines(shadername, LineType.BODY);
		this._setLinesPreBlock(shadersCollectionController);
		this.setLinesBlockStart(shadersCollectionController);
		shadersCollectionController.addBodyLines(this, this._sanitizeBodyLines(bodyLines));

		shadersCollectionController.addBodyLines(this, ['}']);
	}
	protected _runCodeBuilder(shadersCollectionController: ShadersCollectionController) {
		// I potentially could look for attribute nodes to use as output,
		// but for now, I'll enforce a rule that attribute nodes must be at the top level
		const outputNodes: SubnetOutputGlNode[] = this.nodesByType(NetworkChildNodeType.OUTPUT);
		const matNode = this.materialNode();
		if (!matNode) {
			return;
		}
		if (outputNodes.length == 0) {
			matNode.states.error.set(`${this.path()}:one output node is required`);
		}
		if (outputNodes.length > 1) {
			matNode.states.error.set(`${this.path()}:only one output node allowed`);
		}
		const subnetOutput = outputNodes[0];
		const subnetOutputInputNames = subnetOutput.io.inputs.namedInputConnectionPoints().map((cp) => cp.name());

		const assembler = shadersCollectionController.assembler();

		const nodeTraverser = new TypedNodeTraverser<NodeContext.GL>(
			this,
			shadersCollectionController.shaderNames(),
			(rootNode, shaderName) => {
				return subnetOutputInputNames;
			}
		);
		const codeBuilder = new CodeBuilder(
			nodeTraverser,
			(shaderName) => {
				return [subnetOutput];
				// return assembler.rootNodesByShaderName(shaderName);
			},
			assembler
		);
		const paramNodes: BaseGlNodeType[] = [];
		codeBuilder.buildFromNodes(outputNodes, paramNodes);
		this._addCodeBuilderDefinition(codeBuilder, shadersCollectionController);
		return codeBuilder;
	}
	private _addCodeBuilderDefinition(
		codeBuilder: CodeBuilder,
		shadersCollectionController: ShadersCollectionController
	) {
		const internalShadersCollectionController = codeBuilder.shadersCollectionController();
		if (!internalShadersCollectionController) {
			return;
		}
		const currentShaderName = shadersCollectionController.currentShaderName();

		// 1- add all definitions for each shaderName
		const shaderNames = shadersCollectionController.shaderNames();
		for (let shaderName of shaderNames) {
			const definitions: BaseGLDefinition[] = [];
			internalShadersCollectionController.traverseDefinitions(shaderName, (definition) => {
				// only add function if it is for the current shader
				const isNotFunction = !(definition instanceof FunctionGLDefinition);
				const isCurrentShader = shaderName == currentShaderName;
				if (isNotFunction || isCurrentShader) {
					definitions.push(definition);
				}
			});
			shadersCollectionController.addDefinitions(this, definitions, shaderName);
		}
		// 2- add vertex body lines if current shader name is fragment
		if (currentShaderName == ShaderName.FRAGMENT) {
			const attribNodes = this.nodesByType(GlNodeType.ATTRIBUTE);
			const bodyLines: string[] = [];
			for (let attribNode of attribNodes) {
				const linesForNode = internalShadersCollectionController.body_lines(ShaderName.VERTEX, attribNode);
				if (linesForNode) {
					bodyLines.push(...linesForNode);
				}
			}
			shadersCollectionController.addBodyLines(this, bodyLines, ShaderName.VERTEX);
		}
	}

	// align with the right number of tabs
	protected _sanitizeBodyLines(lines: string[]): string[] {
		const level = CodeFormatter.nodeDistanceToMaterial(this);
		const prefix = `\t`.repeat(level);

		return lines.map((line) => {
			const trimmed = line.trim();
			if (trimmed.length == 0) {
				return '';
			} else {
				return `${prefix}${trimmed}`;
			}
		});
	}
}

class SubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new SubnetGlParamsConfig();

export class SubnetGlNode extends TypedSubnetGlNode<SubnetGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SUBNET;
	}
}
