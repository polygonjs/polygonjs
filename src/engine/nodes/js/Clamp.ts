/**
 * clamps the input value between a min and a max
 *
 *
 */
import {PolyDictionary} from '../../../types/GlobalTypes';
import {Poly} from '../../Poly';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {MathFunctionArg3OperationFactory, DEFAULT_ALLOWED_TYPES} from './_Math_Arg1Operation';

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

const FUNCTION_NAME = 'clamp';
export class ClampJsNode extends MathFunctionArg3OperationFactory('clamp', {
	inputPrefix: 'in',
	out: 'clamped',
}) {
	protected _coreFunction(shadersCollectionController: ShadersCollectionController) {
		Poly.namedFunctionsRegister.getFunction(FUNCTION_NAME, this, shadersCollectionController).asString('', '', '');

		return FUNCTION_NAME;
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
