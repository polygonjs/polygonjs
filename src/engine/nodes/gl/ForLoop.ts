import {TypedSubnetGlNode} from './Subnet';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {PolyDictionary} from '../../../types/GlobalTypes';

enum ForLoopInput {
	START_INDEX = 'i',
	MAX = 'max',
	STEP = 'step',
}
const DEFAULT_VALUES: PolyDictionary<number> = {
	[ForLoopInput.START_INDEX]: 0,
	[ForLoopInput.MAX]: 10,
	[ForLoopInput.STEP]: 1,
};
const OFFSET = 0;

class ForLoopGlParamsConfig extends NodeParamsConfig {
	start = ParamConfig.FLOAT(0);
	max = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [false, false],
	});
	step = ParamConfig.FLOAT(1);
}
const ParamsConfig = new ForLoopGlParamsConfig();

export class ForLoopGlNode extends TypedSubnetGlNode<ForLoopGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'forLoop';
	}

	param_default_value(name: string) {
		return DEFAULT_VALUES[name];
	}

	protected _expected_inputs_count() {
		const current_connections = this.io.connections.inputConnections();
		return current_connections ? current_connections.length + 1 : 1;
	}

	protected _expected_input_types(): GlConnectionPointType[] {
		const types: GlConnectionPointType[] = [
			// GlConnectionPointType.FLOAT,
			// GlConnectionPointType.FLOAT,
			// GlConnectionPointType.FLOAT,
		];

		const default_type = GlConnectionPointType.FLOAT;
		const current_connections = this.io.connections.inputConnections();

		const expected_count = this._expected_inputs_count();
		for (let i = OFFSET; i < expected_count; i++) {
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
		for (let i = OFFSET; i < input_types.length; i++) {
			types.push(input_types[i]);
		}
		return types;
	}
	protected _expected_input_name(index: number) {
		// switch (index) {
		// 	case 0:
		// 		return ForLoopInput.START_INDEX;
		// 	case 1:
		// 		return ForLoopInput.MAX;
		// 	case 2:
		// 		return ForLoopInput.STEP;
		// 	default: {
		const connection = this.io.connections.inputConnection(index);
		if (connection) {
			const name = connection.src_connection_point().name();
			return name;
		} else {
			return `in${index}`;
		}
		// }
		// }
	}
	protected _expected_output_name(index: number) {
		return this._expected_input_name(index + OFFSET);
	}
	//
	//
	// defines the outputs for the child subnet input
	//
	//
	child_expected_input_connection_point_types() {
		return this._expected_input_types();
	}
	child_expected_input_connection_point_name(index: number) {
		return this._expected_input_name(index);
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
		const connection_points = this.io.inputs.named_input_connection_points;
		for (let i = OFFSET; i < connection_points.length; i++) {
			const connection_point = connection_points[i];
			const gl_type = connection_point.type();
			const out = this.gl_var_name(connection_point.name());
			const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name()));
			const body_line = `${gl_type} ${out} = ${in_value}`;
			body_lines.push(body_line);
		}
		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (let connection of connections) {
				if (connection) {
					if (connection.input_index >= OFFSET) {
						const connection_point = connection.dest_connection_point();
						const in_value = ThreeToGl.any(this.variable_for_input(connection_point.name()));
						const gl_type = connection_point.type();
						const out = this.gl_var_name(connection_point.name());
						const body_line = `${gl_type} ${out} = ${in_value}`;
						body_lines.push(body_line);
					}
				}
			}
		}

		const start: number = this.pv.start;
		const max: number = this.pv.max;
		const step: number = this.pv.step;
		const start_str = ThreeToGl.float(start);
		const max_str = ThreeToGl.float(max);
		const step_str = ThreeToGl.float(step);
		const iterator_name = this.gl_var_name('i');
		const open_for_loop_line = `for(float ${iterator_name} = ${start_str}; ${iterator_name} < ${max_str}; ${iterator_name}+= ${step_str}){`;
		body_lines.push(open_for_loop_line);

		// i
		const out = child_node.gl_var_name(ForLoopInput.START_INDEX);
		const body_line = `	float ${out} = ${iterator_name}`;
		body_lines.push(body_line);

		if (connections) {
			for (let connection of connections) {
				if (connection) {
					if (connection.input_index >= OFFSET) {
						const connection_point = connection.dest_connection_point();
						const in_value = this.gl_var_name(connection_point.name());
						const gl_type = connection_point.type();
						const out = child_node.gl_var_name(connection_point.name());
						const body_line = `	${gl_type} ${out} = ${in_value}`;
						body_lines.push(body_line);
					}
				}
			}
		}
		shaders_collection_controller.add_body_lines(child_node, body_lines);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {}
}
