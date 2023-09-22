import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	isJsConnectionPointPrimitive,
	JsConnectionPointTypeToArrayTypeMap,
	isJsConnectionPointArray,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
// import {LocalFunctionJsDefinition} from './utils/JsDefinition';
// import {PolyDictionary} from '../../../types/GlobalTypes';
// import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
// import {FunctionUtils} from '../../functions/_FunctionUtils';
import {Poly} from '../../Poly';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {
	_vectorFunctionName_1,
	VectorFunctionName,
	MathVectorFunction,
	MathVectorFunction1,
	MathVectorFunction2,
	MathPrimArray,
	MathVectorArray,
	_vectorFunctionName_2,
	MathFloat,
	MathVectorFunction3,
	_vectorFunctionName_3,
	MathVectorFunction4,
	_vectorFunctionName_4,
	MathVectorFunction5,
	_vectorFunctionName_5,
} from '../../functions/_MathGeneric';
// import {jsFunctionName} from './code/assemblers/JsTypeUtils';
// import {JsNodeTriggerContext} from './_Base';
// import {Vector2, Vector3, Vector4} from 'three';
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();

// abstract class ArgBaseMathFunctionJsNode extends BaseMathFunctionJsNode {
// 	protected _inputValuesCount() {
// 		0;
// 	}
// }

interface MathArg1OperationOptions {
	inputPrefix: string;
	out: string;
	allowed_in_types?: JsConnectionPointType[];
	// functionArg?: string;
}
export interface MathFunctionData<MVF extends MathVectorFunction> {
	vectorFunctionNameFunction: VectorFunctionName<MVF>;
	mathFloat: MathFloat;
	mathPrimArray: MathPrimArray;
	mathVectorArray: MathVectorArray;
}
// type PrimitiveJsConnectionPointType = JsConnectionPointType.BOOL | JsConnectionPointType.FLOAT;
export const PRIMITIVE_ALLOWED_TYPES = [
	JsConnectionPointType.INT,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
const ARRAY_ALLOWED_TYPES = PRIMITIVE_ALLOWED_TYPES.map((type) => JsConnectionPointTypeToArrayTypeMap[type]);
export const DEFAULT_ALLOWED_TYPES = [...PRIMITIVE_ALLOWED_TYPES, ...ARRAY_ALLOWED_TYPES];
export const FUNC_ARG_NAME = '_mathFunc';

export function MathFunctionArgXOperationFactory<MVF extends MathVectorFunction>(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	const inputPrefix = options.inputPrefix || type;
	const outputName = options.out || 'val';
	const allowed_in_types = options.allowed_in_types || DEFAULT_ALLOWED_TYPES;
	// const functionArg = options.functionArg || `Math.${type}`;
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

		override setLines(shadersCollectionController: JsLinesCollectionController) {
			const varName = this.jsVarName(this._expectedOutputName(0));
			const inputType = this._expectedInputTypes()[0];
			const variable = createVariable(inputType);
			const tmpVarName = variable != null ? shadersCollectionController.addVariable(this, variable) : undefined;

			const mainFunction = this._mainFunction(shadersCollectionController, tmpVarName);
			if (!mainFunction) {
				return;
			}

			shadersCollectionController.addBodyOrComputed(this, [{dataType: inputType, varName, value: mainFunction}]);
		}
		private _mainFunction(shadersCollectionController: JsLinesCollectionController, tmpVarName?: string) {
			const functionData = this._functionData();
			const {vectorFunctionNameFunction, mathFloat, mathPrimArray, mathVectorArray} = functionData;

			// const arg0 = this.variableForInput(shadersCollectionController, this._expectedInputName(0));
			const args = this._inputArgs(shadersCollectionController);
			const inputType = this._expectedInputTypes()[0];
			const isPrimitive = isJsConnectionPointPrimitive(inputType);
			const coreFunction = this._coreFunction(shadersCollectionController);

			// primitive
			if (isPrimitive) {
				return Poly.namedFunctionsRegister
					.getFunction(mathFloat, this, shadersCollectionController)
					.asString(...[coreFunction, ...args]);
			}
			if (!tmpVarName) {
				return;
			}

			// color / vector
			const vectorFunctionName = vectorFunctionNameFunction(inputType);
			if (vectorFunctionName) {
				return Poly.namedFunctionsRegister
					.getFunction(vectorFunctionName, this, shadersCollectionController)
					.asString(...[coreFunction, ...args, tmpVarName]);
			}

			// array
			if (isJsConnectionPointArray(inputType)) {
				const elementInputType = JsConnectionPointTypeFromArrayTypeMap[inputType];
				const vectorElementInputFunctionName = vectorFunctionNameFunction(elementInputType);
				if (vectorElementInputFunctionName) {
					// array color / vector
					Poly.namedFunctionsRegister
						.getFunction(vectorElementInputFunctionName, this, shadersCollectionController)
						// we call .asString to ensure the function is added to the shadersCollectionController
						.asString('', '', '');
					return Poly.namedFunctionsRegister
						.getFunction(mathVectorArray, this, shadersCollectionController)
						.asString(...[coreFunction, vectorElementInputFunctionName, ...args, tmpVarName]);
				} else {
					// array primitive
					return Poly.namedFunctionsRegister
						.getFunction(mathPrimArray, this, shadersCollectionController)
						.asString(...[coreFunction, ...args, tmpVarName]);
				}
			}
		}

		protected _coreFunction(shadersCollectionController: JsLinesCollectionController) {
			return `Math.${type}`;
		}
		protected _functionData(): MathFunctionData<MVF> {
			return {
				vectorFunctionNameFunction: _vectorFunctionName_1 as VectorFunctionName<MVF>,
				mathFloat: 'mathFloat_1',
				mathPrimArray: 'mathPrimArray_1',
				mathVectorArray: 'mathVectorArray_1',
			};
		}

		protected _inputValuesCount() {
			const inputTypes = this._expectedInputTypes();
			const inputValuesCount = inputTypes.length;
			return inputValuesCount;
		}
		private _inputArgs(shadersCollectionController: JsLinesCollectionController) {
			const inputValuesCount = this._inputValuesCount();
			const inputArgs: string[] = [];
			for (let i = 0; i < inputValuesCount; i++) {
				const arg = this.variableForInput(shadersCollectionController, this._expectedInputName(i));
				inputArgs.push(arg);
			}
			return inputArgs;
		}

		override _expectedInputName(index: number): string {
			return inputPrefix;
		}
		override _expectedOutputName(index: number): string {
			return outputName;
		}

		protected override _expectedInputTypes() {
			let first_input_type = this.io.connection_points.first_input_connection_type();
			const connectionPoints = this.io.inputs.namedInputConnectionPoints();
			if (first_input_type && connectionPoints) {
				if (!allowed_in_types.includes(first_input_type)) {
					// if the first input type is not allowed, either leave the connection point as is,
					// or use the default if there is none
					const first_connection = connectionPoints[0];
					if (first_connection) {
						first_input_type = first_connection.type();
					}
				}
			}
			const type = first_input_type || JsConnectionPointType.FLOAT;
			return [type];
		}
		protected override _expectedOutputTypes() {
			return [this._expectedInputTypes()[0]];
		}
	};
}

export function MathFunctionArg1OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	return class Node extends MathFunctionArgXOperationFactory<MathVectorFunction1>(type, options) {};
}

export function MathFunctionArg2OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	return class Node extends MathFunctionArgXOperationFactory<MathVectorFunction2>(type, options) {
		// TODO: this should ideally be inherited from the class created by MathFunctionArgXOperationFactory
		// and would therefore require an override statement,
		// and would then automatically have the return type FunctionData<MathVectorFunction2>
		protected _functionData(): MathFunctionData<MathVectorFunction2> {
			return {
				vectorFunctionNameFunction: _vectorFunctionName_2,
				mathFloat: 'mathFloat_2',
				mathPrimArray: 'mathPrimArray_2',
				mathVectorArray: 'mathVectorArray_2',
			};
		}
	};
}

export function MathFunctionArg3OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	return class Node extends MathFunctionArgXOperationFactory<MathVectorFunction3>(type, options) {
		// TODO: this should ideally be inherited from the class created by MathFunctionArgXOperationFactory
		// and would therefore require an override statement,
		// and would then automatically have the return type FunctionData<MathVectorFunction2>
		protected _functionData(): MathFunctionData<MathVectorFunction3> {
			return {
				vectorFunctionNameFunction: _vectorFunctionName_3,
				mathFloat: 'mathFloat_3',
				mathPrimArray: 'mathPrimArray_3',
				mathVectorArray: 'mathVectorArray_3',
			};
		}
	};
}

export function MathFunctionArg4OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	return class Node extends MathFunctionArgXOperationFactory<MathVectorFunction4>(type, options) {
		// TODO: this should ideally be inherited from the class created by MathFunctionArgXOperationFactory
		// and would therefore require an override statement,
		// and would then automatically have the return type FunctionData<MathVectorFunction2>
		protected _functionData(): MathFunctionData<MathVectorFunction4> {
			return {
				vectorFunctionNameFunction: _vectorFunctionName_4,
				mathFloat: 'mathFloat_4',
				mathPrimArray: 'mathPrimArray_4',
				mathVectorArray: 'mathVectorArray_4',
			};
		}
	};
}

export function MathFunctionArg5OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	return class Node extends MathFunctionArgXOperationFactory<MathVectorFunction5>(type, options) {
		// TODO: this should ideally be inherited from the class created by MathFunctionArgXOperationFactory
		// and would therefore require an override statement,
		// and would then automatically have the return type FunctionData<MathVectorFunction2>
		protected _functionData(): MathFunctionData<MathVectorFunction5> {
			return {
				vectorFunctionNameFunction: _vectorFunctionName_5,
				mathFloat: 'mathFloat_5',
				mathPrimArray: 'mathPrimArray_5',
				mathVectorArray: 'mathVectorArray_5',
			};
		}
	};
}
