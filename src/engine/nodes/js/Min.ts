/**
 * returns the min between 2 values
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {
	isJsConnectionPointPrimitive,
	JsConnectionPointType,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {
	MathFunctionArg1OperationFactory,
	DEFAULT_ALLOWED_TYPES,
	functionDefinition,
	FUNC_ARG_NAME,
} from './_Math_Arg1Operation';

// const MIN_FUNCTION_NAME = 'mathMin';
// const MIN_FUNCTION_BODY = `function ${MIN_FUNCTION_NAME}(src, min){
// 	return Math.min(src,min)
// }`;
enum MinInput {
	src = 'src',
	min = 'min',
}
const DefaultValues: PolyDictionary<number> = {
	[MinInput.src]: 0,
	[MinInput.min]: 0,
};

export class MinJsNode extends MathFunctionArg1OperationFactory('min', {
	inputPrefix: 'in',
	out: 'min',
	functionPrefix: 'min',
}) {
	protected _data() {
		const functionName = 'mathMin';
		return {
			comparisonFunctionName: functionName,
			comparisonFunctionBody: `function ${functionName}(src, min){
				return Math.min(src, min)
			}`,
		};
	}

	protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
		const {comparisonFunctionName, comparisonFunctionBody} = this._data();
		shadersCollectionController.addDefinitions(this, [
			new LocalFunctionJsDefinition(
				this,
				shadersCollectionController,
				this._expectedInputTypes()[0],
				comparisonFunctionName,
				comparisonFunctionBody
			),
		]);

		const inputType = this._expectedInputTypes()[0];
		// const value0 = this.variableForInput(shadersCollectionController, MixInput.value0);
		const min = this.variableForInput(shadersCollectionController, MinInput.min);
		if (isJsConnectionPointPrimitive(inputType)) {
			return `(src)=> ${comparisonFunctionName}(src, ${min})`;
		} else {
			const elementInputType = JsConnectionPointTypeFromArrayTypeMap[inputType];
			const functionName = `${comparisonFunctionName}_${elementInputType}`;
			const functionBody = functionDefinition({
				functionName,
				inputType: elementInputType,
				componentFunctionCore: (componentNames) =>
					componentNames
						.map((c) => `target.${c} = ${functionName}(src.${c}, ${MinInput.min}.${c})`)
						.join('\n'),
				useFuncArg: false,
				secondaryArgs: [MinInput.min],
			});

			shadersCollectionController.addDefinitions(this, [
				new LocalFunctionJsDefinition(
					this,
					shadersCollectionController,
					this._expectedInputTypes()[0],
					functionName,
					functionBody
				),
			]);

			return `(src,target)=> ${functionName}(src, ${min}, target)`;
		}
	}
	protected componentFunctionCore(componentNames: string[]) {
		const inputType = this._expectedInputTypes()[0];
		return isJsConnectionPointPrimitive(inputType) ? `${FUNC_ARG_NAME}(src)` : `${FUNC_ARG_NAME}(src,target)`;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [MinInput.src, MinInput.min][index];
	}

	protected override _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		if (first_input_type) {
			if (!DEFAULT_ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = this.io.inputs.namedInputConnectionPoints()[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		const boundType = JsConnectionPointTypeFromArrayTypeMap[type];
		return [type, boundType];
	}
}
