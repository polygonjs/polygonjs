import {BaseMathFunctionActorNode} from './_BaseMathFunction';
import {
	ActorConnectionPointType,
	PRIMITIVE_ACTOR_CONNECTION_TYPES,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

interface MathArg2OperationOptions {
	inputPrefix: string;
	out: string;
	allowed_in_types?: ActorConnectionPointType[];
}

function MathFunctionArg2OperationFactory(
	type: string,
	options: MathArg2OperationOptions
): typeof BaseMathFunctionActorNode {
	const inputPrefix = options.inputPrefix || type;
	const output_name = options.out || 'val';
	const allowed_in_types = options.allowed_in_types;
	return class Node extends BaseMathFunctionActorNode {
		static override type() {
			return type;
		}
		override initializeNode() {
			super.initializeNode();
			this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
			this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));

			this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
			this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		}

		protected _applyOperation<T>(arg1: T, arg2: T): any {}
		private _applyOperationForVector<T extends Vector2 | Vector3 | Vector4>(arg1: T, arg2: T): T {
			if (arg1 instanceof Vector2) {
				arg1.x = this._applyOperation(arg1.x, arg2.x);
				arg1.y = this._applyOperation(arg1.y, arg2.y);
			}
			if (arg1 instanceof Vector3 && arg2 instanceof Vector3) {
				arg1.x = this._applyOperation(arg1.x, arg2.x);
				arg1.y = this._applyOperation(arg1.y, arg2.y);
				arg1.z = this._applyOperation(arg1.z, arg2.z);
			}
			if (arg1 instanceof Vector4 && arg2 instanceof Vector4) {
				arg1.x = this._applyOperation(arg1.x, arg2.x);
				arg1.y = this._applyOperation(arg1.y, arg2.y);
				arg1.z = this._applyOperation(arg1.z, arg2.z);
				arg1.w = this._applyOperation(arg1.w, arg2.w);
			}

			return arg1;
		}

		private _defaultVector4 = new Vector4();
		private _defaultVector4Tmp = new Vector4();
		public override outputValue(
			context: ActorNodeTriggerContext,
			outputName: string = ''
		): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
			const isPrimitive = PRIMITIVE_ACTOR_CONNECTION_TYPES.includes(this._expectedInputTypes()[0]);

			if (isPrimitive) {
				let startValue = this._inputValue<ActorConnectionPointType.FLOAT>(0, context) || 0;
				const inputsCount = this.io.inputs.namedInputConnectionPoints().length;
				for (let i = 1; i < inputsCount; i++) {
					const nextValue = this._inputValue<ActorConnectionPointType.FLOAT>(
						this._expectedInputName(i),
						context
					);
					startValue = this._applyOperation(startValue, nextValue);
				}
				return startValue;
			} else {
				let startValue =
					this._inputValue<ActorConnectionPointType.VECTOR4>(0, context) ||
					this._defaultVector4.set(0, 0, 0, 0);
				const inputsCount = this.io.inputs.namedInputConnectionPoints().length;
				for (let i = 1; i < inputsCount; i++) {
					const nextValue =
						this._inputValue<ActorConnectionPointType.VECTOR4>(this._expectedInputName(i), context) ||
						this._defaultVector4Tmp.set(0, 0, 0, 0);
					this._applyOperationForVector(startValue, nextValue);
				}
				return startValue;
			}
		}

		override _expectedInputName(index: number): string {
			return `${inputPrefix}${index}`;
		}
		_expectedOutputName(index: number): string {
			return output_name;
		}

		protected override _expectedInputTypes() {
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
			const type = first_input_type || ActorConnectionPointType.FLOAT;

			const current_connections = this.io.connections.existingInputConnections();

			const expected_count = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
			const expected_input_types = [];
			for (let i = 0; i < expected_count; i++) {
				expected_input_types.push(type);
			}
			return expected_input_types;
		}
		protected override _expectedOutputTypes() {
			const inputTypes = this._expectedInputTypes();
			const type = inputTypes[1] || inputTypes[0] || ActorConnectionPointType.FLOAT;
			return [type];
		}
	};
}
export class AddActorNode extends MathFunctionArg2OperationFactory('add', {
	inputPrefix: 'add',
	out: 'sum',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 + arg2;
	}
}
export class DivideActorNode extends MathFunctionArg2OperationFactory('divide', {
	inputPrefix: 'div',
	out: 'divide',
}) {
	override paramDefaultValue(name: string) {
		return 1;
	}
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 / arg2;
	}
}
export class SubtractActorNode extends MathFunctionArg2OperationFactory('subtract', {
	inputPrefix: 'sub',
	out: 'subtract',
}) {
	protected _applyOperation<T extends number>(arg1: T, arg2: T): any {
		return arg1 - arg2;
	}
}

export class MultActorNode extends MathFunctionArg2OperationFactory('mult', {
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
