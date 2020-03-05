import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunctionArg2';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

interface MathArg2OperationOptions {
	in_prefix: string;
	out: string;
	operation: string;
	allowed_in_types?: ConnectionPointType[];
}

function MathFunctionArg2OperationFactory(type: string, options: MathArg2OperationOptions) {
	const in_prefix = options.in_prefix || type;
	const output_name = options.out || 'val';
	const operation = options.operation;
	const allowed_in_types = options.allowed_in_types;
	return class Node extends BaseNodeGlMathFunctionArg2GlNode {
		static type() {
			return type;
		}
		initialize_node() {
			super.initialize_node();
			this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
			this.gl_connections_controller.set_output_name_function(this._gl_output_name.bind(this));

			this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
			this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
		}
		_gl_input_name(index: number): string {
			return `${in_prefix}${index}`;
		}
		_gl_output_name(index: number): string {
			return output_name;
		}
		gl_operation(): string {
			return operation;
		}
		protected _expected_input_types() {
			let first_input_type = this.gl_connections_controller.first_input_connection_type();
			if (first_input_type && allowed_in_types) {
				if (!allowed_in_types.includes(first_input_type)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const first_connection = this.io.inputs.named_input_connection_points[0];
					if (first_connection) {
						first_input_type = first_connection.type;
					}
				}
			}
			const type = first_input_type || ConnectionPointType.FLOAT;

			const current_connections = this.io.connections.input_connections();
			const expected_count = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
			const expected_input_types = [];
			for (let i = 0; i < expected_count; i++) {
				expected_input_types.push(type);
			}
			return expected_input_types;
		}
		protected _expected_output_types() {
			const type = this._expected_input_types()[0];
			return [type];
		}
	};
}
export class AddGlNode extends MathFunctionArg2OperationFactory('add', {
	in_prefix: 'add',
	out: 'sum',
	operation: '+',
}) {}
export class DivideGlNode extends MathFunctionArg2OperationFactory('divide', {
	in_prefix: 'div',
	out: 'divide',
	operation: '/',
}) {}
export class SubstractGlNode extends MathFunctionArg2OperationFactory('substract', {
	in_prefix: 'sub',
	out: 'substract',
	operation: '-',
}) {}

export class MultGlNode extends MathFunctionArg2OperationFactory('mult', {
	in_prefix: 'mult',
	out: 'product',
	operation: '*',
}) {
	static type() {
		return 'mult';
	}
	gl_input_default_value(name: string) {
		return 1;
	}

	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
	}
	protected _expected_output_type() {
		const input_types = this._expected_input_types();
		const type = input_types[input_types.length - 1];
		return [type];
	}

	protected expected_input_types() {
		const input_connections = this.io.connections.input_connections();
		if (input_connections) {
			const first_connection = input_connections[0];

			if (first_connection) {
				const connection_point_for_first_connection = this.io.inputs.named_input_connection_points[
					first_connection.input_index
				];
				const type = connection_point_for_first_connection.type;
				const expected_count = input_connections ? input_connections.length + 1 : 2;
				const empty_array = new Array(expected_count);

				if (type == ConnectionPointType.FLOAT) {
					const second_connection = input_connections ? input_connections[1] : null;
					if (second_connection) {
						const connection_point_for_second_connection = this.io.inputs.named_input_connection_points[
							second_connection.input_index
						];
						const second_type = connection_point_for_second_connection.type;
						if (second_type == ConnectionPointType.FLOAT) {
							// if first 2 inputs are float: n+1 float inputs
							return empty_array.map((i) => type);
						} else {
							// if first input is float and 2nd is different: 1 float, 1 like second, and no other input
							return [type, second_type];
						}
					} else {
						// if only 1 input: 2 with same type
						return [type, type];
					}
				} else {
					// if first input is not a float: n+1 inputs with same type
					return empty_array.map(() => type);
				}
			}
		}
		return [ConnectionPointType.FLOAT, ConnectionPointType.FLOAT];
	}
}
