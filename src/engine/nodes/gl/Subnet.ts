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
import {NetworkNodeType, NodeContext} from '../../poly/NodeContext';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {SubnetOutputGlNode} from './SubnetOutput';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';

function visibleIfInputsCountAtLeast(index: number) {
	return {
		visibleIf: ArrayUtils.range(index + 1, 10).map((i) => ({inputsCount: i})),
	};
}
// function visibleIfOutputsCountAtLeast(index: number) {
// 	return {
// 		visibleIf: ArrayUtils.range(index + 1, 10).map((i) => ({outputsCount: i})),
// 	};
// }

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
// function outputTypeParam(index: number) {
// 	return ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
// 		menu: {
// 			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
// 				return {name: name, value: i};
// 			}),
// 		},
// 		separatorBefore: true,
// 		...visibleIfOutputsCountAtLeast(index),
// 	});
// }
function inputNameParam(index: number) {
	return ParamConfig.STRING(`input${index}`, {
		...visibleIfInputsCountAtLeast(index),
	});
}
// function outputNameParam(index: number) {
// 	return ParamConfig.STRING(`output${index}`, {
// 		...visibleIfOutputsCountAtLeast(index),
// 	});
// }

export function TypedSubnetGlParamsConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		inputs = ParamConfig.FOLDER();
		inputsCount = ParamConfig.INTEGER(1, {
			range: [1, 10],
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
		// outputs = ParamConfig.FOLDER();
		// outputsCount = ParamConfig.INTEGER(1, {
		// 	range: [0, 10],
		// 	rangeLocked: [true, true],
		// });
		// outputType0 = outputTypeParam(0);
		// outputName0 = outputNameParam(0);
		// outputType1 = outputTypeParam(1);
		// outputName1 = outputNameParam(1);
		// outputType2 = outputTypeParam(2);
		// outputName2 = outputNameParam(2);
		// outputType3 = outputTypeParam(3);
		// outputName3 = outputNameParam(3);
		// outputType4 = outputTypeParam(4);
		// outputName4 = outputNameParam(4);
		// outputType5 = outputTypeParam(5);
		// outputName5 = outputNameParam(5);
		// outputType6 = outputTypeParam(6);
		// outputName6 = outputNameParam(6);
		// outputType7 = outputTypeParam(7);
		// outputName7 = outputNameParam(7);
		// outputType8 = outputTypeParam(8);
		// outputName8 = outputNameParam(8);
		// outputType9 = outputTypeParam(9);
		// outputName9 = outputNameParam(9);
		spare = ParamConfig.FOLDER();
	};
}
class TypedSubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
export class TypedSubnetGlNode<K extends TypedSubnetGlParamsConfig> extends TypedGlNode<K> {
	protected override _childrenControllerContext = NodeContext.GL;
	override initializeNode() {
		this.childrenController?.set_output_node_find_method(() => {
			return this.nodesByType(SubnetOutputGlNode.type())[0];
		});

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _inputTypeParams(): IntegerParam[] {
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
	private _inputNameParams(): StringParam[] {
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
	// private _outputTypeParams(): IntegerParam[] {
	// 	return [
	// 		this.p.outputType0,
	// 		this.p.outputType1,
	// 		this.p.outputType2,
	// 		this.p.outputType3,
	// 		this.p.outputType4,
	// 		this.p.outputType5,
	// 		this.p.outputType6,
	// 		this.p.outputType7,
	// 		this.p.outputType8,
	// 		this.p.outputType9,
	// 	];
	// }
	// private _outputNameParams(): StringParam[] {
	// 	return [
	// 		this.p.outputName0,
	// 		this.p.outputName1,
	// 		this.p.outputName2,
	// 		this.p.outputName3,
	// 		this.p.outputName4,
	// 		this.p.outputName5,
	// 		this.p.outputName6,
	// 		this.p.outputName7,
	// 		this.p.outputName8,
	// 		this.p.outputName9,
	// 	];
	// }

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
	// setOutputType(index: number, type: GlConnectionPointType) {
	// 	const param = this._inputTypeParams()[index];
	// 	if (!param) {
	// 		return;
	// 	}
	// 	param.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
	// }
	// setOutputName(index: number, outputName: string) {
	// 	const param = this._inputNameParams()[index];
	// 	if (!param) {
	// 		return;
	// 	}
	// 	param.set(outputName);
	// }

	protected _expectedInputsCount(): number {
		return this.pv.inputsCount;
		// const current_connections = this.io.connections.inputConnections();
		// return current_connections ? ArrayUtils.compact(current_connections).length + 1 : 1;
	}

	protected _expectedInputTypes(): GlConnectionPointType[] {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => GL_CONNECTION_POINT_TYPES[params[i].value]);
		// const types: GlConnectionPointType[] = [];

		// const default_type = GlConnectionPointType.FLOAT;
		// const current_connections = this.io.connections.inputConnections();

		// const expected_count = this._expected_inputs_count();
		// for (let i = 0; i < expected_count; i++) {
		// 	if (current_connections) {
		// 		const connection = current_connections[i];
		// 		if (connection) {
		// 			const type = connection.src_connection_point().type();
		// 			types.push(type);
		// 		} else {
		// 			types.push(default_type);
		// 		}
		// 	} else {
		// 		types.push(default_type);
		// 	}
		// }
		// return types;
	}
	protected _expectedInputName(index: number) {
		const params: StringParam[] = this._inputNameParams();
		return params[index].value;
		// const connection = this.io.connections.inputConnection(index);
		// if (connection) {
		// 	const name = connection.src_connection_point().name();
		// 	return name;
		// } else {
		// 	return `in${index}`;
		// }
	}

	protected _expectedOutputTypes() {
		const count = this.pv.inputsCount;
		const params: IntegerParam[] = this._inputTypeParams();
		return ArrayUtils.range(0, count).map((value, i) => GL_CONNECTION_POINT_TYPES[params[i].value]);
		// const types: GlConnectionPointType[] = [];
		// const input_types = this._expected_input_types();
		// for (let i = 0; i < input_types.length; i++) {
		// 	types.push(input_types[i]);
		// }
		// return types;
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
	set_lines_block_start(shaders_collection_controller: ShadersCollectionController, child_node: SubnetInputGlNode) {
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
		const open_if_line = `if(true){`;
		body_lines.push(open_if_line);

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					const connection_point = connection.dest_connection_point();
					const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
					const gl_type = connection_point.type();
					const out = child_node.glVarName(connection_point.name());
					const body_line = `	${gl_type} ${out} = ${in_value}`;
					body_lines.push(body_line);
				}
			}
		}

		shaders_collection_controller.addBodyLines(child_node, body_lines);
	}
	set_lines_block_end(shaders_collection_controller: ShadersCollectionController, child_node: SubnetOutputGlNode) {
		shaders_collection_controller.addBodyLines(child_node, ['}']);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {}
}

class SubnetGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new SubnetGlParamsConfig();

export class SubnetGlNode extends TypedSubnetGlNode<SubnetGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return NetworkNodeType.SUBNET;
	}
}
