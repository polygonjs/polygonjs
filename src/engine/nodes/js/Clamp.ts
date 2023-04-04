/**
 * clamps the input value between a min and a max
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

const CLAMP_FUNCTION_NAME = 'clamp';
const CLAMP_FUNCTION_BODY = `function ${CLAMP_FUNCTION_NAME}(src,min,max){
	return Math.min(Math.max(src, min), max)
}`;
enum ClampInput {
	val = 'val',
	min = 'min',
	max = 'max',
}
const DefaultValues: PolyDictionary<number> = {
	[ClampInput.val]: 0,
	[ClampInput.min]: 0,
	[ClampInput.max]: 1,
};

export class ClampJsNode extends MathFunctionArg1OperationFactory('clamp', {
	inputPrefix: 'in',
	out: 'clamped',
	functionPrefix: 'clamp',
}) {
	protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addDefinitions(this, [
			new LocalFunctionJsDefinition(
				this,
				shadersCollectionController,
				this._expectedInputTypes()[0],
				CLAMP_FUNCTION_NAME,
				CLAMP_FUNCTION_BODY
			),
		]);

		const inputType = this._expectedInputTypes()[0];
		const _min = this.variableForInput(shadersCollectionController, ClampInput.min);
		const _max = this.variableForInput(shadersCollectionController, ClampInput.max);
		if (isJsConnectionPointPrimitive(inputType)) {
			return `(src)=> ${CLAMP_FUNCTION_NAME}(src, ${_min}, ${_max})`;
		} else {
			const elementInputType = JsConnectionPointTypeFromArrayTypeMap[inputType];
			const functionName = `${CLAMP_FUNCTION_NAME}_${elementInputType}`;
			const functionBody = functionDefinition({
				functionName,
				inputType: elementInputType,
				componentFunctionCore: (componentNames) =>
					componentNames
						.map(
							(c) =>
								`target.${c} = ${CLAMP_FUNCTION_NAME}(src.${c}, ${ClampInput.min}.${c}, ${ClampInput.max}.${c})`
						)
						.join('\n'),
				useFuncArg: false,
				secondaryArgs: [ClampInput.min, ClampInput.max],
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

			return `(src,target)=> ${functionName}(src, ${_min}, ${_max}, target)`;
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
		return [ClampInput.val, ClampInput.min, ClampInput.max][index];
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
		return [type, boundType, boundType];
	}
}
