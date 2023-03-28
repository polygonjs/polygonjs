import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	// isJsConnectionPointPrimitive,
	// ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {isJsConnectionPointPrimitive} from '../utils/io/connections/Js';
// import {Vector2, Vector3, Vector4} from 'three';

interface MathArgNOperationOptions {
	inputPrefix: string;
	out: string;
	allowed_in_types?: JsConnectionPointType[];
	operator: {
		primitive: string;
		vector: string;
	};
}
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();

export function MathFunctionArgNOperationFactory(
	type: string,
	options: MathArgNOperationOptions
): typeof BaseMathFunctionJsNode {
	const inputPrefix = options.inputPrefix || type;
	const output_name = options.out || 'val';
	const allowed_in_types = options.allowed_in_types;
	const operator = options.operator;
	return class Node extends BaseMathFunctionJsNode {
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

		override setLines(shadersCollectionController: ShadersCollectionController) {
			const values: string[] = [];
			const connectionPoints = this.io.inputs.namedInputConnectionPoints();
			for (let connectionPoint of connectionPoints) {
				const connectionPointName = connectionPoint.name();
				const value = this.variableForInput(shadersCollectionController, connectionPointName);
				values.push(value);
			}

			const firstType = this.io.connection_points.first_input_connection_type();
			if (!firstType) {
				return;
			}
			const isPrimitive = firstType != null && isJsConnectionPointPrimitive(firstType);
			const line = isPrimitive
				? values.join(` ${operator.primitive} `)
				: values.join(`.${operator.vector}(`) + ')';
			// if (isPrimitive) {
			// 	return values.join(' + ');
			// }
			// if (CoreType.isVector(firstType)) {
			// 	return values.join('.add(') + ')';
			// }

			shadersCollectionController.addBodyOrComputed(this, firstType, this.jsVarName(output_name), line);
		}

		// protected _applyOperation<T>(arg1: T, arg2: T): any {}
		// private _applyOperationForVector<T extends Vector2 | Vector3 | Vector4>(arg1: T, arg2: T): T {
		// 	if (arg1 instanceof Vector2) {
		// 		arg1.x = this._applyOperation(arg1.x, arg2.x);
		// 		arg1.y = this._applyOperation(arg1.y, arg2.y);
		// 	}
		// 	if (arg1 instanceof Vector3 && arg2 instanceof Vector3) {
		// 		arg1.x = this._applyOperation(arg1.x, arg2.x);
		// 		arg1.y = this._applyOperation(arg1.y, arg2.y);
		// 		arg1.z = this._applyOperation(arg1.z, arg2.z);
		// 	}
		// 	if (arg1 instanceof Vector4 && arg2 instanceof Vector4) {
		// 		arg1.x = this._applyOperation(arg1.x, arg2.x);
		// 		arg1.y = this._applyOperation(arg1.y, arg2.y);
		// 		arg1.z = this._applyOperation(arg1.z, arg2.z);
		// 		arg1.w = this._applyOperation(arg1.w, arg2.w);
		// 	}

		// 	return arg1;
		// }

		// private _defaultVector4 = new Vector4();
		// private _defaultVector4Tmp = new Vector4();
		// public override outputValue(
		// 	context: ActorNodeTriggerContext,
		// 	outputName: string = ''
		// ): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		// 	const isPrimitive = isActorConnectionPointPrimitive(this._expectedInputTypes()[0]);
		// 	const inputsCount = this.io.inputs.namedInputConnectionPoints().length;
		// 	if (isPrimitive) {
		// 		let startValue = this._inputValue<ActorConnectionPointType.FLOAT>(0, context) || 0;

		// 		for (let i = 1; i < inputsCount; i++) {
		// 			const nextValue = this._inputValue<ActorConnectionPointType.FLOAT>(
		// 				this._expectedInputName(i),
		// 				context
		// 			);
		// 			startValue = this._applyOperation(startValue, nextValue);
		// 		}
		// 		return startValue;
		// 	} else {
		// 		let startValue =
		// 			this._inputValue<
		// 				| ActorConnectionPointType.VECTOR2
		// 				| ActorConnectionPointType.VECTOR3
		// 				| ActorConnectionPointType.VECTOR4
		// 			>(0, context) || this._defaultVector4.set(0, 0, 0, 0);

		// 		if (startValue instanceof Vector2) {
		// 			tmpV2.copy(startValue);
		// 			startValue = tmpV2;
		// 		}
		// 		if (startValue instanceof Vector3) {
		// 			tmpV3.copy(startValue);
		// 			startValue = tmpV3;
		// 		}
		// 		if (startValue instanceof Vector4) {
		// 			tmpV4.copy(startValue);
		// 			startValue = tmpV4;
		// 		}

		// 		for (let i = 1; i < inputsCount; i++) {
		// 			const nextValue =
		// 				this._inputValue<
		// 					| ActorConnectionPointType.VECTOR2
		// 					| ActorConnectionPointType.VECTOR3
		// 					| ActorConnectionPointType.VECTOR4
		// 				>(this._expectedInputName(i), context) || this._defaultVector4Tmp.set(0, 0, 0, 0);
		// 			this._applyOperationForVector(startValue, nextValue);
		// 		}
		// 		return startValue;
		// 	}
		// }

		override _expectedInputName(index: number): string {
			return `${inputPrefix}${index}`;
		}
		override _expectedOutputName(index: number): string {
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
			const type = first_input_type || JsConnectionPointType.FLOAT;

			const current_connections = this.io.connections.existingInputConnections();

			const expectedCount = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
			const expected_input_types = [];
			for (let i = 0; i < expectedCount; i++) {
				expected_input_types.push(type);
			}
			return expected_input_types;
		}
		protected override _expectedOutputTypes() {
			const inputTypes = this._expectedInputTypes();
			const type = inputTypes[1] || inputTypes[0] || JsConnectionPointType.FLOAT;
			return [type];
		}
	};
}
