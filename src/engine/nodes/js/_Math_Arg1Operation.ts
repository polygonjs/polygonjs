import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	// isJsConnectionPointPrimitive,
	// ReturnValueTypeByJsConnectionPointType,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {LocalFunctionJsDefinition} from './utils/JsDefinition';
// import {JsNodeTriggerContext} from './_Base';
// import {Vector2, Vector3, Vector4} from 'three';
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();

interface MathArg1OperationOptions {
	inputPrefix: string;
	out: string;
	allowed_in_types?: JsConnectionPointType[];
}
// type PrimitiveJsConnectionPointType = JsConnectionPointType.BOOL | JsConnectionPointType.FLOAT;
const DEFAULT_ALLOWED_TYPES = [
	JsConnectionPointType.INT,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

export function MathFunctionArg1OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	const inputPrefix = options.inputPrefix || type;
	const outputName = options.out || 'val';
	const allowed_in_types = options.allowed_in_types || DEFAULT_ALLOWED_TYPES;
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
			const arg0 = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
			const out = this.jsVarName(this._expectedOutputName(0));

			const inputType = this._expectedInputTypes()[0];
			const functionName = `${type}_${inputType}`;
			const functionDefinition = this._functionDefinition(functionName, inputType);
			const functionCall = this._functionCall(functionName, inputType, arg0);
			shadersCollectionController.addDefinitions(this, [
				new LocalFunctionJsDefinition(
					this,
					shadersCollectionController,
					this._expectedInputTypes()[0],
					functionName,
					functionDefinition
				),
			]);

			shadersCollectionController.addBodyOrComputed(this, [
				{dataType: inputType, varName: out, value: functionCall},
			]);
		}
		private _functionCall(functionName: string, inputType: JsConnectionPointType, arg0: string) {
			switch (inputType) {
				case JsConnectionPointType.INT:
				case JsConnectionPointType.FLOAT: {
					return `${functionName}(${arg0})`;
				}
				case JsConnectionPointType.COLOR:
				case JsConnectionPointType.VECTOR2:
				case JsConnectionPointType.VECTOR3:
				case JsConnectionPointType.VECTOR4: {
					return `${functionName}(${arg0})`;
				}
			}
			return `${functionName}(${arg0})`;
		}
		private _functionDefinition(functionName: string, inputType: JsConnectionPointType) {
			switch (inputType) {
				case JsConnectionPointType.COLOR: {
					return `function ${functionName}(dest){
						dest.r = Math.${type}(dest.r);
						dest.g = Math.${type}(dest.g);
						dest.b = Math.${type}(dest.b);
						return dest;
					}`;
				}
				case JsConnectionPointType.INT:
				case JsConnectionPointType.FLOAT: {
					return `const ${functionName} = Math.${type};`;
				}
				case JsConnectionPointType.VECTOR2: {
					return `function ${functionName}(dest){
						dest.x = Math.${type}(dest.x);
						dest.y = Math.${type}(dest.y);
						return dest;
					}`;
				}
				case JsConnectionPointType.VECTOR3: {
					return `function ${functionName}(dest){
						dest.x = Math.${type}(dest.x);
						dest.y = Math.${type}(dest.y);
						dest.z = Math.${type}(dest.z);
						return dest;
					}`;
				}
				case JsConnectionPointType.VECTOR4: {
					return `function ${functionName}(dest){
						dest.x = Math.${type}(dest.x);
						dest.y = Math.${type}(dest.y);
						dest.z = Math.${type}(dest.z);
						dest.w = Math.${type}(dest.w);
						return dest;
					}`;
				}
			}
			return `const ${functionName} = Math.${type};`;
		}

		// protected _applyOperation<T>(arg1: T): any {}
		// private _applyOperationForVector<T extends Vector2 | Vector3 | Vector4>(arg1: T): T {
		// 	if (arg1 instanceof Vector2) {
		// 		arg1.x = this._applyOperation(arg1.x);
		// 		arg1.y = this._applyOperation(arg1.y);
		// 	}
		// 	if (arg1 instanceof Vector3) {
		// 		arg1.x = this._applyOperation(arg1.x);
		// 		arg1.y = this._applyOperation(arg1.y);
		// 		arg1.z = this._applyOperation(arg1.z);
		// 	}
		// 	if (arg1 instanceof Vector4) {
		// 		arg1.x = this._applyOperation(arg1.x);
		// 		arg1.y = this._applyOperation(arg1.y);
		// 		arg1.z = this._applyOperation(arg1.z);
		// 		arg1.w = this._applyOperation(arg1.w);
		// 	}

		// 	return arg1;
		// }

		// private _defaultVector4 = new Vector4();
		// public override outputValue(
		// 	context: ActorNodeTriggerContext,
		// 	outputName: string = ''
		// ): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] {
		// 	const isPrimitive = isActorConnectionPointPrimitive(this._expectedInputTypes()[0]);

		// 	if (isPrimitive) {
		// 		// note this can also be a boolean in the case of the negate and complement
		// 		const inputValue = this._inputValue<PrimitiveActorConnectionPointType>(0, context);
		// 		if (inputValue != null) {
		// 			return this._applyOperation(inputValue);
		// 		} else {
		// 			return this._applyOperation(0);
		// 		}
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
		// 		const r = this._applyOperationForVector(startValue);
		// 		return r;
		// 	}
		// }

		override _expectedInputName(index: number): string {
			return inputPrefix;
		}
		override _expectedOutputName(index: number): string {
			return outputName;
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
			return [type];
		}
		protected override _expectedOutputTypes() {
			const inputTypes = this._expectedInputTypes();
			const type = inputTypes[1] || inputTypes[0] || JsConnectionPointType.FLOAT;
			return [type];
		}
	};
}
