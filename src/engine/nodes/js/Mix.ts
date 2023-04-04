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

const MIX_FUNCTION_NAME = 'mix';
const MIX_FUNCTION_BODY = `function ${MIX_FUNCTION_NAME}(src, value1, blend){
	return (1 - blend) * src + blend * value1;
}`;
enum MixInput {
	src = 'src',
	dest = 'dest',
	blend = 'blend',
}
const DefaultValues: PolyDictionary<number> = {
	[MixInput.src]: 0,
	[MixInput.dest]: 1,
	[MixInput.blend]: 0.5,
};

export class MixJsNode extends MathFunctionArg1OperationFactory('mix', {
	inputPrefix: 'in',
	out: 'mix',
	functionPrefix: 'mix',
}) {
	protected _mathFunctionDeclaration(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addDefinitions(this, [
			new LocalFunctionJsDefinition(
				this,
				shadersCollectionController,
				this._expectedInputTypes()[0],
				MIX_FUNCTION_NAME,
				MIX_FUNCTION_BODY
			),
		]);

		const inputType = this._expectedInputTypes()[0];
		// const value0 = this.variableForInput(shadersCollectionController, MixInput.value0);
		const dest = this.variableForInput(shadersCollectionController, MixInput.dest);
		const blend = this.variableForInput(shadersCollectionController, MixInput.blend);
		if (isJsConnectionPointPrimitive(inputType)) {
			return `(src)=> ${MIX_FUNCTION_NAME}(src, ${dest}, ${blend})`;
		} else {
			const elementInputType = JsConnectionPointTypeFromArrayTypeMap[inputType];
			const functionName = `${MIX_FUNCTION_NAME}_${elementInputType}`;
			const functionBody = functionDefinition({
				functionName,
				inputType: elementInputType,
				componentFunctionCore: (componentNames) =>
					componentNames
						.map(
							(c) =>
								`target.${c} = ${MIX_FUNCTION_NAME}(src.${c}, ${MixInput.dest}.${c}, ${MixInput.blend})`
						)
						.join('\n'),
				useFuncArg: false,
				secondaryArgs: [MixInput.dest, MixInput.blend],
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

			return `(src,target)=> ${functionName}(src, ${dest}, ${blend}, target)`;
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
		return [MixInput.src, MixInput.dest, MixInput.blend][index];
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
		return [type, boundType, JsConnectionPointType.FLOAT];
	}
}
