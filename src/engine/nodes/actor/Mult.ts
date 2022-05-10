import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class MultActorNode extends MathFunctionArgNOperationFactory('mult', {
	inputPrefix: 'mult',
	out: 'product',
}) {
	static override type() {
		return 'mult';
	}
	override paramDefaultValue(name: string) {
		return 1;
	}
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 * arg2;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputType.bind(this));
	}
	protected _expectedOutputType() {
		const input_types = this._expectedInputTypes();
		const type = input_types[input_types.length - 1];
		return [type];
	}

	protected override _expectedInputTypes(): ActorConnectionPointType[] {
		const input_connections = this.io.connections.existingInputConnections();
		if (input_connections) {
			const first_connection = input_connections[0];

			if (first_connection) {
				const connection_point_for_first_connection =
					first_connection.node_src.io.outputs.namedOutputConnectionPoints()[first_connection.output_index];
				// this.io.inputs.namedInputConnectionPoints()[
				// 	first_connection.input_index
				// ];
				const type = connection_point_for_first_connection.type();
				const expected_count = Math.max(input_connections.length + 1, 2);
				const empty_array = new Array(expected_count);

				if (type == ActorConnectionPointType.FLOAT) {
					const second_connection = input_connections[1];
					if (second_connection) {
						const connection_point_for_second_connection =
							second_connection.node_src.io.outputs.namedOutputConnectionPoints()[
								second_connection.output_index
							];
						const second_type = connection_point_for_second_connection.type();
						if (second_type == ActorConnectionPointType.FLOAT) {
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
		return [ActorConnectionPointType.FLOAT, ActorConnectionPointType.FLOAT];
	}
}
