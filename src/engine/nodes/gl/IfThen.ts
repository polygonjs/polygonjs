/**
 * executes the nodes inside it based on an input condition
 *
 *
 *
 */

import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin} from './Subnet';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {ArrayUtils} from '../../../core/ArrayUtils';

const CONDITION_INPUT_NAME = 'condition';

class IfThenGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {}
const ParamsConfig = new IfThenGlParamsConfig();

export class IfThenGlNode extends TypedSubnetGlNode<IfThenGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'ifThen'> {
		return 'ifThen';
	}

	protected override _expectedInputsCount() {
		const current_connections = this.io.connections.inputConnections();
		return current_connections ? Math.max(ArrayUtils.compact(current_connections).length + 1, 2) : 2;
	}

	protected override _expectedInputTypes(): GlConnectionPointType[] {
		return [GlConnectionPointType.BOOL, ...super._expectedInputTypes()];

		// const default_type = GlConnectionPointType.FLOAT;
		// const current_connections = this.io.connections.inputConnections();

		// const expected_count = this._expectedInputsCount();
		// for (let i = 1; i < expected_count; i++) {
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

	// protected override _expectedOutputTypes() {
	// 	const types: GlConnectionPointType[] = [];
	// 	const input_types = this._expectedInputTypes();
	// 	for (let i = 1; i < input_types.length; i++) {
	// 		types.push(input_types[i]);
	// 	}
	// 	return types;
	// }
	protected override _expectedInputName(index: number) {
		if (index == 0) {
			return CONDITION_INPUT_NAME;
		} else {
			return super._expectedInputName(index - 1);
			// const connection = this.io.connections.inputConnection(index);
			// if (connection) {
			// 	const name = connection.src_connection_point().name();
			// 	return name;
			// } else {
			// 	return `in${index}`;
			// }
		}
	}
	override childExpectedInputConnectionPointTypes() {
		const subnetInputTypes = super.childExpectedInputConnectionPointTypes();
		const types: GlConnectionPointType[] = [];
		for (let i = 1; i < subnetInputTypes.length; i++) {
			types.push(subnetInputTypes[i]);
		}
		return types;
	}
	override childExpectedInputConnectionPointName(index: number) {
		return super.childExpectedInputConnectionPointName(index + 1);
	}

	//
	//
	// set_lines
	//
	//
	override set_lines_block_start(
		shaders_collection_controller: ShadersCollectionController,
		child_node: SubnetInputGlNode
	) {
		const body_lines: string[] = [];
		const connection_points = this.io.inputs.namedInputConnectionPoints();
		for (let i = 1; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			const gl_type = connection_point.type();
			const out = this.glVarName(connection_point.name());
			const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
			const body_line = `${gl_type} ${out} = ${in_value}`;
			body_lines.push(body_line);
		}
		const condition_value = ThreeToGl.any(this.variableForInput(CONDITION_INPUT_NAME));
		const open_if_line = `if(${condition_value}){`;
		body_lines.push(open_if_line);

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					// if under an if_then node
					if (connection.input_index != 0) {
						const connection_point = connection.dest_connection_point();
						const in_value = ThreeToGl.any(this.variableForInput(connection_point.name()));
						const gl_type = connection_point.type();
						const out = child_node.glVarName(connection_point.name());
						const body_line = `	${gl_type} ${out} = ${in_value}`;
						body_lines.push(body_line);
					}
				}
			}
		}
		shaders_collection_controller.addBodyLines(child_node, body_lines);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {}
}
