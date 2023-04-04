import {BaseMathFunctionJsNode} from './_BaseMathFunction';
import {
	JsConnectionPointType,
	isJsConnectionPointPrimitive,
	JsConnectionPointTypeToArrayTypeMap,
	JsConnectionPointTypeFromArrayTypeMap,
	isJsConnectionPointArray,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {FunctionUtils} from '../../functions/_FunctionUtils';
import {jsFunctionName} from './code/assemblers/JsTypeUtils';
// import {JsNodeTriggerContext} from './_Base';
// import {Vector2, Vector3, Vector4} from 'three';
// const tmpV2 = new Vector2();
// const tmpV3 = new Vector3();
// const tmpV4 = new Vector4();
const RGB = ['r', 'g', 'b'];
const XY = ['x', 'y'];
const XYZ = ['x', 'y', 'z'];
const XYZW = ['x', 'y', 'z', 'w'];
const COMPONENT_BY_JS_TYPE: PolyDictionary<string[]> = {
	[JsConnectionPointType.COLOR]: RGB,
	[JsConnectionPointType.VECTOR2]: XY,
	[JsConnectionPointType.VECTOR3]: XYZ,
	[JsConnectionPointType.VECTOR4]: XYZW,
};

interface MathArg1OperationOptions {
	inputPrefix: string;
	out: string;
	allowed_in_types?: JsConnectionPointType[];
	functionPrefix?: string;
}
// type PrimitiveJsConnectionPointType = JsConnectionPointType.BOOL | JsConnectionPointType.FLOAT;
const PRIMITIVE_ALLOWED_TYPES = [
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

export function MathFunctionArg1OperationFactory(
	type: string,
	options: MathArg1OperationOptions
): typeof BaseMathFunctionJsNode {
	const inputPrefix = options.inputPrefix || type;
	const outputName = options.out || 'val';
	const allowed_in_types = options.allowed_in_types || DEFAULT_ALLOWED_TYPES;
	const functionPrefix = options.functionPrefix || 'Math';
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
			this._setLinesWithArgs([arg0], shadersCollectionController);
		}
		private _setLinesWithArgs(functionArgs: string[], shadersCollectionController: ShadersCollectionController) {
			const varName = this.jsVarName(this._expectedOutputName(0));

			const inputType = this._expectedInputTypes()[0];
			const functionName = jsFunctionName(functionPrefix, inputType);
			const _functionDefinition = functionDefinition({
				functionName,
				inputType,
				componentFunctionCore: (components) => this.componentFunctionCore(components),
				useFuncArg: true,
				secondaryArgs: [],
			});

			const variable = createVariable(inputType);
			if (variable) {
				shadersCollectionController.addVariable(this, varName, variable);
			}

			const functionCall = this._functionCall(
				shadersCollectionController,
				functionName,
				inputType,
				functionArgs,
				varName
			);
			shadersCollectionController.addDefinitions(this, [
				new LocalFunctionJsDefinition(
					this,
					shadersCollectionController,
					this._expectedInputTypes()[0],
					functionName,
					_functionDefinition
				),
			]);

			shadersCollectionController.addBodyOrComputed(this, [{dataType: inputType, varName, value: functionCall}]);
		}

		private _functionCall(
			shadersCollectionController: ShadersCollectionController,
			functionName: string,
			inputType: JsConnectionPointType,
			functionArgs: string[],
			targetArg: string
		) {
			const _func = this._mathFunctionDeclaration(shadersCollectionController);
			const args = isJsConnectionPointPrimitive(inputType)
				? [_func, ...functionArgs]
				: [_func, ...functionArgs, targetArg];
			return `${functionName}(${args.join(', ')})`;
		}
		protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
			return `Math.${type}`;
		}
		protected componentFunctionCore(componentNames: string[]) {
			return componentNames.map((c) => this._functionDefinitionLine(c)).join('\n');
		}
		private _functionDefinitionLine(componentName: string) {
			return `target.${componentName} = ${FUNC_ARG_NAME}(src.${componentName});`;
		}

		override _expectedInputName(index: number): string {
			return inputPrefix;
		}
		override _expectedOutputName(index: number): string {
			return outputName;
		}

		protected override _expectedInputTypes() {
			let first_input_type = this.io.connection_points.first_input_connection_type();
			if (first_input_type) {
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
			return [this._expectedInputTypes()[0]];
		}
	};
}

interface FunctionDefinitionOptions {
	functionName: string;
	inputType: JsConnectionPointType;
	componentFunctionCore: (components: string[]) => string;
	useFuncArg: boolean;
	secondaryArgs: string[];
}
export function functionDefinition(options: FunctionDefinitionOptions) {
	const {functionName, inputType, componentFunctionCore, useFuncArg, secondaryArgs} = options;
	function withFuncArgIfRequired(_functionArgs: string[]) {
		const newList = [..._functionArgs];
		if (useFuncArg) {
			newList.unshift(FUNC_ARG_NAME);
		}
		return newList;
	}
	const functionForComponents = () => {
		if (isJsConnectionPointArray(inputType)) {
			const elementType = JsConnectionPointTypeFromArrayTypeMap[inputType];
			const componentNames = COMPONENT_BY_JS_TYPE[elementType] || [];
			const functionArgs = ['srcElements', 'targetElements'];
			const allArgs = withFuncArgIfRequired(functionArgs);

			return `
function ${functionName}(${allArgs.join(', ')}){
${FunctionUtils.MATCH_ARRAY_LENGTH_WITH_TYPE}(srcElements, targetElements, '${elementType}');
let i = 0;
for(let src of srcElements){
const target = targetElements[i];
${componentFunctionCore(componentNames)}
i++;
}
return targetElements;
}`;
		} else {
			const componentNames = COMPONENT_BY_JS_TYPE[inputType] || [];
			const functionArgs = ['src', ...secondaryArgs, 'target'];
			const allArgs = withFuncArgIfRequired(functionArgs);
			return `
function ${functionName}(${allArgs.join(', ')}){
${componentFunctionCore(componentNames)}
return target;
}`;
		}
	};

	const functionForPrimitive = () => {
		return `function ${functionName}(${FUNC_ARG_NAME}, val){
			return ${FUNC_ARG_NAME}(val);
		}`;
	};

	return isJsConnectionPointPrimitive(inputType) ? functionForPrimitive() : functionForComponents();
}
