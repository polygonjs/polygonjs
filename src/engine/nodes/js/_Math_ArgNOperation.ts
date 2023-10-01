import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	isJsConnectionPointPrimitive,
	isJsConnectionPointVector,
	isJsConnectionPointNumber,
} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
// import {ComputedValueJsDefinition} from './utils/JsDefinition';
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

		override setLines(linesController: JsLinesCollectionController) {
			// if (!firstType) {
			// 	return;
			// }

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
			const firstType = this._expectedInputTypes()[0];
			const varName = this.jsVarName(outputName);
			// const functionName = isPrimitive
			// 	? operator.primitive
			// 	: isVectorScalar
			// 	? operator.vectorScalar
			// 	: operator.vector;

			// if (!functionName) {
			// 	return;
			// }
			// const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const funcString = this._functionString(linesController);
			if (!funcString) {
				console.warn('no function found');
				return;
			}

			linesController.addBodyOrComputed(this, [
				{
					dataType: firstType,
					varName,
					value: funcString,
				},
			]);
		}
		private _functionString(linesController: JsLinesCollectionController) {
			const values: string[] = [];
			const connectionPoints = this.io.inputs.namedInputConnectionPoints();
			if (!connectionPoints) {
				return;
			}
			for (let connectionPoint of connectionPoints) {
				const connectionPointName = connectionPoint.name();
				const value = this.variableForInput(linesController, connectionPointName);
				values.push(value);
			}
			//
			const expectedTypes = this._expectedInputTypes();
			const firstType = expectedTypes[0];
			const secondInputType = expectedTypes[1];
			const isPrimitive = isJsConnectionPointPrimitive(firstType);

			if (isPrimitive) {
				return Poly.namedFunctionsRegister
					.getFunction(operator.primitive, this, linesController)
					.asString(...values);
			}
			const isFirstInputVector = isJsConnectionPointVector(firstType);
			const isSecondInputScalar = secondInputType != null && isJsConnectionPointNumber(secondInputType);
			const isVectorScalar = isFirstInputVector && isSecondInputScalar;

			if (isVectorScalar) {
				return Poly.namedFunctionsRegister
					.getFunction(operator.vectorScalar, this, linesController)
					.asString(values[0], values[1]);
			}

			if (operator.vector) {
				return Poly.namedFunctionsRegister
					.getFunction(operator.vector, this, linesController)
					.asString(...values);
			}
		}

		override _expectedInputName(index: number): string {
			return `${inputPrefix}${index}`;
		}
		override _expectedOutputName(index: number): string {
			return outputName;
		}

		protected override _expectedInputTypes() {
			let firstInputType = this.io.connection_points.first_input_connection_type();
			const connectionPoints = this.io.inputs.namedInputConnectionPoints();
			if (firstInputType && allowedInTypes && connectionPoints) {
				if (!allowedInTypes.includes(firstInputType)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const firstConnection = connectionPoints[0];
					if (firstConnection) {
						firstInputType = firstConnection.type();
					}
				}
			}
			const type = firstInputType || JsConnectionPointType.FLOAT;

			if (VECTOR_TYPES.includes(type)) {
				const secondInputType = this.io.connection_points.input_connection_type(1);
				if (secondInputType != null && secondInputType == JsConnectionPointType.FLOAT) {
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
					const nextType = operator.vector != null ? type : JsConnectionPointType.FLOAT;
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
