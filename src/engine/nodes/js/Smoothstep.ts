/**
 * uses a smoothstep function
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {
	// isJsConnectionPointPrimitive,
	JsConnectionPointType,
	JsConnectionPointTypeFromArrayTypeMap,
} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {LocalFunctionJsDefinition} from './utils/JsDefinition';
import {
	MathFunctionArg3OperationFactory,
	DEFAULT_ALLOWED_TYPES,
	// functionDefinition,
	// FUNC_ARG_NAME,
} from './_Math_Arg1Operation';

// const CLAMP_FUNCTION_NAME = 'clamp';
// const CLAMP_FUNCTION_BODY = `function ${CLAMP_FUNCTION_NAME}(src,min,max){
// 	return Math.min(Math.max(src, min), max)
// }`;
export enum SmoothstepInput {
	X = 'x',
	EDGE0 = 'edge0',
	EDGE1 = 'edge1',
}
const DefaultValues: PolyDictionary<number> = {
	[SmoothstepInput.X]: 0,
	[SmoothstepInput.EDGE0]: 0,
	[SmoothstepInput.EDGE1]: 1,
};

const FUNCTION_NAME = 'smoothstep';
export class SmoothstepJsNode extends MathFunctionArg3OperationFactory('smoothstep', {
	inputPrefix: 'in',
	out: 'smoothstep',
}) {
	protected _coreFunction(shadersCollectionController: ShadersCollectionController) {
		const mainArg = 'x';
		const _min = this.variableForInput(shadersCollectionController, SmoothstepInput.EDGE0);
		const _max = this.variableForInput(shadersCollectionController, SmoothstepInput.EDGE1);
		Poly.namedFunctionsRegister
			.getFunction(FUNCTION_NAME, this, shadersCollectionController)
			.asString(mainArg, _min, _max);

		return FUNCTION_NAME;
	}

	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	protected override _expectedInputName(index: number): string {
		return [SmoothstepInput.X, SmoothstepInput.EDGE0, SmoothstepInput.EDGE1][index];
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
