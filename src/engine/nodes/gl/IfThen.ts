import {SubnetGlNode} from './Subnet';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';

const CONDITION_INPUT_NAME = 'condition';

class IfThenGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new IfThenGlParamsConfig();

export class IfThenGlNode extends SubnetGlNode {
	params_config = ParamsConfig;
	static type(): Readonly<'ifThen'> {
		return 'ifThen';
	}

	protected _expected_inputs_count() {
		const current_connections = this.io.connections.inputConnections();
		return current_connections ? Math.max(current_connections.length + 1, 2) : 2;
	}

	protected _expected_input_types(): GlConnectionPointType[] {
		const types: GlConnectionPointType[] = [GlConnectionPointType.BOOL];

		const default_type = GlConnectionPointType.FLOAT;
		const current_connections = this.io.connections.inputConnections();

		const expected_count = this._expected_inputs_count();
		for (let i = 1; i < expected_count; i++) {
			if (current_connections) {
				const connection = current_connections[i];
				if (connection) {
					const type = connection.src_connection_point().type();
					types.push(type);
				} else {
					types.push(default_type);
				}
			} else {
				types.push(default_type);
			}
		}
		return types;
	}

	protected _expected_output_types() {
		const types: GlConnectionPointType[] = [];
		const input_types = this._expected_input_types();
		for (let i = 1; i < input_types.length; i++) {
			types.push(input_types[i]);
		}
		return types;
	}
	protected _expected_input_name(index: number) {
		if (index == 0) {
			return CONDITION_INPUT_NAME;
		} else {
			const connection = this.io.connections.inputConnection(index);
			if (connection) {
				const name = connection.src_connection_point().name();
				return name;
			} else {
				return `in${index}`;
			}
		}
	}
	protected _expected_output_name(index: number) {
		return this._expected_input_name(index + 1);
	}
	//
	//
	// defines the outputs for the child subnet input
	//
	//
	child_expected_input_connection_point_types() {
		return this._expected_output_types();
	}
	child_expected_input_connection_point_name(index: number) {
		return this._expected_output_name(index);
	}
	child_expected_output_connection_point_types() {
		return this._expected_output_types();
	}
	child_expected_output_connection_point_name(index: number) {
		return this._expected_output_name(index);
	}

	//
	//
	// set_lines
	//
	//
	set_lines_block_start(shaders_collection_controller: ShadersCollectionController, child_node: SubnetInputGlNode) {
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

	setLines(shaders_collection_controller: ShadersCollectionController) {}
}
