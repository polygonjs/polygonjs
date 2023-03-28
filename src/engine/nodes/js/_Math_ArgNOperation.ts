import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	isJsConnectionPointPrimitive,
	isJsConnectionPointVector,
	isJsConnectionPointNumber,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {ComputedValueJsDefinition} from './utils/JsDefinition';
// import {Vector2, Vector3, Vector4} from 'three';

interface MathArgNOperationOptions {
	inputPrefix: string;
	out: string;
	allowedInTypes?: JsConnectionPointType[];
	operator: {
		primitive: 'addNumber' | 'divideNumber' | 'multNumber' | 'subtractNumber';
		vector?: 'addVector' | 'subtractVector' | 'multVector';
		vectorScalar: 'addVectorNumber' | 'divideVectorNumber' | 'multVectorNumber' | 'subtractVectorNumber';
	};
}
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();
const VECTOR_TYPES = [JsConnectionPointType.VECTOR2, JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR4];

export function MathFunctionArgNOperationFactory(
	type: string,
	options: MathArgNOperationOptions
): typeof BaseMathFunctionJsNode {
	const inputPrefix = options.inputPrefix || type;
	const outputName = options.out || 'val';
	const allowedInTypes = options.allowedInTypes;
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
			const secondInputType = this.io.connection_points.input_connection_type(1);
			const isPrimitive = isJsConnectionPointPrimitive(firstType);
			const isVectorScalar =
				isJsConnectionPointVector(firstType) &&
				secondInputType != null &&
				isJsConnectionPointNumber(secondInputType);
			// const line = isPrimitive
			// 	? values.join(` ${operator.primitive} `)
			// 	: values.join(`.${operator.vector}(`) + ')';
			// // if (isPrimitive) {
			// // 	return values.join(' + ');
			// // }
			// // if (CoreType.isVector(firstType)) {
			// // 	return values.join('.add(') + ')';
			// // }

			// shadersCollectionController.addBodyOrComputed(this, firstType, this.jsVarName(outputName), line);

			const out = this.jsVarName(outputName);
			// const functionName = isPrimitive
			// 	? operator.primitive
			// 	: isVectorScalar
			// 	? operator.vectorScalar
			// 	: operator.vector;

			// if (!functionName) {
			// 	return;
			// }
			// const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const funcString = isPrimitive
				? Poly.namedFunctionsRegister
						.getFunction(operator.primitive, this, shadersCollectionController)
						.asString(...values)
				: isVectorScalar
				? Poly.namedFunctionsRegister
						.getFunction(operator.vectorScalar, this, shadersCollectionController)
						.asString(values[0], values[1])
				: operator.vector
				? Poly.namedFunctionsRegister
						.getFunction(operator.vector, this, shadersCollectionController)
						.asString(...values)
				: undefined;

			if (!funcString) {
				return;
			}

			shadersCollectionController.addDefinitions(this, [
				new ComputedValueJsDefinition(this, shadersCollectionController, firstType, out, funcString),
			]);
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
			return outputName;
		}

		protected override _expectedInputTypes() {
			let firstInputType = this.io.connection_points.first_input_connection_type();
			if (firstInputType && allowedInTypes) {
				if (!allowedInTypes.includes(firstInputType)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const firstConnection = this.io.inputs.namedInputConnectionPoints()[0];
					if (firstConnection) {
						firstInputType = firstConnection.type();
					}
				}
			}
			const type = firstInputType || JsConnectionPointType.FLOAT;

			if (VECTOR_TYPES.includes(type)) {
				const secondInputType = this.io.connection_points.input_connection_type(1);
				if (secondInputType && secondInputType == JsConnectionPointType.FLOAT) {
					const expectedInputTypes: JsConnectionPointType[] = [type, secondInputType];
					return expectedInputTypes;
				}
			}

			const currentConnections = this.io.connections.existingInputConnections();

			const expectedCount = currentConnections ? Math.max(currentConnections.length + 1, 2) : 2;
			const expectedInputTypes = [];
			for (let i = 0; i < expectedCount; i++) {
				if (i == 0) {
					expectedInputTypes.push(type);
				} else {
					const nextType = operator.vector ? type : JsConnectionPointType.FLOAT;
					expectedInputTypes.push(nextType);
				}
			}
			return expectedInputTypes;
		}
		protected override _expectedOutputTypes() {
			const inputTypes = this._expectedInputTypes();
			const type = inputTypes[0] || JsConnectionPointType.FLOAT;
			return [type];
		}
	};
}
