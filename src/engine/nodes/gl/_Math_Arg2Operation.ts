import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';

interface MathArg2OperationOptions {
	in_prefix: string;
	out: string;
	operation: string;
	allowed_in_types?: GlConnectionPointType[];
}

function MathFunctionArg2OperationFactory(
	type: string,
	options: MathArg2OperationOptions
): typeof BaseNodeGlMathFunctionArg2GlNode {
	const in_prefix = options.in_prefix || type;
	const output_name = options.out || 'val';
	const operation = options.operation;
	const allowed_in_types = options.allowed_in_types;
	return class Node extends BaseNodeGlMathFunctionArg2GlNode {
		static override type() {
			return type;
		}
		override initializeNode() {
			super.initializeNode();
			this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
			this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));

			this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
			this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		}
		override setLines(shaders_collection_controller: ShadersCollectionController) {
			const var_type: GlConnectionPointType = this.io.outputs.namedOutputConnectionPoints()[0].type();
			const args = this.io.inputs.namedInputConnectionPoints().map((connection, i) => {
				const name = connection.name();
				const variable = this.variableForInput(name);
				if (variable) {
					return ThreeToGl.any(variable);
				}
			});
			const joined_args = args.join(` ${this.gl_operation()} `);

			const sum = this.glVarName(this.io.connection_points.output_name(0));
			const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
			shaders_collection_controller.addBodyLines(this, [body_line]);
		}
		override _gl_input_name(index: number): string {
			return `${in_prefix}${index}`;
		}
		_gl_output_name(index: number): string {
			return output_name;
		}
		gl_operation(): string {
			return operation;
		}
		protected override _expected_input_types() {
			let first_input_type = this.io.connection_points.first_input_connection_type();
			if (first_input_type && allowed_in_types) {
				if (!allowed_in_types.includes(first_input_type)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const first_connection = this.io.inputs.namedInputConnectionPoints()[0];
					if (first_connection) {
						first_input_type = first_connection.type();
					}
				}
			}
			const type = first_input_type || GlConnectionPointType.FLOAT;

			const current_connections = this.io.connections.existingInputConnections();

			const expected_count = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
			const expected_input_types = [];
			for (let i = 0; i < expected_count; i++) {
				expected_input_types.push(type);
			}
			return expected_input_types;
		}
		protected override _expected_output_types() {
			const input_types = this._expected_input_types();
			const type = input_types[1] || input_types[0] || GlConnectionPointType.FLOAT;
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
}) {
	override paramDefaultValue(name: string) {
		return 1;
	}
}
export class SubtractGlNode extends MathFunctionArg2OperationFactory('subtract', {
	in_prefix: 'sub',
	out: 'subtract',
	operation: '-',
}) {}

export class MultGlNode extends MathFunctionArg2OperationFactory('mult', {
	in_prefix: 'mult',
	out: 'product',
	operation: '*',
}) {
	static override type() {
		return 'mult';
	}
	override paramDefaultValue(name: string) {
		return 1;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
	}
	protected _expected_output_type() {
		const input_types = this._expected_input_types();
		const type = input_types[input_types.length - 1];
		return [type];
	}

	protected override _expected_input_types(): GlConnectionPointType[] {
		const input_connections = this.io.connections.existingInputConnections();
		if (input_connections) {
			const first_connection = input_connections[0];

			if (first_connection) {
				const connection_point_for_first_connection =
					first_connection.nodeSrc().io.outputs.namedOutputConnectionPoints()[first_connection.outputIndex()];
				// this.io.inputs.namedInputConnectionPoints()[
				// 	first_connection.input_index
				// ];
				const type = connection_point_for_first_connection.type();
				const expected_count = Math.max(input_connections.length + 1, 2);
				const empty_array = new Array(expected_count);

				if (type == GlConnectionPointType.FLOAT) {
					const second_connection = input_connections[1];
					if (second_connection) {
						const connection_point_for_second_connection =
							second_connection.nodeSrc().io.outputs.namedOutputConnectionPoints()[
								second_connection.outputIndex()
							];
						const second_type = connection_point_for_second_connection.type();
						if (second_type == GlConnectionPointType.FLOAT) {
							// if first 2 inputs are float: n+1 float inputs
							return empty_array.fill(type);
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
					return empty_array.fill(type);
				}
			} else {
				// if we arrive here, we simply go to the last return statement
			}
		}
		return [GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT];
	}
}
